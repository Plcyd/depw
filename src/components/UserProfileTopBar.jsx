import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  ShieldCheck,
  MapPin,
  Clock,
  Mail,
  BadgeCheck,
  ChevronDown,
  Edit3,
  Check,
  X,
  Building2,
  AlertCircle,
} from 'lucide-react';
import styles from '../styles/GlassSystem.module.css';
import {
  DEPW_OFFICER_PROFILES,
  getUserInitials,
  validateUserProfile,
} from '../utils/workflowRules.js';

const DUTY_STATUS_OPTIONS = [
  'On-Duty • Command Center',
  'In Field • Estero de Vitas',
  'On-Duty • Liaison Desk',
  'On-Duty • Dispatch Ready',
  'Standby • Emergency Storm Watch',
];

export default function UserProfileTopBar({
  userProfile,
  onUpdateProfile,
  firebaseUser = null,
  showToast,
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [formState, setFormState] = useState(() => ({
    profileId: userProfile?.profileId || DEPW_OFFICER_PROFILES[0].profileId,
    fullName: userProfile?.fullName || DEPW_OFFICER_PROFILES[0].fullName,
    roleTitle: userProfile?.roleTitle || DEPW_OFFICER_PROFILES[0].roleTitle,
    division: userProfile?.division || DEPW_OFFICER_PROFILES[0].division,
    districtAssignment:
      userProfile?.districtAssignment || DEPW_OFFICER_PROFILES[0].districtAssignment,
    badgeId: userProfile?.badgeId || DEPW_OFFICER_PROFILES[0].badgeId,
    email: userProfile?.email || DEPW_OFFICER_PROFILES[0].email,
    shift: userProfile?.shift || DEPW_OFFICER_PROFILES[0].shift,
    dutyStatus: userProfile?.dutyStatus || DEPW_OFFICER_PROFILES[0].dutyStatus,
    clearanceLevel:
      userProfile?.clearanceLevel || DEPW_OFFICER_PROFILES[0].clearanceLevel,
  }));
  const [validationErrors, setValidationErrors] = useState([]);

  useEffect(() => {
    if (userProfile) {
      setFormState({
        profileId: userProfile.profileId || 'OFF-DEPW-001',
        fullName: userProfile.fullName || '',
        roleTitle: userProfile.roleTitle || '',
        division: userProfile.division || '',
        districtAssignment: userProfile.districtAssignment || '',
        badgeId: userProfile.badgeId || '',
        email: userProfile.email || '',
        shift: userProfile.shift || 'Day Shift (08:00 – 17:00 PST)',
        dutyStatus: userProfile.dutyStatus || 'On-Duty • Command Center',
        clearanceLevel: userProfile.clearanceLevel || 'DEPW Operations Officer',
      });
    }
  }, [userProfile]);

  const activeName =
    firebaseUser?.displayName ||
    userProfile?.fullName ||
    DEPW_OFFICER_PROFILES[0].fullName;
  const activeEmail =
    firebaseUser?.email || userProfile?.email || DEPW_OFFICER_PROFILES[0].email;
  const activeRole =
    userProfile?.roleTitle || DEPW_OFFICER_PROFILES[0].roleTitle;
  const activeDivision =
    userProfile?.division || DEPW_OFFICER_PROFILES[0].division;
  const activeDistrict =
    userProfile?.districtAssignment ||
    DEPW_OFFICER_PROFILES[0].districtAssignment;
  const activeBadge = userProfile?.badgeId || DEPW_OFFICER_PROFILES[0].badgeId;
  const activeShift = userProfile?.shift || DEPW_OFFICER_PROFILES[0].shift;
  const activeDutyStatus =
    userProfile?.dutyStatus || DEPW_OFFICER_PROFILES[0].dutyStatus;
  const initials = getUserInitials(activeName);

  const handleSelectPreset = (preset) => {
    setValidationErrors([]);
    setFormState({ ...preset });
    if (onUpdateProfile) {
      onUpdateProfile(preset);
    }
    if (showToast) {
      showToast(
        `Switched active officer profile to ${preset.fullName} (${preset.roleTitle}).`,
        'info'
      );
    }
  };

  const handleQuickStatusChange = (e) => {
    const nextStatus = e.target.value;
    const updated = {
      ...userProfile,
      dutyStatus: nextStatus,
    };
    if (onUpdateProfile) {
      onUpdateProfile(updated);
    }
    if (showToast) {
      showToast(`Duty status updated to "${nextStatus}".`, 'info');
    }
  };

  const handleSaveCustomProfile = (e) => {
    e.preventDefault();
    const res = validateUserProfile(formState);
    if (!res.isValid) {
      setValidationErrors(res.errors);
      return;
    }
    setValidationErrors([]);
    if (onUpdateProfile) {
      onUpdateProfile(res.profile);
    }
    setModalOpen(false);
    if (showToast) {
      showToast(
        `Saved user profile for ${res.profile.fullName} (${res.profile.badgeId}).`,
        'success'
      );
    }
  };

  return (
    <>
      <div
        role="region"
        aria-label="Active User Profile Top Bar"
        style={{
          width: '100%',
          background: 'var(--bg-navy-elevated)',
          borderBottom: '1px solid var(--glass-border)',
          padding: '8px 24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px 16px',
          zIndex: 55,
          backdropFilter: 'blur(14px)',
        }}
      >
        {/* Left: User Avatar, Name, Badge ID, Role & Division */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
            minWidth: 0,
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
              border: '1px solid rgba(125, 211, 252, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '13px',
              letterSpacing: '0.04em',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.35)',
            }}
          >
            {firebaseUser?.photoURL ? (
              <img
                src={firebaseUser.photoURL}
                alt={activeName}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '9px',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <span>{initials}</span>
            )}
            <span
              title={activeDutyStatus}
              style={{
                position: 'absolute',
                bottom: '-2px',
                right: '-2px',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#10b981',
                border: '2px solid #040b1a',
              }}
            />
          </div>

          <div style={{ minWidth: 0 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexWrap: 'wrap',
              }}
            >
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.01em',
                }}
              >
                {activeName}
              </span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  padding: '1px 7px',
                  borderRadius: '5px',
                  background: 'rgba(56, 189, 248, 0.14)',
                  border: '1px solid rgba(56, 189, 248, 0.35)',
                  color: 'var(--accent-cyan)',
                }}
              >
                <BadgeCheck size={12} />
                {activeBadge}
              </span>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                }}
              >
                • {activeRole}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                flexWrap: 'wrap',
                fontSize: '11px',
                color: 'var(--text-muted)',
                marginTop: '2px',
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Building2 size={11} className="text-sky-400" />
                {activeDivision}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={11} className="text-emerald-400" />
                {activeDistrict}
              </span>
              <span
                className="hidden md:inline-flex"
                style={{ alignItems: 'center', gap: '4px' }}
              >
                <Mail size={11} className="text-amber-400" />
                {activeEmail}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Duty Status Selector, Shift Info & Profile Editor Trigger */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          <div
            className="hidden lg:inline-flex"
            style={{
              alignItems: 'center',
              gap: '5px',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              padding: '4px 10px',
              borderRadius: '6px',
              background: 'var(--glass-surface)',
              border: '1px solid var(--glass-border)',
            }}
          >
            <Clock size={12} className="text-cyan-400" />
            <span>{activeShift}</span>
          </div>

          <label
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              fontWeight: 700,
              color: '#6ee7b7',
              background: 'rgba(16, 185, 129, 0.14)',
              border: '1px solid rgba(52, 211, 153, 0.4)',
              borderRadius: '6px',
              padding: '3px 8px',
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#10b981',
                display: 'inline-block',
              }}
            />
            <span className="sr-only">Duty Status</span>
            <select
              aria-label="Officer Duty Status"
              value={activeDutyStatus}
              onChange={handleQuickStatusChange}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#6ee7b7',
                fontWeight: 700,
                fontSize: '11px',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              {DUTY_STATUS_OPTIONS.map((statusOpt) => (
                <option
                  key={statusOpt}
                  value={statusOpt}
                  style={{ background: '#0f172a', color: '#f8fafc' }}
                >
                  {statusOpt}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={() => {
              setValidationErrors([]);
              setModalOpen(true);
            }}
            aria-label="Edit or Switch Officer Profile"
            className={styles.secondaryBtn}
            style={{
              padding: '5px 11px',
              minHeight: '32px',
              fontSize: '12px',
              borderRadius: '7px',
            }}
          >
            <UserCheck size={13} className="text-cyan-400" />
            <span>Profile</span>
            <ChevronDown size={12} />
          </button>
        </div>
      </div>

      {/* User Profile Switcher & Editor Modal */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="DEPW Officer Profile Information & Switcher"
          onClick={() => setModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9500,
            background: 'rgba(2, 6, 23, 0.82)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={styles.glassPanel}
            style={{
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '22px 24px',
              border: '1px solid var(--accent-cyan)',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.75)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '12px',
                borderBottom: '1px solid var(--glass-border)',
                paddingBottom: '14px',
                marginBottom: '16px',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--accent-cyan)',
                  }}
                >
                  CITY OF MANILA • DEPW PERSONNEL CREDENTIALS
                </div>
                <h2
                  style={{
                    fontSize: '20px',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    margin: '4px 0 0',
                  }}
                >
                  Active Officer Profile & Duty Assignment
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Close User Profile Modal"
                className={styles.secondaryBtn}
                style={{ padding: '6px 10px', minHeight: '34px' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Quick-Select DEPW Officer Presets */}
            <div style={{ marginBottom: '18px' }}>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--text-secondary)',
                  marginBottom: '8px',
                }}
              >
                Quick-Switch DEPW Officer Profile
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {DEPW_OFFICER_PROFILES.map((preset) => {
                  const isSelected = formState.badgeId === preset.badgeId;
                  return (
                    <button
                      key={preset.profileId}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      style={{
                        textAlign: 'left',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        background: isSelected
                          ? 'rgba(2, 132, 199, 0.24)'
                          : 'var(--bg-navy-elevated)',
                        border: isSelected
                          ? '1.5px solid var(--accent-cyan)'
                          : '1px solid var(--glass-border)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: '8px',
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: '13px',
                            fontWeight: 800,
                            color: 'var(--text-primary)',
                          }}
                        >
                          {preset.fullName}
                        </div>
                        <div
                          style={{
                            fontSize: '11px',
                            color: 'var(--text-secondary)',
                            marginTop: '2px',
                          }}
                        >
                          {preset.roleTitle}
                        </div>
                        <div
                          style={{
                            fontSize: '10px',
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--accent-cyan)',
                            marginTop: '4px',
                          }}
                        >
                          {preset.badgeId} • {preset.districtAssignment}
                        </div>
                      </div>
                      {isSelected && (
                        <Check size={16} className="text-cyan-400 shrink-0 mt-1" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Officer Profile Form */}
            <form onSubmit={handleSaveCustomProfile}>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--text-secondary)',
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Edit3 size={13} className="text-cyan-400" />
                <span>Customize Active Profile Details</span>
              </div>

              {validationErrors.length > 0 && (
                <div
                  role="alert"
                  style={{
                    marginBottom: '12px',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: 'rgba(239, 68, 68, 0.16)',
                    border: '1px solid rgba(248, 113, 113, 0.5)',
                    color: '#fecaca',
                    fontSize: '12px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontWeight: 700,
                      marginBottom: '4px',
                    }}
                  >
                    <AlertCircle size={14} />
                    <span>Please complete the required profile fields:</span>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '18px' }}>
                    {validationErrors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={styles.fieldLabel} htmlFor="profile-fullname">
                    Officer Full Name
                  </label>
                  <input
                    id="profile-fullname"
                    type="text"
                    className={styles.glassInput}
                    value={formState.fullName}
                    onChange={(e) =>
                      setFormState((prev) => ({ ...prev, fullName: e.target.value }))
                    }
                    placeholder="e.g. Engr. Lorenzo T. Macapagal"
                  />
                </div>

                <div>
                  <label className={styles.fieldLabel} htmlFor="profile-badge">
                    Official Badge / Employee ID
                  </label>
                  <input
                    id="profile-badge"
                    type="text"
                    className={styles.glassInput}
                    value={formState.badgeId}
                    onChange={(e) =>
                      setFormState((prev) => ({ ...prev, badgeId: e.target.value }))
                    }
                    placeholder="e.g. DEPW-MNL-2026-014"
                  />
                </div>

                <div>
                  <label className={styles.fieldLabel} htmlFor="profile-role">
                    Position / Role Title
                  </label>
                  <input
                    id="profile-role"
                    type="text"
                    className={styles.glassInput}
                    value={formState.roleTitle}
                    onChange={(e) =>
                      setFormState((prev) => ({ ...prev, roleTitle: e.target.value }))
                    }
                    placeholder="e.g. Chief Drainage & Declogging Engineer"
                  />
                </div>

                <div>
                  <label className={styles.fieldLabel} htmlFor="profile-division">
                    DEPW Division / Unit
                  </label>
                  <input
                    id="profile-division"
                    type="text"
                    className={styles.glassInput}
                    value={formState.division}
                    onChange={(e) =>
                      setFormState((prev) => ({ ...prev, division: e.target.value }))
                    }
                    placeholder="e.g. Flood Control & Drainage Operations"
                  />
                </div>

                <div>
                  <label className={styles.fieldLabel} htmlFor="profile-district">
                    Assigned Manila District(s)
                  </label>
                  <input
                    id="profile-district"
                    type="text"
                    className={styles.glassInput}
                    value={formState.districtAssignment}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        districtAssignment: e.target.value,
                      }))
                    }
                    placeholder="e.g. District I & II (Tondo / Binondo)"
                  />
                </div>

                <div>
                  <label className={styles.fieldLabel} htmlFor="profile-email">
                    Official Email Address
                  </label>
                  <input
                    id="profile-email"
                    type="email"
                    className={styles.glassInput}
                    value={formState.email}
                    onChange={(e) =>
                      setFormState((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="officer@depw.manila.gov.ph"
                  />
                </div>

                <div>
                  <label className={styles.fieldLabel} htmlFor="profile-shift">
                    Assigned Shift Schedule
                  </label>
                  <input
                    id="profile-shift"
                    type="text"
                    className={styles.glassInput}
                    value={formState.shift}
                    onChange={(e) =>
                      setFormState((prev) => ({ ...prev, shift: e.target.value }))
                    }
                    placeholder="Day Shift (08:00 – 17:00 PST)"
                  />
                </div>

                <div>
                  <label className={styles.fieldLabel} htmlFor="profile-dutystatus">
                    Current Duty Status
                  </label>
                  <select
                    id="profile-dutystatus"
                    className={styles.glassSelect}
                    value={formState.dutyStatus}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        dutyStatus: e.target.value,
                      }))
                    }
                  >
                    {DUTY_STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '10px',
                  marginTop: '18px',
                  paddingTop: '14px',
                  borderTop: '1px solid var(--glass-border)',
                }}
              >
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className={styles.secondaryBtn}
                  style={{ padding: '8px 14px', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.primaryBtn}
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                >
                  <ShieldCheck size={15} />
                  <span>Save User Profile</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
