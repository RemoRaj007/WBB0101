import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import SLDistrictsMap from '../../assets/sri-lanka-districts.json';
import { getDistrictStats } from '../../network/reliefService';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { MapPin, TrendingUp, Users, Award } from 'lucide-react';

// Fix for default marker icon in React Leaflet
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const normalizeDistrictName = (name: string) => {
    return name.replace(" District", "").trim();
};

const DistrictMap: React.FC = () => {
    const [stats, setStats] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);
    const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);

    useEffect(() => {
        getDistrictStats()
            .then(res => {
                setStats(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch district stats", err);
                setLoading(false);
            });
    }, []);

    const districtMapData = useMemo(() => {
        const map: Record<string, number> = {};
        Object.keys(stats).forEach(district => {
            const data = stats[district];
            const total = (data.pending || 0) + (data.approved || 0) + (data.rejected || 0);
            map[district] = total;
        });
        return map;
    }, [stats]);

    const maxDistrictCount = useMemo(() => {
        const values = Object.values(districtMapData);
        if (values.length === 0) return 1;
        return Math.max(...values, 1);
    }, [districtMapData]);

    const getDistrictColor = (count: number, maxCount: number) => {
        if (count === 0) return "#f1f5f9"; // Light gray for no data
        const intensity = Math.min(count / (maxCount || 1), 1);
        
        // Professional blue gradient with better visibility
        if (intensity < 0.2) return "#bfdbfe"; // Very light blue
        if (intensity < 0.4) return "#93c5fd"; // Light blue
        if (intensity < 0.6) return "#60a5fa"; // Medium-light blue
        if (intensity < 0.8) return "#3b82f6"; // Medium blue
        return "#1e40af"; // Dark blue
    };

    const getTotalRequests = () => {
        return Object.values(districtMapData).reduce((a, b) => a + b, 0);
    };

    const getAveragePerDistrict = () => {
        const total = getTotalRequests();
        const districts = Object.keys(districtMapData).length;
        return districts ? Math.round(total / districts) : 0;
    };

    const onEachFeature = (feature: any, layer: any) => {
        const districtName = normalizeDistrictName(feature.properties.shapeName);
        let safeName = districtName;
        if (districtName === "Moneragala") safeName = "Monaragala";

        const count = districtMapData[safeName] || 0;
        const districtData = stats[safeName] || { pending: 0, approved: 0, rejected: 0 };

        // Set initial style with strong borders
        layer.setStyle({
            fillColor: getDistrictColor(count, maxDistrictCount),
            weight: 1.5, // Thicker border
            opacity: 1,
            color: '#334155', // Dark gray border for visibility
            dashArray: null,
            fillOpacity: 0.8
        });

        const tooltipContent = `
            <div style="padding: 12px; min-width: 220px; font-family: system-ui, -apple-system, sans-serif; background: white; border-radius: 10px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); border: 1px solid #e2e8f0;">
                <div style="display: flex; align-items: center; gap: 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 10px;">
                    <div style="background: #1e40af; width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z" />
                            <circle cx="12" cy="10" r="3" />
                        </svg>
                    </div>
                    <div>
                        <p style="font-weight: 600; color: #0f172a; margin: 0; font-size: 15px;">${districtName} District</p>
                        <p style="color: #475569; font-size: 11px; margin: 2px 0 0 0;">${feature.properties.shapeName}</p>
                    </div>
                </div>
                
                <div style="background: #f8fafc; padding: 10px; border-radius: 8px; margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                        <span style="color: #475569; font-size: 12px;">Total Requests</span>
                        <span style="font-weight: 700; color: #1e40af; font-size: 18px;">${count}</span>
                    </div>
                    <div style="width: 100%; height: 4px; background: #e2e8f0; border-radius: 2px;">
                        <div style="width: ${maxDistrictCount ? (count / maxDistrictCount) * 100 : 0}%; height: 4px; background: #1e40af; border-radius: 2px;"></div>
                    </div>
                </div>
                
                <div style="border-top: 1px solid #e2e8f0; padding-top: 10px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
                        <div style="text-align: center;">
                            <div style="background: #fef3c7; padding: 6px; border-radius: 6px;">
                                <span style="font-weight: 700; color: #d97706; font-size: 14px;">${districtData.pending || 0}</span>
                                <p style="color: #92400e; font-size: 9px; margin: 2px 0 0 0;">Pending</p>
                            </div>
                        </div>
                        <div style="text-align: center;">
                            <div style="background: #d1fae5; padding: 6px; border-radius: 6px;">
                                <span style="font-weight: 700; color: #059669; font-size: 14px;">${districtData.approved || 0}</span>
                                <p style="color: #065f46; font-size: 9px; margin: 2px 0 0 0;">Approved</p>
                            </div>
                        </div>
                        <div style="text-align: center;">
                            <div style="background: #fee2e2; padding: 6px; border-radius: 6px;">
                                <span style="font-weight: 700; color: #dc2626; font-size: 14px;">${districtData.rejected || 0}</span>
                                <p style="color: #991b1b; font-size: 9px; margin: 2px 0 0 0;">Rejected</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        layer.bindTooltip(tooltipContent, { 
            sticky: true, 
            opacity: 1,
            direction: 'top',
            offset: [0, -10]
        });

        layer.on({
            mouseover: (e: any) => {
                const l = e.target;
                l.setStyle({ 
                    weight: 3, 
                    color: '#2563eb', 
                    fillOpacity: 1,
                    dashArray: ''
                });
                l.bringToFront();
            },
            mouseout: (e: any) => {
                const l = e.target;
                l.setStyle({ 
                    weight: 1.5, 
                    color: '#334155', 
                    fillOpacity: 0.8 
                });
            },
            click: (e: any) => {
                setSelectedDistrict(districtName);
                const l = e.target;
                l.setStyle({ 
                    weight: 4, 
                    color: '#1e40af', 
                    fillOpacity: 1,
                    dashArray: ''
                });
            }
        });
    };

    return (
        <div className="h-[712px] w-full relative bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between absolute top-0 left-0 right-0 z-[500] bg-white/95 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
                        <MapPin className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-gray-800">
                            Sri Lanka - District wise Distribution
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Relief request density by district
                        </p>
                    </div>
                </div>

                {/* Stats Summary */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-100">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-medium text-gray-700">
                            Total: <span className="text-blue-700 font-semibold">{getTotalRequests()}</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="text-xs font-medium text-gray-700">
                            Avg: <span className="text-gray-900 font-semibold">{getAveragePerDistrict()}</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Map Container */}
            <MapContainer
                center={[7.8731, 80.7718]}
                zoom={7.5}
                style={{ height: '100%', width: '100%', background: '#e6f0fa' }}
                zoomControl={true}
                scrollWheelZoom={true}
                attributionControl={true}
            >
                <GeoJSON
                    data={SLDistrictsMap as any}
                    onEachFeature={onEachFeature}
                    style={{
                        weight: 1.5,
                        color: '#334155',
                        opacity: 1,
                        fillOpacity: 0.8
                    }}
                />
            </MapContainer>

            {/* Legend */}
            <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-gray-200 z-[500] min-w-[180px]">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
                    <Award className="w-4 h-4 text-blue-600" />
                    <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                        Request Density
                    </h4>
                </div>
                <div className="space-y-2.5">
                    <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded bg-[#1e40af] border border-gray-300"></div>
                        <span className="text-xs text-gray-600">Very High (80%+)</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded bg-[#3b82f6] border border-gray-300"></div>
                        <span className="text-xs text-gray-600">High (60-80%)</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded bg-[#60a5fa] border border-gray-300"></div>
                        <span className="text-xs text-gray-600">Medium (40-60%)</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded bg-[#93c5fd] border border-gray-300"></div>
                        <span className="text-xs text-gray-600">Low (20-40%)</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded bg-[#bfdbfe] border border-gray-300"></div>
                        <span className="text-xs text-gray-600">Minimal (1-20%)</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded bg-[#f1f5f9] border border-gray-300"></div>
                        <span className="text-xs text-gray-600">No Data</span>
                    </div>
                </div>

                {/* Selected District Info */}
                {selectedDistrict && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-[10px] text-gray-400">Selected District</p>
                        <p className="text-sm font-medium text-gray-800 mt-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-blue-600" />
                            {selectedDistrict}
                        </p>
                    </div>
                )}
            </div>

            {/* Loading Overlay */}
            {loading && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-[1000]">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-3 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
                        <p className="text-sm text-gray-600 font-medium">Loading district data...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DistrictMap;