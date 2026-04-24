import React, { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import { ShieldCheck, UserCog, UserMinus, Loader2, ShieldAlert } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export function Staff() {
  const { profile } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'profiles'));
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching users:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchUsers();
    }
  }, [profile]);

  const updateRole = async (userId: string, newRole: string) => {
    if (confirm(`¿Cambiar rol a ${newRole}?`)) {
      await updateDoc(doc(db, 'profiles', userId), { role: newRole });
      fetchUsers();
    }
  };

  const removeAccess = async (userId: string) => {
    if (confirm('¿Eliminar acceso de este usuario? Perderá sus permisos inmediatamente.')) {
      await deleteDoc(doc(db, 'profiles', userId));
      fetchUsers();
    }
  };

  if (profile?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-6" />
        <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">Acceso Denegado</h2>
        <p className="text-neutral-500 font-bold uppercase tracking-widest text-xs">Solo personal de alto rango puede acceder a este protocolo.</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <header>
        <h1 className="text-7xl md:text-9xl font-black leading-[0.8] tracking-tighter uppercase mb-4">STAFF.</h1>
        <p className="text-neutral-500 font-bold uppercase tracking-[0.3em] text-xs md:text-sm">Human Resource Control • Personnel Management</p>
      </header>

      <div className="bg-neutral-900 border border-neutral-800 overflow-hidden">
        <div className="p-8 border-b-2 border-neutral-800 bg-neutral-950 flex justify-between items-center">
          <h3 className="font-black text-[10px] text-neutral-500 uppercase tracking-[0.3em] flex items-center gap-4 italic">
            <ShieldCheck className="w-4 h-4" /> AUTHORIZED PERSONNEL DIRECTORY
          </h3>
          <button onClick={fetchUsers} className="text-neutral-500 hover:text-white transition-colors">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-950">
                <th className="p-6 font-black text-[9px] text-neutral-500 uppercase tracking-widest">Identidad</th>
                <th className="p-6 font-black text-[9px] text-neutral-500 uppercase tracking-widest">Email</th>
                <th className="p-6 font-black text-[9px] text-neutral-500 uppercase tracking-widest">Protocolo (Rol)</th>
                <th className="p-6 font-black text-[9px] text-neutral-500 uppercase tracking-widest text-right">Acciones de Comando</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/50">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-neutral-950/50 transition-colors group">
                  <td className="p-6">
                    <p className="text-xl font-black uppercase tracking-tight group-hover:text-lime-400 transition-colors italic">
                      {u.name}
                    </p>
                    <p className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest mt-1">UID: {u.id.substring(0, 12)}</p>
                  </td>
                  <td className="p-6 font-bold text-xs text-neutral-400">{u.email}</td>
                  <td className="p-6">
                    <span className={cn(
                      "px-3 py-1 bg-neutral-950 border border-neutral-800 font-black text-[9px] uppercase tracking-widest",
                      u.role === 'admin' ? "text-red-500 border-red-500/20" : 
                      u.role === 'manager' ? "text-blue-400 border-blue-400/20" :
                      u.role === 'staff' ? "text-lime-400 border-lime-400/20" : "text-neutral-500"
                    )}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="flex justify-end gap-3">
                      <select 
                        onChange={(e) => updateRole(u.id, e.target.value)}
                        value={u.role}
                        className="bg-neutral-950 border border-neutral-800 text-[9px] font-black uppercase p-2 outline-none focus:border-lime-400"
                      >
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="staff">Staff/Encargado</option>
                        <option value="cashier">Cashier</option>
                      </select>
                      <button 
                        onClick={() => removeAccess(u.id)}
                        className="p-2 border border-neutral-800 text-neutral-500 hover:text-red-500 transition-all hover:bg-neutral-950"
                        title="Eliminar Acceso"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
