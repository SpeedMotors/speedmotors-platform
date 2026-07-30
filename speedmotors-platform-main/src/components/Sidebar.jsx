import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  Car, 
  Wrench, 
  ClipboardList,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from './Button';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useAuth();
  
  const navItems = {
    admin: [
      { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
      { name: 'Leads', path: '/sales/leads', icon: Users },
      { name: 'Job Cards', path: '/service/job-cards', icon: Wrench },
      { name: 'Inventory', path: '/service/inventory', icon: ClipboardList },
    ],
    sales: [
      { name: 'Dashboard', path: '/sales/dashboard', icon: LayoutDashboard },
      { name: 'Leads', path: '/sales/leads', icon: Users },
      { name: 'Quotations', path: '/sales/quotations', icon: ClipboardList },
      { name: 'Cars', path: '/cars', icon: Car },
    ],
    technician: [
      { name: 'Job Cards', path: '/service/job-cards', icon: Wrench },
      { name: 'Repair Status', path: '/service/repair-status', icon: ClipboardList },
      { name: 'Inventory', path: '/service/inventory', icon: ClipboardList },
    ]
  };

  const links = navItems[user?.role] || [];

  return (
    <motion.aside
      initial={{ width: isOpen ? 280 : 80 }}
      animate={{ width: isOpen ? 280 : 80 }}
      transition={{ duration: 0.3, type: "spring", bounce: 0 }}
      className="h-full bg-charcoal-800 border-r border-white/5 flex flex-col relative z-20"
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/5">
        <AnimatePresence mode="wait">
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center gap-2 overflow-hidden whitespace-nowrap"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-red to-accent-amber flex items-center justify-center">
                <Car size={18} className="text-white" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-white">SpeedMotors</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        {!isOpen && (
           <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-red to-accent-amber flex items-center justify-center mx-auto">
             <Car size={20} className="text-white" />
           </div>
        )}
      </div>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-3 top-20 bg-charcoal-700 border border-white/10 rounded-full p-1 text-gray-400 hover:text-white hover:bg-charcoal-600 z-50"
      >
        {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      <div className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-2">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all group",
                isActive 
                  ? "bg-accent-red/10 text-accent-red" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              {({ isActive }) => (
                <>
                  <Icon size={22} className={cn("shrink-0", isActive && "drop-shadow-[0_0_8px_rgba(255,42,42,0.5)]")} />
                  <AnimatePresence mode="wait">
                    {isOpen && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        className="font-medium whitespace-nowrap overflow-hidden"
                      >
                        {link.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      <div className="p-4 border-t border-white/5">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-3 w-full rounded-xl text-gray-400 hover:text-accent-red hover:bg-accent-red/10 transition-all group"
        >
          <LogOut size={22} className="shrink-0 group-hover:drop-shadow-[0_0_8px_rgba(255,42,42,0.5)]" />
          <AnimatePresence mode="wait">
            {isOpen && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="font-medium whitespace-nowrap overflow-hidden"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
