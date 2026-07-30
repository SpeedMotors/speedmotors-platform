import React, { createContext, useContext, useState, useEffect } from 'react';

const TestDriveContext = createContext();

export const useTestDrive = () => useContext(TestDriveContext);

export const TestDriveProvider = ({ children }) => {
  const [testDriveCars, setTestDriveCars] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('speedmotors_testdrive');
    if (stored) {
      try {
        setTestDriveCars(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const addCar = (car) => {
    setTestDriveCars((prev) => {
      // Don't add if it's already there
      if (prev.find(c => c.id === car.id)) return prev;
      const updated = [...prev, car];
      localStorage.setItem('speedmotors_testdrive', JSON.stringify(updated));
      return updated;
    });
  };

  const removeCar = (carId) => {
    setTestDriveCars((prev) => {
      const updated = prev.filter(c => c.id !== carId);
      localStorage.setItem('speedmotors_testdrive', JSON.stringify(updated));
      return updated;
    });
  };
  
  const clearTestDrives = () => {
    setTestDriveCars([]);
    localStorage.removeItem('speedmotors_testdrive');
  };

  return (
    <TestDriveContext.Provider value={{ testDriveCars, addCar, removeCar, clearTestDrives }}>
      {children}
    </TestDriveContext.Provider>
  );
};
