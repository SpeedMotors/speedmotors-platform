import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, Menu, User, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTestDrive } from '../context/TestDriveContext';
import Button, { cn } from './Button';

const Navbar = ({ toggleSidebar, showToggle }) => {
  const { user, logout } = useAuth();
  const { testDriveCars } = useTestDrive();
  const navigate = useNavigate();

  return (
    <header className="h-16 border-b border-white/5 bg-charcoal-900/80 backdrop-blur-md sticky top-0 z-10">
      <div className="h-full px-4 md:px-6 flex items-center justify-between">
        
        <div className="flex items-center gap-4">
          {showToggle && (
            <button 
              onClick={toggleSidebar}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 md:hidden"
            >
              <Menu size={24} />
            </button>
          )}

          {(!user || user.role === 'customer') && (
            <NavLink to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-red to-accent-amber flex items-center justify-center transition-transform group-hover:scale-105">
                <Car size={22} className="text-white" />
              </div>
              <span className="font-display font-bold text-2xl tracking-tight text-white hidden sm:block">
                SpeedMotors
              </span>
            </NavLink>
          )}
        </div>

        {/* Customer / Public Navigation Links */}
        {(!user || user.role === 'customer') && (
          <nav className="hidden md:flex items-center gap-1 bg-charcoal-800/50 p-1 rounded-2xl border border-white/5">
            {[
              { name: 'Home', path: '/' },
              { name: 'Cars', path: '/cars' },
              { name: 'Test Drive', path: '/test-drive' },
              { name: 'Service', path: '/service-booking' }
            ].map(link => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) => cn(
                  "relative px-4 py-2 rounded-xl text-sm font-medium transition-all",
                  isActive ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                {link.name}
                {link.name === 'Test Drive' && testDriveCars.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent-red text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {testDriveCars.length}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-accent-red rounded-full animate-pulse" />
              </button>
              
              <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-medium text-white">{user.name}</span>
                  <span className="text-xs text-gray-400 capitalize">{user.role}</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-navy-700 border border-white/10 flex items-center justify-center overflow-hidden">
                  <User size={20} className="text-gray-300" />
                </div>
                {user.role === 'customer' && (
                  <Button variant="ghost" size="sm" onClick={logout} className="ml-2">
                    Logout
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => navigate('/login')}>Sign In</Button>
              <Button onClick={() => navigate('/register')}>Sign Up</Button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default Navbar;
