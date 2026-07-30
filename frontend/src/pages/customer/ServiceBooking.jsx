import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Wrench, FileText, CheckCircle2, Star, CreditCard, ChevronRight, Activity, Bell, RefreshCw } from 'lucide-react';
import Card, { CardContent } from '../../components/Card';
import Button from '../../components/Button';
import api from '../../services/api';

// Workflow states: BOOKING -> TRACKING -> PAYMENT -> FEEDBACK -> DONE
const STAGES = {
  BOOKING: 'BOOKING',
  TRACKING: 'TRACKING',
  PAYMENT: 'PAYMENT',
  FEEDBACK: 'FEEDBACK',
  DONE: 'DONE'
};

const TRACKING_STEPS = ['Booked', 'In Progress', 'Quality Check', 'Ready for Delivery'];

const getTrackingStep = (status) => {
  switch (status) {
    case 'Received':
    case 'Diagnosis':
      return 0;
    case 'Repair':
      return 1;
    case 'QC':
      return 2;
    case 'Ready':
      return 3;
    default:
      return 0;
  }
};

const ServiceBooking = () => {
  const [currentStage, setCurrentStage] = useState(STAGES.BOOKING);
  const [jobCard, setJobCard] = useState(null);
  const [trackingStep, setTrackingStep] = useState(0); // 0 to 3
  const [isProcessing, setIsProcessing] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    make: '',
    model: '',
    year: '',
    date: '',
    serviceType: 'Routine Maintenance',
    issue: ''
  });

  // Check for active in-progress bookings on load
  const checkActiveBooking = async () => {
    try {
      const res = await api.get('/job-cards');
      if (res.data.success && res.data.data && res.data.data.length > 0) {
        // Find the first job card that is not paid, or is paid but feedback not given
        const activeCard = res.data.data.find(jc => !jc.isPaid || jc.rating === null);
        if (activeCard) {
          setJobCard(activeCard);
          if (!activeCard.isPaid) {
            if (activeCard.status === 'Ready') {
              setCurrentStage(STAGES.PAYMENT);
            } else {
              setCurrentStage(STAGES.TRACKING);
              setTrackingStep(getTrackingStep(activeCard.status));
            }
          } else if (activeCard.rating === null) {
            setCurrentStage(STAGES.FEEDBACK);
          } else {
            setCurrentStage(STAGES.DONE);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load active job card:', err);
    }
  };

  useEffect(() => {
    checkActiveBooking();
  }, []);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const res = await api.post('/service-bookings', {
        name: formData.name,
        phone: formData.phone,
        make: formData.make,
        model: formData.model,
        year: parseInt(formData.year, 10),
        date: formData.date,
        serviceType: formData.serviceType,
        issue: formData.issue
      });

      if (res.data.success) {
        // Fetch newly created Job Card
        const jcRes = await api.get('/job-cards');
        if (jcRes.data.success && jcRes.data.data && jcRes.data.data.length > 0) {
          const newCard = jcRes.data.data[0];
          setJobCard(newCard);
          setTrackingStep(0);
          setCurrentStage(STAGES.TRACKING);
        }
      }
    } catch (err) {
      console.error('Booking submission failed:', err);
      alert(err.response?.data?.message || 'Failed to book service.');
    } finally {
      setIsProcessing(false);
    }
  };

  const refreshStatus = async () => {
    if (!jobCard) return;
    setIsProcessing(true);
    try {
      const res = await api.get(`/job-cards/${jobCard.id}`);
      if (res.data.success) {
        const updatedCard = res.data.data;
        setJobCard(updatedCard);
        const step = getTrackingStep(updatedCard.status);
        setTrackingStep(step);
        
        if (updatedCard.status === 'Ready' && !updatedCard.isPaid) {
          setCurrentStage(STAGES.PAYMENT);
        }
      }
    } catch (err) {
      console.error('Failed to refresh job card status:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = async () => {
    if (!jobCard) return;
    setIsProcessing(true);
    try {
      const res = await api.patch(`/job-cards/${jobCard.id}`, { isPaid: true });
      if (res.data.success) {
        setJobCard(res.data.data);
        setCurrentStage(STAGES.FEEDBACK);
      }
    } catch (err) {
      console.error('Payment failed:', err);
      alert('Failed to simulate secure gateway payment.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!jobCard) return;
    setIsProcessing(true);
    try {
      const res = await api.patch(`/job-cards/${jobCard.id}`, {
        rating: rating,
        feedback: feedbackText
      });
      if (res.data.success) {
        setCurrentStage(STAGES.DONE);
      }
    } catch (err) {
      console.error('Feedback submission failed:', err);
      alert('Failed to save service rating.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white mb-2">Service Center</h1>
        <p className="text-gray-400">Complete vehicle care, transparency, and top-tier expertise.</p>
      </div>

      <AnimatePresence mode="wait">
        
        {/* ================= STAGE: BOOKING ================= */}
        {currentStage === STAGES.BOOKING && (
          <motion.div
            key="booking"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid lg:grid-cols-2 gap-8"
          >
            <div>
              <Card>
                <CardContent className="p-8">
                  <h3 className="text-2xl font-display font-bold text-white mb-6">Book an Appointment</h3>
                  <form onSubmit={handleBookingSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                        <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-charcoal-800 border border-white/10 rounded-xl py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-accent-red" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                        <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-charcoal-800 border border-white/10 rounded-xl py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-accent-red" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Make</label>
                        <input required type="text" value={formData.make} onChange={e => setFormData({...formData, make: e.target.value})} className="w-full bg-charcoal-800 border border-white/10 rounded-xl py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-accent-red" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Model</label>
                        <input required type="text" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} className="w-full bg-charcoal-800 border border-white/10 rounded-xl py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-accent-red" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Year</label>
                        <input required type="text" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} className="w-full bg-charcoal-800 border border-white/10 rounded-xl py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-accent-red" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Service Type</label>
                        <select value={formData.serviceType} onChange={e => setFormData({...formData, serviceType: e.target.value})} className="w-full bg-charcoal-800 border border-white/10 rounded-xl py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-accent-red">
                          <option>Routine Maintenance</option>
                          <option>Repairs</option>
                          <option>Inspection & Diagnostics</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Preferred Date</label>
                        <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-charcoal-800 border border-white/10 rounded-xl py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-accent-red" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Describe the Issue (Optional)</label>
                      <textarea rows="3" value={formData.issue} onChange={e => setFormData({...formData, issue: e.target.value})} className="w-full bg-charcoal-800 border border-white/10 rounded-xl py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-accent-red"></textarea>
                    </div>

                    <Button type="submit" size="lg" className="w-full" disabled={isProcessing}>
                      {isProcessing ? 'Booking appointment...' : 'Book Service'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
            <div className="hidden lg:flex flex-col justify-center">
              <img src="https://images.unsplash.com/photo-1632733711679-529326f6db12?auto=format&fit=crop&q=80&w=1000" alt="Service Bay" className="rounded-3xl shadow-2xl mb-8" />
              <div className="flex gap-4">
                 <div className="bg-charcoal-800/50 p-4 rounded-xl border border-white/5 flex-1">
                   <Wrench className="text-accent-red mb-2" />
                   <h4 className="text-white font-bold">Expert Technicians</h4>
                   <p className="text-xs text-gray-400">Certified professionals for all premium models.</p>
                 </div>
                 <div className="bg-charcoal-800/50 p-4 rounded-xl border border-white/5 flex-1">
                   <Activity className="text-accent-amber mb-2" />
                   <h4 className="text-white font-bold">Live Tracking</h4>
                   <p className="text-xs text-gray-400">Track your vehicle's repair status in real-time.</p>
                 </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ================= STAGE: TRACKING ================= */}
        {currentStage === STAGES.TRACKING && jobCard && (
          <motion.div
            key="tracking"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="space-y-8"
          >
            {/* Progress Stepper */}
            <Card>
              <CardContent className="p-8">
                <div className="flex items-center justify-between relative">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-charcoal-700 z-0 rounded-full" />
                  <div 
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-accent-red z-0 transition-all duration-500 rounded-full" 
                    style={{ width: `${(trackingStep / (TRACKING_STEPS.length - 1)) * 100}%` }}
                  />
                  
                  {TRACKING_STEPS.map((step, idx) => (
                    <div key={idx} className="relative z-10 flex flex-col items-center gap-3 bg-charcoal-900 px-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${idx <= trackingStep ? 'bg-accent-red text-white' : 'bg-charcoal-700 text-gray-400'}`}>
                        {idx < trackingStep ? <CheckCircle2 size={20} /> : <span>{idx + 1}</span>}
                      </div>
                      <span className={`text-sm font-semibold ${idx <= trackingStep ? 'text-white' : 'text-gray-500'}`}>{step}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-12 flex justify-center">
                  <Button variant="outline" onClick={refreshStatus} disabled={isProcessing}>
                    <RefreshCw size={16} className={`mr-2 ${isProcessing ? 'animate-spin' : ''}`} />
                    Refresh Status
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Digital Job Card */}
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/5">
                    <div className="flex items-center gap-3">
                      <FileText className="text-accent-red" />
                      <h3 className="text-xl font-display font-bold text-white">Digital Job Card</h3>
                    </div>
                    <span className="bg-white/10 text-white px-3 py-1 rounded-full text-sm font-mono">{jobCard.id}</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Customer</span>
                      <span className="text-white font-medium">{jobCard.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Vehicle</span>
                      <span className="text-white font-medium">{jobCard.carMake}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Assigned Technician</span>
                      <span className="text-white font-medium">{jobCard.technician?.name || 'Awaiting assignment'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Expected Delivery</span>
                      <span className="text-white font-medium">{jobCard.expectedCompletion || 'TBD'}</span>
                    </div>
                    <div className="pt-4 mt-4 border-t border-white/5">
                      <span className="block text-gray-400 mb-2">Reported Issue / Request</span>
                      <p className="text-white bg-white/5 p-3 rounded-lg text-sm">{jobCard.issue}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notification Feed */}
              <Card>
                <CardContent className="p-6 h-full">
                  <h3 className="text-xl font-display font-bold text-white mb-6 flex items-center gap-2">
                    <Bell className="text-accent-amber" size={20} /> System Notifications
                  </h3>
                  <div className="space-y-4">
                    {trackingStep >= 0 && (
                      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-charcoal-800 p-3 rounded-lg border-l-2 border-accent-red text-sm">
                        <span className="text-gray-400 text-xs block mb-1">Just now</span>
                        <span className="text-white">Your vehicle has been successfully booked for service. Job Card: {jobCard.id}.</span>
                      </motion.div>
                    )}
                    {trackingStep >= 1 && (
                      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-charcoal-800 p-3 rounded-lg border-l-2 border-accent-red text-sm">
                        <span className="text-gray-400 text-xs block mb-1">Update</span>
                        <span className="text-white">Technician {jobCard.technician?.name || 'Staff'} has started diagnostics/repairs on your {jobCard.carMake}.</span>
                      </motion.div>
                    )}
                    {trackingStep >= 2 && (
                      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-charcoal-800 p-3 rounded-lg border-l-2 border-accent-amber text-sm">
                        <span className="text-gray-400 text-xs block mb-1">Update</span>
                        <span className="text-white">Repairs completed. Vehicle is currently undergoing final quality checks.</span>
                      </motion.div>
                    )}
                    {trackingStep >= 3 && (
                      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-charcoal-800 p-3 rounded-lg border-l-2 border-green-500 text-sm">
                        <span className="text-gray-400 text-xs block mb-1">Ready</span>
                        <span className="text-white">Great news! Your vehicle is ready for pickup. Invoice has been generated. Click refresh to proceed to checkout.</span>
                      </motion.div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {/* ================= STAGE: PAYMENT ================= */}
        {currentStage === STAGES.PAYMENT && jobCard && (
          <motion.div
            key="payment"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-2xl mx-auto"
          >
            <Card>
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-display font-bold text-white">Service Invoice</h2>
                  <p className="text-gray-400">Job Card: {jobCard.id}</p>
                </div>

                <div className="bg-charcoal-800/50 rounded-xl p-6 mb-8 border border-white/5">
                  <h4 className="text-white font-medium mb-4 border-b border-white/10 pb-2">Parts & Labor Breakdown</h4>
                  <div className="space-y-3">
                    {Array.isArray(jobCard.parts) && jobCard.parts.length > 0 ? (
                      jobCard.parts.map((part, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-gray-300">{part.name}</span>
                          <span className="text-white font-mono">${parseFloat(part.price).toFixed(2)}</span>
                        </div>
                      ))
                    ) : (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Standard Service Charge</span>
                        <span className="text-white font-mono">${jobCard.totalCost?.toFixed(2) || '0.00'}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
                    <span className="text-lg font-bold text-white">Total Due</span>
                    <span className="text-2xl font-bold text-accent-red">${jobCard.totalCost?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>

                <Button 
                  size="lg" 
                  className="w-full relative" 
                  onClick={handlePayment}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Processing Payment...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2"><CreditCard size={20} /> Pay via Secure Gateway</span>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ================= STAGE: FEEDBACK ================= */}
        {currentStage === STAGES.FEEDBACK && (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto text-center py-12"
          >
            <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-3xl font-display font-bold text-white mb-2">Payment Successful!</h2>
            <p className="text-gray-400 mb-8">Your vehicle is released and ready to go. How was your experience with SpeedMotors?</p>

            <Card>
              <CardContent className="p-6">
                <div className="flex justify-center gap-2 mb-6">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star} 
                      type="button"
                      onClick={() => setRating(star)}
                      className={`transition-colors ${rating >= star ? 'text-accent-amber' : 'text-gray-600 hover:text-gray-400'}`}
                    >
                      <Star size={32} fill={rating >= star ? "currentColor" : "none"} />
                    </button>
                  ))}
                </div>
                <textarea 
                  rows="3" 
                  value={feedbackText}
                  onChange={e => setFeedbackText(e.target.value)}
                  placeholder="Leave a comment (optional)..."
                  className="w-full bg-charcoal-800 border border-white/10 rounded-xl py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-accent-red mb-4"
                ></textarea>
                <Button 
                  className="w-full" 
                  onClick={handleFeedbackSubmit}
                  disabled={isProcessing || rating === 0}
                >
                  {isProcessing ? 'Submitting...' : 'Submit Feedback'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ================= STAGE: DONE ================= */}
        {currentStage === STAGES.DONE && (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <h2 className="text-3xl font-display font-bold text-white mb-4">Thank you for choosing SpeedMotors.</h2>
            <p className="text-gray-400 mb-8 max-w-lg mx-auto">Your feedback helps us continuously improve. We hope to see you again for your next scheduled maintenance.</p>
            <Button onClick={() => window.location.reload()}>Book Another Service</Button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};

export default ServiceBooking;
