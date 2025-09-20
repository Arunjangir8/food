import React, { createContext, useContext, useState } from 'react';

const LocationContext = createContext();

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

export const LocationProvider = ({ children }) => {
  const [selectedLocation, setSelectedLocation] = useState('Delhi');
  const locations = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata'];

  return (
    <LocationContext.Provider value={{
      selectedLocation,
      setSelectedLocation,
      locations
    }}>
      {children}
    </LocationContext.Provider>
  );
};