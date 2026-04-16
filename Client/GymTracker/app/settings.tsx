import { Stack } from "expo-router";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { useUnits, WeightUnit } from "./UnitsContext";

const UNIT_OPTIONS: { label: string; value: WeightUnit }[] = [
  { label: "Pounds (lbs)", value: "lbs" },
  { label: "Kilograms (kg)", value: "kg" },
];

export default function Settings() {
  const { unit, setUnit } = useUnits();

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: "Settings" }} />
      <View style={styles.content}>
        <Text style={styles.heading}>⚙️ Settings</Text>

        <Text style={styles.sectionTitle}>Weight Unit</Text>
        <View style={styles.optionsRow}>
          {UNIT_OPTIONS.map((opt) => (
            <Pressable
              key={opt.value}
              style={[styles.option, unit === opt.value && styles.optionActive]}
              onPress={() => setUnit(opt.value)}
            >
              <Text style={[styles.optionText, unit === opt.value && styles.optionTextActive]}>
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.hint}>
          This changes labels only. Stored values are not converted.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  content: {
    padding: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: "900",
    color: "#F6C846",
    marginBottom: 24,
  },
  sectionTitle: {
    color: "#EDE3B8",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  optionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  option: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: "#111",
    borderColor: "#333",
    borderWidth: 1,
    alignItems: "center",
  },
  optionActive: {
    backgroundColor: "#F6C846",
    borderColor: "#F6C846",
  },
  optionText: {
    color: "#888",
    fontWeight: "700",
    fontSize: 15,
  },
  optionTextActive: {
    color: "#050505",
  },
  hint: {
    color: "#666",
    fontSize: 13,
    marginTop: 12,
    lineHeight: 18,
  },
});
