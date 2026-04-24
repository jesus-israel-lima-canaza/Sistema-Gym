import React, { useState } from 'react';
import { loginWithGoogle, loginWithEmail, registerWithEmail } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function Login() {
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      setError('');
      await loginWithGoogle();
      navigate('/');
    } catch (err) {
      setError('Error al iniciar sesión con Google.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isRegistering) {
        await registerWithEmail(formData.email, formData.password, formData.name);
      } else {
        await loginWithEmail(formData.email, formData.password);
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Access denied.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-950 text-white font-sans overflow-hidden relative p-4">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[40vw] font-black tracking-tighter uppercase whitespace-nowrap opacity-5 select-none">
          TITAN. CORE.
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 p-8 md:p-16 bg-neutral-900 border-4 border-neutral-800 shadow-[0_0_100px_rgba(0,0,0,0.5)] max-w-xl w-full text-center overflow-hidden"
      >
        {/* Accent Bar */}
        <div className="absolute top-0 left-0 w-full h-3 bg-lime-400 shadow-[0_0_20px_rgba(163,230,53,0.3)]" />

        <div className="mb-10">
          <Dumbbell className="w-16 h-16 mx-auto mb-6 text-lime-400" />
          <h1 className="text-6xl md:text-8xl font-black mb-2 tracking-tighter uppercase italic leading-[0.8]">TITAN.</h1>
          <p className="text-neutral-500 font-black text-[10px] uppercase tracking-[0.5em] italic">Iron Core Master Interface v5.1</p>
        </div>
        
        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500 text-red-500 font-black text-[9px] uppercase tracking-widest leading-relaxed">
            SYSTEM_ERROR: {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mb-8 text-left">
          <AnimatePresence mode="wait">
            {isRegistering && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-1 italic">Subject Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input
                    type="text"
                    required
                    className="w-full bg-neutral-950 border-2 border-neutral-800 p-4 pl-12 font-black text-sm uppercase tracking-tight outline-none focus:border-lime-400 transition-colors"
                    placeholder="Enter Full Name"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-1 italic">Email Identity</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="email"
                required
                className="w-full bg-neutral-950 border-2 border-neutral-800 p-4 pl-12 font-black text-sm uppercase tracking-tight outline-none focus:border-lime-400 transition-colors"
                placeholder="Subject Email Address"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-1 italic">Access Token (Password)</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="password"
                required
                className="w-full bg-neutral-950 border-2 border-neutral-800 p-4 pl-12 font-black text-sm uppercase tracking-tight outline-none focus:border-lime-400 transition-colors"
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-lime-400 text-black font-black uppercase text-xs tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-white transition-all disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isRegistering ? 'Register Subject' : 'Initialize Session')}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-[2px] bg-neutral-800" />
          <span className="text-[10px] font-black text-neutral-700 uppercase tracking-widest">OR</span>
          <div className="flex-1 h-[2px] bg-neutral-800" />
        </div>
        
        <div className="space-y-4">
          <button 
            type="button"
            onClick={handleGoogleLogin}
            className="group relative w-full py-5 px-10 bg-white text-black font-black hover:bg-neutral-200 transition-all flex items-center justify-center gap-4 uppercase text-xs tracking-[0.2em] shadow-2xl"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            Google Identity Auth
          </button>

          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-[10px] font-black text-neutral-500 hover:text-white uppercase tracking-widest transition-colors italic block mx-auto underline underline-offset-4"
          >
            {isRegistering ? 'Already have access? Sign In' : 'Need clearance? Register here'}
          </button>
        </div>
        
        <div className="mt-12 pt-8 border-t border-neutral-800">
          <p className="text-neutral-700 font-black text-[9px] tracking-widest leading-relaxed uppercase">
            RESTRICTED ACCESS • AUTHORIZED PERSONNEL ONLY<br/>
            IRON CORE PROTOCOLS IN EFFECT<br/>
            © 2024 TITAN GYM SYSTEMS LTD.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
