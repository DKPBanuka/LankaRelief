import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { District, SkillType, Volunteer, Coordinates } from '../../types';
import { MapPin, User, Phone, Briefcase, CheckCircle, AlertTriangle } from 'lucide-react';
import { LocationPicker } from '../Map/LocationPicker';

export const VolunteerRegistration: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { addVolunteer } = useApp();
    const { t } = useLanguage();

    const [formData, setFormData] = useState({
        name: '',
        contactNumber: '',
        district: District.COLOMBO,
        location: '',
        coverageArea: 'Whole District',
        skills: [] as SkillType[],
        coordinates: undefined as Coordinates | undefined,
        secretPin: ''
    });

    const [submitted, setSubmitted] = useState(false);

    const handleSkillChange = (skill: SkillType) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.includes(skill)
                ? prev.skills.filter(s => s !== skill)
                : [...prev.skills, skill]
        }));
    };

    const handleLocationSelect = (coords: Coordinates, address?: string, district?: District) => {
        setFormData(prev => ({
            ...prev,
            coordinates: coords,
            location: address ? address.split(',')[0] : prev.location, // Use first part of address as city
            district: district || prev.district
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.secretPin || formData.secretPin.length !== 4) {
            alert('Please enter a 4-digit Secret PIN to manage your profile later.');
            return;
        }

        // Default coordinates if none selected (Colombo center)
        const finalCoords = formData.coordinates || { lat: 6.9271, lng: 79.8612 };

        const newVolunteer: Volunteer = {
            id: Date.now().toString(),
            ...formData,
            coordinates: finalCoords,
            status: 'AVAILABLE',
            joinedAt: Date.now(),
            secretPin: formData.secretPin,
        };

        addVolunteer(newVolunteer);
        setSubmitted(true);
        setTimeout(onClose, 2000);
    };

    if (submitted) {
        return (
            <div className="text-center p-8">
                <div className="flex justify-center mb-4">
                    <CheckCircle className="text-green-500 w-16 h-16" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{t.thankYou}</h3>
                <p className="text-gray-600">{t.regSuccess}</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-yellow-800 mb-1">{t.disclaimerTitle}</h4>
                        <p className="text-sm text-yellow-700 leading-relaxed">
                            {t.disclaimerText}
                        </p>
                    </div>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.fullName}</label>
                <div className="relative">
                    <User className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        required
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder={t.enterName}
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.contactPhone}</label>
                <div className="relative">
                    <Phone className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                    <input
                        type="tel"
                        required
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.contactNumber}
                        onChange={e => setFormData({ ...formData, contactNumber: e.target.value })}
                        placeholder={t.enterPhone}
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.selectOnMap}</label>
                <LocationPicker onLocationSelect={handleLocationSelect} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.district}</label>
                    <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        value={formData.district}
                        onChange={e => setFormData({ ...formData, district: e.target.value as District })}
                    >
                        {Object.values(District).map(d => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.cityTown}</label>
                    <input
                        type="text"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        value={formData.location}
                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                        placeholder={t.enterCity}
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.iCanOffer}</label>
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { id: 'GOODS', label: t.goods, icon: '📦' },
                        { id: 'SERVICES', label: t.services, icon: '🛠️' },
                        { id: 'LABOR', label: t.labor, icon: '💪' }
                    ].map(skill => (
                        <button
                            key={skill.id}
                            type="button"
                            onClick={() => handleSkillChange(skill.id as SkillType)}
                            className={`p-3 rounded-xl border-2 transition-all ${formData.skills.includes(skill.id as SkillType)
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 hover:border-blue-200'
                                }`}
                        >
                            <div className="text-2xl mb-1">{skill.icon}</div>
                            <div className="text-xs font-medium">{skill.label}</div>
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.coverage}</label>
                <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.coverageArea}
                    onChange={e => setFormData({ ...formData, coverageArea: e.target.value })}
                >
                    <option>{t.wholeDistrict}</option>
                    <option>{t.radius10}</option>
                    <option>{t.radius5}</option>
                    <option>{t.myCity}</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Secret PIN (4-digits)</label>
                <input
                    required
                    type="text"
                    maxLength={4}
                    pattern="\d{4}"
                    value={formData.secretPin}
                    onChange={e => setFormData({ ...formData, secretPin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                    className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white font-mono tracking-widest text-center"
                    placeholder="0000"
                />
                <p className="text-xs text-gray-500 mt-1">Required to delete your profile later.</p>
            </div>

            <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
            >
                {t.joinNow}
            </button>
        </form>
    );
};
