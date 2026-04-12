import React, { createContext, ReactNode, useContext, useState } from "react";

export interface Location {
  id: string;
  name: string;
}

interface LocationContextType {
  location: Location | null;
  setLocation: (loc: Location | null) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function useLocationContext() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useLocationContext must be used within a LocationProvider");
  return ctx;
}

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<Location | null>(null);
  return (
    <LocationContext.Provider value={{ location, setLocation }}>
      {children}
    </LocationContext.Provider>
  );
}
