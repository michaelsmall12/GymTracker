import { Stack } from "expo-router";
import { LocationProvider } from "./LocationContext";
import { UnitsProvider } from "./UnitsContext";

export default function RootLayout() {
  return (
    <UnitsProvider>
      <LocationProvider>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: "#050505" },
            headerTintColor: "#F6C846",
            headerTitleStyle: { fontWeight: "800" },
            contentStyle: { backgroundColor: "#000" },
          }}
        />
      </LocationProvider>
    </UnitsProvider>
  );
}
