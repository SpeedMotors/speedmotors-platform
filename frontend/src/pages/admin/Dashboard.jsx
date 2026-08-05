import React from 'react';
import { motion } from 'framer-motion';
import { IndianRupee, Users, Car, Wrench, ArrowUpRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Card, { CardContent } from '../../components/Card';
import { mockData } from '../../services/api';

const StatCard = ({ title, value, trend, icon: Icon, colorClass }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-white">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl bg-charcoal-800 border border-white/5 ${colorClass}`}>
          <Icon size={20} />
        </div>
      </div>
      <div className="flex items-center text-sm">
        <ArrowUpRight size={16} className="text-green-400 mr-1" />
        <span className="text-green-400 font-medium">{trend}</span>
        <span className="text-gray-500 ml-2">vs last month</span>
      </div>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6 max-w-7xl mx-auto space-y-6"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Dealership Overview</h1>
          <p className="text-gray-400">Welcome back, Admin. Here's what's happening today.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Revenue" value="₹2.4M" trend="+12.5%" icon={IndianRupee} colorClass="text-green-400" />
        <StatCard title="Active Leads" value="142" trend="+8.2%" icon={Users} colorClass="text-accent-amber" />
        <StatCard title="Vehicles Sold" value="38" trend="+14.1%" icon={Car} colorClass="text-blue-400" />
        <StatCard title="Open Job Cards" value="15" trend="+2.4%" icon={Wrench} colorClass="text-purple-400" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-white mb-6">Revenue Growth</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockData.analytics.revenue}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="name" stroke="#ffffff50" axisLine={false} tickLine={false} />
                  <YAxis stroke="#ffffff50" axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value / 1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #ffffff10', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="total" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Leads */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">Recent Leads</h3>
              <button className="text-accent-red text-sm font-medium hover:underline">View All</button>
            </div>
            <div className="space-y-4">
              {mockData.leads.map((lead) => (
                <div key={lead.id} className="flex justify-between items-center p-3 rounded-xl bg-charcoal-800 border border-white/5 hover:border-white/10 transition-colors">
                  <div>
                    <h4 className="text-white font-medium text-sm">{lead.name}</h4>
                    <p className="text-gray-400 text-xs">Interested in {mockData.cars.find(c => c.id === lead.carId)?.model || 'a vehicle'}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    lead.status === 'New' ? 'bg-blue-500/20 text-blue-400' :
                    lead.status === 'Won' ? 'bg-green-500/20 text-green-400' :
                    'bg-charcoal-700 text-gray-300'
                  }`}>
                    {lead.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Job Cards */}
        <Card className="lg:col-span-3">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-white mb-6">Active Service Jobs</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 text-sm">
                    <th className="pb-3 font-medium">Job ID</th>
                    <th className="pb-3 font-medium">Customer</th>
                    <th className="pb-3 font-medium">Issue</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Expected</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-300">
                  {mockData.jobCards.map((job) => (
                    <tr key={job.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-4 font-mono text-white">{job.id}</td>
                      <td className="py-4">{job.customerName}</td>
                      <td className="py-4">{job.issue}</td>
                      <td className="py-4">
                        <span className="bg-charcoal-800 border border-white/10 px-2 py-1 rounded-md text-xs text-white">
                          {job.status}
                        </span>
                      </td>
                      <td className="py-4">{job.expectedCompletion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

      </div>
    </motion.div>
  );
};

export default Dashboard;
