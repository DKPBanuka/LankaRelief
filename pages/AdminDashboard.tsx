import React from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { Trash2, AlertTriangle, CheckCircle, Package } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { needs, people, updateNeedStatus } = useApp();
  const { t } = useLanguage();

  // Note: In a real app, delete functionality would be here. 
  // Since we only have 'updateNeedStatus' exposed in mock context, 
  // this is a visualization of the admin panel structure.

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t.adminTitle}</h1>
        <p className="text-gray-500 mt-1">Manage system data and coordinate relief efforts.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Package className="text-blue-600" size={20} />
            {t.manageNeeds}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-3">{t.itemNeeded}</th>
                <th className="px-6 py-3">{t.district}</th>
                <th className="px-6 py-3">{t.status}</th>
                <th className="px-6 py-3">{t.actions}</th>
              </tr>
            </thead>
            <tbody>
              {needs.map((need) => (
                <tr key={need.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{need.item} ({need.quantity})</td>
                  <td className="px-6 py-4">{need.district}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      need.status === 'REQUESTED' ? 'bg-red-100 text-red-700' :
                      need.status === 'PLEDGED' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {need.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                     {/* Admin Actions Simulator */}
                     <button className="text-red-600 hover:text-red-800" title={t.delete}>
                       <Trash2 size={16} />
                     </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <AlertTriangle className="text-orange-600" size={20} />
            {t.managePeople}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-3">{t.fullName}</th>
                <th className="px-6 py-3">{t.district}</th>
                <th className="px-6 py-3">{t.status}</th>
                <th className="px-6 py-3">{t.actions}</th>
              </tr>
            </thead>
            <tbody>
              {people.map((person) => (
                <tr key={person.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{person.name}</td>
                  <td className="px-6 py-4">{person.district}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      person.status === 'SAFE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {person.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                     <button className="text-red-600 hover:text-red-800" title={t.delete}>
                       <Trash2 size={16} />
                     </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};