import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import Card, { CardContent } from '../../components/Card';
import { Calendar, User, ChevronRight, Check } from 'lucide-react';

const statuses = ['New', 'Contacted', 'Quoted', 'Won'];

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await api.get('/leads');
      // The API returns standard { success: true, data: [...] }
      setLeads(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch leads:', err);
      setError('Failed to load leads pipeline.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const moveLead = async (id, currentStatus) => {
    const currentIndex = statuses.indexOf(currentStatus);
    if (currentIndex < statuses.length - 1) {
      const nextStatus = statuses[currentIndex + 1];
      try {
        const res = await api.patch(`/leads/${id}`, { status: nextStatus });
        if (res.data.success) {
          // Update state locally with returning updated lead details
          setLeads(prev => prev.map(lead => lead.id === id ? { ...lead, status: nextStatus } : lead));
        }
      } catch (err) {
        console.error('Failed to move lead:', err);
      }
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Leads Pipeline</h1>
          <p className="text-gray-400">Manage and track your sales inquiries.</p>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading leads pipeline...</div>
        ) : error ? (
          <div className="text-center py-12 text-red-400">{error}</div>
        ) : (
          <div className="flex gap-6 min-w-max h-full">
            {statuses.map(status => {
              const columnLeads = leads.filter(l => l.status === status);
              
              return (
                <div key={status} className="w-80 flex flex-col h-full bg-charcoal-800/30 rounded-2xl p-4 border border-white/5">
                  <div className="flex items-center justify-between mb-4 px-2">
                    <h3 className="font-semibold text-white">{status}</h3>
                    <span className="bg-white/10 text-gray-300 text-xs px-2 py-1 rounded-full">
                      {columnLeads.length}
                    </span>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                    <AnimatePresence>
                      {columnLeads.map(lead => (
                        <motion.div
                          key={lead.id}
                          layout
                          initial={{ opacity: 0, y: 20, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                          transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        >
                          <Card hoverEffect className="cursor-pointer group">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <h4 className="font-medium text-white">{lead.name}</h4>
                                <span className="text-xs text-gray-400">#{lead.id}</span>
                              </div>
                              
                              <div className="space-y-2 mb-4">
                                <div className="flex items-center text-xs text-gray-400 gap-2">
                                  <User size={14} /> {lead.car ? `${lead.car.make} ${lead.car.model}` : `Car ID: ${lead.carId}`}
                                </div>
                                <div className="flex items-center text-xs text-gray-400 gap-2">
                                  <Calendar size={14} /> {lead.date}
                                </div>
                              </div>

                              {status !== 'Won' && (
                                <button 
                                  onClick={() => moveLead(lead.id, status)}
                                  className="w-full py-2 bg-white/5 hover:bg-accent-red hover:text-white text-gray-300 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                  Move to {statuses[statuses.indexOf(status) + 1]}
                                  <ChevronRight size={16} />
                                </button>
                              )}
                              {status === 'Won' && (
                                <div className="w-full py-2 bg-green-500/20 text-green-400 rounded-lg text-sm flex items-center justify-center gap-2">
                                  <Check size={16} /> Closed Won
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leads;
