import axios from 'axios';

// Create an Axios instance
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// Interceptor to attach the token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('speedmotors_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;

// Mock Data for the Frontend Demonstration
export const mockData = {
  cars: [
    { id: 1, make: 'SpeedMotors', model: 'Elektrify X', year: 2026, price: 55000, type: 'SUV', image: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=800', specs: { power: '450 hp', acceleration: '0-60 in 3.8s', range: '320 miles', topSpeed: '140 mph' } },
    { id: 2, make: 'SpeedMotors', model: 'Aero Sedan', year: 2026, price: 42000, type: 'Sedan', image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=800', specs: { power: '320 hp', acceleration: '0-60 in 4.5s', range: '280 miles', topSpeed: '135 mph' } },
    { id: 3, make: 'SpeedMotors', model: 'Thrust Coupe', year: 2025, price: 68000, type: 'Coupe', image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800', specs: { power: '550 hp', acceleration: '0-60 in 3.2s', range: '250 miles', topSpeed: '180 mph' } },
    { id: 4, make: 'SpeedMotors', model: 'Phantom SUV', year: 2026, price: 72000, type: 'SUV', image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&q=80&w=800', specs: { power: '600 hp', acceleration: '0-60 in 3.4s', range: '340 miles', topSpeed: '155 mph' } },
    { id: 5, make: 'SpeedMotors', model: 'Velocity Roadster', year: 2024, price: 89000, type: 'Roadster', image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=800', specs: { power: '700 hp', acceleration: '0-60 in 2.8s', range: '220 miles', topSpeed: '200 mph' } },
    { id: 6, make: 'SpeedMotors', model: 'Eco Hatch', year: 2026, price: 29000, type: 'Hatchback', image: 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&q=80&w=800', specs: { power: '201 hp', acceleration: '0-60 in 6.5s', range: '260 miles', topSpeed: '120 mph' } }
  ],
  leads: [
    { id: 101, name: 'John Doe', carId: 1, status: 'New', date: '2026-07-20' },
    { id: 102, name: 'Jane Smith', carId: 2, status: 'Contacted', date: '2026-07-22' },
    { id: 103, name: 'Mike Ross', carId: 3, status: 'Quoted', date: '2026-07-24' },
    { id: 104, name: 'Sarah Lee', carId: 1, status: 'Won', date: '2026-07-25' }
  ],
  jobCards: [
    { id: 'JC-001', customerName: 'Alan Turing', carMake: 'SpeedMotors', issue: 'Brake pads replacement', status: 'Diagnosis', expectedCompletion: '2026-07-26' },
    { id: 'JC-002', customerName: 'Grace Hopper', carMake: 'SpeedMotors', issue: 'Software update & Battery Check', status: 'Repair', expectedCompletion: '2026-07-25' },
    { id: 'JC-003', customerName: 'Linus Torvalds', carMake: 'SpeedMotors', issue: 'AC not cooling', status: 'QC', expectedCompletion: '2026-07-25' },
    { id: 'JC-004', customerName: 'Ada Lovelace', carMake: 'SpeedMotors', issue: 'Annual Service', status: 'Ready', expectedCompletion: '2026-07-24' }
  ],
  analytics: {
    revenue: [
      { name: 'Jan', total: 450000 },
      { name: 'Feb', total: 520000 },
      { name: 'Mar', total: 480000 },
      { name: 'Apr', total: 610000 },
      { name: 'May', total: 590000 },
      { name: 'Jun', total: 720000 }
    ],
    salesByType: [
      { name: 'SUV', value: 45 },
      { name: 'Sedan', value: 30 },
      { name: 'Coupe', value: 15 },
      { name: 'Roadster', value: 10 }
    ],
    leadsConversion: [
      { name: 'Week 1', new: 40, converted: 12 },
      { name: 'Week 2', new: 45, converted: 15 },
      { name: 'Week 3', new: 35, converted: 18 },
      { name: 'Week 4', new: 50, converted: 22 }
    ]
  }
};
