import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, Package, CalendarDays, BarChart3, LogOut, Dumbbell, Menu, X, ShieldCheck, Sun, Moon, Edit3, Save } from 'lucide-react';
import { auth } from '../../firebase';
import { useAuth } from '../../AuthContext';
import { useTheme } from '../../ThemeContext';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, updateProfileName } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(profile?.name || '');

  const menuItems = [
    { path: '/', label: 'Panel', icon: LayoutDashboard },
    { path: '/members', label: 'Miembros', icon: Users },
    { path: '/payments', label: 'Pagos', icon: CreditCard },
    { path: '/inventory', label: 'Inventario', icon: Package },
    { path: '/appointments', label: 'Citas', icon: CalendarDays },
    { path: '/reports', label: 'Reportes', icon: BarChart3 },
    ...(profile?.role === 'admin' ? [{ path: '/staff', label: 'Personal', icon: ShieldCheck }] : []),
  ];

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  const handleSaveName = async () => {
    if (newName.trim() && newName !== profile?.name) {
      await updateProfileName(newName.trim());
    }
    setIsEditingName(false);
  };

  return (
    <div className={cn(
      "flex min-h-screen font-sans overflow-x-hidden transition-colors duration-300",
      theme === 'dark' ? "bg-neutral-950 text-white" : "bg-neutral-50 text-neutral-950"
    )}>
      {/* Sidebar Desktop */}
      <aside className={cn(
        "hidden md:flex flex-col w-24 border-r items-center py-8 justify-between sticky top-0 h-screen shrink-0 transition-colors",
        theme === 'dark' ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-300"
      )}>
        <div className="space-y-12 flex flex-col items-center w-full">
          {/* Logo */}
          <div className={cn(
            "w-12 h-12 flex items-center justify-center rounded-sm transition-colors",
            theme === 'dark' ? "bg-white" : "bg-black"
          )}>
            <div className={cn(
              "w-6 h-6 border-4 rotate-45",
              theme === 'dark' ? "border-black" : "border-white"
            )}></div>
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
                    isActive ? "opacity-100" : "opacity-60 hover:opacity-100"
                  )}
                >
                  <Icon className={cn("w-5 h-5", isActive ? "text-lime-400" : theme === 'dark' ? "text-white" : "text-neutral-900 group-hover:text-black")} />
                  <span className={cn(
                    "text-[9px] uppercase font-black tracking-widest",
                    theme === 'dark' ? "text-white/60 group-hover:text-white" : "text-neutral-600 group-hover:text-black"
                  )}>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex flex-col items-center gap-6">
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-neutral-500/10 transition-colors"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-lime-400" /> : <Moon className="w-5 h-5 text-neutral-600" />}
          </button>
          <button 
            onClick={handleLogout}
            className="opacity-40 hover:opacity-100 hover:text-red-500 transition-all"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
          
          <div className="relative group">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center text-xs font-black ring-2",
              theme === 'dark' ? "bg-neutral-700 ring-neutral-800" : "bg-neutral-200 ring-neutral-300"
            )}>
              {profile?.name?.substring(0, 2).toUpperCase() || 'AD'}
            </div>
            
            {/* Context Info on Hover */}
            <div className={cn(
              "absolute left-full ml-4 top-1/2 -translate-y-1/2 p-4 min-w-[200px] shadow-2xl border invisible group-hover:visible z-50",
              theme === 'dark' ? "bg-neutral-900 border-neutral-800 text-white" : "bg-white border-neutral-300 text-black shadow-neutral-200"
            )}>
              <div className="flex justify-between items-start mb-2">
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-widest",
                  theme === 'dark' ? "text-neutral-500" : "text-neutral-400"
                )}>Profile Protocol</span>
                <button 
                  onClick={() => {
                    setIsEditingName(true);
                    setNewName(profile?.name || '');
                  }}
                  className="text-lime-500 hover:text-lime-600"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
              </div>
              
              {isEditingName ? (
                <div className="space-y-2">
                  <input 
                    type="text"
                    className={cn(
                      "w-full text-xs font-bold p-1 bg-transparent border-b outline-none",
                      theme === 'dark' ? "border-neutral-700 text-white" : "border-neutral-400 text-black"
                    )}
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button onClick={handleSaveName} className="text-[9px] font-black uppercase text-lime-500">Save</button>
                    <button onClick={() => setIsEditingName(false)} className="text-[9px] font-black uppercase text-red-500">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm font-black uppercase italic mb-1">{profile?.name}</p>
                  <p className={cn(
                    "text-[9px] font-bold uppercase tracking-widest",
                    theme === 'dark' ? "text-neutral-500" : "text-neutral-500"
                  )}>{profile?.role}</p>
                </>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header Mobile */}
        <header className={cn(
          "md:hidden p-4 border-b flex items-center justify-between sticky top-0 z-50 transition-colors",
          theme === 'dark' ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"
        )}>
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 flex items-center justify-center rounded-sm scale-75",
              theme === 'dark' ? "bg-white" : "bg-black"
            )}>
              <div className={cn(
                "w-4 h-4 border-2 rotate-45",
                theme === 'dark' ? "border-black" : "border-white"
              )}></div>
            </div>
            <h1 className="text-xl font-black tracking-tighter uppercase italic">Titan</h1>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={toggleTheme}>
              {theme === 'dark' ? <Sun className="w-5 h-5 text-lime-400" /> : <Moon className="w-5 h-5" />}
            </button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </header>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className={cn(
                "md:hidden border-b overflow-hidden",
                theme === 'dark' ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"
              )}
            >
              <div className="p-6 border-b border-neutral-800/20">
                 <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center text-sm font-black ring-2",
                      theme === 'dark' ? "bg-neutral-700 ring-neutral-800" : "bg-neutral-200 ring-neutral-300"
                    )}>
                      {profile?.name?.substring(0, 2).toUpperCase() || 'AD'}
                    </div>
                    <div>
                      {isEditingName ? (
                         <div className="flex gap-2 items-center">
                            <input 
                              type="text"
                              className="bg-transparent border-b border-lime-400 outline-none font-bold text-xs"
                              value={newName}
                              onChange={(e) => setNewName(e.target.value)}
                            />
                            <button onClick={handleSaveName}><Save className="w-4 h-4 text-lime-400" /></button>
                         </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <p className="font-black uppercase italic">{profile?.name}</p>
                          <button onClick={() => { setIsEditingName(true); setNewName(profile?.name || ''); }}><Edit3 className="w-3 h-3 text-neutral-500" /></button>
                        </div>
                      )}
                      <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">{profile?.role}</p>
                    </div>
                 </div>
              </div>
              <nav className="p-4 flex flex-col gap-1 text-[10px] font-bold uppercase tracking-widest">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link 
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-4 px-4 py-4 border-b last:border-0",
                        theme === 'dark' ? "border-neutral-800" : "border-neutral-100"
                      )}
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

        <div className="flex-1 p-6 md:p-12 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
