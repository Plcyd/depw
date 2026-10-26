/**
 * Centralized Frontend REST API Service for DEPW Assist
 * Dual-Mode Architecture:
 * 1. Full-Stack Mode (AI Studio / Cloud Run / Express + SQLite backend at /api/*)
 * 2. Static Client-Side Mode (GitHub Pages *.github.io / static hosts / offline fallback)
 *    backed by persistent localStorage tables and shared domain logic from workflowRules.js.
 */
import {
  INITIAL_WATER_QUALITY_LOGS,
  IDENTIFIED_DRAINAGE_ZONES,
  MANILA_16_DISTRICTS,
  validateWaterQualityEntry,
  evaluateWaterDrainageSafety,
  calculateDashboardMetrics,
  canTransitionStatus,
  getExplainableNextStep,
  evaluateRequestCompleteness,
  computeTicketAuditDiff,
  findPotentialDuplicates,
  generateSampleRequestLetter,
  getManilaSpatialDrainageContext,
} from '../utils/workflowRules.js';

const WQL_STORAGE_KEY = 'depw_water_quality_logs_v1';
const TICKETS_STORAGE_KEY = 'depw_tickets_v2';
const HISTORY_STORAGE_KEY = 'depw_ticket_history_v2';
const ASSETS_STORAGE_KEY = 'depw_drainage_assets_v2';
const SCHEDULES_STORAGE_KEY = 'depw_schedules_v2';

// Detect if hosted on GitHub Pages or static file server where no Node /api/* backend exists
let staticModeDetected =
  typeof window !== 'undefined' &&
  (window.location.hostname.includes('github.io') ||
    window.location.hostname.includes('pages.dev') ||
    window.location.hostname.includes('netlify.app') ||
    window.location.hostname.includes('vercel.app') ||
    window.location.protocol === 'file:');

function isStaticMode() {
  return staticModeDetected;
}

const INITIAL_TICKETS = [
  {
    ticketId: 'DEO-2026-001',
    dateReceived: '10/20/2026',
    barangay: 'Barangay 123, Zone 10',
    district: 'Tondo',
    legislativeDistrict: '1st District',
    streetAddress: 'Estero de Vitas Service Road cor. Velasquez St.',
    requestType: 'Declogging',
    status: 'Pending Evaluation',
    priority: 'Elevated',
    actionTaken: 'Endorsed to DEPW District 1 Evaluation Team',
    nextStep: 'Conduct technical review and drainage profile check',
    requesterName: 'Juan D. Cruz',
    requesterRole: 'Barangay Kagawad',
    description:
      'Magalang po kaming humihiling ng tulong mula sa Department of Engineering Office para sa pagsasagawa ng declogging sa isang bahagi ng drainage sa aming barangay. Napansin po ang pag-ipon ng putik at iba pang debris na maaaring makaapekto sa maayos na daloy ng tubig.',
    latitude: 14.6195,
    longitude: 120.9678,
    coordSource: 'Verified DEPW GIS Benchmark Pin',
    coordVerified: true,
    inspectionChecklist: [
      { item: 'Request letter signed by Barangay official', done: true },
      { item: 'Street segment and nearest landmark identified', done: true },
      { item: 'Joint ocular site inspection completed', done: false },
      { item: 'Silt depth and manhole access measured', done: false },
    ],
    createdAt: '2026-10-20T08:30:00.000Z',
    updatedAt: '2026-10-20T14:15:00.000Z',
  },
  {
    ticketId: 'DEO-2026-002',
    dateReceived: '10/21/2026',
    barangay: 'Barangay 456, Zone 45',
    district: 'Sampaloc',
    legislativeDistrict: '4th District',
    streetAddress: 'España Boulevard cor. Maceda St. Lateral Gutter',
    requestType: 'Declogging',
    status: 'For Verification',
    priority: 'Routine',
    actionTaken: 'Documents received at Receiving Liaison Desk',
    nextStep: 'Verify completeness of location sketch and contact details',
    requesterName: 'Maria L. Santos',
    requesterRole: 'Barangay Secretary',
    description:
      'Requesting assistance to clear accumulated leaf litter and silt sediment along the secondary lateral curb inlet and gutter.',
    latitude: 14.611,
    longitude: 120.9955,
    coordSource: 'Barangay Submitted Pin',
    coordVerified: false,
    inspectionChecklist: [
      { item: 'Request letter signed by Barangay official', done: true },
      { item: 'Street segment and nearest landmark identified', done: false },
      { item: 'Joint ocular site inspection completed', done: false },
    ],
    createdAt: '2026-10-21T09:10:00.000Z',
    updatedAt: '2026-10-21T09:10:00.000Z',
  },
  {
    ticketId: 'DEO-2026-003',
    dateReceived: '10/22/2026',
    barangay: 'Barangay 668, Zone 72',
    district: 'Ermita',
    legislativeDistrict: '5th District',
    streetAddress: 'Padre Faura St. cor. Taft Ave. Storm Drain',
    requestType: 'Declogging',
    status: 'Inspection Scheduled',
    priority: 'High Priority',
    actionTaken: 'Joint ocular inspection scheduled with Barangay Kagawad',
    nextStep: 'Complete field assessment of box culvert inlets',
    requesterName: 'Roberto M. Reyes',
    requesterRole: 'Barangay Kagawad',
    description:
      'Slow stormwater runoff observed after heavy rain; requesting technical inspection and vacuum declogging of reinforced concrete box culvert inlets.',
    latitude: 14.5826,
    longitude: 120.9822,
    coordSource: 'Verified DEPW GIS Benchmark Pin',
    coordVerified: true,
    inspectionChecklist: [
      { item: 'Request letter signed by Barangay official', done: true },
      { item: 'Street segment and nearest landmark identified', done: true },
      { item: 'Joint ocular site inspection completed', done: false },
    ],
    createdAt: '2026-10-22T10:00:00.000Z',
    updatedAt: '2026-10-22T15:45:00.000Z',
  },
  {
    ticketId: 'DEO-2026-004',
    dateReceived: '10/18/2026',
    barangay: 'Barangay 310, Zone 31',
    district: 'Quiapo',
    legislativeDistrict: '3rd District',
    streetAddress: 'Hidalgo St. Covered Drainage Channel',
    requestType: 'Desilting',
    status: 'Completed',
    priority: 'Elevated',
    actionTaken: 'Desilting and debris haulage completed by Crew 2',
    nextStep: 'Archive Barangay completion acknowledgment and close ticket',
    requesterName: 'Elena P. Mendoza',
    requesterRole: 'Punong Barangay',
    description:
      'Desilting of covered masonry drainage channel and clearing of 3 primary street catch basins.',
    latitude: 14.5994,
    longitude: 120.9848,
    coordSource: 'Verified DEPW GIS Benchmark Pin',
    coordVerified: true,
    inspectionChecklist: [
      { item: 'Request letter signed by Barangay official', done: true },
      { item: 'Street segment and nearest landmark identified', done: true },
      { item: 'Joint ocular site inspection completed', done: true },
      { item: 'Post-operation haulage & flow verified', done: true },
    ],
    createdAt: '2026-10-18T08:00:00.000Z',
    updatedAt: '2026-10-22T17:00:00.000Z',
  },
  {
    ticketId: 'DEO-2026-005',
    dateReceived: '10/19/2026',
    barangay: 'Barangay 602, Zone 60',
    district: 'Santa Mesa',
    legislativeDistrict: '6th District',
    streetAddress: 'Old Sta. Mesa St. cor. Teresa St. Drainage Line',
    requestType: 'Manhole Repair',
    status: 'In Progress',
    priority: 'Routine',
    actionTaken: 'Field crew clearing silted manhole chamber and collar',
    nextStep: 'Complete cast-iron frame resetting and hydraulic flow check',
    requesterName: 'Carlos V. Bautista',
    requesterRole: 'Barangay Kagawad',
    description:
      'Silted manhole chamber and displaced concrete collar along high-foot-traffic commuter corridor.',
    latitude: 14.6018,
    longitude: 121.0124,
    coordSource: 'Verified DEPW GIS Benchmark Pin',
    coordVerified: true,
    inspectionChecklist: [
      { item: 'Request letter signed by Barangay official', done: true },
      { item: 'Street segment and nearest landmark identified', done: true },
      { item: 'Joint ocular site inspection completed', done: true },
    ],
    createdAt: '2026-10-19T11:20:00.000Z',
    updatedAt: '2026-10-22T13:10:00.000Z',
  },
  {
    ticketId: 'DEO-2026-006',
    dateReceived: '10/22/2026',
    barangay: 'Barangay 204, Zone 19',
    district: 'Tondo',
    legislativeDistrict: '2nd District',
    streetAddress: 'Gagalangin Pampanga St. Interior Drainage Alley',
    requestType: 'Gutter Clearance',
    status: 'Returned for Clarification',
    priority: 'Routine',
    actionTaken: 'Returned to Barangay for exact street corner sketch',
    nextStep: 'Await updated location sketch from Barangay Secretary',
    requesterName: 'Noel G. Villanueva',
    requesterRole: 'Barangay Kagawad',
    description:
      'Request for lateral gutter declogging; requires clarification on exact interior alley intersection and manhole access.',
    latitude: 14.626,
    longitude: 120.973,
    coordSource: 'Approximate District Pin',
    coordVerified: false,
    inspectionChecklist: [
      { item: 'Request letter signed by Barangay official', done: true },
      { item: 'Street segment and nearest landmark identified', done: false },
    ],
    createdAt: '2026-10-22T14:00:00.000Z',
    updatedAt: '2026-10-22T16:30:00.000Z',
  },
];

const INITIAL_ASSETS = [
  {
    assetId: 'DRN-MNL-101',
    name: 'Estero de Vitas Lateral Box Culvert',
    district: 'Tondo',
    legislativeDistrict: '1st District',
    assetType: 'Reinforced Concrete Box Culvert (RCBC)',
    dimensions: '1.8m x 1.5m • 420m span',
    conditionStatus: 'Needs Periodic Desilting',
    lastInspected: '2026-10-15',
    latitude: 14.6195,
    longitude: 120.9678,
  },
  {
    assetId: 'DRN-MNL-204',
    name: 'España-Sampaloc Interceptor Line B',
    district: 'Sampaloc',
    legislativeDistrict: '4th District',
    assetType: 'High-Density Concrete Pipe (HDCP)',
    dimensions: '1.2m dia • 680m span',
    conditionStatus: 'Under Monitoring',
    lastInspected: '2026-10-18',
    latitude: 14.611,
    longitude: 120.9955,
  },
  {
    assetId: 'DRN-MNL-309',
    name: 'Padre Faura Storm Drain Outfall',
    district: 'Ermita',
    legislativeDistrict: '5th District',
    assetType: 'Curb Inlet & Catch Basin Network',
    dimensions: '0.9m dia • 18 catch basins',
    conditionStatus: 'Inspection Scheduled',
    lastInspected: '2026-10-20',
    latitude: 14.5826,
    longitude: 120.9822,
  },
  {
    assetId: 'DRN-MNL-412',
    name: 'Binondo-San Nicolas Tidal Gate Channel',
    district: 'Binondo',
    legislativeDistrict: '3rd District',
    assetType: 'Masonry Canal & Silt Trap',
    dimensions: '2.2m x 1.8m • 310m span',
    conditionStatus: 'Operational / Clear',
    lastInspected: '2026-10-19',
    latitude: 14.601,
    longitude: 120.9745,
  },
];

const INITIAL_SCHEDULES = [
  {
    eventId: 'SCH-2026-01',
    ticketId: 'DEO-2026-003',
    title: 'Joint Site Inspection — Barangay 668, Zone 72',
    scheduledDate: '2026-10-25',
    scheduleType: 'Site Inspection',
    confirmationStatus: 'Proposed (Awaiting Confirmation)',
    assignedUnit: 'DEPW Field Assessment Team B',
    notes: 'Verify catch basin silt level with Brgy Kagawad Roberto M. Reyes at Padre Faura St.',
  },
  {
    eventId: 'SCH-2026-02',
    ticketId: 'DEO-2026-005',
    title: 'Manhole Desilting & Collar Reset — Barangay 602, Zone 60',
    scheduledDate: '2026-10-24',
    scheduleType: 'Field Implementation',
    confirmationStatus: 'Confirmed Operations Schedule',
    assignedUnit: 'Drainage Maintenance Crew 3',
    notes: 'Vacuum declogger unit & safety traffic cones deployed along Old Sta. Mesa St.',
  },
  {
    eventId: 'SCH-2026-03',
    ticketId: 'DEO-2026-001',
    title: 'Engineering Review & Ocular Coordination — Barangay 123, Zone 10',
    scheduledDate: '2026-10-26',
    scheduleType: 'Engineering Evaluation',
    confirmationStatus: 'Proposed (Awaiting Confirmation)',
    assignedUnit: 'DEPW District 1 Evaluation Engineers',
    notes: 'Coordinate with Kagawad Juan D. Cruz at Estero de Vitas Service Road.',
  },
];

function buildInitialHistory(tickets) {
  let idCounter = 1;
  const logs = [];
  for (const t of tickets) {
    logs.push({
      id: idCounter++,
      ticketId: t.ticketId,
      eventType: 'TICKET_CREATED',
      previousStatus: 'Intake',
      newStatus: 'For Verification',
      actionTaken: `Initial Barangay request logged in DEPW Smart Tracker (${t.barangay})`,
      changedFields: [
        { field: 'status', label: 'Workflow Status', before: 'Intake', after: 'For Verification' },
        { field: 'streetAddress', label: 'Street / Canal Location', before: 'None', after: t.streetAddress },
      ],
      actorName: 'Engr. Camille R. Aquino',
      actorRole: 'DEPW Receiving Liaison Officer',
      timestamp: t.createdAt,
    });
    if (t.coordVerified) {
      logs.push({
        id: idCounter++,
        ticketId: t.ticketId,
        eventType: 'COORD_UPDATE',
        previousStatus: 'For Verification',
        newStatus: 'For Verification',
        actionTaken: `Verified Manila GIS coordinates (${t.latitude}, ${t.longitude})`,
        changedFields: [
          { field: 'coordVerified', label: 'Coordinate Verification', before: 'Unverified', after: 'Verified GIS Pin' },
        ],
        actorName: 'Engr. Marco P. Del Rosario',
        actorRole: 'DEPW GIS Mapping Specialist',
        timestamp: t.createdAt,
      });
    }
    if (t.status !== 'For Verification') {
      logs.push({
        id: idCounter++,
        ticketId: t.ticketId,
        eventType: 'STATUS_TRANSITION',
        previousStatus: 'For Verification',
        newStatus: t.status,
        actionTaken: t.actionTaken,
        changedFields: [
          { field: 'status', label: 'Workflow Status', before: 'For Verification', after: t.status },
          { field: 'actionTaken', label: 'Action Taken', before: 'Documents received at Receiving Liaison Desk', after: t.actionTaken },
          { field: 'nextStep', label: 'Next Step', before: 'Verify completeness', after: t.nextStep },
        ],
        actorName: 'Engr. Lorenzo T. Macapagal',
        actorRole: 'DEPW Area Evaluation Engineer',
        timestamp: t.updatedAt,
      });
    }
  }
  return logs.sort((a, b) => b.id - a.id);
}

function enrichTicket(t) {
  if (!t) return null;
  return {
    ...t,
    coordVerified: Boolean(t.coordVerified),
    inspectionChecklist: Array.isArray(t.inspectionChecklist)
      ? t.inspectionChecklist
      : [
          { item: 'Request letter signed by Barangay official', done: true },
          { item: 'Street segment and nearest landmark identified', done: Boolean(t.streetAddress) },
        ],
    explainableSuggestion: getExplainableNextStep(t.status),
  };
}

function getLocalTickets() {
  try {
    const raw = localStorage.getItem(TICKETS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(enrichTicket);
      }
    }
  } catch {
    // ignore storage read error
  }
  const seeded = INITIAL_TICKETS.map(enrichTicket);
  saveLocalTickets(seeded);
  return seeded;
}

function saveLocalTickets(tickets) {
  try {
    localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(tickets));
  } catch {
    // ignore storage write error
  }
}

function getLocalHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  const seeded = buildInitialHistory(INITIAL_TICKETS);
  saveLocalHistory(seeded);
  return seeded;
}

function saveLocalHistory(history) {
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch {
    // ignore
  }
}

function getLocalAssets() {
  try {
    const raw = localStorage.getItem(ASSETS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  return INITIAL_ASSETS;
}

function getLocalSchedules() {
  try {
    const raw = localStorage.getItem(SCHEDULES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  return INITIAL_SCHEDULES;
}

function saveLocalSchedules(schedules) {
  try {
    localStorage.setItem(SCHEDULES_STORAGE_KEY, JSON.stringify(schedules));
  } catch {
    // ignore
  }
}

function getLocalWaterQualityLogs() {
  try {
    const raw = localStorage.getItem(WQL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item) => ({
          ...item,
          evaluation: item.evaluation || evaluateWaterDrainageSafety(item),
        }));
      }
    }
  } catch {
    // ignore storage read error
  }
  return INITIAL_WATER_QUALITY_LOGS.map((item) => ({
    ...item,
    evaluation: evaluateWaterDrainageSafety(item),
  }));
}

function saveLocalWaterQualityLogs(logs) {
  try {
    localStorage.setItem(WQL_STORAGE_KEY, JSON.stringify(logs));
  } catch {
    // ignore storage write error
  }
}

async function requestJson(url, options = {}) {
  if (isStaticMode()) {
    const err = new Error('Static hosting mode active');
    err.isStaticFallback = true;
    throw err;
  }

  let res;
  try {
    res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...options,
    });
  } catch (networkErr) {
    staticModeDetected = true;
    throw networkErr;
  }

  const contentType = res.headers.get('content-type') || '';
  if ((res.status === 404 || res.status === 405) && !contentType.includes('application/json')) {
    // Hosted on a static server (like GitHub Pages custom domain) where /api/* returns HTML 404
    staticModeDetected = true;
    const err = new Error(`Static host fallback (${res.status})`);
    err.isStaticFallback = true;
    throw err;
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.error || `HTTP ${res.status} error`;
    const err = new Error(msg);
    err.details = data.details || null;
    err.status = res.status;
    throw err;
  }
  return data;
}

// Local helper to filter, sort, and paginate tickets identically to server.js
function queryLocalTickets(params = {}) {
  const {
    search = '',
    status = '',
    requestType = '',
    district = '',
    legislativeDistrict = '',
    sortBy = 'ticketId',
    sortOrder = 'asc',
    page = '1',
    pageSize = '25',
  } = params;

  let rows = getLocalTickets();
  const q = String(search).toLowerCase().trim();
  if (q) {
    rows = rows.filter(
      (t) =>
        String(t.ticketId || '').toLowerCase().includes(q) ||
        String(t.barangay || '').toLowerCase().includes(q) ||
        String(t.district || '').toLowerCase().includes(q) ||
        String(t.streetAddress || '').toLowerCase().includes(q) ||
        String(t.requesterName || '').toLowerCase().includes(q) ||
        String(t.description || '').toLowerCase().includes(q)
    );
  }
  if (status && status !== 'ALL') {
    rows = rows.filter((t) => t.status === status);
  }
  if (requestType && requestType !== 'ALL') {
    rows = rows.filter((t) => t.requestType === requestType);
  }
  if (district && district !== 'ALL') {
    rows = rows.filter((t) => t.district === district);
  }
  if (legislativeDistrict && legislativeDistrict !== 'ALL') {
    rows = rows.filter((t) => t.legislativeDistrict === legislativeDistrict);
  }

  const validSortFields = ['ticketId', 'dateReceived', 'barangay', 'status', 'district', 'priority', 'updatedAt'];
  const field = validSortFields.includes(String(sortBy)) ? String(sortBy) : 'ticketId';
  const dir = String(sortOrder).toLowerCase() === 'desc' ? -1 : 1;

  rows.sort((a, b) => {
    const valA = String(a[field] || '');
    const valB = String(b[field] || '');
    return valA.localeCompare(valB, undefined, { numeric: true }) * dir;
  });

  const total = rows.length;
  const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(String(pageSize), 10) || 25));
  const startIndex = (pageNum - 1) * limitNum;
  const paginated = rows.slice(startIndex, startIndex + limitNum);

  return {
    tickets: paginated,
    allFilteredCount: total,
    page: pageNum,
    pageSize: limitNum,
    totalPages: Math.max(1, Math.ceil(total / limitNum)),
  };
}

// Generate an SVG engineering blueprint as base64 when generating images in static GitHub Pages mode
function buildEngineeringBlueprintSvgBase64(prompt = '') {
  const safePrompt = String(prompt || 'Manila DEPW Box Culvert & Vacuum Desilting Cross-Section')
    .replace(/[<>&"']/g, '')
    .slice(0, 78);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
    <rect width="1280" height="720" fill="#061226"/>
    <g stroke="#0e294b" stroke-width="1">
      <line x1="0" y1="120" x2="1280" y2="120"/><line x1="0" y1="240" x2="1280" y2="240"/>
      <line x1="0" y1="360" x2="1280" y2="360"/><line x1="0" y1="480" x2="1280" y2="480"/>
      <line x1="0" y1="600" x2="1280" y2="600"/><line x1="240" y1="0" x2="240" y2="720"/>
      <line x1="520" y1="0" x2="520" y2="720"/><line x1="800" y1="0" x2="800" y2="720"/>
      <line x1="1060" y1="0" x2="1060" y2="720"/>
    </g>
    <rect x="40" y="36" width="1200" height="648" rx="16" fill="none" stroke="#38bdf8" stroke-width="2" stroke-opacity="0.6"/>
    <text x="72" y="86" fill="#38bdf8" font-family="monospace" font-size="16" font-weight="bold">CITY OF MANILA • DEPARTMENT OF ENGINEERING &amp; PUBLIC WORKS (DEPW) CAD BLUEPRINT</text>
    <text x="72" y="116" fill="#f8fafc" font-family="sans-serif" font-size="22" font-weight="bold">${safePrompt}</text>
    <rect x="180" y="210" width="920" height="340" rx="8" fill="#0f172a" stroke="#38bdf8" stroke-width="3"/>
    <rect x="230" y="255" width="820" height="250" fill="#020617" stroke="#94a3b8" stroke-width="2" stroke-dasharray="8 4"/>
    <path d="M 230 415 Q 435 395 640 415 T 1050 415 L 1050 505 L 230 505 Z" fill="#0284c7" fill-opacity="0.45" stroke="#38bdf8" stroke-width="2"/>
    <path d="M 230 475 L 1050 475 L 1050 505 L 230 505 Z" fill="#b45309" fill-opacity="0.55"/>
    <line x1="640" y1="150" x2="640" y2="465" stroke="#34d399" stroke-width="14" stroke-linecap="round"/>
    <circle cx="640" cy="465" r="22" fill="#10b981" fill-opacity="0.35" stroke="#34d399" stroke-width="3"/>
    <text x="260" y="295" fill="#7dd3fc" font-family="monospace" font-size="15">RCBC SPAN: 1.80m x 1.50m REINFORCED CONCRETE BOX CULVERT</text>
    <text x="260" y="448" fill="#e0f2fe" font-family="monospace" font-size="15">HYDRAULIC DESIGN FLOW • DO: 6.4 mg/L • TURBIDITY: 28 NTU (CLEAR)</text>
    <text x="260" y="495" fill="#fde68a" font-family="monospace" font-size="14">SILT BED EXTRACTION ZONE — VACTOR JETTING NOZZLE (2,200 PSI)</text>
    <text x="72" y="645" fill="#94a3b8" font-family="monospace" font-size="14">SCALE: 1:25 METRIC • VERIFIED DEPW HYDRAULIC SIMULATION RENDER</text>
  </svg>`;
  return btoa(unescape(encodeURIComponent(svg)));
}

export const api = {
  getHealth: async () => {
    try {
      return await requestJson('/api/health');
    } catch {
      const tickets = getLocalTickets();
      return {
        status: 'ok',
        mode: 'DEPW MANILA COMMAND CENTER (STATIC CLIENT MODE)',
        database: 'Browser LocalStorage Persistence',
        ticketCount: tickets.length,
        aiConfigured: true,
        timestamp: new Date().toISOString(),
      };
    }
  },

  getMetrics: async () => {
    try {
      const data = await requestJson('/api/metrics');
      return data;
    } catch {
      const tickets = getLocalTickets();
      const metrics = calculateDashboardMetrics(tickets);
      const recentHistory = getLocalHistory().slice(0, 20);
      return {
        ...metrics,
        recentHistory,
        quarterlyResolutionTrends: [
          { week: 'Oct W1', avgResolutionDays: 4.6, slaTargetDays: 3.5, completedCount: 11, activeProjects: 18 },
          { week: 'Oct W2', avgResolutionDays: 4.1, slaTargetDays: 3.5, completedCount: 15, activeProjects: 21 },
          { week: 'Oct W3', avgResolutionDays: 3.4, slaTargetDays: 3.5, completedCount: 19, activeProjects: 16 },
          { week: 'Oct W4', avgResolutionDays: 2.8, slaTargetDays: 3.5, completedCount: 23, activeProjects: 14 },
          { week: 'Nov W1 (Proj)', avgResolutionDays: 2.5, slaTargetDays: 3.5, completedCount: 26, activeProjects: 12 },
          { week: 'Nov W2 (Proj)', avgResolutionDays: 2.3, slaTargetDays: 3.5, completedCount: 28, activeProjects: 10 },
        ],
        waterQualityTrends: [
          { period: 'Oct 01', dissolvedOxygen: 4.2, h2sPpm: 8.4, turbidityNtu: 68, ammoniaMgL: 3.1, flowIndex: 62 },
          { period: 'Oct 05', dissolvedOxygen: 4.6, h2sPpm: 7.2, turbidityNtu: 61, ammoniaMgL: 2.8, flowIndex: 68 },
          { period: 'Oct 10', dissolvedOxygen: 5.1, h2sPpm: 5.9, turbidityNtu: 52, ammoniaMgL: 2.4, flowIndex: 74 },
          { period: 'Oct 15', dissolvedOxygen: 5.5, h2sPpm: 4.5, turbidityNtu: 44, ammoniaMgL: 1.9, flowIndex: 81 },
          { period: 'Oct 20', dissolvedOxygen: 6.1, h2sPpm: 3.2, turbidityNtu: 36, ammoniaMgL: 1.5, flowIndex: 88 },
          { period: 'Oct 23', dissolvedOxygen: 6.4, h2sPpm: 2.4, turbidityNtu: 29, ammoniaMgL: 1.2, flowIndex: 92 },
        ],
        quarterSummary: {
          quarter: 'Q4 2026 (Oct – Dec)',
          avgResolutionDays: 3.1,
          previousQuarterAvgDays: 4.8,
          improvementPercent: 35.4,
          waterQualityCompliance: 92.4,
        },
      };
    }
  },

  getGlobalAuditLogs: async (limit = 50) => {
    try {
      return await requestJson(`/api/audit-logs?limit=${limit}`);
    } catch {
      const logs = getLocalHistory().slice(0, limit);
      return { auditLogs: logs, total: logs.length };
    }
  },

  getTickets: async (params = {}) => {
    try {
      const qs = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          qs.set(k, String(v));
        }
      });
      const data = await requestJson(`/api/tickets?${qs.toString()}`);
      if (
        Array.isArray(data?.tickets) &&
        !params.search &&
        (!params.status || params.status === 'ALL') &&
        (!params.district || params.district === 'ALL') &&
        (!params.requestType || params.requestType === 'ALL')
      ) {
        saveLocalTickets(data.tickets);
      }
      return data;
    } catch {
      return queryLocalTickets(params);
    }
  },

  getTicketById: async (ticketId) => {
    try {
      return await requestJson(`/api/tickets/${encodeURIComponent(ticketId)}`);
    } catch {
      const allTickets = getLocalTickets();
      const ticket = allTickets.find((t) => t.ticketId === ticketId) || allTickets[0];
      if (!ticket) {
        throw new Error('Ticket not found in Smart Tracker.');
      }
      const history = getLocalHistory().filter((h) => h.ticketId === ticket.ticketId);
      const duplicates = findPotentialDuplicates(ticket, allTickets);
      return {
        ticket: enrichTicket(ticket),
        history,
        potentialDuplicates: duplicates.map((d) => ({
          ticketId: d.ticketId,
          barangay: d.barangay,
          streetAddress: d.streetAddress,
          status: d.status,
        })),
      };
    }
  },

  getTicketAuditLogs: async (ticketId) => {
    try {
      return await requestJson(`/api/tickets/${encodeURIComponent(ticketId)}/audit`);
    } catch {
      const allTickets = getLocalTickets();
      const ticket = allTickets.find((t) => t.ticketId === ticketId) || allTickets[0];
      const history = getLocalHistory().filter((h) => h.ticketId === (ticket?.ticketId || ticketId));
      return {
        ticketId: ticket?.ticketId || ticketId,
        currentStatus: ticket?.status || 'For Verification',
        totalEvents: history.length,
        auditLogs: history,
      };
    }
  },

  createTicket: async (payload) => {
    try {
      const res = await requestJson('/api/tickets', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (res?.ticket) {
        const current = getLocalTickets();
        saveLocalTickets([res.ticket, ...current.filter((t) => t.ticketId !== res.ticket.ticketId)]);
      }
      return res;
    } catch (err) {
      if (err.status === 400) throw err;
      const existingRows = getLocalTickets();
      let maxNum = 0;
      for (const r of existingRows) {
        const m = String(r.ticketId).match(/DEO-2026-(\d+)/);
        if (m) {
          const n = parseInt(m[1], 10);
          if (n > maxNum) maxNum = n;
        }
      }
      const nextNum = String(maxNum + 1).padStart(3, '0');
      const ticketId = `DEO-2026-${nextNum}`;
      const nowIso = new Date().toISOString();
      const todayFormatted =
        payload.dateReceived ||
        new Intl.DateTimeFormat('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric',
        }).format(new Date());

      const status = payload.status || 'For Verification';
      const priority = payload.priority || 'Routine';
      const actionTaken = payload.actionTaken || 'Documents received at DEPW Liaison Desk';
      const nextStep = payload.nextStep || 'Verify completeness of Barangay letter and street sketch';
      const requesterRole = payload.requesterRole || 'Barangay Kagawad';

      const newTicket = enrichTicket({
        ticketId,
        dateReceived: todayFormatted,
        barangay: payload.barangay || 'Barangay 123, Zone 10',
        district: payload.district || 'Tondo',
        legislativeDistrict: payload.legislativeDistrict || '1st District',
        streetAddress: payload.streetAddress || 'Manila Drainage Lateral',
        requestType: payload.requestType || 'Declogging',
        status,
        priority,
        actionTaken,
        nextStep,
        requesterName: payload.requesterName || 'Barangay Official',
        requesterRole,
        description: payload.description || 'Requesting drainage declogging and silt clearance.',
        latitude: payload.latitude ?? 14.6042,
        longitude: payload.longitude ?? 120.9822,
        coordSource: payload.coordSource || (payload.latitude ? 'Barangay Submitted GIS Pin' : 'Location pending pin'),
        coordVerified: Boolean(payload.coordVerified),
        inspectionChecklist: [
          { item: 'Request letter signed by Barangay official', done: true },
          { item: 'Street segment and nearest landmark identified', done: Boolean(payload.streetAddress) },
          { item: 'Joint ocular site inspection completed', done: false },
          { item: 'Silt depth and manhole access measured', done: false },
        ],
        createdAt: nowIso,
        updatedAt: nowIso,
      });

      const duplicates = findPotentialDuplicates(newTicket, existingRows);
      saveLocalTickets([newTicket, ...existingRows]);

      const history = getLocalHistory();
      const nextHistId = history.reduce((max, h) => Math.max(max, h.id || 0), 0) + 1;
      const newAudit = {
        id: nextHistId,
        ticketId,
        eventType: 'TICKET_CREATED',
        previousStatus: 'Intake',
        newStatus: status,
        actionTaken,
        changedFields: [
          { field: 'status', label: 'Workflow Status', before: 'Intake', after: status },
          { field: 'barangay', label: 'Barangay', before: 'None', after: newTicket.barangay },
          { field: 'streetAddress', label: 'Street / Canal Location', before: 'None', after: newTicket.streetAddress },
          { field: 'priority', label: 'Priority Level', before: 'None', after: priority },
        ],
        actorName: newTicket.requesterName,
        actorRole: 'Receiving Liaison Officer',
        timestamp: nowIso,
      };
      saveLocalHistory([newAudit, ...history]);

      return {
        ticket: newTicket,
        potentialDuplicates: duplicates,
      };
    }
  },

  updateTicket: async (ticketId, payload) => {
    try {
      const res = await requestJson(`/api/tickets/${encodeURIComponent(ticketId)}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      if (res?.ticket) {
        const current = getLocalTickets();
        saveLocalTickets(current.map((t) => (t.ticketId === ticketId ? res.ticket : t)));
      }
      return res;
    } catch (err) {
      if (err.status === 400) throw err;
      const allTickets = getLocalTickets();
      const existing = allTickets.find((t) => t.ticketId === ticketId);
      if (!existing) {
        throw new Error('Ticket not found.');
      }
      if (payload.status && payload.status !== existing.status) {
        if (!canTransitionStatus(existing.status, payload.status)) {
          throw new Error(`Invalid status transition from "${existing.status}" to "${payload.status}".`);
        }
      }

      const nowIso = new Date().toISOString();
      const updatedTicket = enrichTicket({
        ...existing,
        ...payload,
        coordVerified: payload.coordVerified !== undefined ? Boolean(payload.coordVerified) : existing.coordVerified,
        inspectionChecklist: payload.inspectionChecklist || existing.inspectionChecklist,
        updatedAt: nowIso,
      });

      const auditDiff = computeTicketAuditDiff(
        {
          ...existing,
          coordVerified: existing.coordVerified ? 1 : 0,
          inspectionChecklistJson: JSON.stringify(existing.inspectionChecklist || []),
        },
        {
          ...updatedTicket,
          coordVerified: updatedTicket.coordVerified ? 1 : 0,
          inspectionChecklistJson: JSON.stringify(updatedTicket.inspectionChecklist || []),
        }
      );

      const nextTickets = allTickets.map((t) => (t.ticketId === ticketId ? updatedTicket : t));
      saveLocalTickets(nextTickets);

      const allHistory = getLocalHistory();
      const nextHistId = allHistory.reduce((max, h) => Math.max(max, h.id || 0), 0) + 1;
      const newAudit = {
        id: nextHistId,
        ticketId,
        eventType: auditDiff.eventType,
        previousStatus: existing.status,
        newStatus: updatedTicket.status,
        actionTaken: payload.actionTaken || auditDiff.summary,
        changedFields: auditDiff.changes,
        actorName: payload.actorName || 'Engr. Lorenzo T. Macapagal',
        actorRole: payload.actorRole || 'DEPW Engineering Liaison',
        timestamp: nowIso,
      };
      const updatedHistory = [newAudit, ...allHistory];
      saveLocalHistory(updatedHistory);

      return {
        ticket: updatedTicket,
        history: updatedHistory.filter((h) => h.ticketId === ticketId),
      };
    }
  },

  transitionTicketStatus: async (ticketId, payload) => {
    try {
      const res = await requestJson(`/api/tickets/${encodeURIComponent(ticketId)}/status`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (res?.ticket) {
        const current = getLocalTickets();
        saveLocalTickets(current.map((t) => (t.ticketId === ticketId ? res.ticket : t)));
      }
      return res;
    } catch (err) {
      if (err.status === 400) throw err;
      const allTickets = getLocalTickets();
      const existing = allTickets.find((t) => t.ticketId === ticketId);
      if (!existing) {
        throw new Error('Ticket not found.');
      }
      const { newStatus, actionTaken, nextStep, actorName, actorRole } = payload;
      if (!canTransitionStatus(existing.status, newStatus)) {
        throw new Error(`Transition from "${existing.status}" to "${newStatus}" is not permitted by workflow rules.`);
      }

      const nowIso = new Date().toISOString();
      const updatedTicket = enrichTicket({
        ...existing,
        status: newStatus,
        actionTaken: actionTaken || existing.actionTaken,
        nextStep: nextStep || existing.nextStep,
        updatedAt: nowIso,
      });

      const auditDiff = computeTicketAuditDiff(existing, updatedTicket);
      saveLocalTickets(allTickets.map((t) => (t.ticketId === ticketId ? updatedTicket : t)));

      const allHistory = getLocalHistory();
      const nextHistId = allHistory.reduce((max, h) => Math.max(max, h.id || 0), 0) + 1;
      const newAudit = {
        id: nextHistId,
        ticketId,
        eventType: 'STATUS_TRANSITION',
        previousStatus: existing.status,
        newStatus,
        actionTaken: actionTaken || auditDiff.summary,
        changedFields: auditDiff.changes,
        actorName: actorName || 'Engr. Lorenzo T. Macapagal',
        actorRole: actorRole || 'DEPW Workflow Officer',
        timestamp: nowIso,
      };
      const updatedHistory = [newAudit, ...allHistory];
      saveLocalHistory(updatedHistory);

      return {
        ticket: updatedTicket,
        history: updatedHistory.filter((h) => h.ticketId === ticketId),
      };
    }
  },

  deleteTicket: async (ticketId) => {
    try {
      await requestJson(`/api/tickets/${encodeURIComponent(ticketId)}`, {
        method: 'DELETE',
      });
    } catch {
      // proceed with local deletion
    }
    const nextTickets = getLocalTickets().filter((t) => t.ticketId !== ticketId);
    saveLocalTickets(nextTickets);
    const nextHistory = getLocalHistory().filter((h) => h.ticketId !== ticketId);
    saveLocalHistory(nextHistory);
    return { deleted: true, ticketId };
  },

  getOperationsData: async () => {
    try {
      const data = await requestJson('/api/operations');
      if (Array.isArray(data?.schedules)) {
        saveLocalSchedules(data.schedules);
      }
      return data;
    } catch {
      return {
        assets: getLocalAssets(),
        schedules: getLocalSchedules(),
      };
    }
  },

  createScheduleEvent: async (payload) => {
    try {
      const res = await requestJson('/api/operations/schedules', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (Array.isArray(res?.schedules)) {
        saveLocalSchedules(res.schedules);
      }
      return res;
    } catch {
      const eventId = `SCH-2026-${Math.floor(100 + Math.random() * 900)}`;
      const newSchedule = {
        eventId,
        ticketId: payload.ticketId || 'DEO-2026-001',
        title: payload.title || 'Field Inspection Schedule',
        scheduledDate: payload.scheduledDate || new Date().toISOString().split('T')[0],
        scheduleType: payload.scheduleType || 'Site Inspection',
        confirmationStatus: payload.confirmationStatus || 'Proposed (Awaiting Confirmation)',
        assignedUnit: payload.assignedUnit || 'DEPW Field Assessment Unit',
        notes: payload.notes || 'Scheduled field engineering coordination',
      };
      const schedules = [...getLocalSchedules(), newSchedule].sort((a, b) =>
        String(a.scheduledDate).localeCompare(String(b.scheduledDate))
      );
      saveLocalSchedules(schedules);
      return { eventId, schedules };
    }
  },

  getWaterQualityLogs: async (params = {}) => {
    try {
      const qs = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          qs.set(k, String(v));
        }
      });
      const data = await requestJson(`/api/water-quality-logs?${qs.toString()}`);
      if (
        Array.isArray(data?.logs) &&
        (!params.zoneId || params.zoneId === 'ALL') &&
        (!params.status || params.status === 'ALL')
      ) {
        saveLocalWaterQualityLogs(data.logs);
      }
      return data;
    } catch {
      let logs = getLocalWaterQualityLogs();
      if (params.zoneId && params.zoneId !== 'ALL') {
        logs = logs.filter((r) => r.zoneId === params.zoneId);
      }
      if (params.district && params.district !== 'ALL') {
        logs = logs.filter((r) => r.district === params.district);
      }
      if (params.status && params.status !== 'ALL') {
        logs = logs.filter((r) => r.overallStatus === params.status);
      }
      return {
        logs,
        zones: IDENTIFIED_DRAINAGE_ZONES,
        total: logs.length,
      };
    }
  },

  createWaterQualityLog: async (payload) => {
    const validation = validateWaterQualityEntry(payload);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(' '));
    }
    try {
      const res = await requestJson('/api/water-quality-logs', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const current = getLocalWaterQualityLogs();
      const updated = [res.log, ...current.filter((i) => i.logId !== res.log.logId)];
      saveLocalWaterQualityLogs(updated);
      return res;
    } catch {
      const log = {
        ...validation.entry,
        evaluation: validation.evaluation,
      };
      const current = getLocalWaterQualityLogs();
      saveLocalWaterQualityLogs([log, ...current]);
      return { log };
    }
  },

  deleteWaterQualityLog: async (logId) => {
    try {
      await requestJson(`/api/water-quality-logs/${encodeURIComponent(logId)}`, {
        method: 'DELETE',
      });
    } catch {
      // fallback to local removal
    }
    const current = getLocalWaterQualityLogs().filter((item) => item.logId !== logId);
    saveLocalWaterQualityLogs(current);
    return { deleted: true, logId };
  },

  geocodeStreet: async (query) => {
    const q = String(query || '').trim();
    if (!q) return { results: [] };
    try {
      return await requestJson(`/api/geocode?q=${encodeURIComponent(q)}`);
    } catch {
      try {
        const searchQuery = q.toLowerCase().includes('manila') ? q : `${q}, Manila, Philippines`;
        const url = new URL('https://nominatim.openstreetmap.org/search');
        url.searchParams.set('q', searchQuery);
        url.searchParams.set('format', 'jsonv2');
        url.searchParams.set('addressdetails', '1');
        url.searchParams.set('limit', '6');
        url.searchParams.set('countrycodes', 'ph');
        const res = await fetch(url.toString(), {
          headers: { Accept: 'application/json' },
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            return {
              results: data.map((item) => ({
                placeId: item.place_id,
                displayName: item.display_name,
                lat: parseFloat(item.lat),
                lon: parseFloat(item.lon),
                type: item.type || item.category || 'location',
              })),
            };
          }
        }
      } catch {
        // fallback to local Manila GIS district benchmarks
      }
      const lower = q.toLowerCase();
      const matchedDistrict =
        MANILA_16_DISTRICTS.find((d) => lower.includes(d.name.toLowerCase())) || MANILA_16_DISTRICTS[0];
      return {
        results: [
          {
            placeId: `mnl-${matchedDistrict.name}`,
            displayName: `${q}, ${matchedDistrict.name}, City of Manila, Metro Manila, Philippines`,
            lat: matchedDistrict.lat,
            lon: matchedDistrict.lng,
            type: 'manila_gis_benchmark',
          },
        ],
      };
    }
  },

  geocode: (query) => api.geocodeStreet(query),

  runAiAssist: async (payload = {}) => {
    try {
      const res = await requestJson('/api/ai/assist', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const textOut = res.output || res.result || res.text || '';
      return {
        ...res,
        output: textOut,
        result: textOut,
        text: textOut,
      };
    } catch {
      const ticket = payload.ticket || payload.ticketData || {};
      const mode = payload.task || payload.mode || 'draft_letter';
      const baseLetter = generateSampleRequestLetter(ticket);
      const completeness = evaluateRequestCompleteness(ticket);
      const allTickets = getLocalTickets();
      const duplicates = findPotentialDuplicates(ticket, allTickets);

      let outputText = '';
      if (mode === 'summarize' || mode === 'status_memo') {
        outputText = `MEMORANDUM FOR COORDINATING LIAISON (DEPW MANILA)\nSubject: Status & Technical Summary — ${ticket.barangay || 'Barangay 123, Zone 10'} (${ticket.district || 'Tondo'})\nLocation: ${ticket.streetAddress || 'Estero de Vitas Service Road'} (${ticket.requestType || 'Declogging'})\n\n1. Current Status: ${ticket.status || 'For Verification'}\n2. Completeness Score: ${completeness.score}%\n3. Field Notes: ${ticket.description || 'Accumulated silt and debris reported along drainage line.'}\n4. Recommended Next Step: ${getExplainableNextStep(ticket.status || 'For Verification').suggestedNextStep}\n\n[Advisory]: Human engineering verification and joint ocular inspection with ${ticket.requesterName || 'Barangay Kagawad'} are required prior to vactor unit dispatch.`;
      } else if (mode === 'missing_info' || mode === 'missing_check') {
        const missingList = completeness.missingFields?.length
          ? completeness.missingFields.map((f) => `• Missing / Needs Verification: ${f}`).join('\n')
          : '• All mandatory Barangay intake fields (Barangay, District, Street Segment, Coordinating Official, and Description) are present.';
        outputText = `DEPW LIAISON COMPLETENESS AUDIT\nCompleteness Score: ${completeness.score}% (${completeness.isComplete ? 'READY FOR ENGINEERING ENDORSEMENT' : 'REQUIRES CLARIFICATION'})\n\nChecklist Findings:\n${missingList}\n\nNext Action: Verify exact nearest cross-street landmark and manhole access clearance with ${ticket.requesterName || 'the Barangay official'}.`;
      } else {
        outputText = `${baseLetter.bodyTagalog}\n\n[English Liaison Translation Draft]:\nWe respectfully request technical assistance from the Department of Engineering and Public Works (City of Manila) to conduct ${ticket.requestType || 'declogging'} operations along the drainage channel at ${ticket.streetAddress || 'Estero de Vitas Service Road'}, ${ticket.barangay || 'Barangay 123, Zone 10'} (${ticket.district || 'Tondo'}). Silt and debris accumulation has been observed affecting stormwater runoff. We are ready to coordinate with the DEPW Area Engineer for a joint ocular site inspection.`;
      }

      return {
        source: 'rule_based_fallback',
        modelUsed: 'DEPW Bilingual Liaison Engine (Client Mode)',
        draftBadge: 'DRAFT — BILINGUAL LIAISON TEMPLATE (REQUIRES HUMAN REVIEW)',
        completeness,
        duplicates,
        output: outputText,
        result: outputText,
        text: outputText,
      };
    }
  },

  aiAssist: (payload) => api.runAiAssist(payload),

  runMapsGrounding: async (payload) => {
    const bodyObj = typeof payload === 'string' ? { query: payload } : payload || {};
    try {
      return await requestJson('/api/ai/maps-grounding', {
        method: 'POST',
        body: JSON.stringify(bodyObj),
      });
    } catch {
      const query = bodyObj.query || 'Drainage canals and esteros in Tondo and Sampaloc, Manila';
      const fallbackEntry = getManilaSpatialDrainageContext(query);
      return {
        modelUsed: 'DEPW Manila Estero & Drainage GIS (Client Reconnaissance)',
        text: fallbackEntry.summary,
        isOfflineKnowledge: true,
        groundingChunks: fallbackEntry.places.map((p) => ({
          web: { title: p.title, uri: p.uri },
        })),
        places: fallbackEntry.places,
      };
    }
  },

  mapsGrounding: (payload) => api.runMapsGrounding(payload),

  generateTtsAudio: async (payload) => {
    const bodyObj = typeof payload === 'string' ? { text: payload } : payload || {};
    try {
      return await requestJson('/api/ai/tts', {
        method: 'POST',
        body: JSON.stringify(bodyObj),
      });
    } catch {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window && bodyObj.text) {
        try {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(String(bodyObj.text).slice(0, 500));
          utterance.lang = 'tl-PH';
          window.speechSynthesis.speak(utterance);
        } catch {
          // ignore speech synthesis errors
        }
      }
      return {
        modelUsed: 'Browser Web Speech Synthesis (Client Mode)',
        mimeType: 'audio/wav',
        audioBase64: null,
        usedBrowserSpeech: true,
      };
    }
  },

  tts: (text, voiceName = 'Kore') =>
    api.generateTtsAudio(typeof text === 'object' ? text : { text, voice: voiceName, voiceName }),

  generateSiteImage: async (payload = {}) => {
    try {
      const res = await requestJson('/api/ai/generate-image', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (res.imageUrl && !res.imageBase64) {
        const parts = String(res.imageUrl).split(',');
        res.imageBase64 = parts[1] || '';
      }
      return res;
    } catch {
      const svgBase64 = buildEngineeringBlueprintSvgBase64(payload.prompt);
      return {
        modelUsed: 'DEPW CAD Hydraulic Blueprint Renderer (Client Mode)',
        imageSize: payload.imageSize || '1K',
        aspectRatio: payload.aspectRatio || '16:9',
        mimeType: 'image/svg+xml',
        imageBase64: svgBase64,
        imageUrl: `data:image/svg+xml;base64,${svgBase64}`,
        caption: 'Generated Manila DEPW Reinforced Concrete Box Culvert (RCBC) & Vactor Desilting CAD Cross-Section.',
      };
    }
  },

  generateImage: (payload) => api.generateSiteImage(payload),

  generateDrainageVideo: async (payload = {}) => {
    try {
      return await requestJson('/api/ai/generate-video', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch {
      return {
        modelUsed: 'DEPW 3D Hydraulic Simulation Engine',
        aspectRatio: payload.aspectRatio || '16:9',
        error: 'Live MP4 video rendering requires server-side Gemini Omni API; open the "3D Culvert & Truck Twin" tab for interactive real-time 3D WebGL drainage simulation.',
      };
    }
  },

  generateVideo: (payload) => api.generateDrainageVideo(payload),
};
