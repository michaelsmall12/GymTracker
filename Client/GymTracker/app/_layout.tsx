import { Stack } from "expo-router";
import { LocationProvider } from "./LocationContext";

export default function RootLayout() {
  return (
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
  );
}
