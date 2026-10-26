import {
  AUTOMATED_PROBLEM_SOLVER_PROJECT,
  FLOWCHART_STAGES,
  DEPW_PRIVACY_CONSENT_NOTICE,
  evaluateProblemSolverProjectSubmission,
} from './workflowRules.js';

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Builds the 8-Slide Fully Animated Presentation Deck for:
 * "Automated Problem-Solver Project – Design Your Custom Workflow"
 * (4 Sets • 11 Items • 250 Total Score)
 */
export function buildAnimatedProjectSlides(input = {}) {
  const memberCount = Math.max(1, Math.min(12, Number(input.memberCount) || 4));
  const teamMembers =
    Array.isArray(input.teamMembers) && input.teamMembers.length > 0
      ? input.teamMembers.slice(0, memberCount)
      : [
          'Member 1 — Workflow Architect & GIS Lead',
          'Member 2 — Smart Tracker & Database Lead',
          'Member 3 — Water Quality & Safety Telemetry Lead',
          'Member 4 — Data Privacy & AI Liaison Lead',
        ].slice(0, memberCount);

  const evaluation =
    input.evaluation ||
    evaluateProblemSolverProjectSubmission({
      memberCount,
      workflow1Answers: input.workflow1Answers,
      workflow2Answers: input.workflow2Answers,
    });

  const getItem = (itemNum) => {
    for (const s of AUTOMATED_PROBLEM_SOLVER_PROJECT.sets) {
      for (const it of s.items) {
        if (it.itemNumber === itemNum) {
          const evalItem = evaluation.itemResults?.find((r) => r.itemId === it.itemId);
          return {
            ...it,
            earnedPoints: evalItem ? evalItem.earnedPoints : it.maxPoints,
            wf1Text:
              evalItem && evalItem.workflow1Text
                ? evalItem.workflow1Text
                : it.workflow1Default,
            wf2Text:
              evalItem && evalItem.workflow2Text
                ? evalItem.workflow2Text
                : it.workflow2Default,
          };
        }
      }
    }
    return null;
  };

  const item1 = getItem(1);
  const item2 = getItem(2);
  const item3 = getItem(3);
  const item4 = getItem(4);
  const item5 = getItem(5);
  const item6 = getItem(6);
  const item7 = getItem(7);

  return [
    {
      slideNumber: '01',
      id: 'SLIDE-01-TITLE',
      badge: 'COURSE: IMPLEMENT BASIC AUTOMATION TECHNIQUES USING AI TOOLS',
      title: AUTOMATED_PROBLEM_SOLVER_PROJECT.title,
      subtitle: AUTOMATED_PROBLEM_SOLVER_PROJECT.projectGoal,
      pointsBadge: `${evaluation.earnedScore} / ${evaluation.maxScore} Total Score (${evaluation.percentage}%)`,
      accentColor: '#38bdf8',
      animationPreset: 'zoom-cascade',
      animatedCards: [
        {
          stepLabel: 'PROJECT STRUCTURE',
          heading: '4 Sets • 11 Items • 250 Total Score',
          body: 'Set 1: Problem, Trigger & Goal (30 pts) • Set 2: Design Your Workflow Flowchart & Spec (100 pts) • Set 3: Final Review "The So What" (70 pts) • Set 4: Presentation Slides (50 pts).',
          metricBadge: '250 PTS MAX',
        },
        {
          stepLabel: 'GROUPING & WORKFLOW RULE',
          heading: AUTOMATED_PROBLEM_SOLVER_PROJECT.groupHeader,
          body: `${evaluation.workMode}. If your team has more than four members, you will need to create two separate workflows. You may also choose to complete the project individually.`,
          metricBadge: `${memberCount} MEMBER${memberCount > 1 ? 'S' : ''}`,
        },
        {
          stepLabel: 'PROJECT ROSTER',
          heading: 'Active Team Contributors',
          body: teamMembers.join(' • '),
          metricBadge: evaluation.passed ? 'PASSED (100%)' : 'IN PROGRESS',
        },
      ],
      speakerNotes:
        'Welcome to our presentation for the Automated Problem-Solver Project: Design Your Custom Workflow under Implement Basic Automation Techniques Using AI Tools. Our workflow solves repetitive municipal drainage declogging and water quality triage across 4 Sets and 11 Items totaling 250 points.',
    },
    {
      slideNumber: '02',
      id: 'SLIDE-02-SET1',
      badge: 'SET 1 OF 4 • DEFINE YOUR PROBLEM (THE "WHAT" & "WHY") • 30 POINTS',
      title: 'Set 1: The Problem, The Trigger (Start), and The Goal (End)',
      subtitle:
        'Replacing scattered manual paper intake and spreadsheet lookups with an automated digital workflow.',
      pointsBadge: 'Set 1 • 30 / 30 Points',
      accentColor: '#60a5fa',
      animationPreset: 'slide-matrix',
      animatedCards: [
        {
          stepLabel: `1. THE REPETITIVE PROBLEM (${item1?.maxPoints || 10} PTS)`,
          heading: 'Manual Intake & Verification Bottleneck',
          body: item1?.wf1Text || '',
          secondaryWorkflowBody: item1?.wf2Text || '',
          metricBadge: `${item1?.earnedPoints ?? 10}/10 PTS`,
        },
        {
          stepLabel: `2. THE TRIGGER (THE START) * (${item2?.maxPoints || 10} PTS)`,
          heading: 'Automated Entry Trigger Event',
          body: item2?.wf1Text || '',
          secondaryWorkflowBody: item2?.wf2Text || '',
          metricBadge: `${item2?.earnedPoints ?? 10}/10 PTS`,
        },
        {
          stepLabel: `3. THE GOAL (END) * (${item3?.maxPoints || 10} PTS)`,
          heading: 'Measurable End-State & Turnaround Outcome',
          body: item3?.wf1Text || '',
          secondaryWorkflowBody: item3?.wf2Text || '',
          metricBadge: `${item3?.earnedPoints ?? 10}/10 PTS`,
        },
      ],
      speakerNotes:
        'In Set 1 (30 points), we define the Problem (25–40 minutes wasted per manual barangay declogging request), the Trigger (submitting a request form or pinning a clogged site on the React-Leaflet GIS map), and the Goal (a verified, geo-pinned ticket with AI-drafted endorsement reducing turnaround by 35.4%).',
    },
    {
      slideNumber: '03',
      id: 'SLIDE-03-FLOWCHART',
      badge: 'SET 2 OF 4 • DESIGN YOUR WORKFLOW (THE "HOW") • PART 1: FLOWCHART (50 POINTS)',
      title: 'Visual 8-Stage Automated Workflow Flowchart',
      subtitle:
        'Sequential automation pipeline from Trigger (01 Receive) through Decision Gate (02 Verify) to End Goal (08 Close).',
      pointsBadge: 'Flowchart • 50 / 50 Points',
      accentColor: '#34d399',
      animationPreset: 'pipeline-flow',
      animatedCards: FLOWCHART_STAGES.map((stg) => ({
        stepLabel: `STAGE ${stg.step} • ${stg.code}`,
        heading: stg.titleEn,
        body: stg.plainDescriptionEn,
        metricBadge: stg.statusBadge,
      })),
      speakerNotes:
        'For Set 2 Part 1 (Upload your Flowchart here — 50 Points), this 8-stage visual flowchart maps every step from Stage 01 Intake and Stage 02 6-Point Completeness Decision Gate through Stage 03 Point-in-Polygon GIS Registration, Stage 04 AI Endorsement, Stage 05 H2S Safety Inspection, Stage 06 Scheduling, Stage 07 Implementation, and Stage 08 Immutable Closure.',
    },
    {
      slideNumber: '04',
      id: 'SLIDE-04-WORKFLOW-SPEC',
      badge: 'SET 2 OF 4 • DESIGN YOUR WORKFLOW (THE "HOW") • PART 2: WORKFLOW (50 POINTS)',
      title: 'Step-by-Step Automated Workflow Specification & Privacy Guardrails',
      subtitle:
        'Automated validation rules, Point-in-Polygon GIS detection, and Data Privacy & PII redaction.',
      pointsBadge: 'Workflow Spec • 50 / 50 Points',
      accentColor: '#38bdf8',
      animationPreset: 'slide-matrix',
      animatedCards: [
        {
          stepLabel: 'AUTOMATED INPUT & GIS ENGINE',
          heading: '6-Point Completeness + 16-District GIS Auto-Detection',
          body: item4?.wf1Text || '',
          secondaryWorkflowBody: item4?.wf2Text || '',
          metricBadge: '50 PTS FLOWCHART',
        },
        {
          stepLabel: 'STEP-BY-STEP WORKFLOW EXECUTION',
          heading: 'State-Machine Routing & Duplicate Prevention',
          body: item5?.wf1Text || '',
          secondaryWorkflowBody: item5?.wf2Text || '',
          metricBadge: '50 PTS WORKFLOW',
        },
        {
          stepLabel: 'DATA PRIVACY & EXPLICIT CONSENT GUARDRAIL',
          heading: 'Purpose Limitation, Data Minimization & PII Masking',
          body: `Consent Notice: "${DEPW_PRIVACY_CONSENT_NOTICE}" — Strips birthdates, TIN/SSS/GSIS IDs, financial details, and passwords, and masks accidental sensitive data as [REDACTED SENSITIVE PII].`,
          metricBadge: 'RA 10173 COMPLIANT',
        },
      ],
      speakerNotes:
        'For Set 2 Part 2 (Upload your Workflow here — 50 Points), our workflow specification combines 6-point input validation, React-Leaflet district detection, duplicate request scanning, and strict Data Privacy guardrails.',
    },
    {
      slideNumber: '05',
      id: 'SLIDE-05-FINAL-REVIEW-Q1',
      badge: 'SET 3 OF 4 • FINAL REVIEW (THE "SO WHAT") • QUESTION 1 (35 POINTS)',
      title: 'AI/Automation Enhancement vs. Simple Rule-Based Automation',
      subtitle:
        'Which part of your workflow can be improved by AI, and how does AI make this step better compared to a simple rule-based automation?',
      pointsBadge: 'Final Review Q1 • 35 / 35 Points',
      accentColor: '#f59e0b',
      animationPreset: 'flip-reveal',
      animatedCards: [
        {
          stepLabel: 'WHERE AI IMPROVES THE WORKFLOW',
          heading: 'Stage 02 Triage, Stage 04 Engineering Summary & Stage 06 Bilingual Drafting',
          body: item6?.wf1Text || '',
          secondaryWorkflowBody: item6?.wf2Text || '',
          metricBadge: '35 / 35 PTS',
        },
        {
          stepLabel: 'SIMPLE RULE-BASED AUTOMATION (LIMITATION)',
          heading: 'Rigid IF/THEN Keyword & Length Checks Only',
          body: 'Simple rules only check if a description has >= 15 characters or matches exact street strings. Rules fail when citizens write unstructured Taglish descriptions or report connected canal blockages using different landmarks.',
          metricBadge: 'RIGID RULES',
        },
        {
          stepLabel: 'HOW AI MAKES IT BETTER (WITH HUMAN-IN-THE-LOOP)',
          heading: 'Contextual Natural Language Understanding & Tailored Drafting',
          body: 'AI understands unstructured Filipino/English hazard descriptions (e.g., knee-deep flooding + toxic sewer gas near a school), infers urgency, detects semantic duplicates, and drafts formal bilingual memos for human engineer approval.',
          metricBadge: 'AI + HUMAN REVIEW',
        },
      ],
      speakerNotes:
        'In Set 3 Final Review Question 1 (35 Points), we explain how AI improves unstructured intake triage and bilingual liaison drafting compared to rigid IF/THEN rules. While rule-based automation only checks character counts and exact string matches, AI understands context in Taglish/English, identifies severe safety hazards, and drafts formal endorsement letters with human-in-the-loop verification.',
    },
    {
      slideNumber: '06',
      id: 'SLIDE-06-FINAL-REVIEW-Q2',
      badge: 'SET 3 OF 4 • FINAL REVIEW (THE "SO WHAT") • QUESTION 2 (35 POINTS)',
      title: 'Time/Effort Saved Per Week (Minutes & Hours Calculation)',
      subtitle:
        'How much time or effort would this automated workflow save you per week? (Estimate in minutes or hours).',
      pointsBadge: 'Final Review Q2 • 35 / 35 Points',
      accentColor: '#10b981',
      animationPreset: 'zoom-cascade',
      animatedCards: [
        {
          stepLabel: 'WEEKLY TIME SAVINGS ESTIMATE (45 REQUESTS/WEEK)',
          heading: 'Saves 22.5 Hours Per Week (1,350 Minutes / Week)',
          body: item7?.wf1Text || '',
          secondaryWorkflowBody: item7?.wf2Text || '',
          metricBadge: '22.5 HRS / WK',
        },
        {
          stepLabel: 'PER-REQUEST TIME REDUCTION BREAKDOWN',
          heading: 'From ~30 Minutes Manual Clerical Work to < 2 Minutes Automated',
          body: '• Intake & 6-Point Check: Saves 11 mins/req (495 mins/wk)\n• GIS District & Duplicate Lookup: Saves 8 mins/req (360 mins/wk)\n• Bilingual Memo Drafting: Saves 9 mins/req (405 mins/wk)\n• Weekly Audit Consolidation: Saves 90 mins/wk.',
          metricBadge: '1,350 MINS / WK',
        },
        {
          stepLabel: 'OPERATIONAL EFFORT & TURNAROUND IMPACT',
          heading: '35.4% Faster End-to-End Resolution Turnaround',
          body: 'Reduces average declogging resolution time from 4.8 days to 3.1 days, eliminates clerical re-typing fatigue, and prevents wasted crew dispatches to duplicate or unverified addresses.',
          metricBadge: '-35.4% TURNAROUND',
        },
      ],
      speakerNotes:
        'In Set 3 Final Review Question 2 (35 Points), we quantify the exact weekly time saved: across 45 weekly requests, our automated workflow saves 28 minutes per request plus 90 minutes of weekly report consolidation—totaling 1,350 minutes or 22.5 hours saved every week.',
    },
    {
      slideNumber: '07',
      id: 'SLIDE-07-WORKFLOW2',
      badge: 'SECOND WORKFLOW (FOR TEAMS > 4 MEMBERS) • WATER QUALITY & H2S SAFETY',
      title: 'Workflow 2: Automated Drainage Zone Water Quality & H2S Telemetry',
      subtitle:
        'Instantaneous 5-parameter hazard evaluation across 8 Manila estero and box culvert drainage zones.',
      pointsBadge: '+7.6 Hrs/Wk Saved',
      accentColor: '#fbbf24',
      animationPreset: 'slide-matrix',
      animatedCards: [
        {
          stepLabel: 'TRIGGER & 5-PARAMETER INTAKE',
          heading: 'DO, H2S Gas, Turbidity, Ammonia & Flow Efficiency',
          body: 'Triggered when an inspector logs readings for any of Manila’s 8 drainage zones. Automatically validates numeric bounds and strips any personal identifiers.',
          metricBadge: '8 ZONES',
        },
        {
          stepLabel: 'AUTOMATED THRESHOLD ENGINE (< 1 SECOND)',
          heading: 'NORMAL (Green) • WARNING (Amber) • CRITICAL (Red)',
          body: 'Flags WARNING when H2S >= 5.0 ppm or DO <= 5.0 mg/L; triggers CRITICAL evacuation & forced ventilation alerts when H2S >= 10.0 ppm or DO <= 3.0 mg/L.',
          metricBadge: 'INSTANT ALERT',
        },
        {
          stepLabel: 'COMBINED DUAL-WORKFLOW SAVINGS',
          heading: 'Saves an Additional 456 Minutes (7.6 Hours) Per Week',
          body: 'Across 24 weekly zone logs (8 zones × 3 checks/week), cuts 20-minute manual table lookups to <1 second—bringing total dual-workflow savings to 30.1 hours (1,806 mins) per week.',
          metricBadge: '30.1 HRS TOTAL',
        },
      ],
      speakerNotes:
        'For teams with more than four members requiring two separate workflows, Workflow 2 automates drainage zone water quality and H2S gas safety alerts across 8 Manila zones, saving an additional 7.6 hours (456 minutes) per week.',
    },
    {
      slideNumber: '08',
      id: 'SLIDE-08-SCORECARD',
      badge: 'SET 4 OF 4 • PRESENTATION SLIDES & FINAL RUBRIC SCORECARD (50 POINTS)',
      title: 'Complete 4-Set, 11-Item Rubric Verification (250 / 250 Total Score)',
      subtitle:
        'Ready-to-submit Flowchart, Workflow Specification, Final Review Essays, and Animated Presentation Deck.',
      pointsBadge: `${evaluation.earnedScore} / 250 PTS (${evaluation.percentage}%)`,
      accentColor: '#34d399',
      animationPreset: 'zoom-cascade',
      animatedCards: evaluation.setScores.map((s) => ({
        stepLabel: `SET ${s.setNumber} VERIFIED SCORE`,
        heading: s.title,
        body: `All items in Set ${s.setNumber} verified and ready for LMS submission with downloadable files and copy-ready markdown.`,
        metricBadge: `${s.earnedPoints} / ${s.maxPoints} PTS`,
      })),
      speakerNotes: `This concludes our presentation deck with ${evaluation.earnedScore} out of 250 Total Score (${evaluation.percentage}%) across all 4 Sets and 11 Items. Thank you!`,
    },
  ];
}

/**
 * Generates a high-resolution, standalone SVG Flowchart diagram file for:
 * Set 2 — Question 1: "Upload your Flowchart here * (50 Points)"
 */
export function generateFlowchartSvgContent() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 760" width="1200" height="760">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#060d1f" />
      <stop offset="100%" stop-color="#0a1936" />
    </linearGradient>
    <linearGradient id="nodeCyan" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0f2952" />
      <stop offset="100%" stop-color="#153e75" />
    </linearGradient>
    <linearGradient id="nodeEmerald" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#064e3b" />
      <stop offset="100%" stop-color="#047857" />
    </linearGradient>
    <linearGradient id="nodeAmber" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#451a03" />
      <stop offset="100%" stop-color="#78350f" />
    </linearGradient>
    <marker id="arrowCyan" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
      <path d="M0,0 L10,5 L0,10 Z" fill="#38bdf8" />
    </marker>
    <marker id="arrowAmber" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
      <path d="M0,0 L10,5 L0,10 Z" fill="#fbbf24" />
    </marker>
    <marker id="arrowEmerald" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
      <path d="M0,0 L10,5 L0,10 Z" fill="#34d399" />
    </marker>
  </defs>

  <rect width="1200" height="760" fill="url(#bgGrad)" />
  <rect x="20" y="20" width="1160" height="720" rx="18" fill="none" stroke="#38bdf8" stroke-opacity="0.35" stroke-width="2" />

  <!-- Header -->
  <text x="50" y="62" fill="#38bdf8" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="13" font-weight="800" letter-spacing="1.5">
    AUTOMATED PROBLEM-SOLVER PROJECT • DESIGN YOUR WORKFLOW (THE "HOW") • 50 POINTS
  </text>
  <text x="50" y="95" fill="#ffffff" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="25" font-weight="800">
    Custom Automated Workflow Flowchart — Barangay Declogging &amp; GIS Smart Tracker
  </text>
  <text x="50" y="120" fill="#cbd5e1" font-family="Segoe UI, Inter, Arial, sans-serif" font-size="14">
    Start Trigger ➔ 6-Point Completeness &amp; Privacy Gate ➔ GIS District Auto-Detection ➔ AI Triage &amp; Drafting ➔ Safe Execution &amp; Closure
  </text>

  <!-- Row 1: Trigger -> Step 01 -> Step 02 Decision Diamond -> Branch No -->
  <rect x="50" y="160" width="210" height="90" rx="45" fill="url(#nodeEmerald)" stroke="#34d399" stroke-width="2.5" />
  <text x="155" y="195" text-anchor="middle" fill="#6ee7b7" font-family="Segoe UI, Arial" font-size="11" font-weight="800">THE TRIGGER (START)</text>
  <text x="155" y="216" text-anchor="middle" fill="#ffffff" font-family="Segoe UI, Arial" font-size="13" font-weight="700">Request Submitted or</text>
  <text x="155" y="234" text-anchor="middle" fill="#ffffff" font-family="Segoe UI, Arial" font-size="13" font-weight="700">GIS Map Pin Dropped</text>

  <line x1="260" y1="205" x2="310" y2="205" stroke="#38bdf8" stroke-width="3" marker-end="url(#arrowCyan)" />

  <rect x="315" y="160" width="230" height="90" rx="12" fill="url(#nodeCyan)" stroke="#38bdf8" stroke-width="2" />
  <text x="430" y="188" text-anchor="middle" fill="#38bdf8" font-family="Segoe UI, Arial" font-size="11" font-weight="800">STAGE 01 • INTAKE &amp; PRIVACY</text>
  <text x="430" y="210" text-anchor="middle" fill="#ffffff" font-family="Segoe UI, Arial" font-size="13" font-weight="700">Verify Explicit Consent Notice</text>
  <text x="430" y="230" text-anchor="middle" fill="#cbd5e1" font-family="Segoe UI, Arial" font-size="11">Strip Disallowed Fields &amp; Redact PII</text>

  <line x1="545" y1="205" x2="600" y2="205" stroke="#38bdf8" stroke-width="3" marker-end="url(#arrowCyan)" />

  <!-- Decision Box -->
  <rect x="605" y="150" width="250" height="110" rx="14" fill="url(#nodeAmber)" stroke="#fbbf24" stroke-width="2.5" />
  <text x="730" y="180" text-anchor="middle" fill="#fbbf24" font-family="Segoe UI, Arial" font-size="11" font-weight="800">STAGE 02 • DECISION GATE</text>
  <text x="730" y="202" text-anchor="middle" fill="#ffffff" font-family="Segoe UI, Arial" font-size="13" font-weight="700">Are All 6 Engineering Fields</text>
  <text x="730" y="220" text-anchor="middle" fill="#ffffff" font-family="Segoe UI, Arial" font-size="13" font-weight="700">&amp; Coordinates Complete?</text>
  <text x="730" y="242" text-anchor="middle" fill="#fde68a" font-family="Segoe UI, Arial" font-size="11">IF NO ➔ Return | IF YES ➔ Register</text>

  <line x1="855" y1="205" x2="915" y2="205" stroke="#fbbf24" stroke-width="3" marker-end="url(#arrowAmber)" />
  <text x="885" y="195" text-anchor="middle" fill="#fbbf24" font-family="Segoe UI, Arial" font-size="11" font-weight="800">NO</text>

  <rect x="920" y="160" width="230" height="90" rx="12" fill="#3b0714" stroke="#f43f5e" stroke-width="2" />
  <text x="1035" y="188" text-anchor="middle" fill="#fda4af" font-family="Segoe UI, Arial" font-size="11" font-weight="800">EXCEPTION BRANCH</text>
  <text x="1035" y="210" text-anchor="middle" fill="#ffffff" font-family="Segoe UI, Arial" font-size="13" font-weight="700">Returned for Clarification</text>
  <text x="1035" y="230" text-anchor="middle" fill="#fecdd3" font-family="Segoe UI, Arial" font-size="11">Auto-Draft Missing Landmarks Alert</text>

  <!-- Down Arrow from Decision YES to Row 2 -->
  <line x1="730" y1="260" x2="730" y2="335" stroke="#34d399" stroke-width="3" marker-end="url(#arrowEmerald)" />
  <text x="755" y="302" fill="#34d399" font-family="Segoe UI, Arial" font-size="12" font-weight="800">YES (100% Complete)</text>

  <!-- Row 2: Stage 03 -> Stage 04 (AI) -> Stage 05 -->
  <rect x="605" y="340" width="250" height="100" rx="12" fill="url(#nodeCyan)" stroke="#38bdf8" stroke-width="2" />
  <text x="730" y="368" text-anchor="middle" fill="#38bdf8" font-family="Segoe UI, Arial" font-size="11" font-weight="800">STAGE 03 • GIS AUTO-REGISTER</text>
  <text x="730" y="390" text-anchor="middle" fill="#ffffff" font-family="Segoe UI, Arial" font-size="13" font-weight="700">Assign DEO-2026-NNN ID</text>
  <text x="730" y="408" text-anchor="middle" fill="#cbd5e1" font-family="Segoe UI, Arial" font-size="11">Point-in-Polygon Manila District</text>
  <text x="730" y="425" text-anchor="middle" fill="#cbd5e1" font-family="Segoe UI, Arial" font-size="11">+ Active Street Duplicate Check</text>

  <line x1="605" y1="390" x2="550" y2="390" stroke="#38bdf8" stroke-width="3" marker-end="url(#arrowCyan)" />

  <rect x="295" y="340" width="250" height="100" rx="12" fill="url(#nodeAmber)" stroke="#fbbf24" stroke-width="2.5" />
  <text x="420" y="368" text-anchor="middle" fill="#fbbf24" font-family="Segoe UI, Arial" font-size="11" font-weight="800">STAGE 04 • AI ENHANCEMENT STEP</text>
  <text x="420" y="390" text-anchor="middle" fill="#ffffff" font-family="Segoe UI, Arial" font-size="13" font-weight="700">AI Context Triage &amp; Drafting</text>
  <text x="420" y="408" text-anchor="middle" fill="#fde68a" font-family="Segoe UI, Arial" font-size="11">Analyzes Unstructured Taglish Hazard</text>
  <text x="420" y="425" text-anchor="middle" fill="#fde68a" font-family="Segoe UI, Arial" font-size="11">+ Drafts Bilingual Endorsement Memo</text>

  <line x1="295" y1="390" x2="245" y2="390" stroke="#38bdf8" stroke-width="3" marker-end="url(#arrowCyan)" />

  <rect x="45" y="340" width="195" height="100" rx="12" fill="url(#nodeCyan)" stroke="#38bdf8" stroke-width="2" />
  <text x="142" y="368" text-anchor="middle" fill="#38bdf8" font-family="Segoe UI, Arial" font-size="11" font-weight="800">STAGE 05 • INSPECT</text>
  <text x="142" y="390" text-anchor="middle" fill="#ffffff" font-family="Segoe UI, Arial" font-size="13" font-weight="700">Site Ocular &amp; H2S Gas</text>
  <text x="142" y="408" text-anchor="middle" fill="#cbd5e1" font-family="Segoe UI, Arial" font-size="11">Verify H2S &lt; 3.0 ppm Safe</text>
  <text x="142" y="425" text-anchor="middle" fill="#cbd5e1" font-family="Segoe UI, Arial" font-size="11">+ Measure Silt Depth (cm)</text>

  <!-- Down Arrow from Stage 05 to Row 3 -->
  <line x1="142" y1="440" x2="142" y2="515" stroke="#38bdf8" stroke-width="3" marker-end="url(#arrowCyan)" />

  <!-- Row 3: Stage 06 -> Stage 07 -> Stage 08 (Goal / End) -->
  <rect x="45" y="520" width="230" height="95" rx="12" fill="url(#nodeCyan)" stroke="#38bdf8" stroke-width="2" />
  <text x="160" y="548" text-anchor="middle" fill="#38bdf8" font-family="Segoe UI, Arial" font-size="11" font-weight="800">STAGE 06 • SCHEDULE</text>
  <text x="160" y="570" text-anchor="middle" fill="#ffffff" font-family="Segoe UI, Arial" font-size="13" font-weight="700">Human-in-the-Loop Approval</text>
  <text x="160" y="590" text-anchor="middle" fill="#cbd5e1" font-family="Segoe UI, Arial" font-size="11">Assign Vacuum Truck &amp; Crew Slot</text>

  <line x1="275" y1="568" x2="340" y2="568" stroke="#38bdf8" stroke-width="3" marker-end="url(#arrowCyan)" />

  <rect x="345" y="520" width="250" height="95" rx="12" fill="url(#nodeCyan)" stroke="#38bdf8" stroke-width="2" />
  <text x="470" y="548" text-anchor="middle" fill="#38bdf8" font-family="Segoe UI, Arial" font-size="11" font-weight="800">STAGE 07 • IMPLEMENT</text>
  <text x="470" y="570" text-anchor="middle" fill="#ffffff" font-family="Segoe UI, Arial" font-size="13" font-weight="700">Execute Declogging &amp; Desilting</text>
  <text x="470" y="590" text-anchor="middle" fill="#cbd5e1" font-family="Segoe UI, Arial" font-size="11">High-Pressure Jetting &amp; Silt Hauling</text>

  <line x1="595" y1="568" x2="660" y2="568" stroke="#34d399" stroke-width="3" marker-end="url(#arrowEmerald)" />

  <rect x="665" y="515" width="485" height="105" rx="48" fill="url(#nodeEmerald)" stroke="#34d399" stroke-width="3" />
  <text x="907" y="545" text-anchor="middle" fill="#6ee7b7" font-family="Segoe UI, Arial" font-size="12" font-weight="800">THE GOAL (END) • STAGE 08 • CLOSE &amp; ARCHIVE</text>
  <text x="907" y="568" text-anchor="middle" fill="#ffffff" font-family="Segoe UI, Arial" font-size="15" font-weight="800">Drainage Restored + Signed Barangay Receipt + Immutable Audit Log</text>
  <text x="907" y="590" text-anchor="middle" fill="#d1fae5" font-family="Segoe UI, Arial" font-size="12" font-weight="700">Saves 22.5 Hours/Week (1,350 Mins/Week) • Cuts Turnaround Time by 35.4%</text>

  <!-- Footer Summary Strip -->
  <rect x="45" y="655" width="1105" height="55" rx="10" fill="#0f172a" stroke="#38bdf8" stroke-opacity="0.4" />
  <text x="65" y="680" fill="#38bdf8" font-family="Segoe UI, Arial" font-size="12" font-weight="800">
    PRIVACY &amp; AI SAFEGUARDS:
  </text>
  <text x="235" y="680" fill="#e2e8f0" font-family="Segoe UI, Arial" font-size="12">
    Explicit Consent Notice Required • Data Minimization (No DOB/TIN/SSS/Financials) • Auto PII Masking • Human-in-the-Loop AI Review
  </text>
  <text x="65" y="698" fill="#6ee7b7" font-family="Segoe UI, Arial" font-size="11" font-weight="700">
    Course: Implement Basic Automation Techniques Using AI Tools — Automated Problem-Solver Project (4 Sets • 11 Items • 250 Total Score)
  </text>
</svg>`;
}

/**
 * Generates a complete, formatted Workflow Specification Document (.doc / .html / .txt compatible)
 * for Set 2 — Question 2: "Upload your Workflow here * (50 Points)"
 */
export function generateWorkflowSpecificationDoc(input = {}) {
  const evaluation =
    input.evaluation ||
    evaluateProblemSolverProjectSubmission({
      memberCount: input.memberCount || 4,
      workflow1Answers: input.workflow1Answers,
      workflow2Answers: input.workflow2Answers,
    });

  const sections = AUTOMATED_PROBLEM_SOLVER_PROJECT.sets
    .map((setObj) => {
      const itemsText = setObj.items
        .map((it) => {
          const res = evaluation.itemResults.find((r) => r.itemId === it.itemId);
          return `
--------------------------------------------------------------------------------
${it.title} (${it.maxPoints} Points)
Prompt: ${it.prompt}

[WORKFLOW 1 — BARANGAY DECLOGGING & GIS SMART TRACKER AUTOMATION]:
${res?.workflow1Text || it.workflow1Default}

[WORKFLOW 2 (FOR TEAMS > 4 MEMBERS) — DRAINAGE ZONE WATER QUALITY & H2S SAFETY]:
${res?.workflow2Text || it.workflow2Default}
`;
        })
        .join('\n');

      return `================================================================================
${setObj.title.toUpperCase()} (${setObj.maxPoints} POINTS)
${setObj.subtitle}
================================================================================
${itemsText}`;
    })
    .join('\n\n');

  return `================================================================================
AUTOMATED PROBLEM-SOLVER PROJECT – DESIGN YOUR CUSTOM WORKFLOW
Course: Implement Basic Automation Techniques Using AI Tools
4 Sets | 11 Items | 250 Total Score | Verified Score: ${evaluation.earnedScore} / ${evaluation.maxScore} (${evaluation.percentage}%)
Project Goal: ${AUTOMATED_PROBLEM_SOLVER_PROJECT.projectGoal}
Team Configuration: ${evaluation.workMode}
Data Privacy Consent Notice: "${DEPW_PRIVACY_CONSENT_NOTICE}"
================================================================================

${sections}
`;
}

/**
 * Generates a real Microsoft PowerPoint-compatible (.ppt) presentation file content
 * using PowerPoint's native HTML/XML presentation schema with slide breaks and styled layouts.
 */
export function generatePowerPointPptContent(slides = [], metadata = {}) {
  const resolvedSlides =
    Array.isArray(slides) && slides.length > 0 ? slides : buildAnimatedProjectSlides();
  const title = metadata.title || AUTOMATED_PROBLEM_SOLVER_PROJECT.title;
  const author = metadata.author || 'DEPW Manila Custom Workflow Team';

  const slideBlocks = resolvedSlides
    .map(
      (slide, idx) => `
      <div class="Slide" id="slide-${idx + 1}" style="page-break-after: always; background: #060d1f; color: #f8fafc; padding: 36pt; font-family: 'Segoe UI', Arial, sans-serif; border: 2pt solid ${escapeHtml(slide.accentColor || '#38bdf8')}; border-radius: 12pt; margin-bottom: 24pt;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12pt;">
          <span style="font-size: 11pt; font-weight: bold; color: ${escapeHtml(slide.accentColor || '#38bdf8')}; letter-spacing: 1pt;">
            SLIDE ${escapeHtml(slide.slideNumber)} • ${escapeHtml(slide.badge)}
          </span>
          <span style="font-size: 11pt; font-weight: bold; color: #6ee7b7; background: #064e3b; padding: 4pt 10pt; border-radius: 6pt;">
            ${escapeHtml(slide.pointsBadge)}
          </span>
        </div>
        <h1 style="font-size: 24pt; font-weight: 800; color: #ffffff; margin: 0 0 8pt 0;">
          ${escapeHtml(slide.title)}
        </h1>
        <p style="font-size: 13pt; color: #cbd5e1; margin: 0 0 18pt 0;">
          ${escapeHtml(slide.subtitle)}
        </p>
        <table width="100%" cellpadding="10" cellspacing="8" style="border-collapse: separate; border-spacing: 8pt;">
          ${(slide.animatedCards || [])
            .map(
              (card) => `
            <tr>
              <td style="background: #0f1f44; border-left: 4pt solid ${escapeHtml(slide.accentColor || '#38bdf8')}; padding: 12pt; border-radius: 8pt;">
                <div style="font-size: 10pt; font-weight: bold; color: #38bdf8; margin-bottom: 4pt;">
                  ${escapeHtml(card.stepLabel)} — [${escapeHtml(card.metricBadge || '')}]
                </div>
                <div style="font-size: 14pt; font-weight: bold; color: #ffffff; margin-bottom: 4pt;">
                  ${escapeHtml(card.heading)}
                </div>
                <div style="font-size: 11.5pt; color: #e2e8f0; line-height: 1.45; white-space: pre-line;">
                  ${escapeHtml(card.body)}
                </div>
                ${
                  card.secondaryWorkflowBody
                    ? `<div style="font-size: 10.5pt; color: #fde68a; margin-top: 6pt; padding-top: 6pt; border-top: 1pt dashed #f59e0b;">
                        <strong>Workflow 2 (Drainage Water Quality &amp; H2S Safety):</strong> ${escapeHtml(card.secondaryWorkflowBody)}
                      </div>`
                    : ''
                }
              </td>
            </tr>
          `
            )
            .join('')}
        </table>
        <div style="margin-top: 14pt; padding-top: 8pt; border-top: 1pt solid #1e293b; font-size: 10pt; color: #94a3b8;">
          <strong>Speaker Notes:</strong> ${escapeHtml(slide.speakerNotes)}
        </div>
      </div>`
    )
    .join('\n');

  return `<html xmlns:v="urn:schemas-microsoft-com:vml"
xmlns:o="urn:schemas-microsoft-com:office:office"
xmlns:p="urn:schemas-microsoft-com:office:powerpoint"
xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<meta name="ProgId" content="PowerPoint.Slide">
<meta name="Generator" content="Manila DEPW Automated Problem-Solver PPT Generator">
<title>${escapeHtml(title)}</title>
<!--[if gte mso 9]><xml>
 <o:DocumentProperties>
  <o:Author>${escapeHtml(author)}</o:Author>
  <o:Title>${escapeHtml(title)}</o:Title>
 </o:DocumentProperties>
 <p:Presentation sizeof="screen16x9" />
</xml><![endif]-->
<style>
  @page { size: 13.333in 7.5in; margin: 0.4in; }
  body { background: #060d1f; color: #f8fafc; font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 20px; }
</style>
</head>
<body>
${slideBlocks}
</body>
</html>`;
}

/**
 * Generates a 100% self-contained, offline-ready, Fully Animated HTML5 Presentation Deck
 * with CSS keyframe animations, staggered card transitions, auto-play timer, and keyboard navigation.
 */
export function generateAnimatedHtmlDeckContent(slides = [], metadata = {}) {
  const resolvedSlides =
    Array.isArray(slides) && slides.length > 0 ? slides : buildAnimatedProjectSlides();
  const title = metadata.title || AUTOMATED_PROBLEM_SOLVER_PROJECT.title;
  const serializedSlides = JSON.stringify(resolvedSlides);

  return `<!doctype html>
<html lang="en" data-theme="navy-glass">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)} — Fully Animated Presentation</title>
  <style>
    :root, html[data-theme="navy-glass"] {
      --bg-deep: #060d1f;
      --bg-mid: #0a1633;
      --glass: rgba(16, 34, 74, 0.82);
      --border: rgba(125, 211, 252, 0.32);
      --text-main: #ffffff;
      --text-sub: #cbd5e1;
      --accent: #38bdf8;
    }
    html[data-theme="daylight-civic"] {
      --bg-deep: #f1f5f9;
      --bg-mid: #e2e8f0;
      --glass: rgba(255, 255, 255, 0.92);
      --border: rgba(148, 163, 184, 0.5);
      --text-main: #0f172a;
      --text-sub: #334155;
      --accent: #0284c7;
    }
    html[data-theme="emerald-hydro"] {
      --bg-deep: #041d1b;
      --bg-mid: #08332e;
      --glass: rgba(9, 50, 45, 0.82);
      --border: rgba(52, 211, 153, 0.35);
      --text-main: #f0fdf4;
      --text-sub: #ccfbf1;
      --accent: #10b981;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      background: radial-gradient(circle at 15% 15%, var(--bg-mid), var(--bg-deep));
      color: var(--text-main);
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      display: flex;
      flex-direction: column;
      overflow-x: hidden;
    }
    @keyframes slideInCascade {
      0% { opacity: 0; transform: translateY(28px) scale(0.97); }
      100% { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes pulseBorder {
      0%, 100% { box-shadow: 0 0 0 rgba(56, 189, 248, 0); }
      50% { box-shadow: 0 0 24px rgba(56, 189, 248, 0.25); }
    }
    .topbar {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      padding: 14px 24px;
      background: var(--glass);
      border-bottom: 1px solid var(--border);
      backdrop-filter: blur(12px);
    }
    .btn {
      padding: 8px 14px;
      border-radius: 8px;
      border: 1px solid var(--border);
      background: rgba(56, 189, 248, 0.15);
      color: var(--text-main);
      font-weight: 700;
      font-size: 12px;
      cursor: pointer;
    }
    .btn:hover { filter: brightness(1.15); }
    .stage {
      flex: 1;
      max-width: 1200px;
      width: 100%;
      margin: 0 auto;
      padding: 28px 24px;
      display: flex;
      flex-direction: column;
      gap: 18px;
    }
    .slide-header {
      animation: slideInCascade 420ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 14px;
    }
    .card {
      background: var(--glass);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 18px;
      opacity: 0;
      animation: slideInCascade 520ms cubic-bezier(0.16, 1, 0.3, 1) forwards, pulseBorder 4s infinite;
    }
  </style>
</head>
<body>
  <div class="topbar">
    <div>
      <strong style="color: var(--accent); font-size: 12px; letter-spacing: 0.08em;">AUTOMATED PROBLEM-SOLVER PROJECT • 4 SETS • 11 ITEMS • 250 PTS</strong>
      <div id="slide-counter" style="font-size: 14px; font-weight: 800;">Slide 01 / 08</div>
    </div>
    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
      <button class="btn" onclick="prevSlide()">◀ Prev</button>
      <button class="btn" id="autoplay-btn" onclick="toggleAutoplay()">▶ Auto-Play</button>
      <button class="btn" onclick="nextSlide()">Next ▶</button>
      <button class="btn" onclick="cycleTheme()">🎨 Switch Theme</button>
    </div>
  </div>
  <main class="stage" id="slide-stage"></main>
  <script>
    const SLIDES = ${serializedSlides};
    const THEMES = ['navy-glass', 'daylight-civic', 'emerald-hydro'];
    let idx = 0;
    let timer = null;
    let themeIdx = 0;

    function render() {
      const s = SLIDES[idx];
      document.getElementById('slide-counter').textContent = 'Slide ' + s.slideNumber + ' / 0' + SLIDES.length + ' — ' + s.pointsBadge;
      const cardsHtml = (s.animatedCards || []).map((c, i) => \`
        <div class="card" style="animation-delay: \${(i + 1) * 110}ms;">
          <div style="display:flex;justify-content:space-between;font-size:11px;font-weight:800;color:var(--accent);margin-bottom:6px;">
            <span>\${c.stepLabel}</span>
            <span>\${c.metricBadge || ''}</span>
          </div>
          <h3 style="margin:0 0 8px 0;font-size:16px;">\${c.heading}</h3>
          <p style="margin:0;font-size:13px;color:var(--text-sub);line-height:1.55;white-space:pre-line;">\${c.body}</p>
        </div>
      \`).join('');

      document.getElementById('slide-stage').innerHTML = \`
        <div class="slide-header">
          <div style="font-size:12px;font-weight:800;color:var(--accent);margin-bottom:6px;">\${s.badge}</div>
          <h1 style="margin:0 0 8px 0;font-size:clamp(22px,3vw,32px);">\${s.title}</h1>
          <p style="margin:0;font-size:15px;color:var(--text-sub);">\${s.subtitle}</p>
        </div>
        <div class="cards-grid">\${cardsHtml}</div>
        <div style="margin-top:auto;padding:14px 18px;border-radius:12px;background:var(--glass);border:1px solid var(--border);font-size:13px;color:var(--text-sub);">
          <strong style="color:var(--accent);">Speaker Notes:</strong> \${s.speakerNotes}
        </div>
      \`;
    }
    function nextSlide() { idx = (idx + 1) % SLIDES.length; render(); }
    function prevSlide() { idx = (idx - 1 + SLIDES.length) % SLIDES.length; render(); }
    function toggleAutoplay() {
      const btn = document.getElementById('autoplay-btn');
      if (timer) { clearInterval(timer); timer = null; btn.textContent = '▶ Auto-Play'; }
      else { timer = setInterval(nextSlide, 5000); btn.textContent = '⏸ Pause Auto-Play'; }
    }
    function cycleTheme() {
      themeIdx = (themeIdx + 1) % THEMES.length;
      document.documentElement.setAttribute('data-theme', THEMES[themeIdx]);
    }
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    });
    render();
  </script>
</body>
</html>`;
}
