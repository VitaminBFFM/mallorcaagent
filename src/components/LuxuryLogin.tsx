import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Key, Lock, Eye, EyeOff, Globe, Sparkles, Check, CheckCircle2 } from 'lucide-react';
import { TeamMember } from '../types';
import { useTranslation } from './LanguageSelector';

interface LuxuryLoginProps {
  team: TeamMember[];
  onLoginSuccess: (member: TeamMember) => void;
}

export default function LuxuryLogin({ team, onLoginSuccess }: LuxuryLoginProps) {
  const { t, language, setLanguage } = useTranslation();
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBiometricSimulating, setIsBiometricSimulating] = useState(false);
  const [biometricSuccess, setBiometricSuccess] = useState(false);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    if (!selectedMember) {
      setError(language === 'DE' ? 'Bitte wählen Sie Ihr Profil aus' : language === 'ES' ? 'Por favor seleccione su perfil' : 'Please select your partner profile');
      return;
    }

    // Accept standard passwords for demonstration, or any 4 digit pin to make it easy to play
    // Let's create a standard passcode check: e.g. "1234" or "agents", or any 4-digit numeric code
    if (passcode.length < 4) {
      setError(language === 'DE' ? 'Der Passcode muss mindestens 4 Zeichen lang sein' : language === 'ES' ? 'El código debe tener al menos 4 caracteres' : 'Credential passcode must be at least 4 digits');
      return;
    }

    onLoginSuccess(selectedMember);
  };

  const triggerBiometricScan = () => {
    if (!selectedMember) {
      setError(language === 'DE' ? 'Bitte wählen Sie zuerst einen Berater aus' : language === 'ES' ? 'Seleccione un agente primero' : 'Please select a profile first');
      return;
    }
    setError(null);
    setIsBiometricSimulating(true);
    
    setTimeout(() => {
      setIsBiometricSimulating(false);
      setBiometricSuccess(true);
      setTimeout(() => {
        onLoginSuccess(selectedMember);
      }, 1000);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-100 bg-black flex items-center justify-center overflow-y-auto font-sans">
      {/* Immersive Dark Background with Soft Gold Atmosphere */}
      <div className="absolute inset-0 bg-[#050505]" />
      <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] rounded-full bg-[#c5a059]/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[45vw] h-[45vw] rounded-full bg-indigo-950/10 blur-3xl pointer-events-none" />
      
      {/* Decorative Golden Map grid pattern/lines */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#c5a059_1px,transparent_1px)] [background-size:16px_16px]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative w-full max-w-xl mx-4 my-8 bg-zinc-950 border border-[#c5a059]/25 rounded-3xl p-6 md:p-10 shadow-3xl text-neutral-200 z-10"
      >
        {/* Subtle Luxury Corner Accents */}
        <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-[#c5a059]/40 rounded-tl pointer-events-none" />
        <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-[#c5a059]/40 rounded-tr pointer-events-none" />
        <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-[#c5a059]/40 rounded-bl pointer-events-none" />
        <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-[#c5a059]/40 rounded-br pointer-events-none" />

        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1 bg-[#c5a059]/10 border border-[#c5a059]/30 rounded-full px-3 py-1">
            <Globe className="w-3.5 h-3.5 text-[#c5a059] animate-spin-slow" />
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#c5a059]">Mallorca Agents Cluster Net</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif text-white tracking-tight">
            Mallorca <span className="text-[#c5a059] italic font-normal">Agents</span>
          </h1>
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-neutral-500">
            {language === 'DE' ? 'Executive Authentifizierungsportal' : language === 'ES' ? 'Portal de Acceso de Élite' : 'Executive Authentication Portal'}
          </p>
          <div className="w-12 h-[1px] bg-[#c5a059]/30 mx-auto my-4" />
        </div>

        {/* Translation Buttons in Login */}
        <div className="flex justify-center gap-2 mb-6">
          {(['EN', 'DE', 'ES'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-md border transition-all cursor-pointer ${
                language === lang 
                  ? 'bg-[#c5a059]/20 border-[#c5a059] text-[#c5a059]' 
                  : 'bg-transparent border-neutral-800 text-neutral-500 hover:text-white'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-rose-950/30 border border-rose-500/40 text-rose-300 p-3.5 rounded-xl text-xs flex items-center gap-2 mb-6"
          >
            <Shield className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        <div className="space-y-6">
          {/* Identity Matrix Grid Selection */}
          <div className="space-y-3">
            <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-bold">
              {language === 'DE' ? '1. Partner-Identität wählen' : language === 'ES' ? '1. Seleccione Socio Ejecutivo' : '1. Select Executive Partner Profile'}
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {team.map((member) => {
                const isSelected = selectedMember?.id === member.id;
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => {
                      setSelectedMember(member);
                      setError(null);
                    }}
                    className={`p-3.5 rounded-xl text-left border transition-all flex items-center gap-3 relative overflow-hidden group cursor-pointer ${
                      isSelected 
                        ? 'bg-[#c5a059]/15 border-[#c5a059] shadow-lg shadow-[#c5a059]/5' 
                        : 'bg-neutral-900/50 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                      isSelected ? 'bg-[#c5a059] text-black' : 'bg-neutral-800 text-neutral-400'
                    }`}>
                      {member.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">{member.name}</p>
                      <p className="text-[9px] text-neutral-400 uppercase tracking-wider truncate mt-0.5">{member.role}</p>
                    </div>
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#c5a059] rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* PIN Entering fields */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-bold">
                  {language === 'DE' ? '2. Passcode eingeben (z. B. 0000)' : language === 'ES' ? '2. Ingrese Clave de Acceso (ej. 0000)' : '2. Enter Passcode (e.g. 0000)'}
                </label>
                <div className="text-[10px] font-mono text-neutral-500">
                  {language === 'DE' ? 'Demo: Beliebige 4 Zahlen' : language === 'ES' ? 'Demo: Cualquier PIN' : 'Demo: Any 4 digits'}
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-4 w-4 text-neutral-500" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  maxLength={16}
                  placeholder="••••••••"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="block w-full bg-neutral-900/80 border border-neutral-800 rounded-xl pl-10 pr-10 py-3 text-sm text-white font-mono placeholder-neutral-600 focus:outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059]/30 transition-all text-center tracking-[0.3em] font-bold"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={triggerBiometricScan}
                disabled={isBiometricSimulating || biometricSuccess}
                className="w-full bg-neutral-900 border border-neutral-800 hover:border-neutral-700 py-3 rounded-xl text-xs font-semibold hover:bg-neutral-850 transition-all flex items-center justify-center gap-2 select-none cursor-pointer disabled:opacity-50"
              >
                {isBiometricSimulating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#c5a059] border-t-transparent rounded-full animate-spin" />
                    <span>{language === 'DE' ? 'Krypto-Schlüssel abgleichen...' : language === 'ES' ? 'Escaneando hardware...' : 'Matching Hardware Key...'}</span>
                  </>
                ) : biometricSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#c5a059]" />
                    <span className="text-[#c5a059] font-bold">{language === 'DE' ? 'Freigegeben' : language === 'ES' ? 'Acceso Autorizado' : 'Access Authorized'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#c5a059]" />
                    <span>{language === 'DE' ? 'Biometrisch simulieren' : language === 'ES' ? 'Acceso Biométrico' : 'Simulate Biometrics'}</span>
                  </>
                )}
              </button>

              <button
                type="submit"
                disabled={isBiometricSimulating || biometricSuccess}
                className="w-full bg-gradient-to-r from-[#c5a059] to-[#d6b36e] text-black hover:brightness-110 font-bold text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer shadow-lg shadow-[#c5a059]/10 disabled:opacity-50"
              >
                <span>{language === 'DE' ? 'Sichere Verbindung aufbauen' : language === 'ES' ? 'Sincronizar Panel' : 'Establish Secure Connection'}</span>
                <Lock className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8 pt-5 border-t border-neutral-800/40 text-center text-[10px] text-neutral-500 font-mono">
          {language === 'DE' 
            ? 'Achtung: Sämtliche Zugriffsmuster werden kryptographisch signiert und im Audit Ledger festgehalten.' 
            : language === 'ES'
            ? 'Aviso: Los intentos de autenticación se registran con firma digital en el historial de seguridad.'
            : 'Warning: Authentication queries are digitally signed and archived securely in the system blockchain ledger.'}
        </div>
      </motion.div>
    </div>
  );
}
