const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'src');

const files = [
  'components/MainLayout.jsx',
  'components/Navbar.jsx',
  'components/Sidebar.jsx',
  'components/Button.jsx',
  'components/Card.jsx',
  'pages/Home.jsx',
  'pages/Login.jsx',
  'pages/Register.jsx',
  'pages/customer/Cars.jsx',
  'pages/customer/TestDrive.jsx',
  'pages/customer/ServiceBooking.jsx',
  'pages/customer/Feedback.jsx',
  'pages/sales/Leads.jsx',
  'pages/sales/Quotations.jsx',
  'pages/sales/SalesDashboard.jsx',
  'pages/service/JobCards.jsx',
  'pages/service/RepairStatus.jsx',
  'pages/admin/Dashboard.jsx',
  'pages/admin/Analytics.jsx'
];

const template = (name) => `import React from 'react';
import { motion } from 'framer-motion';

const ${name} = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6"
    >
      <h1 className="text-3xl font-display font-bold text-white mb-6">${name} Page</h1>
      <div className="glass-card p-6">
        <p className="text-gray-300">Content for ${name} goes here.</p>
      </div>
    </motion.div>
  );
};

export default ${name};
`;

files.forEach(file => {
  const fullPath = path.join(baseDir, file);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const componentName = path.basename(file, '.jsx');
  if (!fs.existsSync(fullPath)) {
    fs.writeFileSync(fullPath, template(componentName));
  }
});

console.log('Scaffolding complete!');
