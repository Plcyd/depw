import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canTransitionStatus,
  getExplainableNextStep,
  evaluateRequestCompleteness,
  computeTicketAuditDiff,
  findPotentialDuplicates,
  calculateDashboardMetrics,
  escapeCsvCell,
  ticketsToCsv,
  MANILA_16_DISTRICTS,
  LEGISLATIVE_DISTRICTS,
  APP_THEMES,
  evaluateWaterDrainageSafety,
  FLOWCHART_STAGES,
  TUTORIAL_LESSONS,
  getWhatShouldIDoNext,
  getManilaSpatialDrainageContext,
} from './workflowRules.js';

test('Manila districts, legislative districts, and themes (including 3 distinct light themes) match specification', () => {
  assert.equal(LEGISLATIVE_DISTRICTS.length, 6);
  assert.equal(MANILA_16_DISTRICTS.length, 16);
  assert.equal(APP_THEMES.length, 7);
  const lightThemes = APP_THEMES.filter((t) => t.isLight);
  assert.equal(lightThemes.length, 3);
  const themeIds = APP_THEMES.map((t) => t.id);
  assert.ok(themeIds.includes('navy-glass'));
  assert.ok(themeIds.includes('daylight-civic'));
  assert.ok(themeIds.includes('light-sky'));
  assert.ok(themeIds.includes('light-emerald'));

  const names = MANILA_16_DISTRICTS.map((d) => d.name);
  assert.ok(names.includes('Binondo'));
  assert.ok(names.includes('Tondo'));
  assert.ok(names.includes('Sampaloc'));
  assert.ok(names.includes('Intramuros'));
});

test('flowchart stages, tutorial lessons, and next action helper provide bilingual guidance', () => {
  assert.equal(FLOWCHART_STAGES.length, 8);
  assert.equal(FLOWCHART_STAGES[0].code, 'INTAKE');
  assert.equal(FLOWCHART_STAGES[7].code, 'CLOSE');

  assert.equal(TUTORIAL_LESSONS.length, 12);
  assert.ok(TUTORIAL_LESSONS[0].titleFil.length > 5);
  assert.ok(TUTORIAL_LESSONS[0].titleEn.length > 5);

  const guideFil = getWhatShouldIDoNext({ status: 'For Verification', barangay: 'Barangay 123', streetAddress: 'Velasquez St' }, 'fil');
  assert.ok(guideFil.action.includes('Suriin'));
  const guideEn = getWhatShouldIDoNext({ status: 'For Verification', barangay: 'Barangay 123', streetAddress: 'Velasquez St' }, 'en');
  assert.ok(guideEn.action.includes('Verify'));

  const sampalocContext = getManilaSpatialDrainageContext('España Boulevard, Sampaloc, Manila');
  assert.ok(sampalocContext.summary.includes('Sampaloc'));
  assert.ok(sampalocContext.places.length > 0);
});

test('status transition validation enforces allowed transitions and locks Closed', () => {
  assert.equal(canTransitionStatus('For Verification', 'Pending Evaluation'), true);
  assert.equal(canTransitionStatus('For Verification', 'Closed'), false);
  assert.equal(canTransitionStatus('Closed', 'In Progress'), false);
  assert.equal(canTransitionStatus('Completed', 'Closed'), true);
});

test('explainable next step returns rationale and valid target status', () => {
  const step = getExplainableNextStep('Pending Evaluation');
  assert.equal(step.suggestedNextStatus, 'Inspection Scheduled');
  assert.ok(step.rationale.length > 10);
});

test('request completeness assistant detects missing and complete fields', () => {
  const incomplete = evaluateRequestCompleteness({ barangay: 'Barangay 123, Zone 10' });
  assert.equal(incomplete.isComplete, false);
  assert.ok(incomplete.score < 100);

  const complete = evaluateRequestCompleteness({
    barangay: 'Barangay 123, Zone 10',
    district: 'Tondo',
    streetAddress: 'Estero de Vitas Service Road',
    requesterName: 'Juan D. Cruz',
    description: 'Accumulated silt and debris obstructing storm drain flow.',
    latitude: 14.6195,
    longitude: 120.9678,
  });
  assert.equal(complete.isComplete, true);
  assert.equal(complete.score, 100);
});

test('computeTicketAuditDiff accurately detects status transitions, field edits, and checklist updates', () => {
  const before = {
    status: 'For Verification',
    priority: 'Routine',
    streetAddress: 'Old Street',
    inspectionChecklistJson: JSON.stringify([{ item: 'Check 1', done: false }]),
  };
  const afterEdit = {
    status: 'For Verification',
    priority: 'High Priority',
    streetAddress: 'España Blvd cor. Maceda St.',
    inspectionChecklistJson: JSON.stringify([{ item: 'Check 1', done: false }]),
  };
  const diffEdit = computeTicketAuditDiff(before, afterEdit);
  assert.equal(diffEdit.eventType, 'FIELD_EDIT');
  assert.equal(diffEdit.changes.length, 2);

  const afterStatus = {
    ...before,
    status: 'Pending Evaluation',
  };
  const diffStatus = computeTicketAuditDiff(before, afterStatus);
  assert.equal(diffStatus.eventType, 'STATUS_TRANSITION');
  assert.equal(diffStatus.changes[0].before, 'For Verification');
  assert.equal(diffStatus.changes[0].after, 'Pending Evaluation');
});

test('duplicate detection flags matching barangay and requestType', () => {
  const existing = [
    {
      ticketId: 'DEO-2026-001',
      barangay: 'Barangay 123, Zone 10',
      streetAddress: 'Estero de Vitas Service Road',
      requestType: 'Declogging',
      status: 'Pending Evaluation',
    },
  ];
  const dupes = findPotentialDuplicates(
    {
      barangay: 'Barangay 123, Zone 10',
      streetAddress: 'Other Corner',
      requestType: 'Declogging',
    },
    existing
  );
  assert.equal(dupes.length, 1);
  assert.equal(dupes[0].ticketId, 'DEO-2026-001');
});

test('dashboard metrics accurately aggregate dataset', () => {
  const sample = [
    { status: 'Pending Evaluation', requestType: 'Declogging', district: 'Tondo' },
    { status: 'For Verification', requestType: 'Declogging', district: 'Sampaloc' },
    { status: 'Inspection Scheduled', requestType: 'Declogging', district: 'Ermita' },
    { status: 'Completed', requestType: 'Desilting', district: 'Tondo' },
  ];
  const metrics = calculateDashboardMetrics(sample);
  assert.equal(metrics.totalRequests, 4);
  assert.equal(metrics.pendingVerification, 1);
  assert.equal(metrics.pendingEvaluation, 1);
  assert.equal(metrics.inspectionScheduled, 1);
  assert.equal(metrics.completedRequests, 1);
  assert.equal(metrics.byDistrict.Tondo, 2);
});

test('CSV export escapes special characters and formula prefixes', () => {
  assert.equal(escapeCsvCell('=SUM(A1:A2)'), "'=SUM(A1:A2)");
  assert.equal(escapeCsvCell('Brgy 123, "Zone 1"'), '"Brgy 123, ""Zone 1"""');
  const csv = ticketsToCsv([
    {
      dateReceived: '10/20/2026',
      ticketId: 'DEO-2026-001',
      barangay: 'Barangay 123, Zone 10',
      district: 'Tondo',
      legislativeDistrict: '1st District',
      streetAddress: 'Estero de Vitas Service Road',
      requestType: 'Declogging',
      status: 'Pending Evaluation',
      priority: 'Elevated',
      actionTaken: 'Endorsed to DEO',
      nextStep: 'Awaiting review',
      requesterName: 'Juan D. Cruz',
      latitude: 14.6195,
      longitude: 120.9678,
    },
  ]);
  assert.ok(csv.includes('DEO-2026-001'));
  assert.ok(csv.includes('Barangay 123, Zone 10'));
});

test('evaluateWaterDrainageSafety flags NORMAL, WARNING, and CRITICAL thresholds with visual status', () => {
  const normalReadings = {
    h2sPpm: 2.1,
    dissolvedOxygen: 6.4,
    turbidityNtu: 28,
    ammoniaMgL: 1.2,
    flowIndex: 92,
  };
  const normalResult = evaluateWaterDrainageSafety(normalReadings);
  assert.equal(normalResult.overallStatus, 'NORMAL');
  assert.equal(normalResult.criticalCount, 0);
  assert.equal(normalResult.warningCount, 0);

  const warnReadings = {
    h2sPpm: 6.5, // > 5.0 warn
    dissolvedOxygen: 6.0,
    turbidityNtu: 30,
    ammoniaMgL: 1.0,
    flowIndex: 85,
  };
  const warnResult = evaluateWaterDrainageSafety(warnReadings);
  assert.equal(warnResult.overallStatus, 'WARNING');
  assert.equal(warnResult.warningCount, 1);
  assert.equal(warnResult.criticalCount, 0);
  assert.equal(warnResult.breaches[0].key, 'h2sPpm');

  const critReadings = {
    h2sPpm: 12.4, // >= 10.0 crit
    dissolvedOxygen: 2.1, // <= 3.0 crit
    turbidityNtu: 88, // >= 80 crit
    ammoniaMgL: 3.8, // >= 3.0 crit
    flowIndex: 35, // <= 50 crit
  };
  const critResult = evaluateWaterDrainageSafety(critReadings);
  assert.equal(critResult.overallStatus, 'CRITICAL');
  assert.equal(critResult.criticalCount, 5);
});

test('validateWaterQualityEntry validates identified drainage zone water quality parameters and classifies safety', async () => {
  const { IDENTIFIED_DRAINAGE_ZONES, INITIAL_WATER_QUALITY_LOGS, validateWaterQualityEntry } = await import('./workflowRules.js');
  assert.ok(IDENTIFIED_DRAINAGE_ZONES.length >= 8);
  assert.ok(INITIAL_WATER_QUALITY_LOGS.length >= 6);

  // Rejects empty/missing required fields
  const invalidRes = validateWaterQualityEntry({
    zoneId: '',
    dissolvedOxygen: '',
    h2sPpm: 'abc',
    inspectorName: '',
  });
  assert.equal(invalidRes.isValid, false);
  assert.ok(invalidRes.errors.length >= 3);

  // Accepts valid readings and computes overallStatus accurately
  const validRes = validateWaterQualityEntry({
    zoneId: 'ZONE-TONDO-VITAS',
    dissolvedOxygen: 6.2,
    h2sPpm: 2.1,
    turbidityNtu: 32,
    ammoniaMgL: 1.3,
    flowIndex: 89,
    pH: 7.2,
    inspectorName: 'Engr. Camille R. Aquino',
    notes: 'Clear tidal outflow',
  });
  assert.equal(validRes.isValid, true);
  assert.equal(validRes.entry.zoneName, 'Estero de Vitas Outfall & Service Rd.');
  assert.equal(validRes.entry.district, 'Tondo');
  assert.equal(validRes.entry.overallStatus, 'NORMAL');

  // Flags CRITICAL when H2S >= 10 ppm or DO <= 3.0 mg/L
  const critEntryRes = validateWaterQualityEntry({
    zoneId: 'ZONE-QUIAPO-HIDALGO',
    dissolvedOxygen: 2.4,
    h2sPpm: 11.5,
    turbidityNtu: 85,
    ammoniaMgL: 3.2,
    flowIndex: 42,
    inspectorName: 'Engr. Mateo R. Santos',
  });
  assert.equal(critEntryRes.isValid, true);
  assert.equal(critEntryRes.entry.overallStatus, 'CRITICAL');
});

test('user profile helpers validate officer profile fields and compute initials accurately', async () => {
  const { DEPW_OFFICER_PROFILES, getUserInitials, validateUserProfile } = await import('./workflowRules.js');
  assert.ok(DEPW_OFFICER_PROFILES.length >= 4);
  assert.equal(getUserInitials('Engr. Lorenzo T. Macapagal'), 'LM');
  assert.equal(getUserInitials('Engr. Camille R. Aquino'), 'CA');

  const invalidProfile = validateUserProfile({
    fullName: '',
    roleTitle: '',
    division: '',
    districtAssignment: '',
    badgeId: '',
  });
  assert.equal(invalidProfile.isValid, false);
  assert.ok(invalidProfile.errors.length >= 5);

  const validProfile = validateUserProfile({
    fullName: 'Engr. Camille R. Aquino',
    roleTitle: 'Water Quality & Estero Field Inspector',
    division: 'Environmental & Waterway Telemetry Unit',
    districtAssignment: 'District I & II (Tondo / Binondo)',
    badgeId: 'DEPW-MNL-2026-029',
    email: 'c.aquino@depw.manila.gov.ph',
    dutyStatus: 'In Field • Estero de Vitas',
  });
  assert.equal(validProfile.isValid, true);
  assert.equal(validProfile.profile.badgeId, 'DEPW-MNL-2026-029');
});

test('Manila district polygons, coordinate district detection, and pinned declogging site validation work accurately', async () => {
  const {
    MANILA_DISTRICT_POLYGONS,
    detectManilaDistrictFromCoords,
    validatePinnedDecloggingSite,
  } = await import('./workflowRules.js');

  assert.equal(MANILA_DISTRICT_POLYGONS.length, 16);
  for (const poly of MANILA_DISTRICT_POLYGONS) {
    assert.ok(poly.positions.length >= 4);
    assert.ok(poly.esteros.length >= 1);
  }

  // Null / invalid coordinates return null
  assert.equal(detectManilaDistrictFromCoords('', ''), null);
  assert.equal(detectManilaDistrictFromCoords('invalid', 120.98), null);

  // Detects Tondo inside Tondo polygon
  const tondoDetected = detectManilaDistrictFromCoords(14.6195, 120.9678);
  assert.equal(tondoDetected.district, 'Tondo');
  assert.equal(tondoDetected.legislativeDistrict, '1st District');
  assert.equal(tondoDetected.isWithinManilaBounds, true);

  // Detects Sampaloc inside Sampaloc polygon
  const sampalocDetected = detectManilaDistrictFromCoords(14.6110, 120.9955);
  assert.equal(sampalocDetected.district, 'Sampaloc');
  assert.equal(sampalocDetected.legislativeDistrict, '4th District');

  // Validates pinned declogging site
  const invalidPin = validatePinnedDecloggingSite({
    latitude: null,
    longitude: null,
    barangay: '',
    streetAddress: '',
    requesterName: '',
    description: '',
  });
  assert.equal(invalidPin.isValid, false);
  assert.ok(invalidPin.errors.length >= 4);

  const validPin = validatePinnedDecloggingSite({
    latitude: 14.6112,
    longitude: 120.9958,
    barangay: 'Barangay 452, Zone 45',
    streetAddress: 'España Blvd. cor. Maceda Box Culvert',
    requestType: 'Declogging',
    priority: 'High Priority',
    requesterName: 'Engr. Lorenzo T. Macapagal',
    description: 'Reported silted curb inlet and drainage blockage during heavy rain.',
  });
  assert.equal(validPin.isValid, true);
  assert.equal(validPin.payload.district, 'Sampaloc');
  assert.equal(validPin.payload.legislativeDistrict, '4th District');
  assert.equal(validPin.payload.coordVerified, true);
});

test('Data Privacy & Protection Guidelines: explicit consent notice, data minimization, and sensitive PII masking work accurately', async () => {
  const {
    DEPW_PRIVACY_CONSENT_NOTICE,
    DEPW_DATA_PRIVACY_GUIDELINES,
    detectAndMaskSensitivePII,
    sanitizeTicketPayloadPrivacy,
  } = await import('./workflowRules.js');

  assert.equal(
    DEPW_PRIVACY_CONSENT_NOTICE,
    'By providing your contact details, you consent to DEPW processing your information solely for verifying and coordinating this service request under our public service privacy guidelines.'
  );
  assert.ok(DEPW_DATA_PRIVACY_GUIDELINES.purposeLimitation.includes('strictly'));
  assert.ok(DEPW_DATA_PRIVACY_GUIDELINES.dataMinimization.includes('Never request or store'));
  assert.ok(DEPW_DATA_PRIVACY_GUIDELINES.publicChatSafeguard.includes('Viber'));
  assert.ok(DEPW_DATA_PRIVACY_GUIDELINES.dataRetentionDisclaimer.includes('operational logs'));

  // Clean operational text has no sensitive PII
  const cleanRes = detectAndMaskSensitivePII(
    'Requesting declogging of silted box culvert along España Blvd cor. Maceda St. Contact: Kagawad Juan Cruz'
  );
  assert.equal(cleanRes.hasSensitivePII, false);
  assert.equal(cleanRes.redactionCount, 0);

  // Detects and masks accidental TIN, SSS, Password, Birthdate, and Credit Card without echoing sensitive values
  const sensitiveSample =
    'Please log ticket. My TIN: 123-456-789-000, SSS: 34-1234567-8, Password: MySecretPassword99, DOB: 1985-04-12, Card: 4532-1111-2222-3333.';
  const maskRes = detectAndMaskSensitivePII(sensitiveSample);
  assert.equal(maskRes.hasSensitivePII, true);
  assert.ok(maskRes.redactionCount >= 4);
  assert.equal(maskRes.sanitizedText.includes('123-456-789-000'), false);
  assert.equal(maskRes.sanitizedText.includes('34-1234567-8'), false);
  assert.equal(maskRes.sanitizedText.includes('MySecretPassword99'), false);
  assert.equal(maskRes.sanitizedText.includes('1985-04-12'), false);
  assert.equal(maskRes.sanitizedText.includes('4532-1111-2222-3333'), false);
  assert.ok(maskRes.sanitizedText.includes('[REDACTED SENSITIVE PII]'));

  // Enforces explicit consent when required and strips disallowed minimization fields
  const rejectedConsent = sanitizeTicketPayloadPrivacy(
    {
      barangay: 'Barangay 123, Zone 10',
      requesterName: 'Juan D. Cruz',
      description: 'Blocked drainage canal, TIN 123-456-789-000',
      birthdate: '1980-01-01',
      tin: '123-456-789-000',
      financialDetails: 'BPI 1234567890',
      privacyConsentAccepted: false,
    },
    { requireConsent: true }
  );
  assert.equal(rejectedConsent.isValid, false);
  assert.ok(rejectedConsent.errors[0].includes(DEPW_PRIVACY_CONSENT_NOTICE));
  assert.ok(rejectedConsent.strippedFields.includes('birthdate'));
  assert.ok(rejectedConsent.strippedFields.includes('tin'));
  assert.ok(rejectedConsent.strippedFields.includes('financialDetails'));
  assert.equal('birthdate' in rejectedConsent.sanitizedPayload, false);
  assert.equal(rejectedConsent.sanitizedPayload.description.includes('123-456-789-000'), false);
});

test('Automated Problem-Solver Project – Design Your Custom Workflow matches 4 Sets, 11 Items, 250 Total Score, and team rules', async () => {
  const {
    AUTOMATED_PROBLEM_SOLVER_PROJECT,
    evaluateProblemSolverProjectSubmission,
  } = await import('./workflowRules.js');

  assert.equal(
    AUTOMATED_PROBLEM_SOLVER_PROJECT.title,
    'Automated Problem-Solver Project – Design Your Custom Workflow'
  );
  assert.equal(AUTOMATED_PROBLEM_SOLVER_PROJECT.totalSets, 4);
  assert.equal(AUTOMATED_PROBLEM_SOLVER_PROJECT.totalItems, 11);
  assert.equal(AUTOMATED_PROBLEM_SOLVER_PROJECT.totalScore, 250);
  assert.equal(AUTOMATED_PROBLEM_SOLVER_PROJECT.passingGradePercent, 70);
  assert.equal(AUTOMATED_PROBLEM_SOLVER_PROJECT.sets.length, 4);

  const flatItems = AUTOMATED_PROBLEM_SOLVER_PROJECT.sets.flatMap((s) => s.items);
  assert.equal(flatItems.length, 11);
  const sumPoints = flatItems.reduce((acc, item) => acc + item.maxPoints, 0);
  assert.equal(sumPoints, 250);

  // Standard 4-member group requires 1 workflow and achieves 250/250 with default answers
  const groupOf4 = evaluateProblemSolverProjectSubmission({ memberCount: 4 });
  assert.equal(groupOf4.requiredWorkflowCount, 1);
  assert.equal(groupOf4.earnedScore, 250);
  assert.equal(groupOf4.percentage, 100);
  assert.equal(groupOf4.passed, true);

  // Team with > 4 members (e.g. 5 members) requires 2 separate workflows
  const groupOf5 = evaluateProblemSolverProjectSubmission({
    memberCount: 5,
    workflow2Answers: { 'ITEM-1': '' }, // empty 2nd workflow item 1 loses half points on item 1
  });
  assert.equal(groupOf5.requiredWorkflowCount, 2);
  assert.equal(groupOf5.earnedScore, 245);
  assert.equal(groupOf5.passed, true);
});

test('themeConfig manages CSS variables and cycling for navy-glass, daylight-civic, and emerald-hydro themes', async () => {
  const {
    CORE_THEME_IDS,
    THEME_CSS_VARIABLES,
    resolveValidThemeId,
    getThemeVariables,
    getNextThemeId,
  } = await import('./themeConfig.js');

  assert.deepEqual(CORE_THEME_IDS, ['navy-glass', 'daylight-civic', 'emerald-hydro']);
  assert.equal(resolveValidThemeId('invalid-theme'), 'navy-glass');
  assert.equal(resolveValidThemeId('emerald-hydro'), 'emerald-hydro');

  const navyVars = getThemeVariables('navy-glass');
  const daylightVars = getThemeVariables('daylight-civic');
  const emeraldVars = getThemeVariables('emerald-hydro');

  assert.equal(navyVars['--bg-navy-deep'], '#060d1f');
  assert.equal(daylightVars['--bg-navy-deep'], '#f1f5f9');
  assert.equal(emeraldVars['--bg-navy-deep'], '#041d1b');
  assert.ok(Object.keys(THEME_CSS_VARIABLES['navy-glass']).length >= 16);

  assert.equal(getNextThemeId('navy-glass'), 'daylight-civic');
  assert.equal(getNextThemeId('daylight-civic'), 'emerald-hydro');
  assert.equal(getNextThemeId('emerald-hydro'), 'navy-glass');
});

test('pptGenerator generates 8 animated slides, PowerPoint .ppt, standalone animated HTML, Flowchart SVG, and Workflow TXT', async () => {
  const {
    buildAnimatedProjectSlides,
    generatePowerPointPptContent,
    generateAnimatedHtmlDeckContent,
    generateFlowchartSvgContent,
    generateWorkflowSpecificationDoc,
  } = await import('./pptGenerator.js');

  const slides = buildAnimatedProjectSlides();
  assert.equal(slides.length, 8);
  assert.ok(slides[0].title.includes('Automated Problem-Solver Project'));

  const pptContent = generatePowerPointPptContent();
  assert.ok(pptContent.includes('xmlns:p="urn:schemas-microsoft-com:office:powerpoint"'));
  assert.ok(pptContent.includes('Set 1: The Problem, The Trigger (Start), and The Goal (End)'));

  const htmlContent = generateAnimatedHtmlDeckContent();
  assert.ok(htmlContent.toLowerCase().includes('<!doctype html>'));
  assert.ok(htmlContent.includes('toggleAutoplay()'));

  const svgContent = generateFlowchartSvgContent();
  assert.ok(svgContent.includes('<svg'));
  assert.ok(svgContent.includes('STAGE 01'));
  assert.ok(svgContent.includes('STAGE 08'));

  const txtContent = generateWorkflowSpecificationDoc();
  assert.ok(txtContent.includes('AUTOMATED PROBLEM-SOLVER PROJECT'));
  assert.ok(txtContent.includes('SET 2: DESIGN YOUR WORKFLOW'));
});





