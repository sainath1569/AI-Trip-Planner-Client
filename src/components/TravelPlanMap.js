import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom marker icons with different colors
const attractionIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const restaurantIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const hotelIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const TravelPlanMap = ({ planId, apiBaseUrl, authToken }) => {
  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (planId) {
      fetchMapData();
    }
  }, [planId]);

  const fetchMapData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🗺️ Fetching map data for plan:', planId);
      
      const response = await fetch(
        `${apiBaseUrl}/maps/plan/${planId}/map-data?radius=5000`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required. Please login again.');
        }
        throw new Error(`Failed to fetch map data: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Map data loaded:', data);
      setMapData(data);
    } catch (error) {
      console.error('❌ Error fetching map data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        height: '600px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f8fafc',
        borderRadius: '8px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="loading-spinner-large-ct"></div>
          <p style={{ marginTop: '16px', color: '#64748b' }}>Loading map data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        height: '600px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#fef2f2',
        borderRadius: '8px',
        border: '1px solid #fecaca'
      }}>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p style={{ color: '#dc2626', marginBottom: '8px', fontWeight: '600' }}>
            Failed to load map
          </p>
          <p style={{ color: '#991b1b', fontSize: '14px', marginBottom: '16px' }}>{error}</p>
          <button 
            onClick={fetchMapData}
            style={{
              padding: '8px 16px',
              background: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!mapData || !mapData.center) {
    return (
      <div style={{ 
        height: '600px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f8fafc',
        borderRadius: '8px'
      }}>
        <p style={{ color: '#64748b' }}>No map data available for this destination</p>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <MapContainer
        center={[mapData.center.lat, mapData.center.lng]}
        zoom={13}
        style={{ height: '600px', width: '100%', borderRadius: '8px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Attractions Markers (Red) */}
        {mapData.attractions && mapData.attractions.map((place, index) => (
          <Marker
            key={`attraction-${index}`}
            position={[place.lat, place.lng]}
            icon={attractionIcon}
          >
            <Popup>
              <div style={{ minWidth: '200px' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#1e293b' }}>
                  {place.name}
                </h3>
                <p style={{ margin: '4px 0', fontSize: '12px', color: '#f59e0b', fontWeight: '600' }}>
                  🎯 Attraction
                </p>
                {place.rating && (
                  <p style={{ margin: '4px 0', fontSize: '14px' }}>
                    ⭐ {place.rating}
                  </p>
                )}
                {place.address && (
                  <p style={{ margin: '4px 0', fontSize: '11px', color: '#64748b' }}>
                    📍 {place.address}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Restaurant Markers (Blue) */}
        {mapData.restaurants && mapData.restaurants.map((place, index) => (
          <Marker
            key={`restaurant-${index}`}
            position={[place.lat, place.lng]}
            icon={restaurantIcon}
          >
            <Popup>
              <div style={{ minWidth: '200px' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#1e293b' }}>
                  {place.name}
                </h3>
                <p style={{ margin: '4px 0', fontSize: '12px', color: '#3b82f6', fontWeight: '600' }}>
                  🍽️ Restaurant
                </p>
                {place.rating && (
                  <p style={{ margin: '4px 0', fontSize: '14px' }}>
                    ⭐ {place.rating}
                  </p>
                )}
                {place.address && (
                  <p style={{ margin: '4px 0', fontSize: '11px', color: '#64748b' }}>
                    📍 {place.address}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Hotel Markers (Green) */}
        {mapData.hotels && mapData.hotels.map((place, index) => (
          <Marker
            key={`hotel-${index}`}
            position={[place.lat, place.lng]}
            icon={hotelIcon}
          >
            <Popup>
              <div style={{ minWidth: '200px' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#1e293b' }}>
                  {place.name}
                </h3>
                <p style={{ margin: '4px 0', fontSize: '12px', color: '#10b981', fontWeight: '600' }}>
                  🏨 Hotel
                </p>
                {place.rating && (
                  <p style={{ margin: '4px 0', fontSize: '14px' }}>
                    ⭐ {place.rating}
                  </p>
                )}
                {place.address && (
                  <p style={{ margin: '4px 0', fontSize: '11px', color: '#64748b' }}>
                    📍 {place.address}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Legend */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        background: 'white',
        padding: '12px 16px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        zIndex: 1000,
        display: 'flex',
        gap: '16px',
        fontSize: '13px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: '#dc2626', fontSize: '16px' }}>●</span>
          <span>Attractions ({mapData.attractions?.length || 0})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: '#3b82f6', fontSize: '16px' }}>●</span>
          <span>Restaurants ({mapData.restaurants?.length || 0})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: '#10b981', fontSize: '16px' }}>●</span>
          <span>Hotels ({mapData.hotels?.length || 0})</span>
        </div>
      </div>
    </div>
  );
};

export default TravelPlanMap;
