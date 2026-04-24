import React, { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import { useTheme } from '../ThemeContext';
import { ShieldCheck, UserCog, UserMinus, Loader2, ShieldAlert } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export function Staff() {
  const { profile } = useAuth();
  const { theme } = useTheme();
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

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 overflow-hidden transition-colors">
        <div className="p-8 border-b-2 border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 flex justify-between items-center transition-colors">
          <h3 className="font-black text-[10px] text-neutral-500 uppercase tracking-[0.3em] flex items-center gap-4 italic">
            <ShieldCheck className="w-4 h-4" /> AUTHORIZED PERSONNEL DIRECTORY
          </h3>
          <button onClick={fetchUsers} className="text-neutral-500 hover:text-black dark:hover:text-white transition-colors">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950">
                <th className="p-6 font-black text-[9px] text-neutral-600 dark:text-neutral-500 uppercase tracking-widest">Identidad</th>
                <th className="p-6 font-black text-[9px] text-neutral-600 dark:text-neutral-500 uppercase tracking-widest">Email</th>
                <th className="p-6 font-black text-[9px] text-neutral-600 dark:text-neutral-500 uppercase tracking-widest">Protocolo (Rol)</th>
                <th className="p-6 font-black text-[9px] text-neutral-600 dark:text-neutral-500 uppercase tracking-widest text-right">Acciones de Comando</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/50">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-neutral-100 dark:hover:bg-neutral-950/50 transition-colors group">
                  <td className="p-6">
                    <p className={cn(
                      "text-xl font-black uppercase tracking-tight transition-colors italic",
                      theme === 'dark' ? "text-white group-hover:text-lime-400" : "text-neutral-900 group-hover:text-lime-600"
                    )}>
                      {u.name}
                    </p>
                    <p className="text-[9px] font-bold text-neutral-500 dark:text-neutral-600 uppercase tracking-widest mt-1">UID: {u.id.substring(0, 12)}</p>
                  </td>
                  <td className="p-6 font-bold text-xs text-neutral-700 dark:text-neutral-400">{u.email}</td>
                  <td className="p-6">
                    <span className={cn(
                      "px-3 py-1 border font-black text-[9px] uppercase tracking-widest transition-colors",
                      theme === 'dark' ? "bg-neutral-950 border-neutral-800" : "bg-white border-neutral-300 shadow-sm",
                      u.role === 'admin' ? "text-red-500 border-red-500/30" : 
                      u.role === 'manager' ? "text-blue-500 dark:text-blue-400 border-blue-500/30" :
                      u.role === 'staff' ? "text-lime-600 dark:text-lime-400 border-lime-600/30" : "text-neutral-500"
                    )}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="flex justify-end gap-3">
                      <select 
                        onChange={(e) => updateRole(u.id, e.target.value)}
                        value={u.role}
                        className={cn(
                          "border text-[9px] font-black uppercase p-2 outline-none focus:border-lime-400 transition-colors",
                          theme === 'dark' ? "bg-neutral-950 border-neutral-800 text-white" : "bg-white border-neutral-200 text-black"
                        )}
                      >
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="staff">Staff/Encargado</option>
                        <option value="cashier">Cashier</option>
                      </select>
                      <button 
                        onClick={() => removeAccess(u.id)}
                        className={cn(
                          "p-2 border text-neutral-500 hover:text-red-500 transition-all",
                          theme === 'dark' ? "bg-neutral-100 border-neutral-800 hover:bg-neutral-950" : "bg-white border-neutral-200 hover:bg-neutral-50"
                        )}
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
