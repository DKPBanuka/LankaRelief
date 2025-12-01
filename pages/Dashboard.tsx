import React from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { Activity, ShieldCheck, Heart, Users, AlertCircle } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

import { ReliefMap } from '../components/Map/ReliefMap';

export const Dashboard: React.FC = () => {
  const { stats, needs, events, people } = useApp();
  const { t } = useLanguage();

  // Prepare data for chart (Needs by District)
  const districtData = Object.values(
    needs.reduce((acc, curr) => {
      acc[curr.district] = (acc[curr.district] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map((val, idx, arr) => {
    const keys = Object.keys(needs.reduce((acc, curr) => {
      acc[curr.district] = 0;
      return acc;
    }, {} as Record<string, number>));
    return { name: keys[idx] || 'Other', count: val };
  }).slice(0, 5); // Top 5

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-gradient-to-r from-blue-700 to-blue-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2">{t.heroTitle}</h1>
          <p className="text-blue-100 text-lg max-w-xl">
            {t.heroSub}
          </p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10">
          <Activity size={300} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t.totalNeeds}
          value={stats.totalNeeds}
          icon={<Heart className="text-red-500" />}
          subtext="Items requested"
        />
        <StatCard
          title={t.fulfilled}
          value={stats.fulfilledNeeds}
          icon={<ShieldCheck className="text-green-500" />}
          subtext="Needs received"
        />
        <StatCard
          title={t.adminMissingPeople}
          value={stats.missingPeople}
          icon={<AlertCircle className="text-orange-500" />}
          subtext="Reported"
        />
        <StatCard
          title={t.activeVolunteers}
          value={stats.activeVolunteers}
          icon={<Activity className="text-purple-500" />}
          subtext="Active on ground"
        />
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Live Situation Map</h3>
        <ReliefMap items={[...needs, ...events, ...people]} legendMode="all" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-6">{t.needsByDistrict}</h3>
          <div className="h-[300px] w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={districtData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">{t.latestActivity}</h3>
          <div className="space-y-4">
            {needs.slice(0, 4).map((need, i) => (
              <div key={i} className="flex items-start gap-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                <div className="w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{need.item} requested in {need.district}</p>
                  <p className="text-xs text-gray-500">{new Date(need.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, subtext }: { title: string, value: number, icon: React.ReactNode, subtext: string }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-gray-50 rounded-lg">{icon}</div>
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{title}</span>
    </div>
    <div className="flex items-baseline gap-2">
      <h2 className="text-3xl font-bold text-gray-900">{value}</h2>
    </div>
    <p className="text-sm text-gray-500 mt-1">{subtext}</p>
  </div>
);