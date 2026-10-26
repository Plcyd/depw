import React, { useState, useEffect, useMemo } from 'react';
import {
  MapContainer,
  TileLayer,
  Polygon,
  Circle,
  Marker,
  Popup,
  Tooltip as LeafletTooltip,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Search,
  Layers,
  Compass,
  Sparkles,
  ExternalLink,
  Crosshair,
  Building2,
  PlusCircle,
  CheckCircle2,
  AlertTriangle,
  Navigation,
} from 'lucide-react';
import styles from '../styles/GlassSystem.module.css';
import {
  MANILA_16_DISTRICTS,
  MANILA_DISTRICT_POLYGONS,
  LEGISLATIVE_DISTRICTS,
  TICKET_STATUSES,
  REQUEST_TYPES,
  PRIORITY_LEVELS,
  detectManilaDistrictFromCoords,
  validatePinnedDecloggingSite,
  getManilaSpatialDrainageContext,
} from '../utils/workflowRules.js';
import { api } from '../services/api.js';

const STATUS_PIN_COLORS = {
  'For Verification': '#38bdf8',
  'Returned for Clarification': '#f43f5e',
  'Pending Evaluation': '#fbbf24',
  'Inspection Scheduled': '#818cf8',
  'Scheduled for Implementation': '#c084fc',
  'In Progress': '#f97316',
  'Completed': '#10b981',
  'Closed': '#64748b',
};

const QUICK_PIN_HOTSPOTS = [
  {
    label: 'Tondo • Estero de Vitas',
    lat: 14.6195,
    lng: 120.9678,
    barangay: 'Barangay 123, Zone 10',
    streetAddress: 'Estero de Vitas Outfall cor. Velasquez St.',
    requestType: 'Declogging',
    priority: 'High Priority',
    description: 'Heavy silt and tidal plastic debris obstructing lateral box culvert outfall.',
  },
  {
    label: 'Sampaloc • España Box Culvert',
    lat: 14.6112,
    lng: 120.9958,
    barangay: 'Barangay 452, Zone 45',
    streetAddress: 'España Blvd. cor. Maceda St. Storm Interceptor',
    requestType: 'Declogging',
    priority: 'Elevated',
    description: 'Accumulated street sediment and leaf litter clogging curb inlets along España Blvd.',
  },
  {
    label: 'Quiapo • Hidalgo Canal',
    lat: 14.5994,
    lng: 120.9848,
    barangay: 'Barangay 384, Zone 39',
    streetAddress: 'Hidalgo St. near Estero de Quiapo Covered Culvert',
    requestType: 'Desilting',
    priority: 'High Priority',
    description: 'Market runoff and compacted silt reducing drainage conveyance capacity.',
  },
  {
    label: 'Ermita • Padre Faura Drain',
    lat: 14.5826,
    lng: 120.9822,
    barangay: 'Barangay 669, Zone 72',
    streetAddress: 'Padre Faura St. cor. Taft Ave. Catch Basin',
    requestType: 'Declogging',
    priority: 'Elevated',
    description: 'Slow surface runoff at Taft intersection requiring vacuum jetting.',
  },
  {
    label: 'Paco • Estero de Paco',
    lat: 14.5805,
    lng: 120.9964,
    barangay: 'Barangay 678, Zone 74',
    streetAddress: 'Paz St. Linear Canal near Paco Market',
    requestType: 'Gutter Clearance',
    priority: 'Routine',
    description: 'Lateral drainage grating clearance requested prior to monsoon downpour.',
  },
];

function createTicketDivIcon(ticket, isSelected) {
  const tId = String(ticket.ticketId || ticket.id || 'DEO');
  const color = STATUS_PIN_COLORS[ticket.status] || '#38bdf8';
  const size = isSelected ? 34 : 28;
  const ring = isSelected ? '3px solid #ffffff' : '2.5px solid #040914';
  const shadow = isSelected
    ? `0 0 0 4px rgba(56,189,248,0.45), 0 6px 16px rgba(0,0,0,0.75)`
    : `0 4px 12px rgba(0,0,0,0.6), 0 0 10px ${color}`;

  return L.divIcon({
    className: 'depw-ticket-marker',
    html: `
      <div style="
        display:flex;align-items:center;justify-content:center;
        width:${size}px;height:${size}px;border-radius:50%;
        background:${color};border:${ring};
        box-shadow:${shadow};
        color:#040914;font-weight:800;font-size:${isSelected ? 11 : 10}px;font-family:monospace;
        transition:transform 0.15s ease;
      ">
        ${tId.slice(-2)}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

function createAssetDivIcon() {
  return L.divIcon({
    className: 'depw-asset-marker',
    html: `
      <div style="
        width:22px;height:22px;border-radius:6px;
        background:#0f172a;border:1.5px solid #22d3ee;
        display:flex;align-items:center;justify-content:center;
        color:#22d3ee;font-size:10px;font-weight:800;font-family:monospace;
        box-shadow:0 2px 8px rgba(0,0,0,0.5);
      ">
        A
      </div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -11],
  });
}

function createNewPinDivIcon() {
  return L.divIcon({
    className: 'depw-new-pin-marker',
    html: `
      <div style="
        position:relative;display:flex;align-items:center;justify-content:center;
        width:34px;height:34px;border-radius:50%;
        background:linear-gradient(135deg,#f97316,#ea580c);
        border:3px solid #ffffff;
        box-shadow:0 0 0 5px rgba(249,115,22,0.38), 0 6px 18px rgba(0,0,0,0.7);
        color:#ffffff;font-weight:900;font-size:14px;font-family:monospace;
      ">
        +
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17],
  });
}

function MapViewportController({ viewTarget }) {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);
    return () => clearTimeout(timer);
  }, [map]);

  useEffect(() => {
    if (!viewTarget || typeof viewTarget.lat !== 'number' || typeof viewTarget.lng !== 'number') {
      return;
    }
    if (Number.isNaN(viewTarget.lat) || Number.isNaN(viewTarget.lng)) return;
    map.flyTo([viewTarget.lat, viewTarget.lng], viewTarget.zoom || 15, {
      duration: 0.85,
    });
  }, [map, viewTarget]);

  return null;
}

function MapClickPinHandler({ onMapPinClick }) {
  useMapEvents({
    click(e) {
      if (onMapPinClick && e?.latlng) {
        onMapPinClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

export default function StreetMapView({
  tickets = [],
  assets = [],
  selectedMapTicket,
  onSelectTicketOnTracker,
  onUseCoordinatesForNewTicket,
  onRefreshTickets,
  userProfile,
  showToast,
  compactMode = false,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedRequestType, setSelectedRequestType] = useState('ALL');
  const [showDistrictPolygons, setShowDistrictPolygons] = useState(true);
  const [showAssets, setShowAssets] = useState(true);
  const [showHeatOverlay, setShowHeatOverlay] = useState(true);
  const [pinMode, setPinMode] = useState(true);

  const [viewTarget, setViewTarget] = useState({
    lat: 14.5995,
    lng: 120.9842,
    zoom: 13,
    ts: 0,
  });

  const [activeTicket, setActiveTicket] = useState(selectedMapTicket || tickets[0] || null);
  const [localPinnedTickets, setLocalPinnedTickets] = useState([]);

  // Interactive Pin & Report Declogging Site Form State
  const [pinnedCoords, setPinnedCoords] = useState({
    lat: 14.6112,
    lng: 120.9958,
  });
  const [pinForm, setPinForm] = useState({
    barangay: 'Barangay 452, Zone 45',
    district: 'Sampaloc',
    legislativeDistrict: '4th District',
    streetAddress: 'España Blvd. cor. Maceda St. Storm Drain',
    requestType: 'Declogging',
    priority: 'Elevated',
    requesterName: userProfile?.fullName || 'Engr. Lorenzo T. Macapagal',
    requesterRole: userProfile?.roleTitle || 'Barangay Kagawad',
    description:
      'Pinned declogging site: Accumulated silt and street debris obstructing storm drain inlet.',
  });
  const [pinFormErrors, setPinFormErrors] = useState([]);
  const [pinSaving, setPinSaving] = useState(false);
  const [lastPinnedSuccess, setLastPinnedSuccess] = useState(null);

  // Maps Grounding AI state
  const [groundingQuery, setGroundingQuery] = useState(
    'Drainage pumping stations, esteros, and flood-prone streets near España Boulevard, Sampaloc, Manila'
  );
  const [groundingLoading, setGroundingLoading] = useState(false);
  const [groundingResult, setGroundingResult] = useState(null);

  useEffect(() => {
    if (userProfile?.fullName) {
      setPinForm((prev) => ({
        ...prev,
        requesterName: userProfile.fullName,
        requesterRole: userProfile.roleTitle || prev.requesterRole,
      }));
    }
  }, [userProfile?.fullName, userProfile?.roleTitle]);

  useEffect(() => {
    if (selectedMapTicket) {
      setActiveTicket(selectedMapTicket);
      const lat = Number(selectedMapTicket.latitude ?? selectedMapTicket.lat);
      const lng = Number(selectedMapTicket.longitude ?? selectedMapTicket.lng);
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        setViewTarget({ lat, lng, zoom: 16, ts: Date.now() });
      }
    } else if (!activeTicket && tickets.length > 0) {
      setActiveTicket(tickets[0]);
    }
  }, [selectedMapTicket, tickets]);

  // Combine prop tickets + any newly pinned tickets in current session
  const combinedTickets = useMemo(() => {
    const existingIds = new Set(tickets.map((t) => t.ticketId));
    const extras = localPinnedTickets.filter((t) => !existingIds.has(t.ticketId));
    return [...extras, ...tickets];
  }, [tickets, localPinnedTickets]);

  const filteredTickets = useMemo(() => {
    return combinedTickets.filter((t) => {
      const matchDistrict = selectedDistrict === 'ALL' || t.district === selectedDistrict;
      const matchStatus = selectedStatus === 'ALL' || t.status === selectedStatus;
      const rType = t.requestType || t.drainage_type;
      const matchType = selectedRequestType === 'ALL' || rType === selectedRequestType;
      return matchDistrict && matchStatus && matchType;
    });
  }, [combinedTickets, selectedDistrict, selectedStatus, selectedRequestType]);

  // Count tickets per Manila District for polygon badges
  const districtTicketCounts = useMemo(() => {
    const counts = {};
    for (const poly of MANILA_DISTRICT_POLYGONS) {
      counts[poly.name] = 0;
    }
    for (const t of combinedTickets) {
      if (t.district && counts[t.district] !== undefined) {
        counts[t.district] += 1;
      }
    }
    return counts;
  }, [combinedTickets]);

  const detectedPinInfo = useMemo(() => {
    if (!pinnedCoords) return null;
    return detectManilaDistrictFromCoords(pinnedCoords.lat, pinnedCoords.lng);
  }, [pinnedCoords]);

  const handleMapPinClick = (lat, lng) => {
    const roundedLat = Number(lat.toFixed(5));
    const roundedLng = Number(lng.toFixed(5));
    setPinnedCoords({ lat: roundedLat, lng: roundedLng });
    setLastPinnedSuccess(null);
    setPinFormErrors([]);

    const detected = detectManilaDistrictFromCoords(roundedLat, roundedLng);
    if (detected) {
      setPinForm((prev) => ({
        ...prev,
        district: detected.district,
        legislativeDistrict: detected.legislativeDistrict,
        barangay: detected.sampleBarangay || prev.barangay,
        streetAddress: `${detected.nearestEstero} Corridor (${detected.district})`,
      }));
      if (showToast) {
        showToast(
          `Pinned declogging site in ${detected.district} (${detected.legislativeDistrict}) • ${roundedLat}, ${roundedLng}`,
          'info'
        );
      }
    }
  };

  const handleApplyHotspotPreset = (hotspot) => {
    setPinnedCoords({ lat: hotspot.lat, lng: hotspot.lng });
    setViewTarget({ lat: hotspot.lat, lng: hotspot.lng, zoom: 16, ts: Date.now() });
    setLastPinnedSuccess(null);
    setPinFormErrors([]);

    const detected = detectManilaDistrictFromCoords(hotspot.lat, hotspot.lng);
    setPinForm((prev) => ({
      ...prev,
      barangay: hotspot.barangay,
      district: detected?.district || 'Tondo',
      legislativeDistrict: detected?.legislativeDistrict || '1st District',
      streetAddress: hotspot.streetAddress,
      requestType: hotspot.requestType,
      priority: hotspot.priority,
      description: hotspot.description,
    }));
  };

  const handleSavePinnedSite = async (e) => {
    e.preventDefault();
    setPinFormErrors([]);
    setLastPinnedSuccess(null);

    const validation = validatePinnedDecloggingSite({
      latitude: pinnedCoords?.lat,
      longitude: pinnedCoords?.lng,
      ...pinForm,
    });

    if (!validation.isValid) {
      setPinFormErrors(validation.errors);
      if (showToast) {
        showToast(validation.errors[0], 'error');
      }
      return;
    }

    setPinSaving(true);
    try {
      const res = await api.createTicket(validation.payload);
      const createdTicket = res?.ticket;
      if (createdTicket) {
        setLocalPinnedTickets((prev) => [createdTicket, ...prev]);
        setActiveTicket(createdTicket);
        setLastPinnedSuccess(createdTicket);
        setViewTarget({
          lat: Number(createdTicket.latitude),
          lng: Number(createdTicket.longitude),
          zoom: 16,
          ts: Date.now(),
        });
      }
      if (onRefreshTickets) {
        await onRefreshTickets();
      }
      if (showToast) {
        showToast(
          `Pinned Declogging Site ${createdTicket?.ticketId || ''} logged in ${validation.payload.district}!`,
          'success'
        );
      }
    } catch (err) {
      setPinFormErrors([err.message || 'Unable to save pinned declogging site.']);
      if (showToast) {
        showToast(`Failed to pin site: ${err.message}`, 'error');
      }
    } finally {
      setPinSaving(false);
    }
  };

  const handleGeocodeSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const data = await api.geocodeStreet(searchQuery);
      const list = Array.isArray(data) ? data : data.results || [];
      setSearchResults(list);
      if (list.length > 0) {
        const first = list[0];
        const lat = parseFloat(first.lat ?? first.latitude);
        const lon = parseFloat(first.lon ?? first.longitude);
        if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
          setViewTarget({ lat, lng: lon, zoom: 16, ts: Date.now() });
          handleMapPinClick(lat, lon);
        }
      } else if (showToast) {
        showToast('No OpenStreetMap matches found in Manila for that query.', 'info');
      }
    } catch (err) {
      if (showToast) showToast(`Geocoding error: ${err.message}`, 'error');
    } finally {
      setSearching(false);
    }
  };

  const handleDistrictJump = (districtName) => {
    setSelectedDistrict(districtName);
    if (districtName === 'ALL') {
      setViewTarget({ lat: 14.5995, lng: 120.9842, zoom: 13, ts: Date.now() });
      return;
    }
    const found =
      MANILA_DISTRICT_POLYGONS.find((d) => d.name === districtName) ||
      MANILA_16_DISTRICTS.find((d) => d.name === districtName);
    if (found) {
      setViewTarget({ lat: found.lat, lng: found.lng, zoom: 15, ts: Date.now() });
    }
  };

  const handleRunMapsGrounding = async () => {
    if (!groundingQuery.trim()) return;
    setGroundingLoading(true);
    try {
      const res = await api.runMapsGrounding(groundingQuery);
      setGroundingResult(res);
      if (res.isOfflineKnowledge && res.quotaFallbackNotice && showToast) {
        showToast(
          'Active: City of Manila DEPW Geographic Intelligence (Offline Reconnaissance)',
          'info'
        );
      }
    } catch {
      const fallback = getManilaSpatialDrainageContext(groundingQuery);
      setGroundingResult({
        modelUsed: 'DEPW Manila Estero & Drainage GIS (Offline Mode)',
        text: fallback.summary,
        isOfflineKnowledge: true,
        places: fallback.places,
      });
    } finally {
      setGroundingLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header & Controls Bar */}
      <div className={styles.glassPanel} style={{ padding: compactMode ? '16px 20px' : '18px 22px' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '14px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Compass size={16} color="#38bdf8" />
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#38bdf8',
                }}
              >
                REACT-LEAFLET MANILA GIS • 16 ADMINISTRATIVE & 6 LEGISLATIVE DISTRICTS
              </span>
            </div>
            <h2
              style={{
                fontSize: compactMode ? '18px' : '20px',
                fontWeight: 800,
                color: 'var(--text-primary)',
                margin: 0,
              }}
            >
              Manila Districts Map & Interactive Declogging Site Pinning
            </h2>
          </div>

          {/* Nominatim Search Form */}
          <form
            onSubmit={handleGeocodeSearch}
            style={{ display: 'flex', gap: '8px', flex: '1 1 320px', maxWidth: '480px' }}
          >
            <div style={{ position: 'relative', flex: 1 }}>
              <Search
                size={14}
                style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748b' }}
              />
              <input
                type="text"
                className={styles.glassInput}
                style={{ paddingLeft: '34px' }}
                placeholder="Search Manila street, estero, or district (e.g. España Blvd)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button type="submit" className={styles.primaryBtn} disabled={searching}>
              {searching ? 'Locating...' : 'Search Street'}
            </button>
          </form>
        </div>

        {/* Search Results Dropdown Strip */}
        {searchResults.length > 0 && (
          <div
            style={{
              marginTop: '10px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>OSM Matches:</span>
            {searchResults.map((place, idx) => (
              <button
                key={idx}
                type="button"
                className={styles.secondaryBtn}
                style={{ padding: '4px 10px', fontSize: '11px' }}
                onClick={() => {
                  const lat = parseFloat(place.lat ?? place.latitude);
                  const lon = parseFloat(place.lon ?? place.longitude);
                  if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
                    setViewTarget({ lat, lng: lon, zoom: 17, ts: Date.now() });
                    handleMapPinClick(lat, lon);
                  }
                }}
              >
                <MapPin size={12} color="#38bdf8" />
                {(place.displayName || place.display_name || 'Manila Street')
                  .split(',')
                  .slice(0, 2)
                  .join(', ')}
              </button>
            ))}
            <button
              type="button"
              className={styles.secondaryBtn}
              style={{ padding: '4px 8px', fontSize: '11px' }}
              onClick={() => setSearchResults([])}
            >
              Clear
            </button>
          </div>
        )}

        {/* Filter & Layer Controls */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            marginTop: '14px',
            paddingTop: '14px',
            borderTop: '1px solid var(--glass-border)',
            alignItems: 'center',
          }}
        >
          <select
            className={styles.glassSelect}
            style={{ width: 'auto', minWidth: '185px' }}
            value={selectedDistrict}
            onChange={(e) => handleDistrictJump(e.target.value)}
            aria-label="Filter map by Manila District"
          >
            <option value="ALL">All 16 Manila Districts ({combinedTickets.length} Sites)</option>
            {MANILA_DISTRICT_POLYGONS.map((d) => (
              <option key={d.name} value={d.name}>
                {d.name} ({d.legislativeDistrict}) — {districtTicketCounts[d.name] || 0} site(s)
              </option>
            ))}
          </select>

          <select
            className={styles.glassSelect}
            style={{ width: 'auto', minWidth: '165px' }}
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            aria-label="Filter map by workflow status"
          >
            <option value="ALL">All Workflow Statuses</option>
            {TICKET_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          <select
            className={styles.glassSelect}
            style={{ width: 'auto', minWidth: '160px' }}
            value={selectedRequestType}
            onChange={(e) => setSelectedRequestType(e.target.value)}
            aria-label="Filter map by request type"
          >
            <option value="ALL">All Request Types</option>
            {REQUEST_TYPES.map((rt) => (
              <option key={rt} value={rt}>
                {rt}
              </option>
            ))}
          </select>

          <button
            type="button"
            className={showDistrictPolygons ? styles.primaryBtn : styles.secondaryBtn}
            onClick={() => setShowDistrictPolygons((prev) => !prev)}
          >
            <Compass size={14} />{' '}
            {showDistrictPolygons ? 'District Polygons: ON' : 'District Polygons: OFF'}
          </button>

          <button
            type="button"
            className={showHeatOverlay ? styles.primaryBtn : styles.secondaryBtn}
            onClick={() => setShowHeatOverlay((prev) => !prev)}
          >
            <Layers size={14} /> {showHeatOverlay ? 'Hotspot Aura: ON' : 'Hotspot Aura: OFF'}
          </button>

          <button
            type="button"
            className={showAssets ? styles.primaryBtn : styles.secondaryBtn}
            onClick={() => setShowAssets((prev) => !prev)}
          >
            <Building2 size={14} /> {showAssets ? 'Culvert Assets: ON' : 'Culvert Assets: OFF'}
          </button>

          <button
            type="button"
            className={pinMode ? styles.orangeBtn : styles.secondaryBtn}
            onClick={() => setPinMode((prev) => !prev)}
          >
            <Crosshair size={14} />{' '}
            {pinMode ? 'Click Map to Pin Declogging Site: ON' : 'Enable Click-to-Pin'}
          </button>
        </div>

        {/* Quick Hotspot Preset Strip */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '6px',
            marginTop: '10px',
          }}
        >
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--text-secondary)',
              marginRight: '4px',
            }}
          >
            Quick-Pin Manila Drainage Hotspots:
          </span>
          {QUICK_PIN_HOTSPOTS.map((spot) => (
            <button
              key={spot.label}
              type="button"
              onClick={() => handleApplyHotspotPreset(spot)}
              className={styles.secondaryBtn}
              style={{ padding: '4px 10px', fontSize: '11px' }}
            >
              <Navigation size={11} className="text-cyan-400" />
              <span>{spot.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Map + Side Inspector Grid */}
      <div className={styles.splitGrid}>
        {/* Left: Interactive React-Leaflet MapContainer */}
        <div
          className={styles.glassPanel}
          style={{
            padding: '12px',
            position: 'relative',
            minHeight: compactMode ? '480px' : '560px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              width: '100%',
              height: compactMode ? '440px' : '500px',
              borderRadius: '14px',
              overflow: 'hidden',
              border: '1px solid rgba(56, 189, 248, 0.28)',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <MapContainer
              center={[14.5995, 120.9842]}
              zoom={13}
              scrollWheelZoom={true}
              style={{ width: '100%', height: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors • City of Manila DEPW GIS"
                maxZoom={19}
              />

              <MapViewportController viewTarget={viewTarget} />
              <MapClickPinHandler
                onMapPinClick={(lat, lng) => {
                  if (pinMode) {
                    handleMapPinClick(lat, lng);
                  }
                }}
              />

              {/* 16 Manila Districts Boundary Polygons Layer */}
              {showDistrictPolygons &&
                MANILA_DISTRICT_POLYGONS.map((dist) => {
                  const isSelected = selectedDistrict === dist.name;
                  const count = districtTicketCounts[dist.name] || 0;
                  return (
                    <Polygon
                      key={dist.name}
                      positions={dist.positions}
                      pathOptions={{
                        color: dist.color,
                        weight: isSelected ? 3 : 1.75,
                        fillColor: dist.color,
                        fillOpacity: isSelected ? 0.26 : 0.11,
                        dashArray: isSelected ? undefined : '5 4',
                      }}
                      eventHandlers={{
                        click: (e) => {
                          setSelectedDistrict((prev) =>
                            prev === dist.name ? 'ALL' : dist.name
                          );
                          if (pinMode && e?.latlng) {
                            handleMapPinClick(e.latlng.lat, e.latlng.lng);
                          }
                        },
                      }}
                    >
                      <LeafletTooltip direction="center" sticky>
                        <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '11px' }}>
                          <strong>{dist.name}</strong> ({dist.legislativeDistrict})
                          <br />
                          <span>
                            {count} reported site(s) • {dist.esteros[0]}
                          </span>
                        </div>
                      </LeafletTooltip>
                    </Polygon>
                  );
                })}

              {/* Hotspot Priority Aura Circles + Ticket Markers */}
              {filteredTickets.map((ticket) => {
                const tId = ticket.ticketId || ticket.id || 'DEO';
                const lat = Number(ticket.latitude ?? ticket.lat) || 14.5995;
                const lng = Number(ticket.longitude ?? ticket.lng) || 120.9842;
                const street = ticket.streetAddress || ticket.street || '';
                const rType = ticket.requestType || ticket.drainage_type || 'Declogging';
                const prio = ticket.priority || ticket.urgency || 'Routine';
                const isSelected =
                  (activeTicket?.ticketId || activeTicket?.id) === tId;

                const radius =
                  prio === 'High Priority' ? 380 : prio === 'Elevated' ? 270 : 190;
                const heatColor =
                  prio === 'High Priority'
                    ? '#f43f5e'
                    : prio === 'Elevated'
                    ? '#f97316'
                    : '#38bdf8';

                return (
                  <React.Fragment key={tId}>
                    {showHeatOverlay &&
                      ticket.status !== 'Completed' &&
                      ticket.status !== 'Closed' && (
                        <Circle
                          center={[lat, lng]}
                          radius={radius}
                          pathOptions={{
                            color: heatColor,
                            weight: 1,
                            fillColor: heatColor,
                            fillOpacity: 0.16,
                          }}
                        />
                      )}

                    <Marker
                      position={[lat, lng]}
                      icon={createTicketDivIcon(ticket, isSelected)}
                      eventHandlers={{
                        click: () => setActiveTicket(ticket),
                      }}
                    >
                      <Popup>
                        <div
                          style={{
                            fontFamily: 'Plus Jakarta Sans, sans-serif',
                            minWidth: '215px',
                            color: '#0f172a',
                          }}
                        >
                          <div
                            style={{
                              fontSize: '10px',
                              fontWeight: 800,
                              color: '#0284c7',
                              letterSpacing: '0.06em',
                            }}
                          >
                            {tId} • {ticket.legislativeDistrict || 'MANILA DEPW GIS'}
                          </div>
                          <div
                            style={{
                              fontSize: '13px',
                              fontWeight: 800,
                              margin: '3px 0',
                            }}
                          >
                            {ticket.barangay} ({ticket.district})
                          </div>
                          <div style={{ fontSize: '12px', color: '#334155' }}>{street}</div>
                          <div style={{ fontSize: '11px', marginTop: '4px', color: '#475569' }}>
                            <strong>Type:</strong> {rType} • <strong>Priority:</strong> {prio}
                          </div>
                          <div style={{ fontSize: '11px', color: '#475569' }}>
                            <strong>Status:</strong> {ticket.status}
                          </div>
                          <div
                            style={{
                              fontSize: '10px',
                              fontFamily: 'monospace',
                              color: '#64748b',
                              marginTop: '4px',
                            }}
                          >
                            GPS: {lat.toFixed(5)}, {lng.toFixed(5)}
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  </React.Fragment>
                );
              })}

              {/* Drainage Infrastructure Assets Layer */}
              {showAssets &&
                assets.map((asset) => {
                  const aId = asset.assetId || asset.id || 'AST';
                  const lat = Number(asset.latitude ?? asset.lat) || 14.5995;
                  const lng = Number(asset.longitude ?? asset.lng) || 120.9842;
                  const aType = asset.assetType || asset.asset_type || 'Culvert';
                  const cond = asset.conditionStatus || asset.condition || 'Operational';
                  return (
                    <Marker
                      key={aId}
                      position={[lat, lng]}
                      icon={createAssetDivIcon()}
                    >
                      <Popup>
                        <div
                          style={{
                            fontFamily: 'Plus Jakarta Sans, sans-serif',
                            minWidth: '195px',
                            color: '#0f172a',
                          }}
                        >
                          <div
                            style={{
                              fontSize: '10px',
                              fontWeight: 800,
                              color: '#0891b2',
                            }}
                          >
                            DRAINAGE ASSET • {aId}
                          </div>
                          <div
                            style={{
                              fontSize: '13px',
                              fontWeight: 700,
                              margin: '2px 0',
                            }}
                          >
                            {asset.name}
                          </div>
                          <div style={{ fontSize: '11px', color: '#334155' }}>
                            {aType} • {asset.dimensions}
                          </div>
                          <div
                            style={{
                              fontSize: '11px',
                              color: '#475569',
                              marginTop: '3px',
                            }}
                          >
                            Condition: <strong>{cond}</strong>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}

              {/* Interactive Pinned Declogging Site Marker */}
              {pinnedCoords && (
                <Marker
                  position={[pinnedCoords.lat, pinnedCoords.lng]}
                  icon={createNewPinDivIcon()}
                >
                  <Popup>
                    <div
                      style={{
                        fontFamily: 'Plus Jakarta Sans, sans-serif',
                        minWidth: '210px',
                        color: '#0f172a',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          color: '#ea580c',
                          letterSpacing: '0.06em',
                        }}
                      >
                        NEW PINNED DECLOGGING SITE
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 800, margin: '3px 0' }}>
                        {detectedPinInfo?.district || pinForm.district} (
                        {detectedPinInfo?.legislativeDistrict || pinForm.legislativeDistrict})
                      </div>
                      <div style={{ fontSize: '11px', color: '#334155' }}>
                        Nearest Waterway: <strong>{detectedPinInfo?.nearestEstero}</strong>
                      </div>
                      <div
                        style={{
                          fontSize: '11px',
                          fontFamily: 'monospace',
                          color: '#475569',
                          marginTop: '4px',
                        }}
                      >
                        Coords: {pinnedCoords.lat}, {pinnedCoords.lng}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              )}
            </MapContainer>
          </div>

          {/* Pinned Coordinates Status Strip below Map */}
          {pinnedCoords && (
            <div
              style={{
                marginTop: '10px',
                padding: '10px 14px',
                borderRadius: '10px',
                background: 'rgba(249, 115, 22, 0.14)',
                border: '1px solid rgba(249, 115, 22, 0.42)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px',
              }}
            >
              <div style={{ fontSize: '12px', color: 'var(--text-primary)' }}>
                <strong style={{ color: '#fb923c' }}>Active Map Pin:</strong>{' '}
                <span className={styles.monoText}>
                  {pinnedCoords.lat}, {pinnedCoords.lng}
                </span>{' '}
                •{' '}
                <span>
                  Auto-detected:{' '}
                  <strong>
                    {detectedPinInfo?.district || pinForm.district} (
                    {detectedPinInfo?.legislativeDistrict || pinForm.legislativeDistrict})
                  </strong>
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {onUseCoordinatesForNewTicket && (
                  <button
                    type="button"
                    className={styles.secondaryBtn}
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                    onClick={() => onUseCoordinatesForNewTicket(pinnedCoords)}
                  >
                    Open Full Smart Tracker Modal
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Legend */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              marginTop: '12px',
              padding: '4px 8px',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>
              STATUS PINS:
            </span>
            {Object.entries(STATUS_PIN_COLORS).map(([status, color]) => (
              <div
                key={status}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '11px',
                  color: 'var(--text-secondary)',
                }}
              >
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: color,
                    display: 'inline-block',
                  }}
                />
                {status}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: 1) Pin & Log Declogging Site Form, 2) Selected Ticket Inspector, 3) 6 Legislative Districts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Interactive Pin & Report Declogging Site Card */}
          <div
            className={styles.glassPanel}
            style={{
              padding: '18px',
              border: '1px solid rgba(249, 115, 22, 0.38)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                marginBottom: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <PlusCircle size={16} color="#fb923c" />
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: '#fb923c',
                  }}
                >
                  PIN & REPORT DECLOGGING SITE ON MAP
                </span>
              </div>
              <span
                className={styles.monoText}
                style={{
                  fontSize: '11px',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  background: 'rgba(249, 115, 22, 0.16)',
                  color: '#fdba74',
                }}
              >
                {pinnedCoords.lat}, {pinnedCoords.lng}
              </span>
            </div>

            <p
              style={{
                fontSize: '12px',
                color: 'var(--text-secondary)',
                margin: '0 0 12px 0',
                lineHeight: 1.45,
              }}
            >
              Click anywhere on the React-Leaflet Manila map (or choose a hotspot preset) to drop a
              pin, automatically detect the Manila District, and log a reported declogging site.
            </p>

            {pinFormErrors.length > 0 && (
              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: 'rgba(239, 68, 68, 0.16)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#fca5a5',
                  fontSize: '12px',
                  marginBottom: '10px',
                }}
              >
                {pinFormErrors.map((err, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangle size={13} />
                    <span>{err}</span>
                  </div>
                ))}
              </div>
            )}

            {lastPinnedSuccess && (
              <div
                style={{
                  padding: '9px 12px',
                  borderRadius: '8px',
                  background: 'rgba(16, 185, 129, 0.16)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  color: '#6ee7b7',
                  fontSize: '12px',
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={14} />
                  <span>
                    Pinned site <strong>{lastPinnedSuccess.ticketId}</strong> added to{' '}
                    <strong>{lastPinnedSuccess.district}</strong>!
                  </span>
                </div>
                {onSelectTicketOnTracker && (
                  <button
                    type="button"
                    className={styles.secondaryBtn}
                    style={{ padding: '3px 8px', fontSize: '11px' }}
                    onClick={() => onSelectTicketOnTracker(lastPinnedSuccess)}
                  >
                    Inspect
                  </button>
                )}
              </div>
            )}

            <form
              onSubmit={handleSavePinnedSite}
              style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: 'var(--text-secondary)',
                      marginBottom: '3px',
                    }}
                  >
                    Manila District (Auto-Detected)
                  </label>
                  <select
                    className={styles.glassSelect}
                    value={pinForm.district}
                    onChange={(e) => {
                      const nextDist = e.target.value;
                      const found = MANILA_DISTRICT_POLYGONS.find((d) => d.name === nextDist);
                      setPinForm((prev) => ({
                        ...prev,
                        district: nextDist,
                        legislativeDistrict: found?.legislativeDistrict || prev.legislativeDistrict,
                      }));
                      if (found) {
                        setPinnedCoords({ lat: found.lat, lng: found.lng });
                        setViewTarget({ lat: found.lat, lng: found.lng, zoom: 15, ts: Date.now() });
                      }
                    }}
                  >
                    {MANILA_DISTRICT_POLYGONS.map((d) => (
                      <option key={d.name} value={d.name}>
                        {d.name} ({d.legislativeDistrict})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: 'var(--text-secondary)',
                      marginBottom: '3px',
                    }}
                  >
                    Barangay
                  </label>
                  <input
                    type="text"
                    className={styles.glassInput}
                    value={pinForm.barangay}
                    onChange={(e) =>
                      setPinForm((prev) => ({ ...prev, barangay: e.target.value }))
                    }
                    placeholder="e.g. Barangay 452, Zone 45"
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'var(--text-secondary)',
                    marginBottom: '3px',
                  }}
                >
                  Pinned Street / Canal Site Location
                </label>
                <input
                  type="text"
                  className={styles.glassInput}
                  value={pinForm.streetAddress}
                  onChange={(e) =>
                    setPinForm((prev) => ({ ...prev, streetAddress: e.target.value }))
                  }
                  placeholder="Exact street corner, estero segment, or culvert inlet"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: 'var(--text-secondary)',
                      marginBottom: '3px',
                    }}
                  >
                    Operation Type
                  </label>
                  <select
                    className={styles.glassSelect}
                    value={pinForm.requestType}
                    onChange={(e) =>
                      setPinForm((prev) => ({ ...prev, requestType: e.target.value }))
                    }
                  >
                    {REQUEST_TYPES.map((rt) => (
                      <option key={rt} value={rt}>
                        {rt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: 'var(--text-secondary)',
                      marginBottom: '3px',
                    }}
                  >
                    Priority Level
                  </label>
                  <select
                    className={styles.glassSelect}
                    value={pinForm.priority}
                    onChange={(e) =>
                      setPinForm((prev) => ({ ...prev, priority: e.target.value }))
                    }
                  >
                    {PRIORITY_LEVELS.map((pr) => (
                      <option key={pr} value={pr}>
                        {pr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'var(--text-secondary)',
                    marginBottom: '3px',
                  }}
                >
                  Obstruction & Site Condition Notes
                </label>
                <input
                  type="text"
                  className={styles.glassInput}
                  value={pinForm.description}
                  onChange={(e) =>
                    setPinForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Describe silt buildup, standing floodwater, or blocked manhole..."
                />
              </div>

              <button
                type="submit"
                className={styles.orangeBtn}
                disabled={pinSaving}
                style={{ width: '100%', justifyContent: 'center', padding: '10px 14px' }}
              >
                <MapPin size={15} />
                <span>
                  {pinSaving
                    ? 'Pinning Declogging Site...'
                    : `Pin & Save Declogging Site in ${pinForm.district}`}
                </span>
              </button>
            </form>
          </div>

          {/* Selected Map Ticket Inspector Card */}
          <div className={styles.glassPanel} style={{ padding: '18px' }}>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#38bdf8',
                marginBottom: '8px',
              }}
            >
              SELECTED REPORTED DECLOGGING SITE • DEPW GIS
            </div>
            {activeTicket ? (
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px',
                  }}
                >
                  <span
                    className={styles.monoText}
                    style={{ fontSize: '15px', fontWeight: 800, color: '#38bdf8' }}
                  >
                    {activeTicket.ticketId || activeTicket.id}
                  </span>
                  <span
                    style={{
                      padding: '3px 9px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 700,
                      background: 'rgba(56, 189, 248, 0.15)',
                      color: '#7dd3fc',
                    }}
                  >
                    {activeTicket.status}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: '15px',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    marginBottom: '4px',
                  }}
                >
                  {activeTicket.barangay} — {activeTicket.district} (
                  {activeTicket.legislativeDistrict || 'Manila'})
                </div>
                <div
                  style={{
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    marginBottom: '8px',
                  }}
                >
                  {activeTicket.streetAddress || activeTicket.street}
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    marginBottom: '12px',
                    lineHeight: 1.5,
                  }}
                >
                  {activeTicket.description}
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid var(--glass-border)',
                    paddingTop: '10px',
                  }}
                >
                  <span
                    className={styles.monoText}
                    style={{ fontSize: '11px', color: 'var(--text-muted)' }}
                  >
                    GPS: {activeTicket.latitude ?? activeTicket.lat},{' '}
                    {activeTicket.longitude ?? activeTicket.lng}
                  </span>
                  {onSelectTicketOnTracker && (
                    <button
                      type="button"
                      className={styles.secondaryBtn}
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                      onClick={() => onSelectTicketOnTracker(activeTicket)}
                    >
                      Open in Smart Tracker
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Click any marker on the Manila map to inspect its drainage details.
              </div>
            )}
          </div>

          {/* Manila 6 Legislative Districts Quick Jump */}
          {!compactMode && (
            <div className={styles.glassPanel} style={{ padding: '18px' }}>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#fbbf24',
                  marginBottom: '8px',
                }}
              >
                MANILA 6 LEGISLATIVE DISTRICTS QUICK JUMP
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {LEGISLATIVE_DISTRICTS.map((ld) => (
                  <div
                    key={ld.id}
                    className={styles.glassCard}
                    style={{ padding: '8px 10px', cursor: 'pointer' }}
                    onClick={() => handleDistrictJump(ld.districts[0])}
                  >
                    <div
                      style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                      }}
                    >
                      {ld.name || ld.label || ld.id}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {ld.districts.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gemini Maps Grounding Panel */}
          {!compactMode && (
            <div className={styles.glassPanel} style={{ padding: '18px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '6px',
                }}
              >
                <Sparkles size={15} color="#38bdf8" />
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: '#38bdf8',
                  }}
                >
                  GEMINI MAPS GROUNDING (gemini-3.8-flash + googleMaps)
                </span>
              </div>
              <p
                style={{
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  margin: '0 0 10px 0',
                }}
              >
                Query real-world spatial context, nearby waterways, and landmarks in Manila to
                assist engineering field reconnaissance.
              </p>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <input
                  type="text"
                  className={styles.glassInput}
                  value={groundingQuery}
                  onChange={(e) => setGroundingQuery(e.target.value)}
                  placeholder="Ask about streets, esteros, or landmarks near current map center..."
                />
                <button
                  type="button"
                  className={styles.primaryBtn}
                  onClick={handleRunMapsGrounding}
                  disabled={groundingLoading}
                >
                  {groundingLoading ? 'Querying...' : 'Ground'}
                </button>
              </div>

              {groundingResult && (
                <div
                  className={styles.glassCard}
                  style={{ padding: '14px', maxHeight: '250px', overflowY: 'auto' }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                      marginBottom: '8px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: groundingResult.isOfflineKnowledge
                          ? 'rgba(245, 158, 11, 0.18)'
                          : 'rgba(56, 189, 248, 0.15)',
                        color: groundingResult.isOfflineKnowledge ? '#fcd34d' : '#38bdf8',
                        border: `1px solid ${
                          groundingResult.isOfflineKnowledge
                            ? 'rgba(245, 158, 11, 0.4)'
                            : 'rgba(56, 189, 248, 0.3)'
                        }`,
                      }}
                    >
                      {groundingResult.modelUsed || 'Geographic Reconnaissance'}
                    </span>
                  </div>

                  <div
                    style={{
                      fontSize: '12px',
                      color: 'var(--text-primary)',
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.55,
                    }}
                  >
                    {groundingResult.text || groundingResult.answer}
                  </div>
                  {groundingResult.places && groundingResult.places.length > 0 && (
                    <div
                      style={{
                        marginTop: '10px',
                        paddingTop: '8px',
                        borderTop: '1px solid var(--glass-border)',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          color: '#38bdf8',
                          marginBottom: '6px',
                        }}
                      >
                        MANILA DRAINAGE BASIN & WATERWAY LANDMARKS:
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {groundingResult.places.map((p, idx) => (
                          <a
                            key={idx}
                            href={p.uri}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '11px',
                              color: '#7dd3fc',
                              background: 'rgba(56, 189, 248, 0.12)',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              textDecoration: 'none',
                            }}
                          >
                            {p.title} <ExternalLink size={10} />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
