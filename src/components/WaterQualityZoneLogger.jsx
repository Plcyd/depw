import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  Droplets,
  PlusCircle,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Trash2,
  Filter,
  Search,
  Sparkles,
  RefreshCw,
  MapPin,
  UserCheck,
  Clock,
  BarChart3,
  ListFilter,
} from 'lucide-react';
import styles from '../styles/GlassSystem.module.css';
import { api } from '../services/api.js';
import {
  IDENTIFIED_DRAINAGE_ZONES,
  INITIAL_WATER_QUALITY_LOGS,
  evaluateWaterDrainageSafety,
  validateWaterQualityEntry,
} from '../utils/workflowRules.js';

export default function WaterQualityZoneLogger({ showToast, compactHeader = false }) {
  const [logs, setLogs] = useState(() =>
    INITIAL_WATER_QUALITY_LOGS.map((item) => ({
      ...item,
      evaluation: evaluateWaterDrainageSafety(item),
    }))
  );
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Data Entry Form State
  const [zoneId, setZoneId] = useState(IDENTIFIED_DRAINAGE_ZONES[0].zoneId);
  const [dissolvedOxygen, setDissolvedOxygen] = useState('6.2');
  const [h2sPpm, setH2sPpm] = useState('2.1');
  const [turbidityNtu, setTurbidityNtu] = useState('30');
  const [ammoniaMgL, setAmmoniaMgL] = useState('1.3');
  const [flowIndex, setFlowIndex] = useState('88');
  const [pH, setPH] = useState('7.2');
  const [inspectorName, setInspectorName] = useState('Engr. Camille R. Aquino');
  const [notes, setNotes] = useState('');
  const [formErrors, setFormErrors] = useState([]);

  // Simple List View Filters & Visualization State
  const [filterZoneId, setFilterZoneId] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [chartMode, setChartMode] = useState('do_h2s'); // 'do_h2s' | 'turbidity_flow'

  const selectedZoneObj = useMemo(
    () =>
      IDENTIFIED_DRAINAGE_ZONES.find((z) => z.zoneId === zoneId) ||
      IDENTIFIED_DRAINAGE_ZONES[0],
    [zoneId]
  );

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getWaterQualityLogs();
      if (Array.isArray(data?.logs) && data.logs.length > 0) {
        setLogs(data.logs);
      }
    } catch (err) {
      if (showToast) {
        showToast(`Water quality log sync notice: ${err.message}`, 'info');
      }
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Live preview of safety evaluation for current form values
  const liveFormEvaluation = useMemo(() => {
    return evaluateWaterDrainageSafety({
      dissolvedOxygen: Number(dissolvedOxygen),
      h2sPpm: Number(h2sPpm),
      turbidityNtu: Number(turbidityNtu),
      ammoniaMgL: Number(ammoniaMgL),
      flowIndex: Number(flowIndex),
    });
  }, [dissolvedOxygen, h2sPpm, turbidityNtu, ammoniaMgL, flowIndex]);

  const handleApplyPreset = (presetType) => {
    setFormErrors([]);
    if (presetType === 'normal') {
      setDissolvedOxygen('6.4');
      setH2sPpm('1.9');
      setTurbidityNtu('26');
      setAmmoniaMgL('1.1');
      setFlowIndex('92');
      setPH('7.3');
      setNotes('Clear gravity discharge; no silt obstruction observed.');
    } else if (presetType === 'warning') {
      setDissolvedOxygen('4.4');
      setH2sPpm('6.2');
      setTurbidityNtu('63');
      setAmmoniaMgL('2.3');
      setFlowIndex('64');
      setPH('6.8');
      setNotes('Moderate silt accumulation and elevated H2S gas; schedule vacuum declogging.');
    } else if (presetType === 'critical') {
      setDissolvedOxygen('2.5');
      setH2sPpm('11.8');
      setTurbidityNtu('89');
      setAmmoniaMgL('3.5');
      setFlowIndex('41');
      setPH('6.5');
      setNotes('CRITICAL: Heavy silt choke and hazardous H2S pocket. Mandatory ventilation before entry.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors([]);

    const payload = {
      zoneId,
      zoneName: selectedZoneObj?.zoneName || 'Manila Drainage Zone',
      district: selectedZoneObj?.district || 'Manila',
      dissolvedOxygen,
      h2sPpm,
      turbidityNtu,
      ammoniaMgL,
      flowIndex,
      pH,
      inspectorName,
      notes:
        notes.trim() ||
        `Field water quality inspection logged at ${selectedZoneObj?.zoneName || 'drainage zone'}.`,
    };

    const validation = validateWaterQualityEntry(payload);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      if (showToast) {
        showToast(validation.errors[0], 'error');
      }
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.createWaterQualityLog(payload);
      const created = res?.log || {
        ...validation.entry,
        evaluation: validation.evaluation,
      };
      setLogs((prev) => [created, ...prev.filter((item) => item.logId !== created.logId)]);
      setNotes('');
      if (showToast) {
        showToast(
          `Logged water quality parameters for ${created.zoneName} (${created.overallStatus}).`,
          'success'
        );
      }
    } catch (err) {
      setFormErrors([err.message || 'Failed to save water quality log.']);
      if (showToast) {
        showToast(`Validation error: ${err.message}`, 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLog = async (logId, zoneName) => {
    try {
      await api.deleteWaterQualityLog(logId);
      setLogs((prev) => prev.filter((item) => item.logId !== logId));
      if (showToast) {
        showToast(`Removed log ${logId} (${zoneName}).`, 'info');
      }
    } catch (err) {
      if (showToast) {
        showToast(`Delete notice: ${err.message}`, 'error');
      }
    }
  };

  // Filtered logs for Simple List View
  const filteredLogs = useMemo(() => {
    return logs.filter((item) => {
      if (filterZoneId !== 'ALL' && item.zoneId !== filterZoneId) return false;
      if (filterStatus !== 'ALL' && item.overallStatus !== filterStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchZone = String(item.zoneName || '').toLowerCase().includes(q);
        const matchDist = String(item.district || '').toLowerCase().includes(q);
        const matchInsp = String(item.inspectorName || '').toLowerCase().includes(q);
        const matchNotes = String(item.notes || '').toLowerCase().includes(q);
        const matchId = String(item.logId || '').toLowerCase().includes(q);
        if (!matchZone && !matchDist && !matchInsp && !matchNotes && !matchId) {
          return false;
        }
      }
      return true;
    });
  }, [logs, filterZoneId, filterStatus, searchQuery]);

  // Aggregate latest reading per drainage zone for visualization chart
  const zoneChartData = useMemo(() => {
    const latestByZone = new Map();
    for (const item of logs) {
      if (!latestByZone.has(item.zoneId)) {
        latestByZone.set(item.zoneId, item);
      }
    }
    return Array.from(latestByZone.values()).map((item) => ({
      zoneShort: `${item.district} (${item.zoneName.split(' ')[0]})`,
      zoneName: item.zoneName,
      district: item.district,
      dissolvedOxygen: Number(item.dissolvedOxygen),
      h2sPpm: Number(item.h2sPpm),
      turbidityNtu: Number(item.turbidityNtu),
      ammoniaMgL: Number(item.ammoniaMgL),
      flowIndex: Number(item.flowIndex),
      overallStatus: item.overallStatus,
    }));
  }, [logs]);

  // Summary KPIs
  const summaryStats = useMemo(() => {
    const total = logs.length;
    const normalCount = logs.filter((l) => l.overallStatus === 'NORMAL').length;
    const warningCount = logs.filter((l) => l.overallStatus === 'WARNING').length;
    const criticalCount = logs.filter((l) => l.overallStatus === 'CRITICAL').length;
    const avgDo =
      total > 0
        ? (logs.reduce((acc, l) => acc + Number(l.dissolvedOxygen || 0), 0) / total).toFixed(1)
        : '0.0';
    return { total, normalCount, warningCount, criticalCount, avgDo };
  }, [logs]);

  return (
    <section
      aria-label="Drainage Zone Water Quality Data Entry and Simple List View"
      data-testid="water-quality-zone-logger"
      className={styles.glassPanel}
      style={{ padding: compactHeader ? '18px' : '22px', display: 'flex', flexDirection: 'column', gap: '20px' }}
    >
      {/* Top Section Header & Summary Pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Droplets size={17} color="#38bdf8" />
            <span style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#38bdf8' }}>
              IDENTIFIED DRAINAGE ZONES • WATER QUALITY LOGGING & VISUALIZATION
            </span>
          </div>
          <h2 style={{ fontSize: '21px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Drainage Zone Water Quality Data Entry Form & Simple List View
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            Mag-log at sumuri ng Dissolved Oxygen (DO), Hydrogen Sulfide (H2S), Turbidity (NTU), Ammonia, at Flow Efficiency sa mga pangunahing estero at drainage zone ng Maynila.
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
          <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-sky-500/15 border border-sky-400/30 text-sky-300">
            Total Logs: {summaryStats.total}
          </span>
          <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/15 border border-emerald-400/30 text-emerald-300">
            Safe: {summaryStats.normalCount}
          </span>
          <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500/15 border border-amber-400/30 text-amber-300">
            Caution: {summaryStats.warningCount}
          </span>
          <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-500/15 border border-rose-400/30 text-rose-300">
            Critical: {summaryStats.criticalCount}
          </span>
          <button
            type="button"
            onClick={fetchLogs}
            className={styles.secondaryBtn}
            style={{ padding: '6px 12px', fontSize: '12px' }}
            disabled={loading}
          >
            <RefreshCw size={13} />
            <span>{loading ? 'Syncing...' : 'Refresh Logs'}</span>
          </button>
        </div>
      </div>

      {/* Main Split Grid: Left = Data Entry Form, Right = Zone Parameter Visualization Chart */}
      <div className={styles.splitGrid}>
        {/* 1. DATA ENTRY FORM */}
        <div className={styles.glassCard} style={{ padding: '18px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                STEP 1 • FIELD PARAMETER ENTRY
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 800, margin: '2px 0 0 0', color: 'var(--text-primary)' }}>
                Log New Drainage Zone Reading
              </h3>
            </div>

            {/* 1-Click Sample Presets */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              <button
                type="button"
                onClick={() => handleApplyPreset('normal')}
                className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 hover:bg-emerald-500/30 cursor-pointer"
              >
                + Safe Sample
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('warning')}
                className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-500/20 border border-amber-400/40 text-amber-200 hover:bg-amber-500/30 cursor-pointer"
              >
                + Silt Caution
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('critical')}
                className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-500/20 border border-rose-400/40 text-rose-200 hover:bg-rose-500/30 cursor-pointer"
              >
                + H2S Alert
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} data-testid="water-quality-entry-form" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Drainage Zone Selector */}
            <div>
              <label htmlFor="wql-zone-select" className={styles.fieldLabel}>
                Identified Drainage Zone (Manila Estero / Culvert) *
              </label>
              <select
                id="wql-zone-select"
                aria-label="Identified Drainage Zone"
                className={styles.glassSelect}
                value={zoneId}
                onChange={(e) => setZoneId(e.target.value)}
              >
                {IDENTIFIED_DRAINAGE_ZONES.map((z) => (
                  <option key={z.zoneId} value={z.zoneId}>
                    {z.zoneName} — {z.district} ({z.legislativeDistrict})
                  </option>
                ))}
              </select>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={12} color="#38bdf8" />
                <span>
                  District: <strong style={{ color: 'var(--text-primary)' }}>{selectedZoneObj?.district}</strong> • Type: {selectedZoneObj?.waterwayType}
                </span>
              </div>
            </div>

            {/* 3x2 Numeric Parameter Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))', gap: '10px' }}>
              <div>
                <label htmlFor="wql-do-input" className={styles.fieldLabel}>
                  Dissolved O2 (mg/L) *
                </label>
                <input
                  id="wql-do-input"
                  type="number"
                  step="0.1"
                  min="0"
                  max="25"
                  className={styles.glassInput}
                  value={dissolvedOxygen}
                  onChange={(e) => setDissolvedOxygen(e.target.value)}
                  placeholder="e.g. 6.2"
                  required
                />
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Safe: &gt;= 5.0 mg/L</span>
              </div>

              <div>
                <label htmlFor="wql-h2s-input" className={styles.fieldLabel}>
                  H2S Culvert Gas (ppm) *
                </label>
                <input
                  id="wql-h2s-input"
                  type="number"
                  step="0.1"
                  min="0"
                  max="200"
                  className={styles.glassInput}
                  value={h2sPpm}
                  onChange={(e) => setH2sPpm(e.target.value)}
                  placeholder="e.g. 2.1"
                  required
                />
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Safe: &lt; 3.0 ppm</span>
              </div>

              <div>
                <label htmlFor="wql-turbidity-input" className={styles.fieldLabel}>
                  Turbidity (NTU) *
                </label>
                <input
                  id="wql-turbidity-input"
                  type="number"
                  step="1"
                  min="0"
                  max="1000"
                  className={styles.glassInput}
                  value={turbidityNtu}
                  onChange={(e) => setTurbidityNtu(e.target.value)}
                  placeholder="e.g. 30"
                  required
                />
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Safe: &lt;= 50 NTU</span>
              </div>

              <div>
                <label htmlFor="wql-ammonia-input" className={styles.fieldLabel}>
                  Ammonia NH3 (mg/L) *
                </label>
                <input
                  id="wql-ammonia-input"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  className={styles.glassInput}
                  value={ammoniaMgL}
                  onChange={(e) => setAmmoniaMgL(e.target.value)}
                  placeholder="e.g. 1.3"
                  required
                />
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Safe: &lt;= 2.0 mg/L</span>
              </div>

              <div>
                <label htmlFor="wql-flow-input" className={styles.fieldLabel}>
                  Flow Efficiency (%) *
                </label>
                <input
                  id="wql-flow-input"
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  className={styles.glassInput}
                  value={flowIndex}
                  onChange={(e) => setFlowIndex(e.target.value)}
                  placeholder="e.g. 88"
                  required
                />
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Safe: &gt;= 75%</span>
              </div>

              <div>
                <label htmlFor="wql-ph-input" className={styles.fieldLabel}>
                  Water pH Level
                </label>
                <input
                  id="wql-ph-input"
                  type="number"
                  step="0.1"
                  min="0"
                  max="14"
                  className={styles.glassInput}
                  value={pH}
                  onChange={(e) => setPH(e.target.value)}
                  placeholder="e.g. 7.2"
                />
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Normal: 6.5 – 8.5</span>
              </div>
            </div>

            {/* Inspector & Notes */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
              <div>
                <label htmlFor="wql-inspector-input" className={styles.fieldLabel}>
                  Inspector / DEPW Engineer Name *
                </label>
                <input
                  id="wql-inspector-input"
                  type="text"
                  className={styles.glassInput}
                  value={inspectorName}
                  onChange={(e) => setInspectorName(e.target.value)}
                  placeholder="e.g. Engr. Camille R. Aquino"
                  required
                />
              </div>

              <div>
                <label htmlFor="wql-notes-input" className={styles.fieldLabel}>
                  Field Observation / Notes
                </label>
                <input
                  id="wql-notes-input"
                  type="text"
                  className={styles.glassInput}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Post-declogging water clarity check..."
                />
              </div>
            </div>

            {/* Validation Errors */}
            {formErrors.length > 0 && (
              <div
                role="alert"
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: 'rgba(153, 27, 27, 0.35)',
                  border: '1px solid rgba(244, 63, 94, 0.6)',
                  color: '#fecdd3',
                  fontSize: '12px',
                }}
              >
                {formErrors.map((err, i) => (
                  <div key={i}>• {err}</div>
                ))}
              </div>
            )}

            {/* Live Safety Preview & Submit Button Row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '10px', paddingTop: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>
                  Auto-Classification:
                </span>
                {liveFormEvaluation.overallStatus === 'CRITICAL' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-rose-500/25 border border-rose-400 text-rose-200">
                    <AlertCircle size={13} /> CRITICAL HAZARD
                  </span>
                ) : liveFormEvaluation.overallStatus === 'WARNING' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-500/25 border border-amber-400 text-amber-200">
                    <AlertTriangle size={13} /> WARNING THRESHOLD
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-500/20 border border-emerald-400 text-emerald-200">
                    <CheckCircle2 size={13} /> NORMAL / SAFE
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className={styles.primaryBtn}
                style={{ padding: '9px 18px', fontSize: '14px' }}
              >
                <PlusCircle size={16} />
                <span>{submitting ? 'Saving Log...' : 'Save Water Quality Log'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* 2. VISUALIZING WATER QUALITY PARAMETERS BY DRAINAGE ZONE */}
        <div className={styles.glassCard} style={{ padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '12px' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  STEP 2 • ZONE PARAMETER COMPARISON
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, margin: '2px 0 0 0', color: 'var(--text-primary)' }}>
                  Water Quality Visualization Across Identified Zones
                </h3>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => setChartMode('do_h2s')}
                  className={chartMode === 'do_h2s' ? styles.primaryBtn : styles.secondaryBtn}
                  style={{ padding: '5px 10px', fontSize: '11px', minHeight: '32px' }}
                >
                  DO & H2S Gas
                </button>
                <button
                  type="button"
                  onClick={() => setChartMode('turbidity_flow')}
                  className={chartMode === 'turbidity_flow' ? styles.primaryBtn : styles.secondaryBtn}
                  style={{ padding: '5px 10px', fontSize: '11px', minHeight: '32px' }}
                >
                  Turbidity & Flow %
                </button>
              </div>
            </div>

            <div style={{ width: '100%', height: '270px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={zoneChartData} margin={{ top: 10, right: 12, left: -12, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
                  <XAxis dataKey="district" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(7, 16, 38, 0.95)',
                      border: '1px solid rgba(56, 189, 248, 0.4)',
                      borderRadius: '10px',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                  {chartMode === 'do_h2s' ? (
                    <>
                      <Bar
                        isAnimationActive={false}
                        dataKey="dissolvedOxygen"
                        name="Dissolved O2 (mg/L)"
                        fill="#34d399"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        isAnimationActive={false}
                        dataKey="h2sPpm"
                        name="H2S Culvert Gas (ppm)"
                        fill="#f43f5e"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        isAnimationActive={false}
                        dataKey="ammoniaMgL"
                        name="Ammonia NH3 (mg/L)"
                        fill="#fbbf24"
                        radius={[4, 4, 0, 0]}
                      />
                    </>
                  ) : (
                    <>
                      <Bar
                        isAnimationActive={false}
                        dataKey="flowIndex"
                        name="Flow Efficiency (%)"
                        fill="#38bdf8"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        isAnimationActive={false}
                        dataKey="turbidityNtu"
                        name="Suspended Turbidity (NTU)"
                        fill="#f97316"
                        radius={[4, 4, 0, 0]}
                      />
                    </>
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Visual Legend of Regulatory Thresholds */}
          <div
            style={{
              marginTop: '10px',
              padding: '10px 12px',
              borderRadius: '10px',
              background: 'rgba(15, 23, 42, 0.55)',
              border: '1px solid var(--glass-border)',
              fontSize: '11px',
              color: 'var(--text-secondary)',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              gap: '8px',
            }}
          >
            <span>🟢 <strong>DO Safe:</strong> &gt;= 5.0 mg/L</span>
            <span>🔴 <strong>H2S Hazard:</strong> &gt;= 10.0 ppm</span>
            <span>🟠 <strong>Turbidity Limit:</strong> &lt;= 50 NTU</span>
            <span>🔵 <strong>Flow Target:</strong> &gt;= 75%</span>
          </div>
        </div>
      </div>

      {/* 3. SIMPLE LIST VIEW OF LOGGED WATER QUALITY PARAMETERS */}
      <div className={styles.glassCard} style={{ padding: '18px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '14px' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              STEP 3 • SIMPLE LIST VIEW ({filteredLogs.length} RECORDS)
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 800, margin: '2px 0 0 0', color: 'var(--text-primary)' }}>
              Logged Water Quality Readings by Drainage Zone
            </h3>
          </div>

          {/* Filter Controls */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
            <select
              aria-label="Filter Water Logs by Drainage Zone"
              className={styles.glassSelect}
              style={{ width: 'auto', minWidth: '180px', padding: '6px 10px', fontSize: '12px' }}
              value={filterZoneId}
              onChange={(e) => setFilterZoneId(e.target.value)}
            >
              <option value="ALL">All Drainage Zones ({logs.length})</option>
              {IDENTIFIED_DRAINAGE_ZONES.map((z) => (
                <option key={z.zoneId} value={z.zoneId}>
                  {z.district} — {z.zoneName}
                </option>
              ))}
            </select>

            <select
              aria-label="Filter Water Logs by Safety Status"
              className={styles.glassSelect}
              style={{ width: 'auto', minWidth: '140px', padding: '6px 10px', fontSize: '12px' }}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="ALL">All Safety Statuses</option>
              <option value="NORMAL">🟢 Normal / Safe</option>
              <option value="WARNING">🟡 Caution / Warning</option>
              <option value="CRITICAL">🔴 Critical Breach</option>
            </select>

            <input
              type="text"
              aria-label="Search Water Quality Logs"
              className={styles.glassInput}
              style={{ width: 'auto', minWidth: '180px', padding: '6px 10px', fontSize: '12px' }}
              placeholder="Search zone, district, inspector..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Simple List View Items (Responsive Cards/Rows for both PC & Android) */}
        {filteredLogs.length === 0 ? (
          <div style={{ padding: '28px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
            No water quality logs match your current filter. Try selecting "All Drainage Zones" or log a new reading above.
          </div>
        ) : (
          <div
            data-testid="water-quality-list-view"
            style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
          >
            {filteredLogs.map((log) => {
              const isCrit = log.overallStatus === 'CRITICAL';
              const isWarn = log.overallStatus === 'WARNING';

              const borderAccent = isCrit
                ? 'rgba(244, 63, 94, 0.55)'
                : isWarn
                ? 'rgba(245, 158, 11, 0.55)'
                : 'rgba(52, 211, 153, 0.45)';

              const flowPercent = Math.min(100, Math.max(0, Number(log.flowIndex || 0)));
              const doPercent = Math.min(100, Math.max(0, (Number(log.dissolvedOxygen || 0) / 10) * 100));
              const h2sPercent = Math.min(100, Math.max(0, (Number(log.h2sPpm || 0) / 15) * 100));

              return (
                <article
                  key={log.logId}
                  data-testid="water-quality-list-item"
                  style={{
                    padding: '14px 16px',
                    borderRadius: '12px',
                    background: 'rgba(15, 23, 42, 0.65)',
                    border: `1px solid ${borderAccent}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  {/* Top Row: Zone Name, District, Safety Badge, Timestamp & Delete */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
                      <span className={styles.monoText} style={{ fontSize: '11px', fontWeight: 800, color: '#38bdf8' }}>
                        {log.logId}
                      </span>
                      <strong style={{ fontSize: '15px', color: 'var(--text-primary)' }}>
                        {log.zoneName}
                      </strong>
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-sky-500/15 text-sky-300 border border-sky-400/30">
                        {log.district}
                      </span>
                      {isCrit ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-500/25 border border-rose-400 text-rose-200">
                          <AlertCircle size={12} /> CRITICAL
                        </span>
                      ) : isWarn ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-500/25 border border-amber-400 text-amber-200">
                          <AlertTriangle size={12} /> WARNING
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-500/20 border border-emerald-400 text-emerald-200">
                          <CheckCircle2 size={12} /> NORMAL
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', color: 'var(--text-muted)' }}>
                      <span>
                        {log.inspectorName} • {new Date(log.recordedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteLog(log.logId, log.zoneName)}
                        aria-label={`Delete water log ${log.logId}`}
                        className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-700/70 text-slate-400 hover:text-rose-400 hover:border-rose-400/50 cursor-pointer"
                        title="Delete this log entry"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Middle Row: 6 Parameter Pills with Visual Bars */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))', gap: '8px' }}>
                    <div style={{ padding: '8px 10px', borderRadius: '8px', background: 'rgba(6, 14, 32, 0.7)', border: '1px solid rgba(148, 163, 184, 0.16)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Dissolved O2</span>
                        <strong className={styles.monoText} style={{ color: Number(log.dissolvedOxygen) < 5 ? '#fbbf24' : '#34d399' }}>
                          {log.dissolvedOxygen} mg/L
                        </strong>
                      </div>
                      <div style={{ height: '4px', background: 'rgba(148,163,184,0.2)', borderRadius: '999px', marginTop: '5px', overflow: 'hidden' }}>
                        <div style={{ width: `${doPercent}%`, height: '100%', background: Number(log.dissolvedOxygen) < 5 ? '#f59e0b' : '#10b981' }} />
                      </div>
                    </div>

                    <div style={{ padding: '8px 10px', borderRadius: '8px', background: 'rgba(6, 14, 32, 0.7)', border: '1px solid rgba(148, 163, 184, 0.16)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>H2S Gas</span>
                        <strong className={styles.monoText} style={{ color: Number(log.h2sPpm) >= 10 ? '#f43f5e' : Number(log.h2sPpm) >= 5 ? '#fbbf24' : '#34d399' }}>
                          {log.h2sPpm} ppm
                        </strong>
                      </div>
                      <div style={{ height: '4px', background: 'rgba(148,163,184,0.2)', borderRadius: '999px', marginTop: '5px', overflow: 'hidden' }}>
                        <div style={{ width: `${h2sPercent}%`, height: '100%', background: Number(log.h2sPpm) >= 10 ? '#f43f5e' : Number(log.h2sPpm) >= 5 ? '#f59e0b' : '#10b981' }} />
                      </div>
                    </div>

                    <div style={{ padding: '8px 10px', borderRadius: '8px', background: 'rgba(6, 14, 32, 0.7)', border: '1px solid rgba(148, 163, 184, 0.16)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Turbidity</span>
                        <strong className={styles.monoText} style={{ color: Number(log.turbidityNtu) >= 80 ? '#f43f5e' : Number(log.turbidityNtu) >= 50 ? '#fbbf24' : '#38bdf8' }}>
                          {log.turbidityNtu} NTU
                        </strong>
                      </div>
                      <div style={{ height: '4px', background: 'rgba(148,163,184,0.2)', borderRadius: '999px', marginTop: '5px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(100, Number(log.turbidityNtu))}%`, height: '100%', background: '#f97316' }} />
                      </div>
                    </div>

                    <div style={{ padding: '8px 10px', borderRadius: '8px', background: 'rgba(6, 14, 32, 0.7)', border: '1px solid rgba(148, 163, 184, 0.16)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Ammonia NH3</span>
                        <strong className={styles.monoText} style={{ color: Number(log.ammoniaMgL) >= 2 ? '#fbbf24' : '#cbd5e1' }}>
                          {log.ammoniaMgL} mg/L
                        </strong>
                      </div>
                      <div style={{ height: '4px', background: 'rgba(148,163,184,0.2)', borderRadius: '999px', marginTop: '5px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(100, Number(log.ammoniaMgL) * 20)}%`, height: '100%', background: '#eab308' }} />
                      </div>
                    </div>

                    <div style={{ padding: '8px 10px', borderRadius: '8px', background: 'rgba(6, 14, 32, 0.7)', border: '1px solid rgba(148, 163, 184, 0.16)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Flow Index</span>
                        <strong className={styles.monoText} style={{ color: '#38bdf8' }}>
                          {log.flowIndex}%
                        </strong>
                      </div>
                      <div style={{ height: '4px', background: 'rgba(148,163,184,0.2)', borderRadius: '999px', marginTop: '5px', overflow: 'hidden' }}>
                        <div style={{ width: `${flowPercent}%`, height: '100%', background: '#38bdf8' }} />
                      </div>
                    </div>

                    <div style={{ padding: '8px 10px', borderRadius: '8px', background: 'rgba(6, 14, 32, 0.7)', border: '1px solid rgba(148, 163, 184, 0.16)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Water pH</span>
                        <strong className={styles.monoText} style={{ color: '#cbd5e1' }}>
                          {log.pH ?? 7.2} pH
                        </strong>
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '3px' }}>
                        Temp: {log.waterTempC ?? 28.5}°C
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row: Notes */}
                  {log.notes && (
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                      <strong style={{ color: 'var(--text-primary)' }}>Field Note:</strong> {log.notes}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
