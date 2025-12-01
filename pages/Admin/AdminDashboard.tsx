import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { Shield, Users, Package, AlertTriangle, Trash2, CheckCircle, XCircle, Calendar, MapPin } from 'lucide-react';
import { NeedStatus } from '../../types';

export const AdminDashboard: React.FC = () => {
    const { needs, volunteers, people, events, deleteNeed, deletePerson, deleteVolunteer, deleteEvent, updateNeedStatus } = useApp();
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<'needs' | 'people' | 'volunteers' | 'events'>('needs');

    const handleDelete = (type: 'need' | 'person' | 'volunteer' | 'event', id: string) => {
        if (window.confirm(t.confirmDelete)) {
            switch (type) {
                case 'need': deleteNeed(id); break;
                case 'person': deletePerson(id); break;
                case 'volunteer': deleteVolunteer(id); break;
                case 'event': deleteEvent(id); break;
            }
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-4xl font-bold mb-2">{t.adminTitle}</h1>
                    <p className="text-gray-300 text-lg max-w-xl">
                        Manage system data, users, and settings.
                    </p>
                </div>
                <div className="absolute right-0 bottom-0 opacity-10">
                    <Shield size={300} />
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Package size={20} /></div>
                        <span className="text-sm font-medium text-gray-500">{t.totalNeeds}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{needs.length}</h3>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-red-100 text-red-600 rounded-lg"><AlertTriangle size={20} /></div>
                        <span className="text-sm font-medium text-gray-500">{t.missingPeople}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{people.filter(p => p.status === 'MISSING').length}</h3>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-100 text-green-600 rounded-lg"><Users size={20} /></div>
                        <span className="text-sm font-medium text-gray-500">{t.volunteers}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{volunteers.length}</h3>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Calendar size={20} /></div>
                        <span className="text-sm font-medium text-gray-500">{t.events}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{events.length}</h3>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b border-gray-200 overflow-x-auto">
                    {[
                        { id: 'needs', label: t.manageNeeds },
                        { id: 'people', label: t.managePeople },
                        { id: 'volunteers', label: t.manageVolunteers },
                        { id: 'events', label: t.manageEvents }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-6 py-4 text-sm font-medium capitalize whitespace-nowrap transition-colors ${activeTab === tab.id
                                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Table Content */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">{t.details}</th>
                                <th className="px-6 py-4">{t.status}</th>
                                <th className="px-6 py-4">{t.date}</th>
                                <th className="px-6 py-4 text-right">{t.actions}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {activeTab === 'needs' && needs.map((need) => (
                                <tr key={need.id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-gray-900">{need.item}</p>
                                        <p className="text-xs text-gray-500">{need.location} • {need.district}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${need.status === 'RECEIVED' ? 'bg-green-100 text-green-800' :
                                            need.status === 'PLEDGED' ? 'bg-blue-100 text-blue-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {need.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{new Date(need.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        {need.status !== NeedStatus.RECEIVED && (
                                            <button
                                                onClick={() => updateNeedStatus(need.id, NeedStatus.RECEIVED)}
                                                className="text-green-600 hover:bg-green-50 p-2 rounded-lg transition-colors"
                                                title={t.markReceived}
                                            >
                                                <CheckCircle size={18} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete('need', need.id)}
                                            className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                            title={t.delete}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {activeTab === 'people' && people.map((person) => (
                                <tr key={person.id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-gray-900">{person.name}</p>
                                        <p className="text-xs text-gray-500">{person.lastSeenLocation} • {person.district}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${person.status === 'SAFE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {person.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{new Date(person.updatedAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleDelete('person', person.id)}
                                            className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {activeTab === 'volunteers' && volunteers.map((vol) => (
                                <tr key={vol.id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-gray-900">{vol.name}</p>
                                        <p className="text-xs text-gray-500">{vol.email}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {vol.skills.map(skill => (
                                                <span key={skill} className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded border border-gray-200">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{vol.district}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleDelete('volunteer', vol.id)}
                                            className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {activeTab === 'events' && events.map((event) => (
                                <tr key={event.id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-gray-900">{event.title}</p>
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            <MapPin size={10} /> {event.location}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-gray-500">
                                        {event.registeredVolunteers} / {event.maxVolunteers} Volunteers
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{new Date(event.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleDelete('event', event.id)}
                                            className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Empty States */}
                    {((activeTab === 'needs' && needs.length === 0) ||
                        (activeTab === 'people' && people.length === 0) ||
                        (activeTab === 'volunteers' && volunteers.length === 0) ||
                        (activeTab === 'events' && events.length === 0)) && (
                            <div className="p-12 text-center text-gray-500">
                                <p>{t.noData}</p>
                            </div>
                        )}
                </div>
            </div>
        </div>
    );
};
