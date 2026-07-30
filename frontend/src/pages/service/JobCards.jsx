import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Wrench, User, Calendar, DollarSign, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import Card, { CardContent } from '../../components/Card';
import Button from '../../components/Button';
import api from '../../services/api';

const STATUSES = ['Received', 'Diagnosis', 'Repair', 'QC', 'Ready'];

const JobCards = () => {
  const [jobCards, setJobCards] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [techLoading, setTechLoading] = useState(false);
  const [error, setError] = useState(null);

  // Edit fields
  const [status, setStatus] = useState('Received');
  const [technicianId, setTechnicianId] = useState('');
  const [expectedCompletion, setExpectedCompletion] = useState('');
  const [partsList, setPartsList] = useState([]);
  const [newPartName, setNewPartName] = useState('');
  const [newPartPrice, setNewPartPrice] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Fetch job cards
  const fetchJobCards = async () => {
    try {
      setLoading(true);
      const res = await api.get('/job-cards');
      if (res.data.success) {
        setJobCards(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch job cards:', err);
      setError('Could not fetch active workshop queue.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch technician accounts list
  const fetchTechnicians = async () => {
    try {
      setTechLoading(true);
      const res = await api.get('/auth/technicians');
      if (res.data.success) {
        setTechnicians(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch technicians:', err);
    } finally {
      setTechLoading(false);
    }
  };

  useEffect(() => {
    fetchJobCards();
    fetchTechnicians();
  }, []);

  const handleCardSelect = (card) => {
    setSelectedCard(card);
    setStatus(card.status);
    setTechnicianId(card.technicianId || '');
    setExpectedCompletion(card.expectedCompletion || '');
    setPartsList(Array.isArray(card.parts) ? card.parts : []);
    setNewPartName('');
    setNewPartPrice('');
  };

  const handleAddPart = () => {
    if (!newPartName || !newPartPrice) return;
    const price = parseFloat(newPartPrice);
    if (isNaN(price) || price < 0) return;

    const updatedParts = [...partsList, { name: newPartName, price }];
    setPartsList(updatedParts);
    setNewPartName('');
    setNewPartPrice('');
  };

  const handleRemovePart = (index) => {
    const updatedParts = partsList.filter((_, i) => i !== index);
    setPartsList(updatedParts);
  };

  const handleSaveCardDetails = async (e) => {
    e.preventDefault();
    if (!selectedCard) return;
    setIsSaving(true);

    try {
      const payload = {
        status,
        technicianId: technicianId ? parseInt(technicianId, 10) : null,
        expectedCompletion,
        parts: partsList
      };

      const res = await api.patch(`/job-cards/${selectedCard.id}`, payload);
      if (res.data.success) {
        const updated = res.data.data;
        // Update local list
        setJobCards(prev => prev.map(c => c.id === updated.id ? updated : c));
        setSelectedCard(updated);
        alert('Job card updated successfully!');
      }
    } catch (err) {
      console.error('Failed to update job card:', err);
      alert(err.response?.data?.message || 'Failed to update job card parameters.');
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate sum of parts price
  const computedTotal = partsList.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-6xl mx-auto space-y-8"
    >
      <div>
        <h1 className="text-3xl font-display font-bold text-white mb-2">Workshop Job Cards</h1>
        <p className="text-gray-400">Manage vehicle repairs, assign staff, and track diagnostic checklists.</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading active queue...</div>
      ) : error ? (
        <div className="text-center py-12 text-red-400">{error}</div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Job Card List */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-lg font-bold text-white mb-2">Repair Queue ({jobCards.length})</h3>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              {jobCards.length === 0 ? (
                <div className="bg-charcoal-800/40 border border-white/5 p-6 rounded-xl text-center text-gray-500 text-sm">
                  No active service job cards.
                </div>
              ) : (
                jobCards.map(card => {
                  const isSelected = selectedCard?.id === card.id;
                  return (
                    <div 
                      key={card.id}
                      onClick={() => handleCardSelect(card)}
                      className={`cursor-pointer p-4 rounded-xl border transition-all ${
                        isSelected 
                          ? 'bg-accent-red/20 border-accent-red shadow-lg' 
                          : 'bg-charcoal-800/40 border-white/5 hover:border-white/10 hover:bg-charcoal-800/60'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-mono bg-white/10 text-gray-300 px-2 py-0.5 rounded">
                          {card.id}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                          card.status === 'Ready' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-accent-red/20 text-accent-red'
                        }`}>
                          {card.status}
                        </span>
                      </div>
                      <h4 className="text-white font-semibold text-sm">{card.customerName}</h4>
                      <p className="text-xs text-gray-400 mt-1">{card.carMake}</p>
                      <div className="mt-3 pt-3 border-t border-white/5 flex justify-between items-center text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <User size={12} /> {card.technician?.name || 'Unassigned'}
                        </span>
                        <span className="font-mono text-white font-bold">
                          ${card.totalCost?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Job Card Editor / Detail view */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {selectedCard ? (
                <motion.div
                  key={selectedCard.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card className="glass-card">
                    <CardContent className="p-6 space-y-6">
                      
                      {/* Header */}
                      <div className="flex justify-between items-center border-b border-white/5 pb-4">
                        <div>
                          <h3 className="text-xl font-display font-bold text-white">
                            Modify Job Card Details
                          </h3>
                          <p className="text-xs text-gray-400 font-mono mt-1">ID: {selectedCard.id}</p>
                        </div>
                        {selectedCard.isPaid && (
                          <span className="flex items-center gap-1 bg-green-500/20 text-green-400 text-xs px-3 py-1 rounded-full font-bold">
                            <CheckCircle2 size={12} /> Paid & Cleared
                          </span>
                        )}
                      </div>

                      {/* Info Overview */}
                      <div className="grid md:grid-cols-2 gap-4 bg-white/5 p-4 rounded-xl text-sm">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Owner name:</span>
                            <span className="text-white font-medium">{selectedCard.customerName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Vehicle model:</span>
                            <span className="text-white font-medium">{selectedCard.carMake}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Reported symptom:</span>
                            <span className="text-white font-medium italic">{selectedCard.issue}</span>
                          </div>
                        </div>
                      </div>

                      {/* Edit Form */}
                      <form onSubmit={handleSaveCardDetails} className="space-y-6">
                        <div className="grid md:grid-cols-3 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Repair Stage</label>
                            <select 
                              value={status} 
                              onChange={e => setStatus(e.target.value)}
                              className="w-full bg-charcoal-800 border border-white/10 rounded-xl py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-accent-red"
                            >
                              {STATUSES.map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Assign Technician</label>
                            <select 
                              value={technicianId} 
                              onChange={e => setTechnicianId(e.target.value)}
                              className="w-full bg-charcoal-800 border border-white/10 rounded-xl py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-accent-red"
                            >
                              <option value="">-- Choose technician --</option>
                              {technicians.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Expected completion</label>
                            <input 
                              type="text" 
                              value={expectedCompletion}
                              onChange={e => setExpectedCompletion(e.target.value)}
                              placeholder="e.g. Tomorrow, 5:00 PM"
                              className="w-full bg-charcoal-800 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-accent-red text-sm"
                            />
                          </div>
                        </div>

                        {/* Parts & Billing Section */}
                        <div className="border-t border-white/5 pt-6">
                          <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                            <DollarSign size={16} /> Parts & Labor Charges Log
                          </h4>
                          
                          <div className="space-y-3 mb-4">
                            {partsList.map((part, index) => (
                              <div key={index} className="flex justify-between items-center bg-charcoal-800 p-2.5 rounded-lg border border-white/5 text-sm">
                                <span className="text-gray-300 font-medium">{part.name}</span>
                                <div className="flex items-center gap-4">
                                  <span className="font-mono text-white">${parseFloat(part.price).toFixed(2)}</span>
                                  <button 
                                    type="button" 
                                    onClick={() => handleRemovePart(index)}
                                    className="text-gray-500 hover:text-accent-red transition-colors"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Add part inline form */}
                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="col-span-2">
                              <input 
                                type="text"
                                value={newPartName}
                                onChange={e => setNewPartName(e.target.value)}
                                placeholder="Service description or part name"
                                className="w-full bg-charcoal-800 border border-white/10 rounded-xl py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-accent-red text-sm"
                              />
                            </div>
                            <div className="flex gap-2">
                              <input 
                                type="number"
                                value={newPartPrice}
                                onChange={e => setNewPartPrice(e.target.value)}
                                placeholder="Price"
                                className="w-full bg-charcoal-800 border border-white/10 rounded-xl py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-accent-red text-sm font-mono"
                              />
                              <Button type="button" size="sm" onClick={handleAddPart}>
                                <Plus size={16} />
                              </Button>
                            </div>
                          </div>

                          <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl mt-6">
                            <span className="text-white font-medium">Estimated Invoice Balance</span>
                            <span className="text-xl font-bold text-accent-red font-mono">
                              ${computedTotal.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Customer feedback preview if rated */}
                        {selectedCard.rating !== null && (
                          <div className="border-t border-white/5 pt-6 bg-accent-amber/5 p-4 rounded-xl border border-accent-amber/10">
                            <h5 className="text-accent-amber font-bold text-sm flex items-center gap-1.5 mb-2">
                              ★ Customer Rating & Review
                            </h5>
                            <div className="flex gap-1 mb-2 text-accent-amber">
                              {Array.from({ length: selectedCard.rating }).map((_, i) => (
                                <span key={i}>★</span>
                              ))}
                            </div>
                            <p className="text-xs text-gray-300 italic">
                              "{selectedCard.feedback || 'No written comment left by customer.'}"
                            </p>
                          </div>
                        )}

                        <div className="flex justify-end gap-4 border-t border-white/5 pt-6">
                          <Button type="submit" disabled={isSaving}>
                            {isSaving ? 'Saving changes...' : 'Save Job Card Parameters'}
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <div className="bg-charcoal-800/20 border border-white/5 border-dashed rounded-3xl p-12 text-center text-gray-500 h-full flex flex-col justify-center items-center">
                  <Wrench size={40} className="mb-4 text-gray-600 animate-pulse" />
                  <h3 className="text-white font-bold mb-2">No Card Selected</h3>
                  <p className="text-sm max-w-xs">
                    Choose a pending service ticket from the queue list to update repair indicators or parts cost summaries.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default JobCards;
