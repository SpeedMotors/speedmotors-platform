import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, CheckCircle2, Trash2, Zap, Timer, Navigation, Gauge } from 'lucide-react';
import api from '../../services/api';
import { useTestDrive } from '../../context/TestDriveContext';
import Card, { CardContent } from '../../components/Card';
import Button from '../../components/Button';

const TestDrive = () => {
  const navigate = useNavigate();
  const { testDriveCars, removeCar, clearTestDrives } = useTestDrive();
  
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('Downtown Showroom');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (testDriveCars.length === 0) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const payload = {
        date,
        time,
        location,
        carIds: testDriveCars.map(c => c.id)
      };

      const res = await api.post('/test-drives', payload);
      
      if (res.data.success) {
        setIsSubmitted(true);
        // Clear local storage context list
        clearTestDrives();
      }
    } catch (err) {
      console.error('Failed to book test drive:', err);
      setError(err.response?.data?.message || 'Failed to complete booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Your Test Drives</h1>
          <p className="text-gray-400">Review your selected vehicles and book a time slot.</p>
        </div>
      </div>

      {isSubmitted ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16"
        >
          <div className="w-24 h-24 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-3xl font-display font-bold text-white mb-4">Booking Confirmed!</h2>
          <p className="text-gray-400 max-w-md mx-auto mb-8">
            Your test drive session is confirmed for {date} at {time}. We have reserved the selected vehicles for you.
          </p>
          <div className="flex justify-center gap-4">
            <Button onClick={() => { setIsSubmitted(false); navigate('/cars'); }}>Back to Fleet</Button>
            <Button variant="outline" onClick={() => navigate('/')}>Home</Button>
          </div>
        </motion.div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 justify-center">
          
          {/* Selected Cars List */}
          <div className="flex-1 max-w-2xl space-y-4">
            <h3 className="text-xl font-display font-bold text-white mb-4">Selected Vehicles ({testDriveCars.length})</h3>
            
            {testDriveCars.length === 0 ? (
              <div className="border border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center p-12 text-center bg-white/5">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4 text-gray-500">
                  <Calendar size={32} />
                </div>
                <h3 className="text-xl font-medium text-white mb-2">No Vehicles Selected</h3>
                <p className="text-gray-400 mb-6">Go to our fleet page and add cars to your test drive list.</p>
                <Button onClick={() => navigate('/cars')}>Browse Fleet</Button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                <AnimatePresence>
                  {testDriveCars.map((storedCar) => {
                    const car = storedCar;
                    return (
                      <motion.div
                        key={car.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                      >
                        <Card className="overflow-hidden flex flex-col h-full relative group">
                          <button 
                            onClick={() => removeCar(car.id)}
                            className="absolute top-2 right-2 z-10 w-8 h-8 bg-red-500/80 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                          <div className="relative h-40">
                            <img 
                              src={car.image} 
                              alt={car.model}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <CardContent className="p-4 flex-1 flex flex-col">
                            <p className="text-xs text-gray-400 mb-1">{car.type}</p>
                            <h4 className="text-lg font-bold text-white mb-1">{car.make} {car.model}</h4>
                            <p className="text-accent-red font-semibold text-sm mb-4">₹{car.price.toLocaleString()}</p>
                            
                            {car.specs && (
                              <div className="mt-auto grid grid-cols-2 gap-3 pt-4 border-t border-white/5">
                                <div className="flex items-center gap-2 text-xs text-gray-300">
                                  <Zap size={14} className="text-accent-amber" />
                                  <span>{car.specs.power}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-300">
                                  <Timer size={14} className="text-accent-red" />
                                  <span>{car.specs.acceleration}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-300">
                                  <Navigation size={14} className="text-blue-400" />
                                  <span>{car.specs.range}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-300">
                                  <Gauge size={14} className="text-purple-400" />
                                  <span>{car.specs.topSpeed}</span>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Booking Form */}
          <div className="w-full lg:w-[400px] flex-shrink-0">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h3 className="text-xl font-display font-bold text-white mb-6">Schedule Session</h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Preferred Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      <input 
                        type="date" 
                        required
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full bg-charcoal-800 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-accent-red"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Preferred Time</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      <select 
                        required
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full bg-charcoal-800 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-accent-red"
                      >
                        <option value="" disabled>Time...</option>
                        <option value="10:00 AM">10:00 AM</option>
                        <option value="11:30 AM">11:30 AM</option>
                        <option value="1:00 PM">1:00 PM</option>
                        <option value="2:30 PM">2:30 PM</option>
                        <option value="4:00 PM">4:00 PM</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      <select 
                        required
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full bg-charcoal-800 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-accent-red"
                      >
                        <option value="Downtown Showroom">Downtown Showroom (Main St.)</option>
                        <option value="Uptown Showroom">Uptown Dealership (Park Ave.)</option>
                      </select>
                    </div>
                  </div>

                  {error && (
                    <div className="text-sm text-red-500 bg-red-500/10 p-3 rounded-xl border border-red-500/20 text-center">
                      {error}
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={testDriveCars.length === 0 || loading}
                  >
                    {loading ? 'Confirming...' : 'Confirm Booking'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

        </div>
      )}
    </div>
  );
};

export default TestDrive;
