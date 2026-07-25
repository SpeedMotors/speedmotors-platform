import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Car } from 'lucide-react';
import Card, { CardContent } from '../components/Card';
import Button from '../components/Button';

const Register = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-charcoal-900 flex items-center justify-center p-4 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="glass-card border-white/10 p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-red to-accent-amber flex items-center justify-center mx-auto mb-4">
              <Car size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-display font-bold text-white mb-2">Create Account</h1>
            <p className="text-gray-400">Join SpeedMotors today</p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); navigate('/login'); }} className="space-y-4">
            <input 
              type="text" 
              className="w-full bg-charcoal-900 border border-white/10 rounded-xl py-3 px-4 text-white"
              placeholder="Full Name"
              required
            />
            <input 
              type="email" 
              className="w-full bg-charcoal-900 border border-white/10 rounded-xl py-3 px-4 text-white"
              placeholder="Email address"
              required
            />
            <input 
              type="password" 
              className="w-full bg-charcoal-900 border border-white/10 rounded-xl py-3 px-4 text-white"
              placeholder="Password"
              required
            />
            <div className="pt-2">
              <Button type="submit" className="w-full">
                Sign Up
              </Button>
            </div>
          </form>
          
          <p className="text-center mt-6 text-sm text-gray-400">
            Already have an account? <Link to="/login" className="text-accent-red hover:underline">Sign In</Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
};

export default Register;
