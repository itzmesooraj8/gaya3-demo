import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, Users, Home } from 'lucide-react';

const data = [
  { name: 'Jan', revenue: 4000 },
  { name: 'Feb', revenue: 3000 },
  { name: 'Mar', revenue: 5000 },
  { name: 'Apr', revenue: 4500 },
  { name: 'May', revenue: 6000 },
  { name: 'Jun', revenue: 7500 },
];

const pieData = [
  { name: 'Zen', value: 400 },
  { name: 'Party', value: 300 },
  { name: 'Work', value: 300 },
];

const COLORS = ['#ffffff', '#a0a0a0', '#404040'];

const Admin: React.FC = () => {
  return (
    <div className="min-h-screen pt-32 px-4 md:px-12 max-w-7xl mx-auto">
      <h1 className="font-display text-4xl mb-8">COMMAND CENTER</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-4 h-[800px]">
        {/* KPI 1 */}
        <div className="md:col-span-1 bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col justify-between">
           <div className="p-3 bg-white/10 w-fit rounded-full"><DollarSign /></div>
           <div>
             <p className="text-white/50 text-sm">Total Revenue</p>
             <h3 className="text-3xl font-bold">₹2.4M</h3>
           </div>
        </div>

        {/* Revenue Chart */}
        <div className="md:col-span-3 md:row-span-1 bg-white/5 border border-white/10 rounded-3xl p-6">
           <h3 className="text-lg font-bold mb-4">Revenue Trajectory</h3>
           <div className="h-48 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={data}>
                 <defs>
                   <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#ffffff" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <XAxis dataKey="name" stroke="#666" />
                 <YAxis stroke="#666" />
                 <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }} />
                 <Area type="monotone" dataKey="revenue" stroke="#ffffff" fillOpacity={1} fill="url(#colorRevenue)" />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Occupancy Pie */}
        <div className="md:col-span-2 md:row-span-1 bg-white/5 border border-white/10 rounded-3xl p-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold mb-2">Category Distribution</h3>
              <p className="text-white/50 text-sm">Most popular vibe: Zen</p>
            </div>
            <div className="w-40 h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
        </div>

        {/* KPI 2 & 3 Stacked */}
        <div className="md:col-span-1 flex flex-col gap-4">
             <div className="flex-1 bg-white/5 border border-white/10 rounded-3xl p-6 flex items-center gap-4">
               <Users className="text-white/50" />
               <div>
                  <h3 className="text-2xl font-bold">1,204</h3>
                  <p className="text-xs text-white/50">Active Travelers</p>
               </div>
             </div>
             <div className="flex-1 bg-white/5 border border-white/10 rounded-3xl p-6 flex items-center gap-4">
               <Home className="text-white/50" />
               <div>
                  <h3 className="text-2xl font-bold">85%</h3>
                  <p className="text-xs text-white/50">Occupancy Rate</p>
               </div>
             </div>
        </div>
        
        {/* Recent Activity */}
        <div className="md:col-span-1 bg-white/5 border border-white/10 rounded-3xl p-6 overflow-hidden">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/50 mb-4">Live Feed</h3>
            <div className="space-y-4">
               {[1,2,3].map(i => (
                 <div key={i} className="flex gap-2 text-sm">
                   <div className="w-1 h-full bg-green-500 rounded-full" />
                   <p><span className="font-bold">Alex</span> booked <span className="text-white/60">Nebula House</span></p>
                 </div>
               ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
