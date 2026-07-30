import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useTestDrive } from '../../context/TestDriveContext';
import Card, { CardContent } from '../../components/Card';
import Button from '../../components/Button';
import { Search, Filter, Check, X, Calculator } from 'lucide-react';

const Cars = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [addedCars, setAddedCars] = useState({});
  const [quoteCar, setQuoteCar] = useState(null);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { addCar, testDriveCars } = useTestDrive();

  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        const res = await api.get('/cars');
        // The API returns the format: { success: true, message: '...', data: { cars: [...] } }
        setCars(res.data.data.cars || []);
      } catch (err) {
        console.error('Failed to fetch cars:', err);
        setError('Failed to load fleet. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  const filteredCars = cars.filter(car => 
    car.model.toLowerCase().includes(searchTerm.toLowerCase()) || 
    car.make.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Our Fleet</h1>
          <p className="text-gray-400">Discover your next dream car.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Search cars..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-charcoal-800 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-accent-red"
            />
          </div>
          <Button variant="secondary" className="px-3"><Filter size={18} /></Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12 text-gray-400">Loading fleet...</div>
        ) : error ? (
          <div className="col-span-full text-center py-12 text-red-400">{error}</div>
        ) : (
          filteredCars.map((car, idx) => (
            <motion.div
              key={car.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card hoverEffect className="h-full flex flex-col group overflow-hidden">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={car.image} 
                    alt={car.model} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-2 right-2 bg-charcoal-900/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-white border border-white/10">
                    {car.year}
                  </div>
                </div>
                <CardContent className="flex-1 flex flex-col p-5">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-sm text-gray-400 font-medium">{car.make}</h3>
                      <h2 className="text-xl font-display font-bold text-white">{car.model}</h2>
                    </div>
                    <span className="text-lg font-bold text-accent-red">${car.price.toLocaleString()}</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/5 flex gap-2 mt-auto">
                    <Button 
                      className="w-full text-sm py-2" 
                      variant={addedCars[car.id] || testDriveCars.find(c => c.id === car.id) ? "outline" : "primary"}
                      onClick={() => {
                        addCar(car);
                        setAddedCars(prev => ({ ...prev, [car.id]: true }));
                        setTimeout(() => setAddedCars(prev => ({ ...prev, [car.id]: false })), 2000);
                      }}
                    >
                      {addedCars[car.id] || testDriveCars.find(c => c.id === car.id) ? (
                        <span className="flex items-center justify-center gap-2"><Check size={16} /> Added to List</span>
                      ) : (
                        "Add to Test Drive"
                      )}
                    </Button>
                    <Button variant="secondary" className="w-full text-sm py-2" onClick={() => setQuoteCar(car)}>
                      Quote
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
      
      {filteredCars.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">No cars found matching your search.</p>
        </div>
      )}

      {/* Quote Modal */}
      {quoteCar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-charcoal-800 border border-white/10 rounded-2xl p-6 max-w-md w-full relative shadow-2xl"
          >
            <button 
              onClick={() => setQuoteCar(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-accent-red/20 flex items-center justify-center text-accent-red">
                <Calculator size={20} />
              </div>
              <h2 className="text-xl font-display font-bold text-white">Estimated Quote</h2>
            </div>
            
            <div className="mb-6">
              <h3 className="text-sm text-gray-400 font-medium">{quoteCar.make}</h3>
              <p className="text-2xl font-bold text-white">{quoteCar.model} ({quoteCar.year})</p>
            </div>
            
            <div className="space-y-4 bg-charcoal-900 rounded-xl p-5 border border-white/5">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">MSRP</span>
                <span className="text-white font-semibold">${quoteCar.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center border-y border-white/5 py-3 my-3">
                <span className="text-gray-400 text-sm">Est. Monthly (72 mo, 5% APR)</span>
                <span className="text-accent-red font-bold text-2xl">${Math.round(quoteCar.price / 72 * 1.05).toLocaleString()}<span className="text-sm text-gray-500">/mo</span></span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Down Payment (10%)</span>
                <span className="text-white font-semibold">${(quoteCar.price * 0.1).toLocaleString()}</span>
              </div>
            </div>
            
            <div className="mt-6 flex gap-3">
              <Button variant="secondary" className="w-full" onClick={() => setQuoteCar(null)}>Close</Button>
              <Button className="w-full" onClick={() => navigate('/service-booking')}>Contact Sales</Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Cars;
