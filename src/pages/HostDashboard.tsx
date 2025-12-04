
import React, { useState } from 'react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Home, Calendar, DollarSign, Plus, Settings, Users, Star } from 'lucide-react';
import MagneticButton from '../components/ui/MagneticButton';
import { MOCK_PROPERTIES } from '../constants';

const HostDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'calendar' | 'listings'>('overview');

  const earningsData = [
    { name: 'Mon', value: 12000 },
    { name: 'Tue', value: 18000 },
    { name: 'Wed', value: 15000 },
    { name: 'Thu', value: 24000 },
    { name: 'Fri', value: 32000 },
    { name: 'Sat', value: 45000 },
    { name: 'Sun', value: 38000 },
  ];

  return (
    <div className="min-h-screen pt-32 px-4 md:px-12 max-w-7xl mx-auto pb-20">
      
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div>
          <h1 className="font-display text-4xl mb-2">PARTNER PORTAL</h1>
          <p className="text-white/50">Manage your sanctuaries and analyze performance.</p>
        </div>
        <MagneticButton>
          <button className="px-6 py-3 bg-white text-black rounded-xl font-bold flex items-center gap-2 hover:bg-gray-200 transition-colors">
            <Plus size={18} /> LIST NEW SPACE
          </button>
        </MagneticButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Navigation Sidebar */}
        <div className="space-y-2">
          {[
            { id: 'overview', icon: Home, label: 'Overview' },
            { id: 'calendar', icon: Calendar, label: 'Calendar' },
            { id: 'listings', icon: Settings, label: 'My Listings' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === tab.id ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon size={18} />
              <span className="font-bold text-sm">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-8">
          
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4 text-white/50">
                    <DollarSign size={18} />
                    <span className="text-xs uppercase tracking-widest">Est. Earnings (7d)</span>
                  </div>
                  <p className="font-display text-3xl font-bold">₹184,000</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4 text-white/50">
                    <Users size={18} />
                    <span className="text-xs uppercase tracking-widest">Views (30d)</span>
                  </div>
                  <p className="font-display text-3xl font-bold">12,450</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4 text-white/50">
                    <Star size={18} />
                    <span className="text-xs uppercase tracking-widest">Superhost Status</span>
                  </div>
                  <p className="font-display text-3xl font-bold text-yellow-400">ON TRACK</p>
                </div>
              </div>

              {/* Chart */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 h-80">
                <h3 className="font-bold mb-6">Revenue Velocity</h3>
                <ResponsiveContainer width="100%" height="80%">
                  <AreaChart data={earningsData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ffffff" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }} />
                    <Area type="monotone" dataKey="value" stroke="#fff" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Listings Tab */}
          {activeTab === 'listings' && (
            <div className="space-y-4">
              {MOCK_PROPERTIES.slice(0,2).map(property => (
                <div key={property.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex gap-4 items-center">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-white/10 shrink-0">
                    <img src={property.image} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{property.title}</h3>
                    <p className="text-sm text-white/50">{property.location}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 border border-white/10 rounded-lg text-xs font-bold hover:bg-white/10">EDIT</button>
                    <button className="px-4 py-2 bg-white text-black rounded-lg text-xs font-bold hover:bg-gray-200">MANAGE</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Calendar Tab (Mock) */}
          {activeTab === 'calendar' && (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center py-20">
               <Calendar size={48} className="mx-auto mb-4 opacity-50" />
               <h3 className="text-xl font-bold mb-2">Availability Matrix</h3>
               <p className="text-white/50">Select a property to view booking slots.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default HostDashboard;
