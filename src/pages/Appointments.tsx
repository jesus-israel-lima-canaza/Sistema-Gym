import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, query, orderBy, limit, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Calendar, Plus, Clock, User, Trash2, LayoutGrid, List } from 'lucide-react';
import { formatDate } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export function Appointments() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    memberId: '',
    trainerId: '',
    date: '',
    notes: '',
    status: 'pending'
  });

  const fetchData = async () => {
    setLoading(true);
    const snap = await getDocs(query(collection(db, 'appointments'), orderBy('date', 'asc')));
    setAppointments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    
    const membersSnap = await getDocs(collection(db, 'members'));
    setMembers(membersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'appointments'), formData);
      setShowModal(false);
      setFormData({ memberId: '', trainerId: 'Self-User', date: '', notes: '', status: 'pending' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-7xl md:text-9xl font-black leading-[0.8] tracking-tighter uppercase mb-4">TRAINING.</h1>
          <p className="text-neutral-500 font-bold uppercase tracking-[0.3em] text-xs md:text-sm">Session Deployment Agenda • Iron Core Protocol</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-3 px-8 py-5 bg-white text-black font-black uppercase text-[10px] tracking-widest hover:bg-lime-400 transition-all shadow-xl whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          + Nueva Sesión
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
        {appointments.map((apt) => (
          <div key={apt.id} className="bg-neutral-900 border border-neutral-800 p-10 hover:border-lime-400 transition-all group relative overflow-hidden">
            <button 
              onClick={async () => { if(confirm('Abort session protocol?')) { await deleteDoc(doc(db, 'appointments', apt.id)); fetchData(); } }}
              className="absolute right-6 top-6 text-neutral-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all z-20"
            >
              <Trash2 className="w-5 h-5" />
            </button>

            {/* Huge background number */}
            <div className="absolute -right-4 -bottom-4 text-9xl font-black text-neutral-800/10 select-none group-hover:text-lime-400/5 transition-colors">
              {new Date(apt.date).getDate()}
            </div>

            <div className="flex items-center gap-6 mb-10 relative z-10">
              <div className="w-16 h-16 bg-neutral-950 border-2 border-neutral-800 flex flex-col items-center justify-center group-hover:border-lime-400 transition-colors">
                <span className="font-black text-2xl leading-none">{new Date(apt.date).getDate()}</span>
                <span className="font-bold text-[8px] uppercase text-neutral-500 tracking-widest">{new Date(apt.date).toLocaleString('default', { month: 'short' })}</span>
              </div>
              <div className="flex-1">
                <p className="text-2xl font-black uppercase tracking-tighter italic group-hover:text-lime-400 transition-colors truncate">
                  {members.find(m => m.id === apt.memberId)?.name || 'Anónimo'}
                </p>
                <div className="flex items-center gap-3 mt-1">
                   <div className="w-2 h-2 bg-lime-400 shadow-[0_0_8px_rgba(163,230,53,0.8)]" />
                   <p className="font-black text-[9px] text-neutral-500 uppercase tracking-widest italic">{apt.status} • COACH: {apt.trainerId}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 relative z-10">
              <div className="flex items-center gap-4 py-3 border-y border-neutral-800/50">
                 <div className="flex items-center gap-2 text-neutral-400 font-black text-[10px] uppercase tracking-widest">
                   <Clock className="w-3.5 h-3.5 text-lime-400" />
                   {new Date(apt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                 </div>
                 <div className="w-1 h-1 bg-neutral-700 rounded-full" />
                 <div className="flex items-center gap-2 text-neutral-400 font-black text-[10px] uppercase tracking-widest">
                   <Calendar className="w-3.5 h-3.5 text-lime-400" />
                   {formatDate(apt.date)}
                 </div>
              </div>
              
              {apt.notes && (
                <div className="mt-6 p-5 bg-neutral-950 border-l-4 border-white italic group-hover:border-lime-400 transition-all">
                  <p className="text-neutral-400 text-[11px] font-bold uppercase tracking-widest leading-relaxed">"{apt.notes}"</p>
                </div>
              )}
            </div>
          </div>
        ))}
        {appointments.length === 0 && (
          <div className="col-span-full py-32 text-center border-4 border-dashed border-neutral-900 rounded-lg">
            <Calendar className="w-16 h-16 text-neutral-800 mx-auto mb-6" />
            <p className="font-black text-xs text-neutral-600 uppercase tracking-[0.4em] italic">No active deployment schedules detected.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div onClick={() => setShowModal(false)} className="absolute inset-0 bg-neutral-950/95 backdrop-blur-md" />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="relative w-full max-w-xl bg-neutral-950 border-4 border-neutral-900 p-12 shadow-2xl overflow-hidden"
          >
            {/* Decorative Accent */}
            <div className="absolute top-0 left-0 w-full h-2 bg-lime-400" />

            <div className="flex justify-between items-start mb-12">
              <div>
                <h3 className="text-6xl font-black uppercase tracking-tighter italic leading-none mb-2">Schedule.</h3>
                <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-[0.4em]">Iron Core Agenda Protocol v4.0</p>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                className="p-2 border-2 border-neutral-800 text-neutral-400 hover:text-white transition-all"
              >
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-10">
              <div>
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-4 italic">Target Member Selection.</label>
                <select required className="w-full bg-neutral-900 border-2 border-neutral-800 p-4 font-black text-sm uppercase tracking-tight outline-none focus:border-lime-400 transition-colors appearance-none" value={formData.memberId} onChange={e => setFormData({...formData, memberId: e.target.value})}>
                  <option value="">Select Resident Subject...</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name} • {m.email}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-10">
                <div>
                  <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-4 italic">Deployment Time.</label>
                  <input type="datetime-local" required className="w-full bg-neutral-900 border-2 border-neutral-800 p-4 font-black text-sm outline-none focus:border-lime-400 transition-colors text-white" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-4 italic">Master Trainer.</label>
                  <input className="w-full bg-neutral-900 border-2 border-neutral-800 p-4 font-black text-sm uppercase tracking-tight outline-none focus:border-lime-400 transition-colors" value={formData.trainerId} onChange={e => setFormData({...formData, trainerId: e.target.value})} placeholder="DESIGNATE COACH..." />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-4 italic">Session Parameters & Notes.</label>
                <textarea className="w-full bg-neutral-900 border-2 border-neutral-800 p-4 font-bold text-sm tracking-widest uppercase outline-none focus:border-lime-400 min-h-[120px] transition-colors" rows={3} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="SPECIFY TRAINING OBJECTIVES..." />
              </div>
              <div className="pt-6">
                <button type="submit" className="w-full py-6 bg-white text-black font-black uppercase text-xs tracking-[0.4em] hover:bg-lime-400 transition-all hover:scale-[1.01] active:scale-[0.99] shadow-2xl">Initialize Program</button>
                <p className="text-center text-[9px] font-black text-neutral-700 uppercase tracking-widest mt-8 italic">IRON CORE SENSORY SYSTEMS: ACTIVE</p>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
