import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#050505" },
        headerTintColor: "#F6C846",
        headerTitleStyle: { fontWeight: "800" },
        contentStyle: { backgroundColor: "#000" },
      }}
    />
  );
}
