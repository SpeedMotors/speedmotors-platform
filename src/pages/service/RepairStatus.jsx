import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Clipboard, Wrench, Search, ShieldCheck, Car } from 'lucide-react';
import Card, { CardContent } from '../../components/Card';
import { mockData } from '../../services/api';

const timelineStages = [
  { id: 'Received', icon: Clipboard, label: 'Received' },
  { id: 'Diagnosis', icon: Search, label: 'Diagnosis' },
  { id: 'Repair', icon: Wrench, label: 'In Repair' },
  { id: 'QC', icon: ShieldCheck, label: 'Quality Check' },
  { id: 'Ready', icon: Car, label: 'Ready for Delivery' }
];

const RepairStatus = () => {
  const [activeJob, setActiveJob] = useState(mockData.jobCards[0]);

  const currentStageIndex = timelineStages.findIndex(s => s.id === activeJob.status);

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold text-white mb-2">Repair Status</h1>
        <p className="text-gray-400">Track the live progress of ongoing repairs.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Job Selector */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <div className="p-4 border-b border-white/5">
              <h3 className="font-display font-semibold text-white">Active Jobs</h3>
            </div>
            <CardContent className="p-2 space-y-2 max-h-[600px] overflow-y-auto">
              {mockData.jobCards.map(job => (
                <button
                  key={job.id}
                  onClick={() => setActiveJob(job)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    activeJob.id === job.id 
                      ? 'bg-accent-red/10 border-accent-red/50' 
                      : 'bg-white/5 border-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-white">{job.id}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      job.status === 'Ready' ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-gray-300'
                    }`}>
                      {job.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-1">{job.carMake}</p>
                  <p className="text-xs text-gray-500 truncate">{job.issue}</p>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Live Tracker */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeJob.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="h-full">
                <CardContent className="p-8">
                  <div className="mb-8">
                    <h2 className="text-2xl font-display font-bold text-white mb-2">Job Details: {activeJob.id}</h2>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                      <span><strong>Customer:</strong> {activeJob.customerName}</span>
                      <span><strong>Vehicle:</strong> {activeJob.carMake}</span>
                      <span><strong>Est. Completion:</strong> {activeJob.expectedCompletion}</span>
                    </div>
                  </div>

                  {/* Horizontal Timeline */}
                  <div className="relative py-12">
                    {/* Background Track */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-white/10 rounded-full" />
                    
                    {/* Active Track */}
                    <motion.div 
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-accent-red rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(currentStageIndex / (timelineStages.length - 1)) * 100}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />

                    <div className="relative flex justify-between">
                      {timelineStages.map((stage, idx) => {
                        const isCompleted = idx < currentStageIndex;
                        const isActive = idx === currentStageIndex;
                        const StageIcon = stage.icon;
                        
                        return (
                          <div key={stage.id} className="flex flex-col items-center relative">
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: idx * 0.15 + 0.5, type: "spring" }}
                              className={`w-12 h-12 rounded-full flex items-center justify-center relative z-10 transition-colors duration-500 ${
                                isCompleted ? 'bg-accent-red text-white' :
                                isActive ? 'bg-charcoal-800 border-2 border-accent-red text-accent-red' :
                                'bg-charcoal-800 border-2 border-white/10 text-gray-500'
                              }`}
                            >
                              {isCompleted ? <Check size={20} /> : <StageIcon size={20} />}
                              
                              {/* Pulse Effect for Active Stage */}
                              {isActive && (
                                <span className="absolute inset-0 rounded-full border-2 border-accent-red animate-ping opacity-75" />
                              )}
                            </motion.div>
                            
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.15 + 0.7 }}
                              className="absolute top-16 text-center w-24 -ml-6"
                            >
                              <span className={`text-xs font-medium ${
                                isActive ? 'text-accent-red' : 
                                isCompleted ? 'text-gray-200' : 'text-gray-500'
                              }`}>
                                {stage.label}
                              </span>
                            </motion.div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-16 bg-white/5 rounded-xl p-6 border border-white/5">
                    <h4 className="font-semibold text-white mb-2">Issue Description</h4>
                    <p className="text-gray-400">{activeJob.issue}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

export default RepairStatus;
