import React, { useEffect, useState } from 'react';
import { collection, query, getDocs, where, limit, orderBy, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Users, CreditCard, ShoppingBag, Calendar, ArrowUpRight, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'motion/react';
import { formatCurrency, cn } from '../lib/utils';
import { useTheme } from '../ThemeContext';

export function Dashboard() {
  const { theme } = useTheme();
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    monthlyIncome: 0,
    todayIncome: 0,
    recentCheckins: [] as any[],
  });
  const [incomeData, setIncomeData] = useState<any[]>([]);
  const [genderData, setGenderData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const membersSnap = await getDocs(collection(db, 'members'));
        const members = membersSnap.docs.map(doc => doc.data());
        const total = members.length;
        const active = members.filter(m => m.status === 'active').length;

        const males = members.filter(m => m.gender === 'male').length;
        const females = members.filter(m => m.gender === 'female').length;
        const totalGender = males + females || 1;

        setGenderData([
          { name: 'Hombres', value: Math.round((males / totalGender) * 100) },
          { name: 'Mujeres', value: Math.round((females / totalGender) * 100) }
        ]);

        const paymentsSnap = await getDocs(collection(db, 'payments'));
        const payments = paymentsSnap.docs.map(doc => doc.data());
        const today = new Date().toDateString();
        const todayInc = payments
          .filter(p => new Date(p.date).toDateString() === today)
          .reduce((sum, p) => sum + p.amount, 0);
        
        const monthlyInc = payments
          .reduce((sum, p) => sum + p.amount, 0);

        const checkinsSnap = await getDocs(query(collection(db, 'checkins'), orderBy('timestamp', 'desc'), limit(5)));
        const recentCheckins = checkinsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        setIncomeData([
          { name: 'ENE', income: 4000 },
          { name: 'FEB', income: 3000 },
          { name: 'MAR', income: 2000 },
          { name: 'ABR', income: 2780 },
          { name: 'MAY', income: 1890 },
          { name: 'JUN', income: monthlyInc || 2390 },
        ]);

        setStats({
          totalMembers: total,
          activeMembers: active,
          monthlyIncome: monthlyInc,
          todayIncome: todayInc,
          recentCheckins
        });
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const seedPlans = async () => {
    const plansSnap = await getDocs(collection(db, 'plans'));
    if (plansSnap.empty) {
      const defaultPlans = [
        { name: 'Plan Mensual', price: 500, durationMonths: 1, description: 'Acceso total por 1 mes' },
        { name: 'Plan Trimestral', price: 1350, durationMonths: 3, description: 'Acceso total por 3 meses' },
        { name: 'Plan Anual', price: 4800, durationMonths: 12, description: 'Acceso total por 12 meses' },
      ];
      for (const plan of defaultPlans) {
        await addDoc(collection(db, 'plans'), plan);
      }
      alert('Sistemas de Membresía Inicializados.');
      window.location.reload();
    }
  };

  if (loading) return <div className="font-mono text-sm animate-pulse uppercase tracking-widest text-neutral-600">Sincronizando satélites...</div>;

  return (
    <div className="space-y-16">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div>
          <h1 className="text-7xl md:text-9xl font-black leading-[0.8] tracking-tighter uppercase mb-4">DASHBOARD.</h1>
          <p className="text-neutral-500 font-bold uppercase tracking-[0.3em] text-xs md:text-sm">Titan Gym Management System v2.4</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={seedPlans}
            className={cn(
              "px-6 py-3 border-2 text-[10px] font-black uppercase tracking-widest transition-colors",
              theme === 'dark' ? "border-white text-white hover:bg-white hover:text-black" : "border-black text-black hover:bg-black hover:text-white"
            )}
          >
            Sincronizar Planes
          </button>
          <div className="hidden sm:flex gap-4 items-center bg-white dark:bg-neutral-900 px-6 py-3 border border-neutral-200 dark:border-neutral-800 transition-colors">
            <div className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
            <span className="font-mono text-[10px] uppercase text-neutral-400">Status: Online</span>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Ingresos Totales', value: formatCurrency(stats.monthlyIncome), accent: true },
          { label: 'Miembros Activos', value: stats.activeMembers, accent: false },
          { label: 'Accesos Hoy', value: stats.recentCheckins.length + 12, accent: false },
          { label: 'Pendientes', value: '08', accent: false },
        ].map((stat, i) => (
          <div key={i} className={cn("border-l-4 pl-6 transition-all hover:translate-x-1", stat.accent ? "border-lime-400" : "border-neutral-200 dark:border-neutral-800")}>
            <p className="text-xs font-bold text-neutral-500 uppercase mb-2 tracking-widest">{stat.label}</p>
            <p className="text-5xl font-black tracking-tight">{stat.value}</p>
          </div>
        ))}
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Demographics */}
        <div className="lg:col-span-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-8 flex flex-col justify-between group overflow-hidden relative transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Users className="w-48 h-48 -mr-12 -mt-12" />
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl font-black uppercase italic mb-10 tracking-tight">Demographics.</h2>
            <div className="space-y-8">
              {genderData.map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-[11px] font-black mb-2 uppercase tracking-widest">
                    <span>{item.name}</span>
                    <span>{item.value}%</span>
                  </div>
                  <div className="w-full h-4 bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 transition-colors">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${item.value}%` }}
                      className={cn("h-full", i === 0 ? (theme === 'dark' ? "bg-white" : "bg-black") : "bg-lime-400")}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="pt-10 border-t border-neutral-100 dark:border-neutral-800 mt-12 relative z-10">
            <p className="text-[10px] uppercase font-bold text-neutral-500 tracking-widest mb-2">Rango de Edad Promedio</p>
            <p className="text-6xl font-black tracking-tighter">18-35</p>
          </div>
        </div>

        {/* Charts */}
        <div className="lg:col-span-8 flex flex-col">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-3xl font-black uppercase italic tracking-tight">Flow Mensual.</h2>
            <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest text-neutral-400">
              <span className="flex items-center gap-2"><i className="w-2 h-2 bg-white"></i> Ingresos</span>
              <span className="flex items-center gap-2"><i className="w-2 h-2 bg-neutral-800"></i> Gastos</span>
            </div>
          </div>
          <div className="flex-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-10 flex items-end gap-2 sm:gap-4 h-[400px] transition-colors">
             {incomeData.map((data, i) => {
               const height = (data.income / 5000) * 100;
               return (
                 <div key={i} className="flex-1 flex flex-col gap-1 items-center h-full justify-end group">
                   <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${height * 0.3}%` }}
                    className="w-full bg-neutral-100 dark:bg-neutral-800 transition-colors group-hover:bg-neutral-200 dark:group-hover:bg-neutral-700" 
                   />
                   <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    className={cn(
                      "w-full transition-colors group-hover:bg-lime-400",
                      theme === 'dark' ? "bg-white" : "bg-black"
                    )} 
                   />
                   <span className="text-[10px] font-black text-neutral-500 mt-4 tracking-tighter group-hover:text-black dark:group-hover:text-white transition-colors">{data.name}</span>
                 </div>
               );
             })}
          </div>
        </div>
      </div>

      {/* Footer / Activity */}
      <footer className="grid grid-cols-1 md:grid-cols-12 gap-8 border-t border-neutral-200 dark:border-neutral-800 pt-10 transition-colors">
        <div className="md:col-span-3">
          <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Inventory Alert</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-black">Proteína W.</p>
            <span className="text-lime-400 font-bold italic text-sm">Low</span>
          </div>
        </div>
        <div className="md:col-span-9 flex flex-wrap gap-12 overflow-hidden items-end">
          {stats.recentCheckins.map((checkin, i) => (
            <div key={i} className="flex flex-col group transition-all" style={{ opacity: 1 - i * 0.2 }}>
              <span className="text-[10px] font-bold text-neutral-500 tracking-widest uppercase mb-1">
                {new Date(checkin.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • ACCESS GRANTED
              </span>
              <span className="text-xl font-bold uppercase tracking-tight group-hover:text-lime-400 transition-colors">
                ID: {checkin.memberId.substring(0, 8)}
              </span>
            </div>
          ))}
          {stats.recentCheckins.length === 0 && (
            <div className="text-sm font-bold text-neutral-700 uppercase italic tracking-widest">No activity detected. Standing by...</div>
          )}
        </div>
      </footer>
    </div>
  );
}
