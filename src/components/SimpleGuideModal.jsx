import React from 'react';
import {
  FileText,
  Download,
  Copy,
  X,
  HelpCircle,
  GitBranch,
  Sun,
  Moon,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import styles from '../styles/GlassSystem.module.css';

export const TITA_NERRY_GUIDE_TEXT = `================================================================================
   MABUHAY, TITA NERRY! 🇵🇭
   SIMPLE STEP-BY-STEP GUIDE SA PAGGAMIT NG MANILA DEPW ASSIST
   (Department of Engineering and Public Works - Barangay Declogging System)
================================================================================

Hello po, Tita Nerry! Ginawa po naming mas simple, malinaw, at madaling gamitin
ang website na ito para hindi po nakakalito. Narito po ang maikling gabay kung
paano gamitin ang bawat bahagi:

--------------------------------------------------------------------------------
1. PAANO PALITAN ANG KULAY NG SCREEN (THEME SWITCHER: DARK O MALIWANAG)
--------------------------------------------------------------------------------
- Sa bandang itaas (kanang bahagi ng screen), makikita po ninyo ang button na
  "Navy Dark / Daylight" at ang Theme Switcher dropdown.
- Pindutin lamang po ito kung gusto ninyo ng MALIWANAG na screen ("daylight-civic")
  para mas madaling basahin sa araw, o MADILIM na asul ("navy-glass") para hindi
  masakit sa mata.
- Kusa po itong nase-save sa inyong computer o cellphone (localStorage) kaya
  kahit i-refresh ninyo ang page, mananatili ang paborito ninyong kulay!

--------------------------------------------------------------------------------
2. PAANO GAWING MAS SIMPLE ANG MGA BUTTONS (SIMPLE MODE)
--------------------------------------------------------------------------------
- Sa itaas ng pahina, may button na "Simple View: ON / Show All Tools".
- Kapag naka-ON ang Simple View, ang makikita lang po ninyo ay ang 4 na
  pinakamahalagang pahina:
  (1) Command Center (Main Dashboard)
  (2) Request Tracker (Listahan ng mga Barangay Request)
  (3) 8-Step Flowchart (Daloy ng Proseso)
  (4) Street Map GIS (Mapa ng Maynila)
- Kung gusto po ninyong buksan ang iba pang tools (tulad ng 3D View, Slides,
  AI Letter Maker, at Water Lab), pindutin lang po ang "All 8 Tools".

--------------------------------------------------------------------------------
3. PAANO GAMITIN ANG TUTORIAL (STEP-BY-STEP GABAY)
--------------------------------------------------------------------------------
- Pindutin ang button na "Tutorial" sa itaas ng screen o ang
  "Magsimula sa Gabay (Tour)" sa gitna ng Main Dashboard.
- Ipapakita po nito nang paisa-isa (Step 1 hanggang Step 12) kung paano
  gumagana ang sistema sa Tagalog at English.

--------------------------------------------------------------------------------
4. PAANO TINGNAN ANG 8-STEP FLOWCHART (DALOY NG PROSESO)
--------------------------------------------------------------------------------
- Pindutin ang tab na "8-Step Flowchart" sa menu.
- Makikita po ninyo rito ang 8 opisyal na hakbang mula sa simula hanggang matapos:
  * Hakbang 1: Pagkatanggap ng Liham mula sa Barangay (Letter Intake)
  * Hakbang 2: Pagsusuri kung Kumpleto ang Detalye (For Verification)
  * Hakbang 3: Pag-evaluate ng Engineering Office (Pending Evaluation)
  * Hakbang 4: Pag-schedule ng Inspeksyon sa Lugar (Inspection Scheduled)
  * Hakbang 5: Pag-apruba at Paghahanda ng Vactor Truck (Approved for Dispatch)
  * Hakbang 6: Aktuwal na Paglilinis / Declogging sa Kanal (In Progress)
  * Hakbang 7: Pagsusuri ng Supervisor kung Malinis Na (Completed)
  * Hakbang 8: Pagsasara ng Ticket at Pag-archive ng Rekord (Closed)

--------------------------------------------------------------------------------
5. PAANO MAG-CHECK O MAGDAGDAG NG BARANGAY REQUEST (REQUEST TRACKER)
--------------------------------------------------------------------------------
- Pindutin ang tab na "Request Tracker".
- Para MAGHANAP: I-type lang ang pangalan ng Barangay, Kalye, o Ticket Number
  (halimbawa: "Tondo" o "DEO-2026-001") sa Search Box.
- Para MAGDAGDAG NG BAGO: Pindutin ang "+ New Barangay Request", ilagay ang
  Barangay, Kalye, at Pangalan ng nag-request, at pindutin ang "Save".
- Para MAKITA ANG BUONG KWENTO NG TICKET: Pindutin ang "Journey Replay" para
  mapanood ang timeline kung kailan natanggap at ano na ang ginawa ng DEPW.

--------------------------------------------------------------------------------
6. PAANO PALAKIHIN ANG MGA LETRA (LARGE TEXT & HIGH CONTRAST)
--------------------------------------------------------------------------------
- Kung maliit po ang sulat sa screen, pindutin ang "Settings" sa itaas at
  piliin ang "Large (115%)" o "Extra Large (125%)".
================================================================================`;

export default function SimpleGuideModal({
  isOpen,
  onClose,
  onOpenTutorial,
  onOpenFlowchart,
  onToggleTheme,
  currentTheme,
  simpleNavMode,
  onToggleSimpleNav,
  showToast,
}) {
  if (!isOpen) return null;

  const handleDownloadTxt = () => {
    const blob = new Blob([TITA_NERRY_GUIDE_TEXT], {
      type: 'text/plain;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'HOW_TO_USE_FOR_TITA_NERRY.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    if (showToast) {
      showToast('Na-download na po ang HOW_TO_USE_FOR_TITA_NERRY.txt!', 'success');
    }
  };

  const handleCopyTxt = async () => {
    try {
      await navigator.clipboard.writeText(TITA_NERRY_GUIDE_TEXT);
      if (showToast) {
        showToast('Nakopya na po ang gabay para kay Tita Nerry!', 'success');
      }
    } catch {
      if (showToast) {
        showToast('Pindutin ang Download .TXT para ma-save ang gabay.', 'info');
      }
    }
  };

  const quickSteps = [
    {
      num: '1',
      title: 'Palitan ang Kulay (Maliwanag o Madilim)',
      desc: 'Gamitin ang Theme Switcher sa itaas para pumili ng Daylight Civic (maliwanag) o Navy Glass (madilim). Kusa itong nase-save!',
      actionLabel:
        currentTheme === 'daylight-civic'
          ? 'Lumipat sa Navy Glass (🌙)'
          : 'Lumipat sa Daylight Civic (☀️)',
      onAction: () =>
        onToggleTheme(
          currentTheme === 'daylight-civic' ? 'navy-glass' : 'daylight-civic'
        ),
    },
    {
      num: '2',
      title: 'Buksan ang 8-Step Flowchart',
      desc: 'Tingnan ang malinaw na diagram mula sa pagtanggap ng sulat ng Barangay hanggang sa paglilinis ng kanal.',
      actionLabel: 'Buksan ang Flowchart',
      onAction: () => {
        onClose();
        onOpenFlowchart();
      },
    },
    {
      num: '3',
      title: 'Panoorin ang Step-by-Step Tutorial',
      desc: 'May 12 maiikling hakbang na may paliwanag sa Tagalog at English.',
      actionLabel: 'Simulan ang Tutorial',
      onAction: () => {
        onClose();
        onOpenTutorial();
      },
    },
    {
      num: '4',
      title: 'Panatilihing Simple ang Menu',
      desc: 'Itago ang mga kumplikadong engineering tools para 4 na pangunahing tab lang ang makikita.',
      actionLabel: simpleNavMode
        ? 'Naka-Simple View Na (4 Tabs)'
        : 'I-ON ang Simple View',
      onAction: () => {
        if (!simpleNavMode && onToggleSimpleNav) {
          onToggleSimpleNav();
        }
      },
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tita-nerry-guide-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9600,
        background: 'rgba(2, 6, 23, 0.82)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        className={styles.glassPanel}
        style={{
          width: '100%',
          maxWidth: '860px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid var(--glass-border)',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '18px 22px',
            borderBottom: '1px solid var(--glass-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'rgba(56, 189, 248, 0.18)',
                border: '1px solid var(--glass-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-cyan)',
              }}
            >
              <FileText size={22} />
            </div>
            <div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.07em',
                  color: 'var(--accent-cyan)',
                  textTransform: 'uppercase',
                }}
              >
                HOW_TO_USE_FOR_TITA_NERRY.TXT • SIMPLE USER MANUAL
              </span>
              <h2
                id="tita-nerry-guide-title"
                style={{
                  margin: 0,
                  fontSize: '19px',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                }}
              >
                Gabay para kay Tita Nerry: Paano Gamitin ang DEPW Assist
              </h2>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={handleDownloadTxt}
              className={styles.primaryBtn}
              style={{ padding: '8px 14px', fontSize: '12px' }}
            >
              <Download size={14} />
              <span>Download .TXT File</span>
            </button>
            <button
              type="button"
              onClick={handleCopyTxt}
              className={styles.secondaryBtn}
              style={{ padding: '8px 12px', fontSize: '12px' }}
            >
              <Copy size={14} />
              <span>Copy</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Tita Nerry Guide"
              className={styles.secondaryBtn}
              style={{ padding: '8px' }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div
          style={{
            padding: '20px 22px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
          }}
        >
          {/* 4 Simple Visual Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '12px',
            }}
          >
            {quickSteps.map((step) => (
              <div
                key={step.num}
                style={{
                  padding: '14px',
                  borderRadius: '12px',
                  background: 'var(--bg-navy-elevated)',
                  border: '1px solid var(--glass-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '10px',
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '11px',
                      fontWeight: 800,
                      color: 'var(--accent-cyan)',
                      marginBottom: '4px',
                    }}
                  >
                    <CheckCircle2 size={13} />
                    <span>HAKBANG {step.num}</span>
                  </div>
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      marginBottom: '4px',
                    }}
                  >
                    {step.title}
                  </div>
                  <p
                    style={{
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                      margin: 0,
                      lineHeight: 1.5,
                    }}
                  >
                    {step.desc}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={step.onAction}
                  className={styles.secondaryBtn}
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    padding: '7px 10px',
                    fontSize: '12px',
                  }}
                >
                  <span>{step.actionLabel}</span>
                </button>
              </div>
            ))}
          </div>

          {/* Full Text File Preview */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px',
              }}
            >
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: 'var(--accent-cyan)',
                }}
              >
                📄 Nilalaman ng File: /HOW_TO_USE_FOR_TITA_NERRY.txt
              </span>
              <a
                href="/HOW_TO_USE_FOR_TITA_NERRY.txt"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--accent-cyan)',
                  textDecoration: 'underline',
                }}
              >
                Buksan ang .TXT sa Bagong Tab ↗
              </a>
            </div>
            <pre
              style={{
                margin: 0,
                padding: '16px',
                borderRadius: '12px',
                background: 'rgba(2, 6, 23, 0.78)',
                border: '1px solid var(--glass-border)',
                color: '#f8fafc',
                fontFamily: 'var(--font-mono)',
                fontSize: '12.5px',
                lineHeight: 1.65,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                maxHeight: '320px',
                overflowY: 'auto',
              }}
            >
              {TITA_NERRY_GUIDE_TEXT}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 22px',
            borderTop: '1px solid var(--glass-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Tip: Maaari ninyong i-download at i-print ang .TXT file na ito anumang oras.
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={handleDownloadTxt}
              className={styles.secondaryBtn}
              style={{ padding: '8px 14px', fontSize: '12px' }}
            >
              <Download size={14} />
              <span>Save HOW_TO_USE_FOR_TITA_NERRY.txt</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className={styles.primaryBtn}
              style={{ padding: '8px 18px', fontSize: '12px' }}
            >
              <span>Sige, Malinaw Na! (Close)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
