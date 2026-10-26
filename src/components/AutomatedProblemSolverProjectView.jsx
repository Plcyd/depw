import React, { useState, useMemo, useEffect } from 'react';
import {
  CheckCircle2,
  Copy,
  Check,
  Users,
  User,
  Sparkles,
  FileText,
  Play,
  RotateCcw,
  Download,
  ShieldCheck,
  GitBranch,
  Award,
  Layers,
  ArrowRight,
} from 'lucide-react';
import styles from '../styles/GlassSystem.module.css';
import {
  AUTOMATED_PROBLEM_SOLVER_PROJECT,
  FLOWCHART_STAGES,
  DEPW_PRIVACY_CONSENT_NOTICE,
  evaluateProblemSolverProjectSubmission,
} from '../utils/workflowRules.js';

const STORAGE_KEY = 'depw_problem_solver_project_v1';

export default function AutomatedProblemSolverProjectView({
  onNavigateToFlowchart,
  onNavigateToTracker,
  showToast,
}) {
  const [memberCount, setMemberCount] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return saved.memberCount || 4;
    } catch {
      return 4;
    }
  });

  const [teamMembers, setTeamMembers] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      if (Array.isArray(saved.teamMembers) && saved.teamMembers.length > 0) {
        return saved.teamMembers;
      }
    } catch {
      // ignore
    }
    return [
      'Member 1 — Workflow Architect & GIS Lead',
      'Member 2 — Smart Tracker & Database Lead',
      'Member 3 — Water Quality & Safety Telemetry Lead',
      'Member 4 — Data Privacy & AI Liaison Lead',
    ];
  });

  const [activeSetFilter, setActiveSetFilter] = useState('ALL'); // 'ALL' | 1 | 2 | 3 | 4
  const [quizActive, setQuizActive] = useState(true);
  const [showDualWorkflowPreview, setShowDualWorkflowPreview] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const [workflow1Answers, setWorkflow1Answers] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      if (saved.workflow1Answers && typeof saved.workflow1Answers === 'object') {
        return saved.workflow1Answers;
      }
    } catch {
      // ignore
    }
    const defaults = {};
    for (const setObj of AUTOMATED_PROBLEM_SOLVER_PROJECT.sets) {
      for (const item of setObj.items) {
        defaults[item.itemId] = item.workflow1Default;
      }
    }
    return defaults;
  });

  const [workflow2Answers, setWorkflow2Answers] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      if (saved.workflow2Answers && typeof saved.workflow2Answers === 'object') {
        return saved.workflow2Answers;
      }
    } catch {
      // ignore
    }
    const defaults = {};
    for (const setObj of AUTOMATED_PROBLEM_SOLVER_PROJECT.sets) {
      for (const item of setObj.items) {
        defaults[item.itemId] = item.workflow2Default;
      }
    }
    return defaults;
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          memberCount,
          teamMembers,
          workflow1Answers,
          workflow2Answers,
        })
      );
    } catch {
      // ignore storage errors
    }
  }, [memberCount, teamMembers, workflow1Answers, workflow2Answers]);

  const evaluation = useMemo(
    () =>
      evaluateProblemSolverProjectSubmission({
        memberCount,
        workflow1Answers,
        workflow2Answers,
      }),
    [memberCount, workflow1Answers, workflow2Answers]
  );

  const requiresTwoWorkflows = memberCount > 4 || showDualWorkflowPreview;

  const handleMemberCountChange = (nextCount) => {
    const count = Math.max(1, Math.min(8, Number(nextCount) || 1));
    setMemberCount(count);
    setTeamMembers((prev) => {
      const next = [...prev];
      while (next.length < count) {
        next.push(`Member ${next.length + 1} — Project Contributor`);
      }
      return next.slice(0, count);
    });
  };

  const handleCopyText = (id, text, label = 'Copied to clipboard!') => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    if (showToast) {
      showToast(label, 'success');
    }
  };

  const handleResetDefaults = () => {
    const wf1 = {};
    const wf2 = {};
    for (const setObj of AUTOMATED_PROBLEM_SOLVER_PROJECT.sets) {
      for (const item of setObj.items) {
        wf1[item.itemId] = item.workflow1Default;
        wf2[item.itemId] = item.workflow2Default;
      }
    }
    setWorkflow1Answers(wf1);
    setWorkflow2Answers(wf2);
    if (showToast) {
      showToast('Restored all 4 Sets & 11 Items (250 pts) to verified DEPW workflow answers.', 'info');
    }
  };

  const buildFullExportReport = () => {
    const lines = [
      `====================================================================`,
      `${AUTOMATED_PROBLEM_SOLVER_PROJECT.title.toUpperCase()}`,
      `4 Sets • 11 Items • 250 Total Score | Score: ${evaluation.earnedScore} / ${evaluation.maxScore} (${evaluation.percentage}%)`,
      `Project Goal: ${AUTOMATED_PROBLEM_SOLVER_PROJECT.projectGoal}`,
      `Team Configuration: ${evaluation.workMode}`,
      `Members: ${teamMembers.slice(0, memberCount).join(' | ')}`,
      `Data Privacy Consent Notice: "${DEPW_PRIVACY_CONSENT_NOTICE}"`,
      `====================================================================`,
      '',
    ];

    for (const setObj of AUTOMATED_PROBLEM_SOLVER_PROJECT.sets) {
      lines.push(`--------------------------------------------------------------------`);
      lines.push(`${setObj.title} (${setObj.maxPoints} Points)`);
      lines.push(`${setObj.subtitle}`);
      lines.push(`--------------------------------------------------------------------`);
      for (const item of setObj.items) {
        const resItem = evaluation.itemResults.find((r) => r.itemId === item.itemId);
        lines.push(
          `\n[Item ${item.itemNumber} of 11 • ${item.maxPoints} pts] ${item.title}`
        );
        lines.push(`Prompt: ${item.prompt}`);
        lines.push(
          `Workflow 1 (Barangay Declogging Smart Tracker & GIS Automation):\n${resItem?.workflow1Text || item.workflow1Default}`
        );
        if (requiresTwoWorkflows) {
          lines.push(
            `Workflow 2 (Drainage Zone Water Quality & H2S Safety Automation):\n${resItem?.workflow2Text || item.workflow2Default}`
          );
        }
      }
      lines.push('');
    }
    return lines.join('\n');
  };

  const handleDownloadReport = () => {
    const text = buildFullExportReport();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Automated-Problem-Solver-Project-4Sets-11Items-250pts.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    if (showToast) {
      showToast('Downloaded complete 4-Set, 11-Item (250 Score) Project Report.', 'success');
    }
  };

  const visibleSets =
    activeSetFilter === 'ALL'
      ? AUTOMATED_PROBLEM_SOLVER_PROJECT.sets
      : AUTOMATED_PROBLEM_SOLVER_PROJECT.sets.filter((s) => s.setNumber === Number(activeSetFilter));

  return (
    <section
      aria-label="Automated Problem-Solver Project – Design Your Custom Workflow"
      style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
    >
      {/* 1. EXACT PROJECT BRIEF CARD (MATCHING UPLOADED SCREENSHOT) */}
      <div
        className={styles.glassPanel}
        style={{
          padding: '24px 28px',
          border: '1px solid rgba(56, 189, 248, 0.38)',
          background:
            'linear-gradient(135deg, rgba(15, 23, 42, 0.92) 0%, rgba(8, 28, 56, 0.94) 100%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '18px',
          }}
        >
          <div style={{ maxWidth: '780px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 12px',
                borderRadius: '999px',
                background: 'rgba(56, 189, 248, 0.14)',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                fontSize: '11px',
                fontWeight: 800,
                color: '#38bdf8',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginBottom: '10px',
              }}
            >
              <Sparkles size={13} />
              <span>STEP-BY-STEP AUTOMATED WORKFLOW CAPSTONE</span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(22px, 3vw, 28px)',
                fontWeight: 800,
                color: '#60a5fa',
                margin: '0 0 8px 0',
                lineHeight: 1.25,
              }}
            >
              {AUTOMATED_PROBLEM_SOLVER_PROJECT.title}
            </h1>

            {/* 4 Sets • 11 Items • 250 Total Score */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '14px',
                fontSize: '14px',
                fontWeight: 700,
                color: '#cbd5e1',
                marginBottom: '18px',
              }}
            >
              <span
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: 'rgba(30, 41, 59, 0.9)',
                  border: '1px solid rgba(148, 163, 184, 0.25)',
                }}
              >
                4 Sets
              </span>
              <span
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: 'rgba(30, 41, 59, 0.9)',
                  border: '1px solid rgba(148, 163, 184, 0.25)',
                }}
              >
                11 Items
              </span>
              <span
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: 'rgba(16, 185, 129, 0.16)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  color: '#6ee7b7',
                }}
              >
                250 Total Score
              </span>
            </div>

            {/* Project Goal */}
            <div style={{ marginBottom: '16px' }}>
              <h2
                style={{
                  fontSize: '16px',
                  fontWeight: 800,
                  color: '#f8fafc',
                  margin: '0 0 6px 0',
                }}
              >
                Project Goal
              </h2>
              <p
                style={{
                  fontSize: '14px',
                  color: '#e2e8f0',
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                {AUTOMATED_PROBLEM_SOLVER_PROJECT.projectGoal}
              </p>
            </div>

            {/* Group Rules */}
            <div
              style={{
                padding: '14px 18px',
                borderRadius: '12px',
                background: 'rgba(15, 23, 42, 0.78)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                marginBottom: '18px',
              }}
            >
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 800,
                  color: '#f8fafc',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Users size={16} color="#38bdf8" />
                <span>{AUTOMATED_PROBLEM_SOLVER_PROJECT.groupHeader}</span>
              </div>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: '20px',
                  color: '#cbd5e1',
                  fontSize: '13px',
                  lineHeight: 1.65,
                }}
              >
                <li>
                  If your team has <strong>more than four members</strong>, you will need to create{' '}
                  <strong style={{ color: '#fbbf24' }}>two separate workflows</strong>.
                </li>
                <li>
                  You may also choose to complete the project{' '}
                  <strong style={{ color: '#38bdf8' }}>individually</strong> if you prefer.
                </li>
              </ul>
            </div>
          </div>

          {/* Right: Quiz / Project Status Card & Score Meter */}
          <div
            className={styles.glassCard}
            style={{
              minWidth: '290px',
              flex: '1 1 290px',
              maxWidth: '360px',
              padding: '18px 20px',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              background: 'rgba(9, 18, 36, 0.9)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px',
                paddingBottom: '10px',
                borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
              }}
            >
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#fbbf24',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                PROJECT SPECIFICATIONS
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '999px',
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: '#6ee7b7',
                }}
              >
                {evaluation.earnedScore} / {evaluation.maxScore} pts ({evaluation.percentage}%)
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '13px',
                marginBottom: '16px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Number of attempts</span>
                <strong style={{ color: '#f8fafc' }}>
                  {AUTOMATED_PROBLEM_SOLVER_PROJECT.attempts}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Duration</span>
                <strong style={{ color: '#f8fafc' }}>
                  {AUTOMATED_PROBLEM_SOLVER_PROJECT.duration}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Passing Grade</span>
                <strong style={{ color: '#38bdf8' }}>
                  {AUTOMATED_PROBLEM_SOLVER_PROJECT.passingGradePercent}% (175 / 250)
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Status</span>
                <strong style={{ color: '#34d399' }}>
                  {AUTOMATED_PROBLEM_SOLVER_PROJECT.status} • Ready
                </strong>
              </div>
            </div>

            {/* Orange "TAKE QUIZ" Button matching screenshot */}
            <button
              type="button"
              onClick={() => setQuizActive(true)}
              style={{
                width: '100%',
                padding: '11px 16px',
                borderRadius: '8px',
                border: '1px solid rgba(251, 191, 36, 0.6)',
                background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 800,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 6px 20px rgba(245, 158, 11, 0.3)',
              }}
            >
              <Play size={14} />
              <span>TAKE QUIZ • STEP-BY-STEP WORKBOOK</span>
            </button>

            <div
              style={{
                display: 'flex',
                gap: '8px',
                marginTop: '10px',
              }}
            >
              <button
                type="button"
                className={styles.secondaryBtn}
                style={{ flex: 1, justifyContent: 'center', fontSize: '11px', padding: '7px 10px' }}
                onClick={() =>
                  handleCopyText(
                    'FULL-REPORT',
                    buildFullExportReport(),
                    'Copied all 4 Sets & 11 Items (250 pts) to clipboard!'
                  )
                }
              >
                {copiedId === 'FULL-REPORT' ? <Check size={13} /> : <Copy size={13} />}
                <span>{copiedId === 'FULL-REPORT' ? 'Copied All!' : 'Copy All 11 Items'}</span>
              </button>

              <button
                type="button"
                className={styles.secondaryBtn}
                style={{ flex: 1, justifyContent: 'center', fontSize: '11px', padding: '7px 10px' }}
                onClick={handleDownloadReport}
              >
                <Download size={13} />
                <span>Download .TXT</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. TEAM GROUPING CONFIGURATOR (INDIVIDUAL vs <= 4 MEMBERS vs > 4 MEMBERS DUAL WORKFLOW) */}
      <div className={styles.glassPanel} style={{ padding: '18px 22px' }}>
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
            <div
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#38bdf8',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              GROUP SIZE & WORKFLOW REQUIREMENT CALCULATOR
            </div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#f8fafc', marginTop: '2px' }}>
              {evaluation.workMode}
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
            {[
              { count: 1, label: 'Individual (1 Member)', icon: User },
              { count: 4, label: 'Group of 4 (Max 4 • 1 Workflow)', icon: Users },
              { count: 5, label: '5+ Members (2 Separate Workflows)', icon: Layers },
            ].map((preset) => {
              const Icon = preset.icon;
              const isSelected =
                (preset.count === 1 && memberCount === 1) ||
                (preset.count === 4 && memberCount >= 2 && memberCount <= 4) ||
                (preset.count === 5 && memberCount > 4);
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleMemberCountChange(preset.count)}
                  className={isSelected ? styles.primaryBtn : styles.secondaryBtn}
                  style={{ fontSize: '12px', padding: '7px 12px' }}
                >
                  <Icon size={14} />
                  <span>{preset.label}</span>
                </button>
              );
            })}

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '6px' }}>
              <label
                htmlFor="team-member-count-input"
                style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: 600 }}
              >
                Members:
              </label>
              <input
                id="team-member-count-input"
                type="number"
                min={1}
                max={8}
                value={memberCount}
                onChange={(e) => handleMemberCountChange(e.target.value)}
                className={styles.glassInput}
                style={{ width: '64px', padding: '5px 8px', textAlign: 'center' }}
              />
            </div>

            {memberCount <= 4 && (
              <button
                type="button"
                className={showDualWorkflowPreview ? styles.orangeBtn : styles.secondaryBtn}
                style={{ fontSize: '11px', padding: '6px 10px' }}
                onClick={() => setShowDualWorkflowPreview((prev) => !prev)}
              >
                {showDualWorkflowPreview
                  ? 'Showing Both Workflows (1 & 2)'
                  : 'Show Bonus 2nd Workflow'}
              </button>
            )}
          </div>
        </div>

        {/* Team Member Names Input Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '8px',
            marginTop: '12px',
          }}
        >
          {teamMembers.slice(0, memberCount).map((name, idx) => (
            <input
              key={idx}
              type="text"
              value={name}
              aria-label={`Team Member ${idx + 1}`}
              onChange={(e) => {
                const val = e.target.value;
                setTeamMembers((prev) => prev.map((m, i) => (i === idx ? val : m)));
              }}
              className={styles.glassInput}
              style={{ fontSize: '12px', padding: '6px 10px' }}
            />
          ))}
        </div>
      </div>

      {/* 3. VISUAL STEP-BY-STEP AUTOMATION ARCHITECTURE SUMMARY */}
      <div className={styles.glassPanel} style={{ padding: '18px 22px' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            marginBottom: '12px',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#38bdf8',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              COMPLETE STEP-BY-STEP AUTOMATED WORKFLOW ARCHITECTURE
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#f8fafc', margin: '2px 0 0' }}>
              8-Stage Automated Declogging & GIS Dispatch Pipeline
            </h3>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {onNavigateToFlowchart && (
              <button
                type="button"
                className={styles.secondaryBtn}
                style={{ fontSize: '12px', padding: '6px 12px' }}
                onClick={onNavigateToFlowchart}
              >
                <GitBranch size={14} />
                <span>Open Interactive 8-Stage Simulator</span>
              </button>
            )}
            {onNavigateToTracker && (
              <button
                type="button"
                className={styles.primaryBtn}
                style={{ fontSize: '12px', padding: '6px 12px' }}
                onClick={onNavigateToTracker}
              >
                <ArrowRight size={14} />
                <span>Test Live in Smart Tracker</span>
              </button>
            )}
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(195px, 1fr))',
            gap: '10px',
          }}
        >
          {FLOWCHART_STAGES.map((stg) => (
            <div
              key={stg.step}
              className={styles.glassCard}
              style={{
                padding: '10px 12px',
                borderLeft: '3px solid #38bdf8',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '10px',
                  fontWeight: 800,
                  color: '#38bdf8',
                  marginBottom: '4px',
                }}
              >
                <span>STEP {stg.step} • {stg.code}</span>
                <span style={{ color: '#94a3b8' }}>{stg.statusBadge}</span>
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
                {stg.titleEn}
              </div>
              <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '3px', lineHeight: 1.4 }}>
                {stg.plainDescriptionEn}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. 4 SETS / 11 ITEMS / 250 TOTAL SCORE INTERACTIVE WORKBOOK */}
      {quizActive && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Set Filter Bar */}
          <div
            className={styles.glassPanel}
            style={{
              padding: '14px 18px',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setActiveSetFilter('ALL')}
                className={activeSetFilter === 'ALL' ? styles.primaryBtn : styles.secondaryBtn}
                style={{ fontSize: '12px', padding: '7px 12px' }}
              >
                All 4 Sets (11 Items • 250 pts)
              </button>
              {AUTOMATED_PROBLEM_SOLVER_PROJECT.sets.map((s) => (
                <button
                  key={s.setId}
                  type="button"
                  onClick={() => setActiveSetFilter(s.setNumber)}
                  className={
                    activeSetFilter === s.setNumber ? styles.primaryBtn : styles.secondaryBtn
                  }
                  style={{ fontSize: '12px', padding: '7px 12px' }}
                >
                  Set {s.setNumber} ({s.items.length} Items • {s.maxPoints} pts)
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleResetDefaults}
              className={styles.secondaryBtn}
              style={{ fontSize: '11px', padding: '6px 10px' }}
            >
              <RotateCcw size={13} />
              <span>Restore Verified Answers</span>
            </button>
          </div>

          {/* Sets & Items List */}
          {visibleSets.map((setObj) => {
            const setScoreObj = evaluation.setScores.find(
              (sc) => sc.setNumber === setObj.setNumber
            );
            return (
              <div
                key={setObj.setId}
                className={styles.glassPanel}
                style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                    paddingBottom: '12px',
                    borderBottom: '1px solid var(--glass-border)',
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        color: '#38bdf8',
                        textTransform: 'uppercase',
                        letterSpacing: '0.07em',
                      }}
                    >
                      SET {setObj.setNumber} OF 4 • {setObj.items.length} ITEMS
                    </div>
                    <h3
                      style={{
                        fontSize: '18px',
                        fontWeight: 800,
                        color: '#f8fafc',
                        margin: '2px 0',
                      }}
                    >
                      {setObj.title}
                    </h3>
                    <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
                      {setObj.subtitle}
                    </p>
                  </div>

                  <span
                    style={{
                      padding: '5px 12px',
                      borderRadius: '999px',
                      background: 'rgba(16, 185, 129, 0.16)',
                      border: '1px solid rgba(16, 185, 129, 0.4)',
                      color: '#6ee7b7',
                      fontSize: '12px',
                      fontWeight: 800,
                    }}
                  >
                    <Award size={13} style={{ display: 'inline', marginRight: '5px' }} />
                    {setScoreObj?.earnedPoints ?? setObj.maxPoints} / {setObj.maxPoints} Points
                  </span>
                </div>

                {/* Items in Set */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {setObj.items.map((item) => {
                    const resItem = evaluation.itemResults.find((r) => r.itemId === item.itemId);
                    const val1 = workflow1Answers[item.itemId] ?? item.workflow1Default;
                    const val2 = workflow2Answers[item.itemId] ?? item.workflow2Default;

                    return (
                      <div
                        key={item.itemId}
                        className={styles.glassCard}
                        style={{
                          padding: '16px 18px',
                          border: '1px solid rgba(56, 189, 248, 0.22)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '8px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span
                              style={{
                                padding: '3px 9px',
                                borderRadius: '6px',
                                background: 'rgba(56, 189, 248, 0.18)',
                                color: '#38bdf8',
                                fontSize: '11px',
                                fontWeight: 800,
                                fontFamily: 'var(--font-mono)',
                              }}
                            >
                              ITEM {item.itemNumber} OF 11
                            </span>
                            <h4
                              style={{
                                fontSize: '15px',
                                fontWeight: 800,
                                color: '#f8fafc',
                                margin: 0,
                              }}
                            >
                              {item.title}
                            </h4>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span
                              style={{
                                fontSize: '11px',
                                fontWeight: 800,
                                color:
                                  resItem?.earnedPoints === item.maxPoints
                                    ? '#34d399'
                                    : '#fbbf24',
                              }}
                            >
                              {resItem?.earnedPoints ?? item.maxPoints} / {item.maxPoints} pts
                            </span>
                            <button
                              type="button"
                              className={styles.secondaryBtn}
                              style={{ padding: '4px 10px', fontSize: '11px' }}
                              onClick={() =>
                                handleCopyText(
                                  item.itemId,
                                  requiresTwoWorkflows
                                    ? `Workflow 1: ${val1}\n\nWorkflow 2: ${val2}`
                                    : val1,
                                  `Copied Item ${item.itemNumber} answer!`
                                )
                              }
                            >
                              {copiedId === item.itemId ? (
                                <Check size={12} />
                              ) : (
                                <Copy size={12} />
                              )}
                              <span>
                                {copiedId === item.itemId ? 'Copied' : 'Copy Item Answer'}
                              </span>
                            </button>
                          </div>
                        </div>

                        <p
                          style={{
                            fontSize: '12.5px',
                            color: '#cbd5e1',
                            margin: 0,
                            fontStyle: 'italic',
                          }}
                        >
                          {item.prompt}
                        </p>

                        {/* Workflow 1 Answer */}
                        <div>
                          <label
                            htmlFor={`wf1-${item.itemId}`}
                            style={{
                              display: 'block',
                              fontSize: '11px',
                              fontWeight: 700,
                              color: '#38bdf8',
                              marginBottom: '4px',
                            }}
                          >
                            Workflow 1 — Barangay Declogging Smart Tracker & GIS Automation:
                          </label>
                          <textarea
                            id={`wf1-${item.itemId}`}
                            rows={3}
                            value={val1}
                            onChange={(e) =>
                              setWorkflow1Answers((prev) => ({
                                ...prev,
                                [item.itemId]: e.target.value,
                              }))
                            }
                            className={styles.glassTextarea}
                            style={{ fontSize: '12.5px', lineHeight: 1.55 }}
                          />
                        </div>

                        {/* Workflow 2 Answer (Required if Team > 4 Members or Dual Preview Enabled) */}
                        {requiresTwoWorkflows && (
                          <div
                            style={{
                              paddingTop: '8px',
                              borderTop: '1px dashed rgba(251, 191, 36, 0.3)',
                            }}
                          >
                            <label
                              htmlFor={`wf2-${item.itemId}`}
                              style={{
                                display: 'block',
                                fontSize: '11px',
                                fontWeight: 700,
                                color: '#fbbf24',
                                marginBottom: '4px',
                              }}
                            >
                              Workflow 2 (For Teams &gt; 4 Members) — Automated Drainage Zone Water
                              Quality &amp; H2S Safety Alert Workflow:
                            </label>
                            <textarea
                              id={`wf2-${item.itemId}`}
                              rows={3}
                              value={val2}
                              onChange={(e) =>
                                setWorkflow2Answers((prev) => ({
                                  ...prev,
                                  [item.itemId]: e.target.value,
                                }))
                              }
                              className={styles.glassTextarea}
                              style={{ fontSize: '12.5px', lineHeight: 1.55 }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
