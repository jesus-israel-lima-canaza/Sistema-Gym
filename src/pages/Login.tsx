import React, { useState } from 'react';
import { loginWithGoogle } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { Dumbbell } from 'lucide-react';
import { motion } from 'motion/react';

export function Login() {
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (err) {
      setError('Error al iniciar sesión con Google.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-950 text-white font-sans overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[40vw] font-black tracking-tighter uppercase whitespace-nowrap opacity-5 select-none">
          TITAN. CORE.
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 p-16 bg-neutral-900 border-4 border-neutral-800 shadow-[0_0_100px_rgba(0,0,0,0.5)] max-w-xl w-full text-center overflow-hidden"
      >
        {/* Accent Bar */}
        <div className="absolute top-0 left-0 w-full h-3 bg-lime-400 shadow-[0_0_20px_rgba(163,230,53,0.3)]" />

        <div className="mb-12">
          <Dumbbell className="w-24 h-24 mx-auto mb-8 text-lime-400 group-hover:scale-110 transition-transform" />
          <h1 className="text-8xl md:text-[8rem] font-black mb-4 tracking-tighter uppercase italic leading-[0.8]">TITAN.</h1>
          <p className="text-neutral-500 font-black text-xs uppercase tracking-[0.5em] italic">Iron Core Master Interface v5.1</p>
        </div>
        
        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500 text-red-500 font-black text-[10px] uppercase tracking-widest">
            ERROR DETECTED: {error}
          </div>
        )}
        
        <button 
          onClick={handleLogin}
          className="group relative w-full py-6 px-10 bg-white text-black font-black hover:bg-lime-400 transition-all flex items-center justify-center gap-6 uppercase text-sm tracking-[0.2em] shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-6 h-6 group-hover:rotate-12 transition-transform" />
          Authorize via Google
        </button>
        
        <div className="mt-16 pt-10 border-t border-neutral-800">
          <p className="text-neutral-700 font-black text-[10px] tracking-widest leading-relaxed uppercase">
            RESTRICTED ACCESS • AUTHORIZED PERSONNEL ONLY<br/>
            IRON CORE PROTOCOLS IN EFFECT<br/>
            © 2024 TITAN GYM SYSTEMS LTD.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
