// src/Components/Common/LocationPickerModal.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X, Check, Navigation2, Loader2, Search } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import RoutingService from '../../services/routingService';

// Custom marker icon
const createPinIcon = () => L.divIcon({
    className: 'custom-pin-marker',
    html: `
    <div style="
      position: relative;
      width: 40px;
      height: 40px;
    ">
      <div style="
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 4px;
        height: 20px;
        background: linear-gradient(to bottom, #facc15, #eab308);
        border-radius: 2px;
      "></div>
      <div style="
        position: absolute;
        bottom: 16px;
        left: 50%;
        transform: translateX(-50%);
        width: 28px;
        height: 28px;
        background: linear-gradient(135deg, #facc15, #f59e0b);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      ">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1c1917" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
      </div>
    </div>
  `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
});

export default function LocationPickerModal({
    isOpen,
    onClose,
    onConfirm,
    type = 'pickup' // 'pickup' or 'drop'
}) {
    const [selectedCoords, setSelectedCoords] = useState(null);
    const [address, setAddress] = useState('');
    const [isLoadingAddress, setIsLoadingAddress] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markerRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // India center as default
    const defaultCenter = [20.5937, 78.9629];
    const defaultZoom = 5;

    // Reverse geocode coordinates to get address
    const reverseGeocode = useCallback(async (lat, lng) => {
        setIsLoadingAddress(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
                { headers: { 'User-Agent': 'UrbanCabz/1.0' } }
            );

            if (!response.ok) throw new Error('Reverse geocoding failed');

            const data = await response.json();

            if (data && data.display_name) {
                // Format a shorter, more readable address
                const addr = data.address || {};
                const components = [
                    addr.road || addr.neighbourhood || addr.suburb,
                    addr.city || addr.town || addr.village || addr.district,
                    addr.state,
                ].filter(Boolean);

                const shortAddress = components.length > 0
                    ? components.slice(0, 3).join(', ')
                    : data.display_name.split(',').slice(0, 3).join(',');

                setAddress(shortAddress);
                return shortAddress;
            }

            setAddress('Unknown location');
            return 'Unknown location';
        } catch (error) {
            console.error('Reverse geocoding error:', error);
            setAddress('Location selected');
            return 'Location selected';
        } finally {
            setIsLoadingAddress(false);
        }
    }, []);

    // Fetch suggestions
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (searchQuery.length < 2) {
                setSuggestions([]);
                setShowSuggestions(false);
                return;
            }

            setIsSearching(true);
            try {
                const results = await RoutingService.getSuggestions(searchQuery);
                setSuggestions(results);
                setShowSuggestions(results.length > 0);
            } catch (error) {
                console.error('Error fetching suggestions:', error);
            } finally {
                setIsSearching(false);
            }
        };

        const timer = setTimeout(fetchSuggestions, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSuggestionClick = (suggestion) => {
        const { lat, lon, label } = suggestion;

        if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([lat, lon], 16);
            setSelectedCoords({ lat, lon });

            if (markerRef.current) {
                markerRef.current.setLatLng([lat, lon]);
            } else {
                markerRef.current = L.marker([lat, lon], { icon: createPinIcon() })
                    .addTo(mapInstanceRef.current);
            }

            setAddress(label);
            setSearchQuery('');
            setShowSuggestions(false);
        }
    };

    // Initialize map
    useEffect(() => {
        if (!isOpen || !mapRef.current || mapInstanceRef.current) return;

        mapInstanceRef.current = L.map(mapRef.current, {
            zoomControl: true,
            attributionControl: false,
        }).setView(defaultCenter, defaultZoom);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
        }).addTo(mapInstanceRef.current);

        // Handle map clicks
        mapInstanceRef.current.on('click', (e) => {
            const { lat, lng } = e.latlng;
            setSelectedCoords({ lat, lng });

            // Update or create marker
            if (markerRef.current) {
                markerRef.current.setLatLng([lat, lng]);
            } else {
                markerRef.current = L.marker([lat, lng], { icon: createPinIcon() })
                    .addTo(mapInstanceRef.current);
            }

            // Get address for this location
            reverseGeocode(lat, lng);
        });

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
                markerRef.current = null;
            }
        };
    }, [isOpen, reverseGeocode]);

    // Cleanup on close
    useEffect(() => {
        if (!isOpen) {
            setSelectedCoords(null);
            setAddress('');
            setSearchQuery('');
            setSuggestions([]);
            setShowSuggestions(false);
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
                markerRef.current = null;
            }
        }
    }, [isOpen]);

    // Get user's current location
    const locateMe = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;

                if (mapInstanceRef.current) {
                    mapInstanceRef.current.setView([latitude, longitude], 15);

                    setSelectedCoords({ lat: latitude, lng: longitude });

                    if (markerRef.current) {
                        markerRef.current.setLatLng([latitude, longitude]);
                    } else {
                        markerRef.current = L.marker([latitude, longitude], { icon: createPinIcon() })
                            .addTo(mapInstanceRef.current);
                    }

                    reverseGeocode(latitude, longitude);
                }
                setIsLocating(false);
            },
            (error) => {
                console.error('Geolocation error:', error);
                alert('Unable to get your location. Please pin manually.');
                setIsLocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const handleConfirm = () => {
        if (selectedCoords && address) {
            onConfirm({
                coords: selectedCoords,
                address: address,
                displayName: `📍 ${address}`,
            });
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-stone-900 rounded-2xl w-full max-w-2xl h-[80vh] max-h-[600px] flex flex-col overflow-hidden border border-white/10 shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex flex-col border-b border-white/10 bg-stone-950/50">
                        <div className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-yellow-400/20 flex items-center justify-center">
                                    <MapPin className="w-5 h-5 text-yellow-400" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white">
                                        Pin {type === 'pickup' ? 'Pickup' : 'Drop-off'} Location
                                    </h2>
                                    <p className="text-xs text-stone-400">Search or tap on the map</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                            >
                                <X className="w-5 h-5 text-stone-400" />
                            </button>
                        </div>

                        {/* Search Bar */}
                        <div className="px-4 pb-4 relative">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search for a place (e.g. Chanlodiya)"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm focus:border-yellow-400/50 outline-none transition-all"
                                />
                                {isSearching && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />
                                    </div>
                                )}
                            </div>

                            {/* Suggestions Dropdown */}
                            <AnimatePresence>
                                {showSuggestions && searchQuery.length >= 2 && (
                                    <motion.ul
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute left-4 right-4 top-full mt-1 bg-stone-800 border border-white/10 rounded-xl shadow-2xl z-[2000] max-h-60 overflow-y-auto divide-y divide-white/5"
                                    >
                                        {suggestions.map((s, i) => (
                                            <li
                                                key={i}
                                                onClick={() => handleSuggestionClick(s)}
                                                className="px-4 py-3 hover:bg-white/5 cursor-pointer text-sm text-stone-200 flex items-start gap-3 transition-colors"
                                            >
                                                <MapPin className="w-4 h-4 text-stone-500 mt-0.5 shrink-0" />
                                                <span>{s.label}</span>
                                            </li>
                                        ))}
                                    </motion.ul>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Map Container */}
                    <div className="flex-1 relative">
                        <div ref={mapRef} className="w-full h-full" />

                        {/* Locate Me Button */}
                        <button
                            onClick={locateMe}
                            disabled={isLocating}
                            className="absolute bottom-4 right-4 bg-white text-stone-900 px-4 py-2.5 rounded-xl font-medium shadow-lg hover:bg-stone-100 transition-all flex items-center gap-2 disabled:opacity-50 z-[1000]"
                        >
                            {isLocating ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Navigation2 className="w-4 h-4" />
                            )}
                            <span className="text-sm">Use My Location</span>
                        </button>

                        {/* Instructions overlay when no location selected */}
                        {!selectedCoords && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[999]">
                                <div className="bg-stone-900/90 backdrop-blur-sm px-6 py-3 rounded-xl border border-white/10">
                                    <p className="text-stone-300 text-sm">👆 Tap anywhere on the map to pin your location</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer with selected location */}
                    <div className="p-4 border-t border-white/10 bg-stone-950/50">
                        {selectedCoords ? (
                            <div className="flex items-center gap-4">
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">Selected Location</p>
                                    {isLoadingAddress ? (
                                        <div className="flex items-center gap-2 text-stone-400">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span className="text-sm">Getting address...</span>
                                        </div>
                                    ) : (
                                        <p className="text-white font-medium truncate">{address}</p>
                                    )}
                                </div>
                                <button
                                    onClick={handleConfirm}
                                    disabled={isLoadingAddress}
                                    className="bg-yellow-400 hover:bg-yellow-300 text-stone-900 px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-yellow-400/20"
                                >
                                    <Check className="w-5 h-5" />
                                    <span>Confirm</span>
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-2">
                                <p className="text-stone-500 text-sm">No location selected yet</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
