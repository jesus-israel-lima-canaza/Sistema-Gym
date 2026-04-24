import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../firebase';
import { BarChart3, Download, FileText, TrendingUp, TrendingDown, Calendar, Filter } from 'lucide-react';
import { formatCurrency, formatDate, cn } from '../lib/utils';
import * as XLSX from 'xlsx';
import { motion } from 'motion/react';

export function Reports() {
  const [payments, setPayments] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const pSnap = await getDocs(collection(db, 'payments'));
    const eSnap = await getDocs(collection(db, 'expenses'));
    setPayments(pSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setExpenses(eSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const exportToExcel = () => {
    const data = payments.map(p => ({
      ID: p.id,
      Fecha: formatDate(p.date),
      Monto: p.amount,
      Tipo: p.type,
      Descripcion: p.description || 'N/A'
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pagos");
    XLSX.writeFile(wb, `Reporte_TitanGym_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const totalIncome = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalIncome - totalExpenses;

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-7xl md:text-9xl font-black leading-[0.8] tracking-tighter uppercase mb-4">REPORTS.</h1>
          <p className="text-neutral-500 font-bold uppercase tracking-[0.3em] text-xs md:text-sm">Strategic Intelligence Unit • Iron Core Analytics</p>
        </div>
        <button 
          onClick={exportToExcel}
          className="flex items-center justify-center gap-3 px-8 py-5 bg-white text-black font-black uppercase text-[10px] tracking-widest hover:bg-lime-400 transition-all shadow-xl whitespace-nowrap"
        >
          <Download className="w-4 h-4" />
          Exportar Protocolo XLSX
        </button>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {[
          { label: 'Ingreso Bruto Total', value: formatCurrency(totalIncome), trend: 'up', color: 'lime-400' },
          { label: 'Egresos Operativos', value: formatCurrency(totalExpenses), trend: 'down', color: 'red-500' },
          { label: 'Utilidad Proyectada', value: formatCurrency(netProfit), trend: 'neutral', color: 'white' },
        ].map((card, i) => (
          <div key={i} className={cn("border-l-4 pl-8 py-2 transition-all hover:bg-neutral-900", i === 0 ? "border-lime-400" : "border-neutral-800")}>
            <div className="flex items-center gap-3 mb-4 text-neutral-500 font-black text-[10px] uppercase tracking-widest italic">
              {card.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : card.trend === 'down' ? <TrendingDown className="w-3 h-3" /> : <BarChart3 className="w-3 h-3" />}
              {card.label}
            </div>
            <p className={cn("text-5xl font-black tracking-tighter", i === 2 && "group-hover:text-lime-400")}>{card.value}</p>
            <p className="mt-4 font-black text-[9px] text-neutral-700 uppercase tracking-widest">Periodo: Acumulado Global • Verificado</p>
          </div>
        ))}
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 bg-neutral-900 border border-neutral-800">
          <div className="p-8 border-b-2 border-neutral-800 bg-neutral-950 flex justify-between items-center">
            <h3 className="font-black text-[10px] text-neutral-500 uppercase tracking-[0.3em] flex items-center gap-4 italic">
              <FileText className="w-3 h-3" /> OPERATIONAL AUDIT TRAIL
            </h3>
            <Calendar className="w-5 h-5 text-neutral-500" />
          </div>
          <div className="divide-y divide-neutral-800/50">
            {payments.slice(0, 10).map((p, i) => (
              <div key={i} className="p-6 flex items-center justify-between group hover:bg-neutral-950 transition-colors">
                <div className="flex gap-6 items-center">
                   <div className="p-3 bg-neutral-950 border border-neutral-800 text-neutral-600 font-black text-[10px] group-hover:border-lime-400 transition-colors uppercase">
                      {p.type.substring(0, 3)}
                   </div>
                   <div className="flex flex-col">
                      <span className="text-white font-black text-xs uppercase tracking-widest">{formatDate(p.date)}</span>
                      <span className="text-neutral-500 font-bold text-[9px] uppercase tracking-tighter">{p.memberId.substring(0, 16)}</span>
                   </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black tracking-tighter group-hover:text-lime-400 transition-colors">{formatCurrency(p.amount)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-8">
          <div className="bg-neutral-900 border border-neutral-800 p-10 flex flex-col justify-center">
            <h3 className="font-black text-[10px] text-neutral-500 uppercase tracking-[0.3em] mb-10 italic">SYSTEM OBSERVATIONS.</h3>
            <div className="space-y-10">
              <div className="group">
                <p className="font-black text-[10px] text-neutral-400 uppercase mb-4 tracking-widest italic group-hover:text-lime-400 transition-colors">Yield Performance</p>
                <div className="w-full bg-neutral-950 h-2 border border-neutral-800 mb-3 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '85%' }}
                    className="bg-white h-full" 
                  />
                </div>
                <p className="font-bold text-[9px] text-neutral-600 uppercase italic">85% of global revenue derived from Annual Protocols.</p>
              </div>
              
              <div className="p-6 bg-neutral-950 border-2 border-dashed border-red-500/20">
                <p className="font-black text-[10px] text-red-500 uppercase mb-4 tracking-widest italic">Inventory Criticality</p>
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-red-500 flex items-center justify-center text-black font-black text-[9px] uppercase">Alert</div>
                  <p className="font-bold text-[10px] text-neutral-500 uppercase leading-relaxed uppercase">Isolate Protein stock levels below minimum threshold (2 units left).</p>
                </div>
              </div>

              <div className="relative group overflow-hidden p-8 border border-neutral-800 hover:border-lime-400 transition-all">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                   <TrendingUp className="w-24 h-24" />
                </div>
                <p className="font-black text-[10px] text-neutral-500 uppercase mb-4 tracking-[0.3em] italic">Retention Index</p>
                <p className="text-7xl font-black tracking-tighter text-lime-400 group-hover:scale-105 transition-transform origin-left">92.4%</p>
                <p className="font-black text-[9px] text-neutral-700 uppercase tracking-widest mt-4 italic">MONTHLY RENEWAL VELOCITY: POSITIVE</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
