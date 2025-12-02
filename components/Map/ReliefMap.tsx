import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Need, Event, Person, Volunteer, NeedStatus, Coordinates, ServiceRequest } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

const SVGs = {
    medical: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.28 3.6-1.28 5.14 0 .34.66.63 1.37.63 2.24 0 4.7-7 9-12 11-5-2-12-6.3-12-11 0-.87.29-1.58.63-2.24 1.54-1.28 3.65-1.28 5.14 0 1.03.86 2.23 1.77 3.23 1.77 1 0 2.2-.91 3.23-1.77z"></path></svg>`, // Heart
    food: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>`, // Utensils
    water: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.74 5.88a6 6 0 0 1-8.48 8.48A6 6 0 0 1 5.26 8.57L12 2.69z"/></svg>`, // Droplet
    clothing: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg>`, // Shirt
    baby: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12h.01M15 12h.01M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 19 6.3z"/></svg>`, // Baby/Face
    other: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`, // Box
    rescue: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="4.93" y1="4.93" x2="9.17" y2="9.17"/><line x1="14.83" y1="14.83" x2="19.07" y2="19.07"/><line x1="14.83" y1="9.17" x2="19.07" y2="4.93"/><line x1="14.83" y1="9.17" x2="18.36" y2="5.64"/><line x1="4.93" y1="19.07" x2="9.17" y2="14.83"/></svg>`, // LifeBuoy (Simulated)
    cleanup: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`, // Trash
    volunteer: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`, // User
    safe: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`, // CheckCircle
    missing: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`, // AlertTriangle
    tools: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`, // Tool
    default: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>`
};

const createCustomIcon = (color: string, svgContent: string, className: string = '') => {
    return new L.DivIcon({
        className: `custom-marker ${className}`,
        html: `
            <div style="
                background-color: ${color};
                width: 36px;
                height: 36px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 3px solid white;
                box-shadow: 0 4px 6px rgba(0,0,0,0.3);
                color: white;
            ">
                ${svgContent}
            </div>
            <div style="
                width: 0; 
                height: 0; 
                border-left: 8px solid transparent;
                border-right: 8px solid transparent;
                border-top: 10px solid ${color};
                position: absolute;
                bottom: -8px;
                left: 10px;
            "></div>
        `,
        iconSize: [36, 46],
        iconAnchor: [18, 46],
        popupAnchor: [0, -46]
    });
};

interface ReliefMapProps {
    items: (Need | Event | Person | Volunteer | ServiceRequest)[];
    height?: string;
    legendMode?: 'all' | 'person' | 'volunteer' | 'needs';
    focusedLocation?: Coordinates | null;
}

const SRI_LANKA_CENTER: [number, number] = [7.8731, 80.7718];
const DEFAULT_ZOOM = 7;

// Component to update map view when items change or focus changes
const MapUpdater: React.FC<{ items: (Need | Event | Person | Volunteer | ServiceRequest)[], focusedLocation?: Coordinates | null }> = ({ items, focusedLocation }) => {
    const map = useMap();

    useEffect(() => {
        if (focusedLocation && typeof focusedLocation.lat === 'number' && !isNaN(focusedLocation.lat) && typeof focusedLocation.lng === 'number' && !isNaN(focusedLocation.lng)) {
            map.flyTo([focusedLocation.lat, focusedLocation.lng], 15, {
                duration: 1.5
            });
        } else if (items.length > 0) {
            const bounds = L.latLngBounds(items.map(item => {
                const hasLocationObj = 'location' in item && typeof item.location === 'object' && item.location !== null;
                const coords = hasLocationObj && 'coordinates' in (item.location as any)
                    ? (item.location as any).coordinates
                    : item.coordinates;
                return [coords?.lat || 0, coords?.lng || 0];
            }).filter(coords => coords[0] !== 0));

            if (bounds.isValid()) {
                map.fitBounds(bounds, { padding: [50, 50] });
            }
        }
    }, [items, map, focusedLocation]);

    return null;
};

export const ReliefMap: React.FC<ReliefMapProps> = ({ items, height = '400px', legendMode = 'all', focusedLocation }) => {
    const { t } = useLanguage();

    // Filter out completed items and items without coordinates
    const itemsWithCoords = items.filter(item => {
        const hasLocationObj = 'location' in item && typeof item.location === 'object' && item.location !== null;
        const coords = hasLocationObj && 'coordinates' in (item.location as any)
            ? (item.location as any).coordinates
            : item.coordinates;

        const hasValidCoords = coords && typeof coords.lat === 'number' && !isNaN(coords.lat) && typeof coords.lng === 'number' && !isNaN(coords.lng);

        if (!hasValidCoords) return false;

        // Filter out completed needs (but not ServiceRequests which have 'details')
        if ('status' in item && !('details' in item) && (item as Need).status === NeedStatus.RECEIVED) {
            return false;
        }

        return true;
    });



    const getIcon = (item: Need | Event | Person | Volunteer | ServiceRequest) => {
        if ('details' in item) {
            // It's a ServiceRequest
            const req = item as ServiceRequest;
            if (req.category === 'MEDICAL') return createCustomIcon('#ef4444', SVGs.medical);
            if (req.category === 'RESCUE') return createCustomIcon('#f97316', SVGs.rescue);
            if (req.category === 'CLEANUP') return createCustomIcon('#10b981', SVGs.cleanup);
            if (req.category === 'EVACUATION') return createCustomIcon('#f97316', SVGs.rescue); // Use rescue icon for evacuation
            return createCustomIcon('#6366f1', SVGs.tools);
        }

        if ('category' in item) {
            // It's a Need
            const need = item as Need;

            // Service Requests
            if (need.type === 'SERVICE') {
                if (need.category === 'MEDICAL_AID') return createCustomIcon('#ef4444', SVGs.medical, 'blinking-icon'); // Red - Critical
                if (need.category === 'RESCUE') return createCustomIcon('#f97316', SVGs.rescue, 'blinking-icon'); // Orange - Critical
                if (need.category === 'CLEANUP') return createCustomIcon('#10b981', SVGs.cleanup); // Green
                return createCustomIcon('#6366f1', SVGs.tools); // Indigo for General Service
            }

            // Goods Requests
            const isHighUrgency = need.urgency === 'HIGH';
            const blinkClass = isHighUrgency ? 'blinking-icon' : '';

            if (need.category === 'FOOD') return createCustomIcon('#f59e0b', SVGs.food, blinkClass); // Amber
            if (need.category === 'WATER') return createCustomIcon('#0ea5e9', SVGs.water, blinkClass); // Sky Blue
            if (need.category === 'MEDICINE') return createCustomIcon('#ef4444', SVGs.medical, blinkClass); // Red
            if (need.category === 'CLOTHING') return createCustomIcon('#8b5cf6', SVGs.clothing, blinkClass); // Violet
            if (need.category === 'BABY_ITEMS') return createCustomIcon('#ec4899', SVGs.baby, blinkClass); // Pink
            if (need.category === 'OTHER') return createCustomIcon('#64748b', SVGs.other, blinkClass); // Slate

            // Status based fallback
            if (need.status === NeedStatus.REQUESTED) return createCustomIcon('#ef4444', SVGs.default, 'blinking-icon');
            if (need.status === NeedStatus.PARTIALLY_PLEDGED) return createCustomIcon('#f59e0b', SVGs.default);
            if (need.status === NeedStatus.FULLY_PLEDGED) return createCustomIcon('#10b981', SVGs.safe);

            return createCustomIcon('#10b981', SVGs.safe);
        }

        if ('skills' in item) {
            // It's a Volunteer
            return createCustomIcon('#a855f7', SVGs.volunteer); // Purple
        }

        if ('title' in item) {
            // It's an Event
            return createCustomIcon('#ec4899', SVGs.default); // Pink
        }

        // Person
        const person = item as Person;
        const status = person.status ? person.status.toUpperCase() : 'MISSING';
        if (status === 'MISSING') return createCustomIcon('#ef4444', SVGs.missing, 'blinking-icon');
        return createCustomIcon('#10b981', SVGs.safe);
    };

    const [selectedFilters, setSelectedFilters] = React.useState<string[]>([]);
    const [isLegendOpen, setIsLegendOpen] = React.useState(false);

    const legendItems = [
        { id: 'medical', mode: ['all', 'needs', 'volunteer'], color: 'bg-red-500', svg: SVGs.medical, label: t.legend.medical },
        { id: 'food', mode: ['all', 'needs'], color: 'bg-amber-500', svg: SVGs.food, label: t.legend.food },
        { id: 'water', mode: ['all', 'needs'], color: 'bg-sky-500', svg: SVGs.water, label: t.legend.water },
        { id: 'clothing', mode: ['all', 'needs'], color: 'bg-violet-500', svg: SVGs.clothing, label: t.legend.clothing },
        { id: 'baby', mode: ['all', 'needs'], color: 'bg-pink-500', svg: SVGs.baby, label: t.legend.baby },
        { id: 'other', mode: ['all', 'needs'], color: 'bg-slate-500', svg: SVGs.other, label: t.legend.other },
        { id: 'rescue', mode: ['all', 'needs', 'volunteer'], color: 'bg-orange-500', svg: SVGs.rescue, label: t.legend.rescue },
        { id: 'cleanup', mode: ['all', 'needs', 'volunteer'], color: 'bg-emerald-500', svg: SVGs.cleanup, label: t.legend.cleanup },
        { id: 'service', mode: ['all', 'needs', 'volunteer'], color: 'bg-indigo-500', svg: SVGs.tools, label: t.legend.service },
        { id: 'volunteer', mode: ['all', 'volunteer'], color: 'bg-purple-500', svg: SVGs.volunteer, label: t.legend.volunteer },
        { id: 'safe', mode: ['all'], color: 'bg-emerald-500', svg: SVGs.safe, label: t.legend.safe },
        { id: 'missing', mode: ['all', 'person'], color: 'bg-red-500', svg: SVGs.missing, label: t.legend.missing, textColor: 'text-red-600 font-bold' },
        { id: 'event', mode: ['all'], color: 'bg-pink-500', svg: SVGs.default, label: t.legend.event },
    ];

    const filteredLegend = legendItems.filter(item => item.mode.includes(legendMode));

    // Initialize filters on mount or when legendMode changes
    React.useEffect(() => {
        setSelectedFilters(filteredLegend.map(item => item.id));
    }, [legendMode]);

    const getItemCategory = (item: Need | Event | Person | Volunteer | ServiceRequest): string => {
        if ('details' in item) {
            const req = item as ServiceRequest;
            if (req.category === 'MEDICAL') return 'medical';
            if (req.category === 'RESCUE') return 'rescue';
            if (req.category === 'CLEANUP') return 'cleanup';
            return 'service';
        }

        if ('category' in item) {
            const need = item as Need;
            if (need.type === 'SERVICE') {
                if (need.category === 'MEDICAL_AID') return 'medical';
                if (need.category === 'RESCUE') return 'rescue';
                if (need.category === 'CLEANUP') return 'cleanup';
                return 'service'; // General service request
            }
            if (need.category === 'FOOD') return 'food';
            if (need.category === 'WATER') return 'water';
            if (need.category === 'MEDICINE') return 'medical';
            if (need.category === 'CLOTHING') return 'clothing';
            if (need.category === 'BABY_ITEMS') return 'baby';
            if (need.category === 'OTHER') return 'other';
            // Fallback for needs not explicitly categorized in legend, or based on status
            if (need.status === NeedStatus.REQUESTED) return 'medical'; // High urgency
            if (need.status === NeedStatus.PARTIALLY_PLEDGED) return 'food'; // Medium urgency
            return 'safe'; // Fulfilled or other safe status
        }
        if ('skills' in item) {
            return 'volunteer';
        }
        if ('title' in item) {
            return 'event';
        }

        const person = item as Person;
        // Case-insensitive check for safety
        const status = person.status ? person.status.toUpperCase() : 'MISSING';
        return status === 'MISSING' ? 'missing' : 'safe';
    };

    const toggleFilter = (id: string) => {
        setSelectedFilters(prev =>
            prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
        );
    };

    const filteredItems = itemsWithCoords.filter(item => selectedFilters.includes(getItemCategory(item)));

    const isPercentageHeight = height === '100%';

    return (
        <div className={`flex flex-col gap-4 ${isPercentageHeight ? 'h-full' : ''}`}>
            <div
                className={`rounded-xl overflow-hidden shadow-lg border border-gray-100 relative ${isPercentageHeight ? 'flex-1 min-h-0' : ''}`}
                style={isPercentageHeight ? {} : { height }}
            >
                <MapContainer
                    center={SRI_LANKA_CENTER}
                    zoom={DEFAULT_ZOOM}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={false}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {filteredItems.map((item) => (
                        <Marker
                            key={item.id}
                            position={(() => {
                                const hasLocationObj = 'location' in item && typeof item.location === 'object' && item.location !== null;
                                const coords = hasLocationObj && 'coordinates' in (item.location as any)
                                    ? (item.location as any).coordinates
                                    : item.coordinates;
                                return [coords!.lat, coords!.lng];
                            })()}
                            icon={getIcon(item)}
                        >
                            <Popup>
                                <div className="p-1 min-w-[200px]">
                                    {'image' in item && (item as Person).image && (
                                        <img
                                            src={(item as Person).image}
                                            alt={(item as Person).name}
                                            className="w-full h-32 object-cover rounded-lg mb-2"
                                        />
                                    )}
                                    <h3 className="font-bold text-base mb-1">
                                        {'details' in item ?
                                            ((item as ServiceRequest).category === 'RESCUE' ? t.reqCatRescue :
                                                (item as ServiceRequest).category === 'MEDICAL' ? t.reqCatMedical :
                                                    (item as ServiceRequest).category === 'EVACUATION' ? t.reqCatEvacuation :
                                                        (item as ServiceRequest).category === 'CLEANUP' ? t.reqCatCleanup : t.reqCatOther) :
                                            'item' in item ? (item as Need).item :
                                                'title' in item ? (item as Event).title :
                                                    'skills' in item ? (item as Volunteer).name :
                                                        (item as Person).name}
                                    </h3>

                                    {/* Person Details */}
                                    {'status' in item && (item as Person).status === 'MISSING' && (
                                        <div className="mb-2 text-xs space-y-1">
                                            <div className="flex gap-2">
                                                <span className="font-semibold">Age:</span> {(item as Person).age || 'N/A'}
                                                <span className="font-semibold ml-2">Gender:</span> {(item as Person).gender || 'N/A'}
                                            </div>
                                            {(item as Person).lastSeenDate && (
                                                <div><span className="font-semibold">Last Seen:</span> {(item as Person).lastSeenDate}</div>
                                            )}
                                            {(item as Person).physicalDescription && (
                                                <div className="italic text-gray-600 mt-1">"{(item as Person).physicalDescription}"</div>
                                            )}
                                        </div>
                                    )}

                                    <p className="text-xs text-gray-600 mb-2 flex items-center gap-1">
                                        📍 {'location' in item ?
                                            (typeof item.location === 'string' ? item.location : item.location.address)
                                            : (item as Person).lastSeenLocation}
                                    </p>

                                    {'skills' in item && (
                                        <div className="mb-2">
                                            <div className="flex flex-wrap gap-1">
                                                {(item as Volunteer).skills.map(skill => (
                                                    <span key={skill} className="text-[10px] px-1.5 py-0.5 bg-green-50 text-green-700 rounded border border-green-100">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {'details' in item && (
                                        <div className="mb-1 flex flex-col gap-1">
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium w-fit bg-blue-100 text-blue-700`}>
                                                🛠️ SERVICE
                                            </span>
                                            {(item as ServiceRequest).details.urgency === 'CRITICAL' && (
                                                <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-red-100 text-red-700 w-fit">
                                                    CRITICAL
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {'urgency' in item && (
                                        <div className="mb-1 flex flex-col gap-1">
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium w-fit ${(item as Need).urgency === 'HIGH' ? 'bg-red-100 text-red-700' :
                                                (item as Need).urgency === 'MEDIUM' ? 'bg-orange-100 text-orange-700' :
                                                    'bg-green-100 text-green-700'
                                                }`}>
                                                {(item as Need).urgency} URGENCY
                                            </span>
                                            {(item as Need).type === 'SERVICE' && (
                                                <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-blue-100 text-blue-700 w-fit">
                                                    🛠️ SERVICE
                                                </span>
                                            )}
                                            {'pledgedAmount' in item && (
                                                <div className="text-[10px] text-gray-600">
                                                    Pledged: {(item as Need).pledgedAmount || 0} / {(item as Need).quantity}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
                                        {'contactNumber' in item && (item as any).contactNumber && (
                                            <div className="flex items-center gap-1 font-medium text-gray-700">
                                                📞 {(item as any).contactNumber}
                                            </div>
                                        )}
                                        {'reporterContact' in item && (item as Person).reporterContact && (
                                            <div className="flex items-center gap-1 font-medium text-gray-700">
                                                📞 Reporter: {(item as Person).reporterContact}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}

                    <MapUpdater items={filteredItems} focusedLocation={focusedLocation} />

                    {/* Floating Map Legend */}
                    <div className="absolute bottom-6 left-6 z-[1000]">
                        {isLegendOpen ? (
                            <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-xl border border-gray-200 max-w-[280px] animate-in slide-in-from-bottom-5 duration-300">
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="text-xs font-bold text-gray-800 flex items-center gap-2 uppercase tracking-wider">
                                        <span className="bg-blue-100 p-1 rounded text-blue-600">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                                        </span>
                                        {t.legend.title}
                                    </h4>
                                    <button
                                        onClick={() => setIsLegendOpen(false)}
                                        className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                    </button>
                                </div>
                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                                    {filteredLegend.map((item) => {
                                        const isSelected = selectedFilters.includes(item.id);
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => toggleFilter(item.id)}
                                                className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all border text-left group
                                                    ${isSelected
                                                        ? 'bg-white border-gray-100 shadow-sm hover:border-blue-200'
                                                        : 'bg-gray-50 border-transparent opacity-50 hover:opacity-70 grayscale'
                                                    }`}
                                            >
                                                <div className={`w-6 h-6 rounded-full ${item.color} flex items-center justify-center text-white p-1 shadow-sm transition-transform ${isSelected ? 'scale-100' : 'scale-90'}`}>
                                                    <div dangerouslySetInnerHTML={{ __html: item.svg }} className="w-full h-full" />
                                                </div>
                                                <span className={`text-xs ${item.textColor || 'text-gray-600 font-medium group-hover:text-gray-900'}`}>{item.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsLegendOpen(true)}
                                className="bg-white text-gray-700 p-3 rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 hover:scale-105 transition-all flex items-center gap-2 font-bold text-sm"
                            >
                                <span className="bg-blue-100 p-1 rounded-full text-blue-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                                </span>
                                <span className="hidden md:inline">{t.legend.title}</span>
                            </button>
                        )}
                    </div>
                </MapContainer>
            </div >
        </div >
    );
};
