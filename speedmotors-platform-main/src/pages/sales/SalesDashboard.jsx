import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { DollarSign, TrendingUp, Users, Car } from 'lucide-react';
import Card, { CardContent } from '../../components/Card';

const dataSales = [
  { name: 'Jan', sales: 4000 },
  { name: 'Feb', sales: 3000 },
  { name: 'Mar', sales: 5000 },
  { name: 'Apr', sales: 4500 },
  { name: 'May', sales: 6000 },
  { name: 'Jun', sales: 5500 },
];

const dataLeads = [
  { name: 'New', value: 45 },
  { name: 'Contacted', value: 30 },
  { name: 'Quoted', value: 20 },
  { name: 'Won', value: 15 },
];

const COLORS = ['#3a506b', '#ffbf00', '#ff2a2a', '#10b981'];

const CountUp = ({ to, prefix = '', suffix = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const increment = to / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= to) {
        setCount(to);
        clearInterval(timer);
      } else {
        setCount(Math.ceil(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [to]);

  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
};

const SalesDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Sales Overview</h1>
          <p className="text-gray-400">Track performance and revenue metrics.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Revenue', value: 1250000, prefix: '$', icon: DollarSign, color: 'text-green-400' },
          { title: 'Cars Sold', value: 42, icon: Car, color: 'text-accent-amber' },
          { title: 'New Leads', value: 128, icon: Users, color: 'text-blue-400' },
          { title: 'Conversion Rate', value: 18, suffix: '%', icon: TrendingUp, color: 'text-accent-red' }
        ].map((kpi, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card hoverEffect className="h-full">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium mb-1">{kpi.title}</p>
                  <h3 className="text-3xl font-display font-bold text-white">
                    <CountUp to={kpi.value} prefix={kpi.prefix} suffix={kpi.suffix} />
                  </h3>
                </div>
                <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center ${kpi.color}`}>
                  <kpi.icon size={24} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card className="h-full">
            <div className="p-6 border-b border-white/5">
              <h3 className="text-lg font-display font-medium text-white">Revenue Trend</h3>
            </div>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dataSales}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="name" stroke="#a1a1aa" tick={{fill: '#a1a1aa'}} axisLine={false} />
                  <YAxis stroke="#a1a1aa" tick={{fill: '#a1a1aa'}} axisLine={false} tickFormatter={val => `$${val/1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#ffffff20', borderRadius: '12px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#ff2a2a" 
                    strokeWidth={3} 
                    dot={{ fill: '#ff2a2a', strokeWidth: 2, r: 4 }} 
                    activeDot={{ r: 8, stroke: '#ff2a2a', strokeWidth: 2, fill: '#121212' }}
                    animationDuration={1500}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="h-full">
            <div className="p-6 border-b border-white/5">
              <h3 className="text-lg font-display font-medium text-white">Lead Distribution</h3>
            </div>
            <CardContent className="h-80 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dataLeads}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    animationDuration={1500}
                  >
                    {dataLeads.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#ffffff20', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default SalesDashboard;
