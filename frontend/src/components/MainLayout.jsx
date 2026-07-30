import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useAuth } from '../context/AuthContext';

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden bg-charcoal-900">
      {/* Sidebar for authenticated internal users */}
      {user && user.role !== 'customer' && (
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      )}
      
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Navbar for all users, but different content based on role */}
        <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} showToggle={user && user.role !== 'customer'} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-charcoal-900">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
