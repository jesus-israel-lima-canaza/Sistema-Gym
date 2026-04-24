import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, Package, CalendarDays, BarChart3, LogOut, Dumbbell, Menu, X } from 'lucide-react';
import { auth } from '../../firebase';
import { useAuth } from '../../AuthContext';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const menuItems = [
  { path: '/', label: 'Panel', icon: LayoutDashboard },
  { path: '/members', label: 'Miembros', icon: Users },
  { path: '/payments', label: 'Pagos', icon: CreditCard },
  { path: '/inventory', label: 'Inventario', icon: Package },
  { path: '/appointments', label: 'Citas', icon: CalendarDays },
  { path: '/reports', label: 'Reportes', icon: BarChart3 },
];

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-neutral-950 text-white font-sans overflow-x-hidden">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-24 bg-neutral-900 border-r border-neutral-800 items-center py-8 justify-between sticky top-0 h-screen shrink-0">
        <div className="space-y-12 flex flex-col items-center w-full">
          {/* Logo */}
          <div className="w-12 h-12 bg-white flex items-center justify-center rounded-sm">
            <div className="w-6 h-6 border-4 border-black rotate-45"></div>
          </div>
          
          <nav className="flex flex-col gap-10 items-center">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link 
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex flex-col items-center gap-1 transition-all group",
                    isActive ? "opacity-100" : "opacity-40 hover:opacity-100"
                  )}
                >
                  <Icon className={cn("w-5 h-5", isActive ? "text-lime-400" : "text-white")} />
                  <span className="text-[9px] uppercase font-bold tracking-widest">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex flex-col items-center gap-6">
          <button 
            onClick={handleLogout}
            className="opacity-40 hover:opacity-100 hover:text-red-500 transition-all"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center text-xs font-black ring-2 ring-neutral-800">
            {profile?.name?.substring(0, 2).toUpperCase() || 'AD'}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header Mobile */}
        <header className="md:hidden p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900 sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white flex items-center justify-center rounded-sm scale-75">
              <div className="w-4 h-4 border-2 border-black rotate-45"></div>
            </div>
            <h1 className="text-xl font-black tracking-tighter uppercase italic">Titan</h1>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </header>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-neutral-900 border-b border-neutral-800 overflow-hidden"
            >
              <nav className="p-4 flex flex-col gap-1 text-[10px] font-bold uppercase tracking-widest">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link 
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-4 px-4 py-4 border-b border-neutral-800 last:border-0"
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  );
                })}
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-4 px-4 py-4 text-red-500"
                >
                  <LogOut className="w-4 h-4" />
                  SALIR
                </button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 p-6 md:p-12">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
