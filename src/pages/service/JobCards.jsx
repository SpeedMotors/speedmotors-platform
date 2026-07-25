import React from 'react';
import { motion } from 'framer-motion';

const JobCards = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6"
    >
      <h1 className="text-3xl font-display font-bold text-white mb-6">JobCards Page</h1>
      <div className="glass-card p-6">
        <p className="text-gray-300">Content for JobCards goes here.</p>
      </div>
    </motion.div>
  );
};

export default JobCards;
