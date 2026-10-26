import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { applyThemeVariablesToRoot, resolveValidThemeId } from './utils/themeConfig.js';
import './index.css';

if (typeof window !== 'undefined') {
  window.__DEPW_APP_MOUNTED__ = true;
}

// Initialize persisted theme and CSS custom properties immediately on document root before React hydration
try {
  const savedTheme = resolveValidThemeId(
    localStorage.getItem('depw_theme_id') ||
      localStorage.getItem('theme') ||
      'navy-glass'
  );
  applyThemeVariablesToRoot(savedTheme, document);
} catch {
  applyThemeVariablesToRoot('navy-glass', document);
}

class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error?.message || 'Unexpected interface error',
    };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            background: '#060d1f',
            color: '#f8fafc',
            fontFamily: 'Inter, system-ui, sans-serif',
            textAlign: 'center',
          }}
        >
          <h1 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>
            Manila DEPW Assist — Interface Recovery
          </h1>
          <p style={{ fontSize: '14px', color: '#94a3b8', maxWidth: '460px', marginBottom: '18px' }}>
            {this.state.errorMessage}
          </p>
          <button
            type="button"
            onClick={() => {
              this.setState({ hasError: false, errorMessage: '' });
              window.location.hash = '#/';
            }}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              border: '1px solid #38bdf8',
              background: '#0284c7',
              color: '#ffffff',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Return to Main Dashboard
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');

if (rootElement && (typeof window === 'undefined' || !window.__DEPW_ROOT_RENDERED__)) {
  if (typeof window !== 'undefined') {
    window.__DEPW_ROOT_RENDERED__ = true;
    window.__DEPW_APP_MOUNTED__ = true;
  }
  createRoot(rootElement).render(
    <React.StrictMode>
      <RootErrorBoundary>
        <ThemeProvider>
          <HashRouter>
            <Routes>
              <Route path="/" element={<App initialRouteTab="command" />} />
              <Route path="/command" element={<App initialRouteTab="command" />} />
              <Route path="/tracker" element={<App initialRouteTab="tracker" />} />
              <Route path="/flowchart" element={<App initialRouteTab="flowchart" />} />
              <Route path="/waterlog" element={<App initialRouteTab="waterlog" />} />
              <Route path="/project" element={<App initialRouteTab="project" />} />
              <Route path="/map" element={<App initialRouteTab="map" />} />
              <Route path="/presentation" element={<App initialRouteTab="presentation" />} />
              <Route path="/3d" element={<App initialRouteTab="3d" />} />
              <Route path="/ai" element={<App initialRouteTab="ai" />} />
              <Route path="/bioscience" element={<App initialRouteTab="bioscience" />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </HashRouter>
        </ThemeProvider>
      </RootErrorBoundary>
    </React.StrictMode>
  );
}

