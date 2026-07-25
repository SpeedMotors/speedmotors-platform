import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

// Pages
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';

// Customer
import Cars from '../pages/customer/Cars';
import TestDrive from '../pages/customer/TestDrive';
import ServiceBooking from '../pages/customer/ServiceBooking';
import Feedback from '../pages/customer/Feedback';

// Sales
import Leads from '../pages/sales/Leads';
import Quotations from '../pages/sales/Quotations';
import SalesDashboard from '../pages/sales/SalesDashboard';

// Service
import JobCards from '../pages/service/JobCards';
import RepairStatus from '../pages/service/RepairStatus';

// Admin
import Dashboard from '../pages/admin/Dashboard';
import Analytics from '../pages/admin/Analytics';

// Layouts (for Sidebar/Navbar)
import MainLayout from '../components/MainLayout';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />; // or to unauthorized page
  }
  
  return children;
};

const AppRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes without Sidebar */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes inside Main Layout (Sidebar/Navbar) */}
        <Route path="/" element={<MainLayout />}>
          
          {/* Customer Routes */}
          <Route path="cars" element={<ProtectedRoute allowedRoles={['customer', 'admin', 'sales']}><Cars /></ProtectedRoute>} />
          <Route path="test-drive" element={<ProtectedRoute allowedRoles={['customer', 'admin', 'sales']}><TestDrive /></ProtectedRoute>} />
          <Route path="service-booking" element={<ProtectedRoute allowedRoles={['customer', 'admin']}><ServiceBooking /></ProtectedRoute>} />
          <Route path="feedback" element={<ProtectedRoute allowedRoles={['customer', 'admin']}><Feedback /></ProtectedRoute>} />

          {/* Sales Routes */}
          <Route path="sales">
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<ProtectedRoute allowedRoles={['sales', 'admin']}><SalesDashboard /></ProtectedRoute>} />
            <Route path="leads" element={<ProtectedRoute allowedRoles={['sales', 'admin']}><Leads /></ProtectedRoute>} />
            <Route path="quotations" element={<ProtectedRoute allowedRoles={['sales', 'admin']}><Quotations /></ProtectedRoute>} />
          </Route>

          {/* Service Routes */}
          <Route path="service">
            <Route index element={<Navigate to="job-cards" replace />} />
            <Route path="job-cards" element={<ProtectedRoute allowedRoles={['technician', 'admin', 'sales']}><JobCards /></ProtectedRoute>} />
            <Route path="repair-status" element={<ProtectedRoute allowedRoles={['technician', 'admin', 'customer']}><RepairStatus /></ProtectedRoute>} />
          </Route>

          {/* Admin Routes */}
          <Route path="admin">
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<ProtectedRoute allowedRoles={['admin']}><Dashboard /></ProtectedRoute>} />
            <Route path="analytics" element={<ProtectedRoute allowedRoles={['admin']}><Analytics /></ProtectedRoute>} />
          </Route>

        </Route>
      </Routes>
    </AnimatePresence>
  );
};

export default AppRoutes;
