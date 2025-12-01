import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { ServiceCategory, ServiceRequest, District, Coordinates } from '../types';
import { LocationPicker } from './Map/LocationPicker';
import { AlertTriangle, Heart, Truck, Shovel, HelpCircle, Phone, User, Lock, MapPin } from 'lucide-react';

export const RequestHelpForm: React.FC = () => {
    const { addServiceRequest } = useApp();
    const { t } = useLanguage();
    const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        // Rescue
        waterLevel: 'RISING',
        buildingType: '',
        floorLevel: 0,
        safeForHours: '',
        phoneBattery: '',
        peopleCount: { men: 0, women: 0, children: 0, elderly: 0 },
        // Medical
        urgency: 'CRITICAL',
        condition: '',
        ambulanceNeeded: false,
        // Cleanup
        peopleNeeded: 1,
        taskType: 'HOUSE_CLEANING',
        // Evacuation/Other
        description: '',
        headcount: 1,
        // Common
        contactName: '',
        contactPhone: '',
        secretPin: '',
        location: {
            coordinates: undefined as Coordinates | undefined,
            district: District.COLOMBO,
            address: ''
        }
    });

    const categories = [
        { id: 'RESCUE', label: t.reqCatRescue, icon: AlertTriangle, color: 'bg-red-500', hover: 'hover:bg-red-600', border: 'border-red-200', text: 'text-red-700' },
        { id: 'MEDICAL', label: t.reqCatMedical, icon: Heart, color: 'bg-rose-500', hover: 'hover:bg-rose-600', border: 'border-rose-200', text: 'text-rose-700' },
        { id: 'EVACUATION', label: t.reqCatEvacuation, icon: Truck, color: 'bg-orange-500', hover: 'hover:bg-orange-600', border: 'border-orange-200', text: 'text-orange-700' },
        { id: 'CLEANUP', label: t.reqCatCleanup, icon: Shovel, color: 'bg-blue-500', hover: 'hover:bg-blue-600', border: 'border-blue-200', text: 'text-blue-700' },
        { id: 'OTHER', label: t.reqCatOther, icon: HelpCircle, color: 'bg-gray-500', hover: 'hover:bg-gray-600', border: 'border-gray-200', text: 'text-gray-700' },
    ];

    const handleLocationSelect = (coords: Coordinates, address?: string, district?: District) => {
        setFormData(prev => ({
            ...prev,
            location: {
                coordinates: coords,
                address: address || prev.location.address,
                district: district || prev.location.district
            }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCategory) return;
        if (!formData.location.coordinates) {
            alert('Please select a location on the map.');
            return;
        }
        if (!formData.secretPin || formData.secretPin.length !== 4) {
            alert('Please enter a 4-digit PIN.');
            return;
        }

        setIsSubmitting(true);

        const request: ServiceRequest = {
            id: Date.now().toString(),
            category: selectedCategory,
            details: {},
            location: {
                coordinates: formData.location.coordinates,
                district: formData.location.district,
                address: formData.location.address
            },
            contact: {
                name: formData.contactName,
                phone: formData.contactPhone
            },
            secretPin: formData.secretPin,
            status: 'PENDING',
            createdAt: Date.now()
        };

        // Populate details based on category
        if (selectedCategory === 'RESCUE') {
            request.details = {
                waterLevel: formData.waterLevel as any,
                buildingType: formData.buildingType,
                floorLevel: Number(formData.floorLevel),
                safeForHours: Number(formData.safeForHours),
                phoneBattery: Number(formData.phoneBattery),
                peopleCount: formData.peopleCount
            };
        } else if (selectedCategory === 'MEDICAL') {
            request.details = {
                urgency: formData.urgency as any,
                condition: formData.condition,
                ambulanceNeeded: formData.ambulanceNeeded
            };
        } else if (selectedCategory === 'CLEANUP') {
            request.details = {
                peopleNeeded: Number(formData.peopleNeeded),
                taskType: formData.taskType as any
            };
        } else {
            request.details = {
                description: formData.description,
                headcount: Number(formData.headcount)
            };
        }

        try {
            await addServiceRequest(request);
            alert('Request submitted successfully!');
            // Reset form or redirect
            setSelectedCategory(null);
            setFormData({
                waterLevel: 'RISING',
                buildingType: '',
                floorLevel: 0,
                safeForHours: '',
                phoneBattery: '',
                peopleCount: { men: 0, women: 0, children: 0, elderly: 0 },
                urgency: 'CRITICAL',
                condition: '',
                ambulanceNeeded: false,
                peopleNeeded: 1,
                taskType: 'HOUSE_CLEANING',
                description: '',
                headcount: 1,
                contactName: '',
                contactPhone: '',
                secretPin: '',
                location: {
                    coordinates: undefined,
                    district: District.COLOMBO,
                    address: ''
                }
            });
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6 bg-white rounded-2xl shadow-xl border border-gray-100">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{t.reqTitle}</h2>
                <p className="text-gray-500">{t.reqSubtitle}</p>
            </div>

            {/* Step 1: Category Selection */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                {categories.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = selectedCategory === cat.id;
                    return (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id as ServiceCategory)}
                            className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-200 border-2 ${isSelected
                                ? `${cat.color} text-white border-transparent shadow-lg scale-105`
                                : `bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50 text-gray-600`
                                }`}
                        >
                            <Icon size={32} className={`mb-2 ${isSelected ? 'text-white' : cat.text}`} />
                            <span className="font-bold text-sm text-center">{cat.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Step 2: Dynamic Form */}
            {selectedCategory && (
                <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                    <div className={`p-6 rounded-2xl border ${selectedCategory === 'RESCUE' ? 'bg-red-50 border-red-100' :
                        selectedCategory === 'MEDICAL' ? 'bg-rose-50 border-rose-100' :
                            'bg-gray-50 border-gray-200'
                        }`}>
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
                            {t.detailsFor} {categories.find(c => c.id === selectedCategory)?.label}
                        </h3>

                        {/* RESCUE FIELDS */}
                        {selectedCategory === 'RESCUE' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.waterLevel}</label>
                                        <select
                                            value={formData.waterLevel}
                                            onChange={e => setFormData({ ...formData, waterLevel: e.target.value })}
                                            className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 outline-none"
                                        >
                                            <option value="LOW">{t.optLow}</option>
                                            <option value="RISING">{t.optRising}</option>
                                            <option value="HIGH">{t.optHigh}</option>
                                            <option value="EXTREME">{t.optExtreme}</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.buildingType}</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 2-Story House, Apartment"
                                            value={formData.buildingType}
                                            onChange={e => setFormData({ ...formData, buildingType: e.target.value })}
                                            className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">{t.floorLevel}</label>
                                        <input
                                            type="number"
                                            placeholder="0"
                                            value={formData.floorLevel}
                                            onChange={e => setFormData({ ...formData, floorLevel: Number(e.target.value) })}
                                            className="w-full p-2.5 rounded-lg border border-gray-300 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">{t.safeFor}</label>
                                        <input
                                            type="number"
                                            placeholder="e.g. 2"
                                            value={formData.safeForHours}
                                            onChange={e => setFormData({ ...formData, safeForHours: e.target.value })}
                                            className="w-full p-2.5 rounded-lg border border-gray-300 outline-none"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-medium text-gray-700 mb-1">{t.battery}</label>
                                        <input
                                            type="number"
                                            placeholder="e.g. 45"
                                            value={formData.phoneBattery}
                                            onChange={e => setFormData({ ...formData, phoneBattery: e.target.value })}
                                            className="w-full p-2.5 rounded-lg border border-gray-300 outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">{t.peopleCount}</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {[t.men, t.women, t.children, t.elderly].map((type, index) => {
                                            const keys = ['men', 'women', 'children', 'elderly'];
                                            return (
                                                <div key={type}>
                                                    <label className="block text-xs text-gray-500 mb-1">{type}</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={formData.peopleCount[keys[index] as keyof typeof formData.peopleCount]}
                                                        onChange={e => setFormData({
                                                            ...formData,
                                                            peopleCount: {
                                                                ...formData.peopleCount,
                                                                [keys[index]]: Number(e.target.value)
                                                            }
                                                        })}
                                                        className="w-full p-2 rounded-lg border border-gray-300 text-center outline-none"
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* MEDICAL FIELDS */}
                        {selectedCategory === 'MEDICAL' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.urgencyLevel}</label>
                                    <select
                                        value={formData.urgency}
                                        onChange={e => setFormData({ ...formData, urgency: e.target.value })}
                                        className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-500 outline-none"
                                    >
                                        <option value="CRITICAL">{t.optCritical}</option>
                                        <option value="MODERATE">{t.optModerate}</option>
                                        <option value="LOW">{t.optLow}</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.condition}</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Describe symptoms, injuries, or medical needs..."
                                        value={formData.condition}
                                        onChange={e => setFormData({ ...formData, condition: e.target.value })}
                                        className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-500 outline-none"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="ambulance"
                                        checked={formData.ambulanceNeeded}
                                        onChange={e => setFormData({ ...formData, ambulanceNeeded: e.target.checked })}
                                        className="w-5 h-5 text-rose-600 rounded focus:ring-rose-500"
                                    />
                                    <label htmlFor="ambulance" className="text-sm font-medium text-gray-700">{t.ambulance}</label>
                                </div>
                            </div>
                        )}

                        {/* CLEANUP FIELDS */}
                        {selectedCategory === 'CLEANUP' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.taskType}</label>
                                    <select
                                        value={formData.taskType}
                                        onChange={e => setFormData({ ...formData, taskType: e.target.value })}
                                        className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="HOUSE_CLEANING">{t.optHouseClean}</option>
                                        <option value="WELL_CLEANING">{t.optWellClean}</option>
                                        <option value="DEBRIS_REMOVAL">{t.optDebris}</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.peopleNeeded}</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.peopleNeeded}
                                        onChange={e => setFormData({ ...formData, peopleNeeded: Number(e.target.value) })}
                                        className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>
                        )}

                        {/* EVACUATION / OTHER FIELDS */}
                        {(selectedCategory === 'EVACUATION' || selectedCategory === 'OTHER') && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.description}</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Describe your situation..."
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.headcount}</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.headcount}
                                        onChange={e => setFormData({ ...formData, headcount: Number(e.target.value) })}
                                        className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Step 3: Common Fields */}
                    <div className="space-y-6">
                        {/* Location */}
                        <section>
                            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                <MapPin size={20} /> {t.reqLocation}
                            </h3>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                <LocationPicker onLocationSelect={handleLocationSelect} />
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.district}</label>
                                        <select
                                            value={formData.location.district}
                                            onChange={e => setFormData({ ...formData, location: { ...formData.location, district: e.target.value as District } })}
                                            className="w-full p-2.5 rounded-lg border border-gray-300 outline-none"
                                        >
                                            {Object.values(District).map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.cityTown}</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Near the temple, Main Road"
                                            value={formData.location.address}
                                            onChange={e => setFormData({ ...formData, location: { ...formData.location, address: e.target.value } })}
                                            className="w-full p-2.5 rounded-lg border border-gray-300 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Contact */}
                        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <User size={20} /> {t.reqContact}
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.contactName}</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.contactName}
                                            onChange={e => setFormData({ ...formData, contactName: e.target.value })}
                                            className="w-full p-2.5 rounded-lg border border-gray-300 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.contactPhone}</label>
                                        <input
                                            type="tel"
                                            required
                                            value={formData.contactPhone}
                                            onChange={e => setFormData({ ...formData, contactPhone: e.target.value })}
                                            className="w-full p-2.5 rounded-lg border border-gray-300 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <Lock size={20} /> {t.security}
                                </h3>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.secretPin}</label>
                                    <input
                                        type="password"
                                        maxLength={4}
                                        placeholder="****"
                                        required
                                        value={formData.secretPin}
                                        onChange={e => setFormData({ ...formData, secretPin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                                        className="w-full p-2.5 rounded-lg border border-gray-300 outline-none tracking-widest text-center text-lg"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">{t.pinReq}</p>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Step 4: Disclaimer */}
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="text-red-600 shrink-0 mt-0.5" size={20} />
                            <div className="text-sm text-red-800 leading-relaxed">
                                <p className="font-bold mb-1">{t.disclaimerTitle}</p>
                                {t.disclaimerText}
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg transition-all transform hover:scale-[1.01] active:scale-[0.99] ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' :
                            selectedCategory === 'RESCUE' ? 'bg-red-600 hover:bg-red-700 shadow-red-200' :
                                selectedCategory === 'MEDICAL' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200' :
                                    'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                            }`}
                    >
                        {isSubmitting ? t.submitting : t.submitEmerg}
                    </button>

                </form>
            )}
        </div>
    );
};
