import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Presentation,
  Table2,
  Map,
  Box,
  Sparkles,
  FlaskConical,
  BarChart3,
  Menu,
  X,
  LogIn,
  LogOut,
  GitBranch,
  HelpCircle,
  Sliders,
  Search,
  Navigation,
  RotateCcw,
  FileText,
  Layers,
  Droplets,
} from 'lucide-react';
import styles from './styles/GlassSystem.module.css';
import PresentationDeck from './components/PresentationDeck.jsx';
import CommandCenterView from './components/CommandCenterView.jsx';
import SmartTrackerView from './components/SmartTrackerView.jsx';
import InteractiveFlowchartView from './components/InteractiveFlowchartView.jsx';
import TutorialManager from './components/TutorialManager.jsx';
import AccessibilitySettingsModal from './components/AccessibilitySettingsModal.jsx';
import GlobalCommandPalette from './components/GlobalCommandPalette.jsx';
import MobileFieldInspectionModal from './components/MobileFieldInspectionModal.jsx';
import RequestJourneyReplay from './components/RequestJourneyReplay.jsx';
import ManilaSkylineOutline from './components/ManilaSkylineOutline.jsx';
import StreetMapView from './components/StreetMapView.jsx';
import Drainage3DView from './components/Drainage3DView.jsx';
import AiLiaisonHubView from './components/AiLiaisonHubView.jsx';
import BioscienceLabView from './components/BioscienceLabView.jsx';
import WaterQualityZoneLogger from './components/WaterQualityZoneLogger.jsx';
import ThemeSwitcher from './components/ThemeSwitcher.jsx';
import UserProfileTopBar from './components/UserProfileTopBar.jsx';
import { DEPW_OFFICER_PROFILES } from './utils/workflowRules.js';
import { api } from './services/api.js';
import { initAuth, googleSignIn, logout } from './services/firebaseClient.js';

export default function App({ initialRouteTab = 'command' }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(initialRouteTab || 'command');
  const [simpleNavMode, setSimpleNavMode] = useState(() => {
    try {
      const saved = localStorage.getItem('depw_simple_nav');
      return saved === null ? true : saved === 'true';
    } catch {
      return true;
    }
  });
  const [userProfile, setUserProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('depw_user_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.fullName && parsed.badgeId) {
          return parsed;
        }
      }
    } catch {
      // ignore storage errors
    }
    return DEPW_OFFICER_PROFILES[0];
  });

  const [themeId, setThemeId] = useState(() => {
    try {
      return (
        localStorage.getItem('depw_theme_id') ||
        localStorage.getItem('theme') ||
        'navy-glass'
      );
    } catch {
      return 'navy-glass';
    }
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [fieldInspectionOpen, setFieldInspectionOpen] = useState(false);
  const [journeyReplayTicketId, setJourneyReplayTicketId] = useState(null);
  const [reducedMotion, setReducedMotion] = useState(() => {
    try {
      return localStorage.getItem('depw_reduced_motion') === 'true';
    } catch {
      return false;
    }
  });
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [easyMode, setEasyMode] = useState(() => {
    try {
      return localStorage.getItem('depw_easy_mode') === 'true';
    } catch {
      return false;
    }
  });
  const [textScale, setTextScale] = useState(() => {
    try {
      return localStorage.getItem('depw_text_scale') || 'normal';
    } catch {
      return 'normal';
    }
  });
  const [highContrast, setHighContrast] = useState(() => {
    try {
      return localStorage.getItem('depw_high_contrast') === 'true';
    } catch {
      return false;
    }
  });

  const [tickets, setTickets] = useState([]);
  const [assets, setAssets] = useState([]);
  const [metricsData, setMetricsData] = useState(null);

  const [selectedMapTicket, setSelectedMapTicket] = useState(null);
  const [focusedTrackerTicketId, setFocusedTrackerTicketId] = useState('DEO-2026-001');
  const [initialInspectorTab, setInitialInspectorTab] = useState('overview');
  const [initialOpenCreate, setInitialOpenCreate] = useState(false);
  const [trackerStatusFilter, setTrackerStatusFilter] = useState('ALL');

  const [user, setUser] = useState(null);
  const [toast, setToast] = useState(null);

  // Sync route pathname changes with activeTab
  useEffect(() => {
    const path = location?.pathname?.replace('/', '') || '';
    const validTabs = [
      'command',
      'tracker',
      'flowchart',
      'waterlog',
      'presentation',
      'map',
      '3d',
      'ai',
      'bioscience',
    ];
    if (validTabs.includes(path) && path !== activeTab) {
      setActiveTab(path);
    }
  }, [location?.pathname]);

  useEffect(() => {
    try {
      localStorage.setItem('depw_theme_id', themeId);
      localStorage.setItem('theme', themeId);
    } catch {
      // ignore storage errors
    }
    document.documentElement.setAttribute('data-theme', themeId);
    if (document.body) {
      document.body.setAttribute('data-theme', themeId);
    }
  }, [themeId]);

  useEffect(() => {
    try {
      localStorage.setItem('depw_simple_nav', String(simpleNavMode));
    } catch {
      // ignore
    }
  }, [simpleNavMode]);

  const handleUpdateUserProfile = useCallback((nextProfile) => {
    setUserProfile(nextProfile);
    try {
      localStorage.setItem('depw_user_profile', JSON.stringify(nextProfile));
    } catch {
      // ignore storage errors
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('depw_easy_mode', String(easyMode));
    } catch {
      // ignore
    }
    if (easyMode) {
      document.body.classList.add('easy-mode');
    } else {
      document.body.classList.remove('easy-mode');
    }
  }, [easyMode]);

  useEffect(() => {
    try {
      localStorage.setItem('depw_text_scale', textScale);
    } catch {
      // ignore
    }
    document.documentElement.setAttribute('data-text-scale', textScale);
  }, [textScale]);

  useEffect(() => {
    try {
      localStorage.setItem('depw_high_contrast', String(highContrast));
    } catch {
      // ignore
    }
    if (highContrast) {
      document.documentElement.setAttribute('data-contrast', 'high');
    } else {
      document.documentElement.removeAttribute('data-contrast');
    }
  }, [highContrast]);

  useEffect(() => {
    try {
      localStorage.setItem('depw_reduced_motion', String(reducedMotion));
    } catch {
      // ignore
    }
    if (reducedMotion) {
      document.documentElement.setAttribute('data-reduced-motion', 'true');
    } else {
      document.documentElement.removeAttribute('data-reduced-motion');
    }
  }, [reducedMotion]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleResetAccessibilityDefaults = () => {
    setThemeId('navy-glass');
    setTextScale('normal');
    setHighContrast(false);
    setReducedMotion(false);
    setEasyMode(false);
    showToast('Reset all accessibility and appearance preferences to defaults.', 'info');
  };

  const handleSaveInspectionReport = (report) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.ticketId === report.ticketId) {
          const updatedHistory = [
            ...(t.statusHistory || []),
            {
              status: 'INSPECTION',
              date: new Date().toISOString().split('T')[0],
              note: `Field inspection logged by ${report.inspectorName}. Silt depth: ${report.siltDepthCm}cm. ${report.notes || ''}`,
              actor: report.inspectorName,
            },
          ];
          return {
            ...t,
            siltDepthCm: report.siltDepthCm,
            gasReadingPpm: report.gasReadingPpm,
            inspectorWitness: report.kagawadWitness,
            statusHistory: updatedHistory,
            inspectionPhoto: report.photoPreview || t.inspectionPhoto,
            coordinates: report.gpsCoords || t.coordinates,
          };
        }
        return t;
      })
    );
    showToast(`Field Inspection Report logged for ${report.ticketId}.`, 'success');
  };

  const handleCompleteTutorial = useCallback(() => {
    try {
      localStorage.setItem('tutorialCompleted', 'true');
      localStorage.setItem('depw_tutorial_completed', 'true');
    } catch {
      // ignore
    }
    setTutorialOpen(false);
  }, []);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  }, []);

  const fetchAllData = useCallback(async () => {
    try {
      const [ticketsRes, opsRes, metricsRes] = await Promise.all([
        api.getTickets(),
        api.getOperationsData(),
        api.getMetrics(),
      ]);
      const ticketList = Array.isArray(ticketsRes) ? ticketsRes : ticketsRes.tickets || [];
      setTickets(ticketList);
      setAssets(opsRes?.assets || []);
      setMetricsData(metricsRes || null);
    } catch (err) {
      showToast(`Notice loading backend records: ${err.message}`, 'error');
    }
  }, [showToast]);

  useEffect(() => {
    fetchAllData();
    const unsub = initAuth(
      (signedInUser) => setUser(signedInUser),
      () => setUser(null)
    );
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, [fetchAllData]);

  const handleSignIn = async () => {
    try {
      const { user: u } = await googleSignIn();
      setUser(u);
      showToast(`Signed in as ${u.displayName || u.email}`, 'success');
    } catch (err) {
      showToast(`Sign-in notice: ${err.message}`, 'info');
    }
  };

  const handleSignOut = async () => {
    await logout();
    setUser(null);
    showToast('Signed out of Google Workspace session.', 'info');
  };

  const allNavItems = [
    { id: 'command', label: '1. Main Dashboard', icon: BarChart3, essential: true },
    { id: 'tracker', label: '2. Request Tracker', icon: Table2, essential: true },
    { id: 'flowchart', label: '3. 8-Step Flowchart', icon: GitBranch, essential: true },
    { id: 'map', label: '4. Street Map GIS', icon: Map, essential: true },
    { id: 'waterlog', label: '5. Water Quality Log', icon: Droplets, essential: true },
    { id: 'presentation', label: '01–08 Presentation Deck', icon: Presentation, essential: false },
    { id: '3d', label: '3D Culvert & Truck Twin', icon: Box, essential: false },
    { id: 'ai', label: 'AI & Gmail Liaison Hub', icon: Sparkles, essential: false },
    { id: 'bioscience', label: 'Water & Bioscience Lab', icon: FlaskConical, essential: false },
  ];

  const visibleNavItems = simpleNavMode
    ? allNavItems.filter((item) => item.essential || item.id === activeTab)
    : allNavItems;

  const handleSelectNavTab = (tabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    try {
      navigate(tabId === 'command' ? '/' : `/${tabId}`);
    } catch {
      // ignore if outside router context
    }
  };

  return (
    <div className={styles.appShell} data-theme={themeId}>
      {/* Ambient Background Glows */}
      <div className={styles.ambientGlowTop} />
      <div className={styles.ambientGlowBottom} />

      {/* Official City of Manila Architectural Skyline Header Strip (Outline only, conforms to active theme) */}
      <div style={{ width: '100%', borderBottom: '1px solid var(--glass-border)', background: 'transparent' }}>
        <ManilaSkylineOutline height={32} opacity={0.92} glow={true} showSeal={true} />
      </div>

      {/* Dedicated Top Bar with Active User Profile Information & Switcher */}
      <UserProfileTopBar
        userProfile={userProfile}
        onUpdateProfile={handleUpdateUserProfile}
        firebaseUser={user}
        showToast={showToast}
      />

      {/* Persistent Command Center Top Bar */}
      <header className={styles.topCommandHeader}>
        <div className={styles.brandCluster}>
          <div className={styles.sealGroup}>
            <img
              src="./assets/aistudio/image_5aec6efb.png"
              alt="City of Manila Official Seal"
              className={styles.headerSealImg}
              onError={(e) => {
                if (!e.currentTarget.dataset.retried) {
                  e.currentTarget.dataset.retried = '1';
                  e.currentTarget.src = './public/assets/aistudio/image_5aec6efb.png';
                }
              }}
            />
            <img
              src="./assets/aistudio/image_81ca72a0.png"
              alt="Department of Engineering and Public Works Seal"
              className={styles.headerSealImg}
              onError={(e) => {
                if (!e.currentTarget.dataset.retried) {
                  e.currentTarget.dataset.retried = '1';
                  e.currentTarget.src = './public/assets/aistudio/image_81ca72a0.png';
                }
              }}
            />
            <img
              src="./assets/aistudio/image_79da53c5.png"
              alt="Philippine Transparency Seal"
              className={styles.headerSealImg}
              onError={(e) => {
                if (!e.currentTarget.dataset.retried) {
                  e.currentTarget.dataset.retried = '1';
                  e.currentTarget.src = './public/assets/aistudio/image_79da53c5.png';
                }
              }}
            />
          </div>
          <div>
            <div className={styles.departmentEyebrow}>
              DEPARTMENT OF ENGINEERING OFFICE • CITY OF MANILA (DEPW)
            </div>
            <div className={styles.brandTitleRow}>
              <span className={styles.brandMainTitle}>
                Handling of Barangay Declogging Requests
              </span>
              <span className={styles.verifiedSystemBadge}>
                MANILA DEPW OPERATIONS
              </span>
            </div>
          </div>
        </div>

        {/* Right Actions: Tutorial + Journey Replay + Settings + ThemeSwitcher + Auth */}
        <div className={styles.headerRightActions}>

          {/* Step-by-Step Guide / Replay Tutorial Modal Button */}
          <button
            type="button"
            onClick={() => setTutorialOpen(true)}
            className={styles.secondaryBtn}
            style={{ padding: '7px 11px', fontSize: '12px' }}
            title="Interactive Step-by-Step Tutorial / Gabay sa Paggamit"
          >
            <HelpCircle size={14} className="text-cyan-400" />
            <span>Tutorial</span>
          </button>

          {/* Request Journey Replay Tool */}
          <button
            type="button"
            onClick={() => setJourneyReplayTicketId(focusedTrackerTicketId || tickets[0]?.ticketId || 'DEO-2026-001')}
            className={styles.secondaryBtn}
            style={{ padding: '7px 11px', fontSize: '12px' }}
            title="Request Journey Replay (Chronological Milestone Audit)"
          >
            <RotateCcw size={14} className="text-cyan-400" />
            <span className="hidden sm:inline">Journey Replay</span>
          </button>

          {/* Quick Search & Jump (Cmd+K) */}
          <button
            type="button"
            onClick={() => setCommandPaletteOpen(true)}
            className={styles.secondaryBtn}
            style={{ padding: '7px 11px', fontSize: '12px' }}
            title="Global Command Palette (Ctrl+K / Cmd+K)"
          >
            <Search size={14} className="text-cyan-400" />
            <span className="hidden xl:inline">Search</span>
          </button>

          {/* Accessibility & Visual Settings Modal Trigger */}
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className={styles.secondaryBtn}
            style={{ padding: '7px 11px', fontSize: '12px' }}
            title="Accessibility & Theme Settings / Mga Setting ng Hitsura at Text"
          >
            <Sliders size={14} className="text-amber-400" />
            <span className="hidden sm:inline">Settings</span>
          </button>

          {/* Dedicated Theme Switcher (Navy Glass / Daylight Civic + 7 CSS data-themes persisted in localStorage) */}
          <ThemeSwitcher
            themeId={themeId}
            onThemeChange={(nextId) => setThemeId(nextId)}
            showToast={showToast}
          />

          {user ? (
            <button
              type="button"
              className={styles.secondaryBtn}
              style={{ padding: '7px 12px', fontSize: '12px' }}
              onClick={handleSignOut}
              title={`Signed in as ${user.email}`}
            >
              <LogOut size={14} />
              <span>{user.displayName?.split(' ')[0] || 'Sign Out'}</span>
            </button>
          ) : (
            <button
              type="button"
              className={styles.primaryBtn}
              style={{ padding: '7px 12px', fontSize: '12px' }}
              onClick={handleSignIn}
            >
              <LogIn size={14} />
              <span>Sign In</span>
            </button>
          )}

          {/* Mobile Hamburger Menu Button */}
          <button
            type="button"
            aria-label="Toggle Mobile Navigation Menu"
            aria-expanded={mobileMenuOpen}
            className={`${styles.secondaryBtn} ${styles.mobileMenuBtn}`}
            style={{ padding: '7px 10px' }}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
          >
            {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>

        {/* Workspace Navigation Tabs (Desktop Strip + Mobile Drawer) */}
        <nav
          className={`${styles.mainNavStrip} ${mobileMenuOpen ? styles.mainNavStripOpen : ''}`}
          aria-label="Primary Workspace Navigation"
        >
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`${styles.navTabBtn} ${isActive ? styles.navTabBtnActive : ''}`}
                onClick={() => handleSelectNavTab(item.id)}
              >
                <Icon size={15} />
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Toggle between Simple 4-Tab View and Full 8-Tool Engineering View */}
          <button
            type="button"
            onClick={() => {
              setSimpleNavMode((prev) => {
                const next = !prev;
                showToast(
                  next
                    ? 'Simple View activated: Showing the 4 essential tabs.'
                    : 'Full Engineering View activated: Showing all 8 tools.',
                  'info'
                );
                return next;
              });
            }}
            className={styles.navTabBtn}
            style={{
              marginLeft: 'auto',
              borderStyle: 'dashed',
              opacity: 0.92,
            }}
            title="Toggle between Simple 4-Tab Menu and Full 8-Tab Engineering Menu"
          >
            <Layers size={14} />
            <span>
              {simpleNavMode ? 'Show All 8 Tools (+4)' : 'Simple View (4 Tabs)'}
            </span>
          </button>
        </nav>
      </header>

      {/* Non-intrusive Toast Notification */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '22px',
            right: '22px',
            zIndex: 9999,
            padding: '12px 18px',
            borderRadius: '12px',
            background:
              toast.type === 'error'
                ? 'rgba(153, 27, 27, 0.94)'
                : 'rgba(15, 23, 42, 0.94)',
            border: '1px solid rgba(56, 189, 248, 0.45)',
            color: '#f8fafc',
            fontSize: '13px',
            fontWeight: 600,
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {toast.message}
        </div>
      )}

      {/* Main Content Container */}
      <main className={styles.mainViewport}>
        {activeTab === 'command' && (
          <CommandCenterView
            tickets={tickets}
            metricsData={metricsData}
            onRefreshData={fetchAllData}
            onOpenTicketAudit={(ticketId) => {
              setFocusedTrackerTicketId(ticketId);
              setInitialInspectorTab('audit');
              handleSelectNavTab('tracker');
            }}
            onOpenSmartTracker={() => handleSelectNavTab('tracker')}
            onOpenJourneyReplay={(ticketId) => {
              setJourneyReplayTicketId(ticketId || focusedTrackerTicketId);
            }}
            onOpenTutorial={() => setTutorialOpen(true)}
            onNavigateTab={(tab) => handleSelectNavTab(tab)}
            showToast={showToast}
          />
        )}

        {activeTab === 'flowchart' && (
          <InteractiveFlowchartView
            tickets={tickets}
            onNavigateToTracker={(status) => {
              setTrackerStatusFilter(status);
              handleSelectNavTab('tracker');
            }}
            showToast={showToast}
          />
        )}

        {activeTab === 'presentation' && (
          <PresentationDeck
            tickets={tickets}
            onOpenSmartTracker={() => handleSelectNavTab('tracker')}
            onSelectTicketForMap={(ticket) => {
              setSelectedMapTicket(ticket);
              handleSelectNavTab('map');
            }}
            onOpenCreateModal={() => {
              setInitialOpenCreate(true);
              handleSelectNavTab('tracker');
            }}
          />
        )}

        {activeTab === 'tracker' && (
          <SmartTrackerView
            tickets={tickets}
            onRefreshTickets={fetchAllData}
            onSelectTicketForMap={(ticket) => {
              setSelectedMapTicket(ticket);
              handleSelectNavTab('map');
            }}
            onOpenLetterStudioWithTicket={() => {
              handleSelectNavTab('ai');
            }}
            onOpenJourneyReplay={(ticketId) => {
              setJourneyReplayTicketId(ticketId || focusedTrackerTicketId);
            }}
            initialOpenCreate={initialOpenCreate}
            onCloseInitialCreate={() => setInitialOpenCreate(false)}
            focusedTicketId={focusedTrackerTicketId}
            initialInspectorTab={initialInspectorTab}
            initialStatusFilter={trackerStatusFilter}
          />
        )}

        {activeTab === 'map' && (
          <StreetMapView
            tickets={tickets}
            assets={assets}
            selectedMapTicket={selectedMapTicket}
            onSelectTicketOnTracker={(ticket) => {
              if (ticket?.ticketId) {
                setFocusedTrackerTicketId(ticket.ticketId);
              }
              handleSelectNavTab('tracker');
            }}
            onUseCoordinatesForNewTicket={() => {
              setInitialOpenCreate(true);
              handleSelectNavTab('tracker');
            }}
            showToast={showToast}
          />
        )}

        {activeTab === '3d' && <Drainage3DView tickets={tickets} />}

        {activeTab === 'ai' && (
          <AiLiaisonHubView
            tickets={tickets}
            user={user}
            onUserChange={setUser}
            showToast={showToast}
          />
        )}

        {activeTab === 'bioscience' && <BioscienceLabView showToast={showToast} />}

        {activeTab === 'waterlog' && <WaterQualityZoneLogger showToast={showToast} />}
      </main>

      {/* Full-screen Glassmorphism TutorialManager Overlay */}
      <TutorialManager
        isOpen={tutorialOpen}
        onClose={() => setTutorialOpen(false)}
        showToast={showToast}
        onThemeChange={(tId) => setThemeId(tId)}
        onTextScaleToggle={() => {
          setTextScale((prev) => {
            const next = prev === 'large' ? 'normal' : 'large';
            showToast(next === 'large' ? 'Large Text Mode activated (115% scaling).' : 'Standard Text Mode activated.', 'info');
            return next;
          });
        }}
        onHighContrastToggle={() => {
          setHighContrast((prev) => {
            const next = !prev;
            showToast(next ? 'High Contrast Mode activated.' : 'Standard Contrast activated.', 'info');
            return next;
          });
        }}
        onEasyModeToggle={() => {
          setEasyMode((prev) => {
            const next = !prev;
            showToast(next ? 'Easy Mode activated.' : 'Standard Mode activated.', 'info');
            return next;
          });
        }}
        currentTheme={themeId}
        isLargeText={textScale === 'large'}
        isHighContrast={highContrast}
        isEasyMode={easyMode}
      />

      {/* Comprehensive Accessibility & Theme Settings Modal */}
      <AccessibilitySettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        currentTheme={themeId}
        onThemeChange={(tId) => setThemeId(tId)}
        textScale={textScale}
        onTextScaleChange={(scale) => setTextScale(scale)}
        highContrast={highContrast}
        onHighContrastToggle={() => setHighContrast((prev) => !prev)}
        reducedMotion={reducedMotion}
        onReducedMotionToggle={() => setReducedMotion((prev) => !prev)}
        easyMode={easyMode}
        onEasyModeToggle={() => setEasyMode((prev) => !prev)}
        onResetDefaults={handleResetAccessibilityDefaults}
        showToast={showToast}
      />

      {/* Global Command Palette (Cmd+K / Ctrl+K) */}
      <GlobalCommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        tickets={tickets}
        onNavigateTab={(tab) => handleSelectNavTab(tab)}
        onSelectTicket={(ticket) => {
          if (ticket?.ticketId) {
            setFocusedTrackerTicketId(ticket.ticketId);
          }
          handleSelectNavTab('tracker');
        }}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenTutorial={() => setTutorialOpen(true)}
        onOpenJourneyReplay={() => {
          setCommandPaletteOpen(false);
          setJourneyReplayTicketId(focusedTrackerTicketId || tickets[0]?.ticketId || 'DEO-2026-001');
        }}
      />

      {/* Mobile Field Inspection Tool (Location checklist, silt depth, H2S PPM, GPS, photo) */}
      <MobileFieldInspectionModal
        isOpen={fieldInspectionOpen}
        onClose={() => setFieldInspectionOpen(false)}
        tickets={tickets}
        onSaveInspectionReport={handleSaveInspectionReport}
        showToast={showToast}
      />

      {/* Request Journey Replay Modal (Chronological Milestone Timeline) */}
      {journeyReplayTicketId && (
        <RequestJourneyReplay
          isOpen={Boolean(journeyReplayTicketId)}
          onClose={() => setJourneyReplayTicketId(null)}
          initialTicketId={journeyReplayTicketId}
          tickets={tickets}
          showToast={showToast}
        />
      )}

      {/* Mobile Fixed Bottom Navigation Bar (Thumb Friendly) */}
      <nav className={styles.mobileBottomNav} aria-label="Mobile Navigation Bar">
        <button
          type="button"
          onClick={() => handleSelectNavTab('command')}
          className={`${styles.bottomNavBtn} ${activeTab === 'command' ? styles.bottomNavBtnActive : ''}`}
        >
          <BarChart3 size={18} />
          <span>Command</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setTrackerStatusFilter('ALL');
            handleSelectNavTab('tracker');
          }}
          className={`${styles.bottomNavBtn} ${activeTab === 'tracker' ? styles.bottomNavBtnActive : ''}`}
        >
          <Table2 size={18} />
          <span>Tracker</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectNavTab('waterlog')}
          className={`${styles.bottomNavBtn} ${activeTab === 'waterlog' ? styles.bottomNavBtnActive : ''}`}
        >
          <Droplets size={18} />
          <span>Water Log</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectNavTab('flowchart')}
          className={`${styles.bottomNavBtn} ${activeTab === 'flowchart' ? styles.bottomNavBtnActive : ''}`}
        >
          <GitBranch size={18} />
          <span>Flowchart</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className={`${styles.bottomNavBtn} ${mobileMenuOpen ? styles.bottomNavBtnActive : ''}`}
        >
          <Menu size={18} />
          <span>More</span>
        </button>
      </nav>
    </div>
  );
}
