import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Coordinates, District } from '../../types';
import { Search, Loader2, Crosshair } from 'lucide-react';

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationPickerProps {
    onLocationSelect: (coords: Coordinates, address?: string, district?: District) => void;
    initialCoords?: Coordinates;
}

const SRI_LANKA_CENTER: [number, number] = [7.8731, 80.7718];
const DEFAULT_ZOOM = 7;

const MapEvents: React.FC<{ onSelect: (coords: Coordinates) => void }> = ({ onSelect }) => {
    useMapEvents({
        click(e) {
            onSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
        },
    });
    return null;
};

const MapUpdater: React.FC<{ center: [number, number], zoom: number }> = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
};

export const LocationPicker: React.FC<LocationPickerProps> = ({ onLocationSelect, initialCoords }) => {
    const [selectedPos, setSelectedPos] = useState<Coordinates | undefined>(initialCoords);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [mapCenter, setMapCenter] = useState<[number, number]>(initialCoords ? [initialCoords.lat, initialCoords.lng] : SRI_LANKA_CENTER);
    const [mapZoom, setMapZoom] = useState(initialCoords ? 13 : DEFAULT_ZOOM);

    const handleSelect = async (coords: Coordinates) => {
        setSelectedPos(coords);

        // Reverse Geocoding
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`);
            const data = await response.json();

            let district: District | undefined;
            const address = data.display_name;
            const addressParts = address.split(', ');

            // Simple district detection logic
            const districtNames = Object.values(District);
            for (const part of addressParts) {
                const match = districtNames.find(d => part.includes(d));
                if (match) {
                    district = match;
                    break;
                }
            }

            onLocationSelect(coords, address, district);
        } catch (error) {
            console.error("Reverse geocoding failed", error);
            onLocationSelect(coords);
        }
    };

    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const newCoords = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                setSelectedPos(newCoords);
                setMapCenter([newCoords.lat, newCoords.lng]);
                setMapZoom(15);
                handleSelect(newCoords);
                setIsLocating(false);
            },
            (error) => {
                console.error("Geolocation error:", error);
                let errorMessage = 'Unable to retrieve your location';

                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Location permission denied. Please enable location access in your browser settings.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Location information is unavailable. Please try again.';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'The request to get your location timed out.';
                        break;
                }

                alert(errorMessage);
                setIsLocating(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ', Sri Lanka')}&countrycodes=lk`);
            const data = await response.json();

            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                const newCoords = { lat: parseFloat(lat), lng: parseFloat(lon) };
                setSelectedPos(newCoords);
                setMapCenter([newCoords.lat, newCoords.lng]);
                setMapZoom(13);
                handleSelect(newCoords); // Trigger reverse geocoding for the searched location
            } else {
                alert('Location not found');
            }
        } catch (error) {
            console.error("Search failed", error);
            alert('Search failed');
        } finally {
            setIsSearching(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent form submission if inside a form
            handleSearch();
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex gap-2">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search city or place..."
                    className="flex-1 border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    disabled={isLocating}
                    className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
                    title="Use Current Location"
                >
                    {isLocating ? <Loader2 size={18} className="animate-spin" /> : <Crosshair size={18} />}
                </button>
                <button
                    type="button"
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    {isSearching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                </button>
            </div>

            <div className="h-[300px] w-full rounded-xl overflow-hidden border border-gray-300 relative z-0">
                <MapContainer
                    center={mapCenter}
                    zoom={mapZoom}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapEvents onSelect={handleSelect} />
                    <MapUpdater center={mapCenter} zoom={mapZoom} />
                    {selectedPos && (
                        <Marker position={[selectedPos.lat, selectedPos.lng]} />
                    )}
                </MapContainer>
                <div className="absolute bottom-2 left-2 right-2 bg-white/90 p-2 text-xs text-center rounded shadow z-[1000] pointer-events-none">
                    Click on map to auto-detect district
                </div>
            </div>
        </div>
    );
};
