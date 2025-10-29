import React, { useState } from 'react';
import { FaMapMarkedAlt, FaTimes } from 'react-icons/fa';
import TravelPlanMap from './TravelPlanMap';
import './MapModal.css';

const MapModal = ({ planId, destination, apiBaseUrl, authToken }) => {
  const [showMap, setShowMap] = useState(false);

  const handleOpenMap = () => {
    setShowMap(true);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  };

  const handleCloseMap = () => {
    setShowMap(false);
    // Restore body scroll
    document.body.style.overflow = 'auto';
  };

  // Close on ESC key
  React.useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && showMap) {
        handleCloseMap();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showMap]);

  return (
    <>
      {/* View Map Button */}
      <button 
        className="view-map-btn"
        onClick={handleOpenMap}
        title="View locations on map"
      >
        <FaMapMarkedAlt />
        <span>View on Map</span>
      </button>

      {/* Modal */}
      {showMap && (
        <div className="map-modal-overlay" onClick={handleCloseMap}>
          <div className="map-modal-container" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="map-modal-header">
              <div className="map-modal-title">
                <FaMapMarkedAlt className="map-modal-icon" />
                <div>
                  <h2>{destination || 'Travel Plan'}</h2>
                  <p>Explore attractions, restaurants, and hotels</p>
                </div>
              </div>
              <button 
                className="map-modal-close"
                onClick={handleCloseMap}
                title="Close map (ESC)"
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Body */}
            <div className="map-modal-body">
              <TravelPlanMap 
                planId={planId}
                apiBaseUrl={apiBaseUrl}
                authToken={authToken}
              />
            </div>

            {/* Modal Footer */}
            <div className="map-modal-footer">
              <div className="map-legend-info">
                <span className="legend-item">
                  <span className="legend-dot red"></span>
                  Attractions
                </span>
                <span className="legend-item">
                  <span className="legend-dot blue"></span>
                  Restaurants
                </span>
                <span className="legend-item">
                  <span className="legend-dot green"></span>
                  Hotels
                </span>
              </div>
              <button 
                className="map-modal-close-btn"
                onClick={handleCloseMap}
              >
                Close Map
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MapModal;
