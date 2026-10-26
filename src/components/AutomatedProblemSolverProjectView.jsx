import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Copy,
  Check,
  Users,
  User,
  Sparkles,
  FileText,
  Play,
  Pause,
  RotateCcw,
  Download,
  GitBranch,
  Award,
  Layers,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Eraser,
  Presentation,
  Eye,
  EyeOff,
} from 'lucide-react';
import styles from '../styles/GlassSystem.module.css';
import {
  AUTOMATED_PROBLEM_SOLVER_PROJECT,
  FLOWCHART_STAGES,
  DEPW_PRIVACY_CONSENT_NOTICE,
  evaluateProblemSolverProjectSubmission,
} from '../utils/workflowRules.js';
import {
  buildAnimatedProjectSlides,
  generatePowerPointPptContent,
  generateAnimatedHtmlDeckContent,
  generateFlowchartSvgContent,
  generateWorkflowSpecificationDoc,
} from '../utils/pptGenerator.js';
import ThemeSwitcher from './ThemeSwitcher.jsx';

const STORAGE_KEY = 'depw_problem_solver_project_v2';

export default function AutomatedProblemSolverProjectView({
  onNavigateToFlowchart,
  onNavigateToTracker,
  onNavigateTab,
  blankSurroundingChrome = false,
  onToggleBlankSurroundingChrome,
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

  // Fully Animated PPT Player State
  const [showAnimatedPptPlayer, setShowAnimatedPptPlayer] = useState(true);
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const [isAutoPlayingPpt, setIsAutoPlayingPpt] = useState(false);
  const [pptAnimationStyle, setPptAnimationStyle] = useState('zoom-cascade');
  const [slideAnimTick, setSlideAnimTick] = useState(0);

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

  const animatedSlides = useMemo(
    () =>
      buildAnimatedProjectSlides({
        memberCount,
        teamMembers,
        workflow1Answers,
        workflow2Answers,
        evaluation,
      }),
    [memberCount, teamMembers, workflow1Answers, workflow2Answers, evaluation]
  );

  const nextPptSlide = useCallback(() => {
    setCurrentSlideIdx((prev) => (prev + 1) % animatedSlides.length);
    setSlideAnimTick((t) => t + 1);
  }, [animatedSlides.length]);

  const prevPptSlide = useCallback(() => {
    setCurrentSlideIdx((prev) => (prev - 1 + animatedSlides.length) % animatedSlides.length);
    setSlideAnimTick((t) => t + 1);
  }, [animatedSlides.length]);

  useEffect(() => {
    if (!isAutoPlayingPpt) return undefined;
    const timer = setInterval(() => {
      nextPptSlide();
    }, 4500);
    return () => clearInterval(timer);
  }, [isAutoPlayingPpt, nextPptSlide]);

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

  const handleBlankAllAnswers = () => {
    const wf1 = {};
    const wf2 = {};
    for (const setObj of AUTOMATED_PROBLEM_SOLVER_PROJECT.sets) {
      for (const item of setObj.items) {
        wf1[item.itemId] = '';
        wf2[item.itemId] = '';
      }
    }
    setWorkflow1Answers(wf1);
    setWorkflow2Answers(wf2);
    if (showToast) {
      showToast('Blanked all 11 answer fields so you can type from scratch.', 'info');
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
      showToast('Restored all 4 Sets & 11 Items (250 pts) to verified answers.', 'info');
    }
  };

  const downloadBlobFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPowerPointPpt = () => {
    const pptContent = generatePowerPointPptContent(animatedSlides, {
      title: AUTOMATED_PROBLEM_SOLVER_PROJECT.title,
      author: teamMembers.slice(0, memberCount).join(', '),
    });
    downloadBlobFile(
      pptContent,
      'Automated-Problem-Solver-Project-Animated-Slides.ppt',
      'application/vnd.ms-powerpoint;charset=utf-8;'
    );
    if (showToast) {
      showToast('Downloaded PowerPoint (.PPT) Presentation File (8 Slides • 250 Score)!', 'success');
    }
  };

  const handleDownloadAnimatedHtmlDeck = () => {
    const htmlContent = generateAnimatedHtmlDeckContent(animatedSlides, {
      title: AUTOMATED_PROBLEM_SOLVER_PROJECT.title,
    });
    downloadBlobFile(
      htmlContent,
      'Automated-Problem-Solver-Project-Animated-Presentation.html',
      'text/html;charset=utf-8;'
    );
    if (showToast) {
      showToast('Downloaded Standalone Fully-Animated HTML5 Presentation Deck!', 'success');
    }
  };

  const handleDownloadFlowchartSvg = () => {
    const svgContent = generateFlowchartSvgContent();
    downloadBlobFile(
      svgContent,
      'Set2-Q1-Automated-Workflow-Flowchart-50pts.svg',
      'image/svg+xml;charset=utf-8;'
    );
    if (showToast) {
      showToast('Downloaded Flowchart (.SVG) for Set 2 Question 1 (50 Points)!', 'success');
    }
  };

  const handleDownloadWorkflowSpecDoc = () => {
    const docContent = generateWorkflowSpecificationDoc({
      memberCount,
      workflow1Answers,
      workflow2Answers,
      evaluation,
    });
    downloadBlobFile(
      docContent,
      'Set2-Q2-Complete-Automated-Workflow-Specification-50pts.txt',
      'text/plain;charset=utf-8;'
    );
    if (showToast) {
      showToast('Downloaded Workflow Specification for Set 2 Question 2 (50 Points)!', 'success');
    }
  };

  const visibleSets =
    activeSetFilter === 'ALL'
      ? AUTOMATED_PROBLEM_SOLVER_PROJECT.sets
      : AUTOMATED_PROBLEM_SOLVER_PROJECT.sets.filter((s) => s.setNumber === Number(activeSetFilter));

  const activeSlide = animatedSlides[currentSlideIdx] || animatedSlides[0];

  return (
    <section
      aria-label="Automated Problem-Solver Project – Design Your Custom Workflow"
      style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
    >
      <style>{`
        @keyframes depwPptSlideEnter {
          0% { opacity: 0; transform: translateY(20px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes depwPptFlipEnter {
          0% { opacity: 0; transform: perspective(900px) rotateX(12deg) translateY(16px); }
          100% { opacity: 1; transform: perspective(900px) rotateX(0deg) translateY(0); }
        }
      `}</style>

      {/* TOP FOCUS / BLANK EVERYTHING ELSE CONTROL BAR */}
      <div
        className={styles.glassPanel}
        style={{
          padding: '12px 18px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          border: '1px solid var(--accent-cyan)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span
            style={{
              padding: '4px 10px',
              borderRadius: '999px',
              background: 'rgba(56, 189, 248, 0.18)',
              color: 'var(--accent-cyan)',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.06em',
            }}
          >
            {AUTOMATED_PROBLEM_SOLVER_PROJECT.courseTitle || 'COURSE: IMPLEMENT BASIC AUTOMATION TECHNIQUES USING AI TOOLS'}
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>
            4 Sets • 11 Items • 250 Total Score
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {onToggleBlankSurroundingChrome && (
            <button
              type="button"
              onClick={onToggleBlankSurroundingChrome}
              className={blankSurroundingChrome ? styles.primaryBtn : styles.secondaryBtn}
              style={{ fontSize: '11.5px', padding: '6px 12px' }}
              title="Blank or restore the surrounding dashboard toolbars while doing the Automated Problem-Solver Project"
            >
              {blankSurroundingChrome ? <Eye size={13} /> : <EyeOff size={13} />}
              <span>
                {blankSurroundingChrome
                  ? 'Show Top Dashboard Bars'
                  : 'Blank Everything Else (Focus Mode)'}
              </span>
            </button>
          )}

          {blankSurroundingChrome && onNavigateTab && (
            <button
              type="button"
              onClick={() => onNavigateTab('command')}
              className={styles.secondaryBtn}
              style={{ fontSize: '11.5px', padding: '6px 12px' }}
            >
              <span>Exit to Main Dashboard</span>
            </button>
          )}

          <ThemeSwitcher showToast={showToast} />
        </div>
      </div>

      {/* 1. EXACT PROJECT BRIEF CARD (MATCHING UPLOADED LMS SCREENSHOT) */}
      <div
        className={styles.glassPanel}
        style={{
          padding: '24px 28px',
          border: '1px solid var(--glass-border)',
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
          <div style={{ maxWidth: '760px' }}>
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
                color: 'var(--accent-cyan)',
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
                color: 'var(--accent-cyan)',
                margin: '0 0 8px 0',
                lineHeight: 1.25,
              }}
            >
              {AUTOMATED_PROBLEM_SOLVER_PROJECT.title}
            </h1>

            {/* 4 Sets | 11 Items | 250 Total Score */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '12px',
                fontSize: '14px',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                marginBottom: '18px',
              }}
            >
              <span
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: 'var(--bg-navy-elevated)',
                  border: '1px solid var(--glass-border)',
                }}
              >
                4 Sets
              </span>
              <span
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: 'var(--bg-navy-elevated)',
                  border: '1px solid var(--glass-border)',
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
                  color: 'var(--status-emerald)',
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
                  color: 'var(--text-primary)',
                  margin: '0 0 6px 0',
                }}
              >
                Project Goal
              </h2>
              <p
                style={{
                  fontSize: '14px',
                  color: 'var(--text-secondary)',
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
                background: 'var(--bg-navy-elevated)',
                border: '1px solid var(--glass-border)',
                marginBottom: '14px',
              }}
            >
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
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
                  color: 'var(--text-secondary)',
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
                  <strong style={{ color: 'var(--accent-cyan)' }}>individually</strong> if you prefer.
                </li>
              </ul>
            </div>
          </div>

          {/* Right: Quiz / Project Status Card & File Download Center */}
          <div
            className={styles.glassCard}
            style={{
              minWidth: '300px',
              flex: '1 1 300px',
              maxWidth: '380px',
              padding: '18px 20px',
              border: '1px solid rgba(245, 158, 11, 0.4)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px',
                paddingBottom: '10px',
                borderBottom: '1px solid var(--glass-border)',
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
                  color: '#10b981',
                }}
              >
                {evaluation.earnedScore} / {evaluation.maxScore} pts ({evaluation.percentage}%)
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '7px',
                fontSize: '13px',
                marginBottom: '14px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Number of attempts</span>
                <strong style={{ color: 'var(--text-primary)' }}>
                  {AUTOMATED_PROBLEM_SOLVER_PROJECT.attempts}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Duration</span>
                <strong style={{ color: 'var(--text-primary)' }}>
                  {AUTOMATED_PROBLEM_SOLVER_PROJECT.duration}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Passing Grade</span>
                <strong style={{ color: 'var(--accent-cyan)' }}>
                  {AUTOMATED_PROBLEM_SOLVER_PROJECT.passingGradePercent}% (175 / 250)
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Status</span>
                <strong style={{ color: 'var(--status-emerald)' }}>
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
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid rgba(251, 191, 36, 0.6)',
                background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
                color: '#fff',
                fontSize: '12.5px',
                fontWeight: 800,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '8px',
              }}
            >
              <Play size={14} />
              <span>TAKE QUIZ • ALL 4 SETS &amp; 11 ITEMS</span>
            </button>

            {/* Download PPT & Flowchart Files directly for LMS Upload */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              <button
                type="button"
                className={styles.primaryBtn}
                style={{ justifyContent: 'center', fontSize: '11px', padding: '7px 8px' }}
                onClick={handleDownloadPowerPointPpt}
              >
                <Download size={12} />
                <span>Download .PPT File</span>
              </button>

              <button
                type="button"
                className={styles.secondaryBtn}
                style={{ justifyContent: 'center', fontSize: '11px', padding: '7px 8px' }}
                onClick={handleDownloadAnimatedHtmlDeck}
              >
                <Presentation size={12} />
                <span>Animated Deck .HTML</span>
              </button>

              <button
                type="button"
                className={styles.secondaryBtn}
                style={{ justifyContent: 'center', fontSize: '11px', padding: '7px 8px' }}
                onClick={handleDownloadFlowchartSvg}
              >
                <GitBranch size={12} />
                <span>Flowchart .SVG (50pt)</span>
              </button>

              <button
                type="button"
                className={styles.secondaryBtn}
                style={{ justifyContent: 'center', fontSize: '11px', padding: '7px 8px' }}
                onClick={handleDownloadWorkflowSpecDoc}
              >
                <FileText size={12} />
                <span>Workflow .TXT (50pt)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. FULLY ANIMATED PPT PRESENTATION PLAYER (8 SLIDES • AUTO-PLAY • DOWNLOADABLE .PPT) */}
      <div className={styles.glassPanel} style={{ padding: '20px 24px' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            marginBottom: showAnimatedPptPlayer ? '16px' : '0',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: 'var(--accent-cyan)',
                textTransform: 'uppercase',
                letterSpacing: '0.07em',
              }}
            >
              FULLY ANIMATED PPT PRESENTATION SLIDES (SET 4 • 50 POINTS)
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: '2px 0 0' }}>
              Interactive Animated Slide Deck ({activeSlide.slideNumber} / 0{animatedSlides.length}: {activeSlide.title})
            </h2>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={prevPptSlide}
              aria-label="Previous Animated Slide"
              className={styles.secondaryBtn}
              style={{ fontSize: '12px', padding: '6px 11px' }}
            >
              <ChevronLeft size={14} />
              <span>Prev</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAutoPlayingPpt((prev) => !prev)}
              aria-label={isAutoPlayingPpt ? 'Pause Animated Slideshow' : 'Auto-Play Animated Slideshow'}
              className={isAutoPlayingPpt ? styles.orangeBtn : styles.primaryBtn}
              style={{ fontSize: '12px', padding: '6px 12px' }}
            >
              {isAutoPlayingPpt ? <Pause size={14} /> : <Play size={14} />}
              <span>{isAutoPlayingPpt ? 'Pause Auto-Play' : 'Auto-Play PPT'}</span>
            </button>

            <button
              type="button"
              onClick={nextPptSlide}
              aria-label="Next Animated Slide"
              className={styles.secondaryBtn}
              style={{ fontSize: '12px', padding: '6px 11px' }}
            >
              <span>Next</span>
              <ChevronRight size={14} />
            </button>

            <select
              aria-label="Select Slide Animation Style"
              value={pptAnimationStyle}
              onChange={(e) => {
                setPptAnimationStyle(e.target.value);
                setSlideAnimTick((t) => t + 1);
              }}
              className={styles.glassInput}
              style={{ fontSize: '11.5px', padding: '5px 8px', width: 'auto' }}
            >
              <option value="zoom-cascade">Animation: Zoom Cascade</option>
              <option value="flip-3d">Animation: 3D Flip Reveal</option>
            </select>

            <button
              type="button"
              onClick={handleDownloadPowerPointPpt}
              className={styles.primaryBtn}
              style={{ fontSize: '11.5px', padding: '6px 12px' }}
            >
              <Download size={13} />
              <span>Download .PPT File</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAnimatedPptPlayer((prev) => !prev)}
              className={styles.secondaryBtn}
              style={{ fontSize: '11.5px', padding: '6px 10px' }}
            >
              {showAnimatedPptPlayer ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
              <span>{showAnimatedPptPlayer ? 'Collapse Player' : 'Expand Player'}</span>
            </button>
          </div>
        </div>

        {showAnimatedPptPlayer && (
          <div>
            {/* Slide Pills Strip */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
              {animatedSlides.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setCurrentSlideIdx(idx);
                    setSlideAnimTick((t) => t + 1);
                  }}
                  className={idx === currentSlideIdx ? styles.primaryBtn : styles.secondaryBtn}
                  style={{ fontSize: '11px', padding: '4px 10px' }}
                >
                  <span>Slide {s.slideNumber}</span>
                </button>
              ))}
            </div>

            {/* Animated Slide Stage */}
            <div
              key={`${activeSlide.id}-${slideAnimTick}`}
              className={styles.glassCard}
              style={{
                padding: '22px 24px',
                border: `2px solid ${activeSlide.accentColor || '#38bdf8'}`,
                animation:
                  pptAnimationStyle === 'flip-3d'
                    ? 'depwPptFlipEnter 460ms cubic-bezier(0.16, 1, 0.3, 1) forwards'
                    : 'depwPptSlideEnter 420ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '10px',
                }}
              >
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: activeSlide.accentColor || 'var(--accent-cyan)',
                    letterSpacing: '0.06em',
                  }}
                >
                  SLIDE {activeSlide.slideNumber} OF 0{animatedSlides.length} • {activeSlide.badge}
                </span>
                <span
                  style={{
                    padding: '3px 10px',
                    borderRadius: '999px',
                    background: 'rgba(16, 185, 129, 0.18)',
                    color: '#34d399',
                    fontSize: '11px',
                    fontWeight: 800,
                  }}
                >
                  {activeSlide.pointsBadge}
                </span>
              </div>

              <h3
                style={{
                  fontSize: 'clamp(19px, 2.5vw, 24px)',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  margin: '0 0 6px 0',
                }}
              >
                {activeSlide.title}
              </h3>
              <p
                style={{
                  fontSize: '13.5px',
                  color: 'var(--text-secondary)',
                  margin: '0 0 16px 0',
                }}
              >
                {activeSlide.subtitle}
              </p>

              {/* Staggered Animated Cards Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '12px',
                  marginBottom: '14px',
                }}
              >
                {(activeSlide.animatedCards || []).map((card, cIdx) => (
                  <div
                    key={cIdx}
                    className={styles.glassCard}
                    style={{
                      padding: '14px 16px',
                      borderLeft: `4px solid ${activeSlide.accentColor || '#38bdf8'}`,
                      animation: `depwPptSlideEnter ${380 + cIdx * 90}ms cubic-bezier(0.16, 1, 0.3, 1) forwards`,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '10.5px',
                        fontWeight: 800,
                        color: 'var(--accent-cyan)',
                        marginBottom: '4px',
                      }}
                    >
                      <span>{card.stepLabel}</span>
                      <span>{card.metricBadge}</span>
                    </div>
                    <div
                      style={{
                        fontSize: '14px',
                        fontWeight: 800,
                        color: 'var(--text-primary)',
                        marginBottom: '6px',
                      }}
                    >
                      {card.heading}
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.5,
                        whiteSpace: 'pre-line',
                      }}
                    >
                      {card.body}
                    </div>
                  </div>
                ))}
              </div>

              {/* Presenter Speaker Notes Bar */}
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: 'var(--bg-navy-elevated)',
                  border: '1px solid var(--glass-border)',
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px',
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <strong style={{ color: 'var(--accent-cyan)' }}>Presenter Script: </strong>
                  {activeSlide.speakerNotes}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleCopyText(
                      `SLIDE-${activeSlide.slideNumber}`,
                      `${activeSlide.title}\n${activeSlide.subtitle}\n\n${(activeSlide.animatedCards || [])
                        .map((c) => `• ${c.heading}: ${c.body}`)
                        .join('\n')}\n\nSpeaker Notes: ${activeSlide.speakerNotes}`,
                      `Copied Slide ${activeSlide.slideNumber} content & notes!`
                    )
                  }
                  className={styles.secondaryBtn}
                  style={{ fontSize: '11px', padding: '4px 10px', flexShrink: 0 }}
                >
                  <Copy size={12} />
                  <span>Copy Slide Text</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. TEAM GROUPING CONFIGURATOR (INDIVIDUAL vs <= 4 MEMBERS vs > 4 MEMBERS DUAL WORKFLOW) */}
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
                color: 'var(--accent-cyan)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              GROUP SIZE &amp; WORKFLOW REQUIREMENT CALCULATOR
            </div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
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
      </div>

      {/* 4. 4 SETS / 11 ITEMS / 250 TOTAL SCORE INTERACTIVE WORKBOOK */}
      {quizActive && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Set Filter & Blank/Restore Action Bar */}
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

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleBlankAllAnswers}
                className={styles.secondaryBtn}
                style={{ fontSize: '11.5px', padding: '6px 11px' }}
              >
                <Eraser size={13} />
                <span>Blank All 11 Items</span>
              </button>

              <button
                type="button"
                onClick={handleResetDefaults}
                className={styles.primaryBtn}
                style={{ fontSize: '11.5px', padding: '6px 11px' }}
              >
                <RotateCcw size={13} />
                <span>Restore Verified Answers (250/250)</span>
              </button>
            </div>
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
                        color: 'var(--accent-cyan)',
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
                        color: 'var(--text-primary)',
                        margin: '2px 0',
                      }}
                    >
                      {setObj.title}
                    </h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                      {setObj.subtitle}
                    </p>
                  </div>

                  <span
                    style={{
                      padding: '5px 12px',
                      borderRadius: '999px',
                      background: 'rgba(16, 185, 129, 0.16)',
                      border: '1px solid rgba(16, 185, 129, 0.4)',
                      color: '#10b981',
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
                    const val1 =
                      workflow1Answers[item.itemId] !== undefined
                        ? workflow1Answers[item.itemId]
                        : item.workflow1Default;
                    const val2 =
                      workflow2Answers[item.itemId] !== undefined
                        ? workflow2Answers[item.itemId]
                        : item.workflow2Default;

                    return (
                      <div
                        key={item.itemId}
                        className={styles.glassCard}
                        style={{
                          padding: '16px 18px',
                          border: '1px solid var(--glass-border)',
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
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span
                              style={{
                                padding: '3px 9px',
                                borderRadius: '6px',
                                background: 'rgba(56, 189, 248, 0.18)',
                                color: 'var(--accent-cyan)',
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
                                color: 'var(--text-primary)',
                                margin: 0,
                              }}
                            >
                              {item.title}
                            </h4>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <span
                              style={{
                                fontSize: '11px',
                                fontWeight: 800,
                                color:
                                  resItem?.earnedPoints === item.maxPoints
                                    ? '#10b981'
                                    : '#f59e0b',
                              }}
                            >
                              {resItem?.earnedPoints ?? item.maxPoints} / {item.maxPoints} pts
                            </span>

                            {item.itemId === 'ITEM-4' && (
                              <button
                                type="button"
                                onClick={handleDownloadFlowchartSvg}
                                className={styles.primaryBtn}
                                style={{ padding: '4px 10px', fontSize: '11px' }}
                              >
                                <Download size={12} />
                                <span>Download Flowchart (.SVG)</span>
                              </button>
                            )}

                            {item.itemId === 'ITEM-5' && (
                              <button
                                type="button"
                                onClick={handleDownloadWorkflowSpecDoc}
                                className={styles.primaryBtn}
                                style={{ padding: '4px 10px', fontSize: '11px' }}
                              >
                                <Download size={12} />
                                <span>Download Workflow (.TXT)</span>
                              </button>
                            )}

                            <button
                              type="button"
                              className={styles.secondaryBtn}
                              style={{ padding: '4px 10px', fontSize: '11px' }}
                              onClick={() =>
                                handleCopyText(
                                  item.itemId,
                                  requiresTwoWorkflows
                                    ? `Workflow 1:\n${val1}\n\nWorkflow 2:\n${val2}`
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
                                {copiedId === item.itemId ? 'Copied!' : 'Copy Answer'}
                              </span>
                            </button>
                          </div>
                        </div>

                        <p
                          style={{
                            fontSize: '12.5px',
                            color: 'var(--text-secondary)',
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
                              color: 'var(--accent-cyan)',
                              marginBottom: '4px',
                            }}
                          >
                            Workflow 1 — Barangay Declogging Smart Tracker &amp; GIS Automation:
                          </label>
                          <textarea
                            id={`wf1-${item.itemId}`}
                            rows={item.setNumber === 3 ? 6 : 4}
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
