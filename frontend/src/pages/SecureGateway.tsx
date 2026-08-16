import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BackgroundVideo } from '../components/BackgroundVideo';
import { SecureNavbar } from '../components/SecureNavbar';
import { SecureHero } from '../components/SecureHero';
import { TelemetryStatus } from '../components/TelemetryStatus';
import { SecurityAlert } from '../components/SecurityAlert';
import { UnauthorizedAlertModal } from '../components/UnauthorizedAlertModal';
import InfiniteGallery from '../components/InfiniteGallery';
import type { GatewayState } from '../components/AccessButton';
import { auth, type UnauthorizedErrorPayload } from '../lib/auth';
import { recordUnauthorizedAccessAttempt } from '../services/securityAlert';
import { ShieldCheck, LockKeyhole, UserCheck, ShieldAlert } from 'lucide-react';

interface SecureGatewayProps {
  onAccessGranted: (targetTab?: string) => void;
  onUnauthorizedDetected?: (unauthPayload: UnauthorizedErrorPayload) => void;
}

export const SecureGateway: React.FC<SecureGatewayProps> = ({ onAccessGranted, onUnauthorizedDetected }) => {
  const [gatewayState, setGatewayState] = useState<GatewayState>('LOCKED');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertRefId, setAlertRefId] = useState('');

  const [isUnauthModalOpen, setIsUnauthModalOpen] = useState(false);
  const [unauthPayload, setUnauthPayload] = useState<UnauthorizedErrorPayload | null>(null);

  const handleLoginSubmit = async (email: string, pass: string) => {
    if (gatewayState === 'AUTHENTICATING') return;

    setGatewayState('AUTHENTICATING');
    setErrorMessage(null);

    try {
      const userProfile = await auth.loginWithCredentials(email, pass);
      if (userProfile && userProfile.authorized) {
        setGatewayState('AUTHORIZED');
        setTimeout(() => {
          onAccessGranted(userProfile.role === 'DOCTOR' ? 'patient_portal' : 'command');
        }, 3000);
      } else {
        throw new Error('Your account is not authorized to access the HealthShield-X platform.');
      }
    } catch (err: any) {
      setGatewayState('LOCKED');

      if (err.unauthPayload) {
        const payload: UnauthorizedErrorPayload = err.unauthPayload;
        setUnauthPayload(payload);
        setIsUnauthModalOpen(true);
        if (onUnauthorizedDetected) {
          onUnauthorizedDetected(payload);
        }
      } else {
        const msg = err.message || 'Authentication failed. Verify credentials.';
        setErrorMessage(msg);

        // Record unauthorized access attempt to backend audit log
        const auditRes = await recordUnauthorizedAccessAttempt('/login-attempt');
        setAlertRefId(auditRes.reference_id);
        setIsAlertOpen(true);
      }
    }
  };

  const triggerSecurityAlert = async (path: string = '/') => {
    const result = await recordUnauthorizedAccessAttempt(path);
    setAlertRefId(result.reference_id);
    setIsAlertOpen(true);
  };

  return (
    <main className="relative bg-black h-[100dvh] w-full flex flex-col overflow-y-auto overflow-x-hidden selection:bg-white selection:text-black font-sans">
      {/* Cinematic HLS Mux Background Video */}
      <BackgroundVideo />

      {/* Top Navbar */}
      <SecureNavbar onUnauthorizedClick={() => triggerSecurityAlert('/restricted-nav')} />

      {/* Center Hero with Authentication Panel */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-4">
        <SecureHero
          gatewayState={gatewayState}
          onLoginSubmit={handleLoginSubmit}
          errorMessage={errorMessage}
          setErrorMessage={setErrorMessage}
        />

        {/* Demo Preset Buttons for Quick Testing */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 max-w-lg w-full font-mono text-[11px]">
          <button
            onClick={() => handleLoginSubmit('investigator@gmail.com', 'investigate@123')}
            className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-bold flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>INVESTIGATOR DEMO LOGIN</span>
          </button>

          <button
            onClick={() => handleLoginSubmit('doctor_demo', 'demo123')}
            className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-bold flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>DOCTOR DEMO LOGIN</span>
          </button>

          <button
            onClick={() => handleLoginSubmit('unknown_user_47', 'wrong_pass')}
            className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 font-bold flex items-center gap-1.5 cursor-pointer transition-all animate-pulse"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>SIMULATE UNAUTHORIZED LOGIN</span>
          </button>
        </div>
      </div>

      {/* Bottom Telemetry Bar */}
      <TelemetryStatus />

      {/* Security Alert Modal */}
      <SecurityAlert
        isOpen={isAlertOpen}
        referenceId={alertRefId}
        onClose={() => setIsAlertOpen(false)}
      />

      {/* In-Project Unauthorized Access Attempt Alert Modal */}
      <UnauthorizedAlertModal
        isOpen={isUnauthModalOpen}
        payload={unauthPayload}
        onClose={() => setIsUnauthModalOpen(false)}
        onJumpToInvestigation={() => {
          setIsUnauthModalOpen(false);
          onAccessGranted('command');
        }}
      />

      {/* React Bits GradientBlinds Fullscreen WebGL Transition Curtain */}
      <AnimatePresence>
        {gatewayState === 'AUTHORIZED' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl"
          >
            {/* InfiniteGallery Dashboard Zoom Background */}
            <div className="absolute inset-0 pointer-events-none opacity-60 z-0">
              <InfiniteGallery 
                density={4}
                imageWidth={300}
                imageHeight={200}
                dragSpeed={0} 
                friction={0} 
              />
            </div>

            {/* Dark Center Vignette & Card Content */}
            <div className="relative z-10 text-center space-y-4 px-8 py-6 rounded-2xl bg-[#0b0f19]/90 border border-white/20 backdrop-blur-2xl shadow-2xl max-w-md mx-auto">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 animate-pulse">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2
                style={{ fontFamily: "'Instrument Serif', serif" }}
                className="text-3xl md:text-4xl text-white tracking-wide font-normal"
              >
                Authentication Verified
              </h2>
              <p className="text-xs font-mono text-emerald-400 tracking-widest uppercase">
                [●] ACCESS GRANTED — DEPLOYING HEALTHCARE CONSOLE...
              </p>
              <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-slate-400 pt-2 border-t border-white/10">
                <LockKeyhole className="w-3 h-3 text-indigo-400" />
                <span>SESSION ENCRYPTED & AUDITED</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};
