import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";

export type WeightUnit = "lbs" | "kg";

interface UnitsContextValue {
  unit: WeightUnit;
  setUnit: (u: WeightUnit) => void;
}

const UnitsContext = createContext<UnitsContextValue>({
  unit: "lbs",
  setUnit: () => {},
});

const STORAGE_KEY = "gym_tracker_weight_unit";

export function UnitsProvider({ children }: { children: React.ReactNode }) {
  const [unit, setUnitState] = useState<WeightUnit>("lbs");

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val === "kg" || val === "lbs") setUnitState(val);
    });
  }, []);

  function setUnit(u: WeightUnit) {
    setUnitState(u);
    AsyncStorage.setItem(STORAGE_KEY, u);
  }

  return (
    <UnitsContext.Provider value={{ unit, setUnit }}>
      {children}
    </UnitsContext.Provider>
  );
}

export function useUnits() {
  return useContext(UnitsContext);
}
