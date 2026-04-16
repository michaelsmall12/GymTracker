import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { Dimensions, FlatList, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import SpinningDumbbell from "../components/SpinningDumbbell";
import { API_ENDPOINTS } from "../constants/api";
import { useUnits } from "./UnitsContext";

const SCREEN_WIDTH = Dimensions.get("window").width;

interface ProgressEntry {
  date: string;
  maxWeight: number;
  totalVolume: number;
  bestSet: { reps: number; weight: number } | null;
}

export default function ExerciseProgress() {
  const [exerciseNames, setExerciseNames] = useState<{ id: string; name: string }[]>([]);
  const [selectedExercise, setSelectedExercise] = useState("");
  const [search, setSearch] = useState("");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [progress, setProgress] = useState<ProgressEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingNames, setLoadingNames] = useState(true);
  const [chartMode, setChartMode] = useState<"weight" | "volume">("weight");
  const { unit } = useUnits();

  useEffect(() => {
    fetch(API_ENDPOINTS.EXERCISE_NAMES)
      .then((res) => res.json())
      .then(setExerciseNames)
      .catch(() => {})
      .finally(() => setLoadingNames(false));
  }, []);

  async function loadProgress(name: string) {
    setLoading(true);
    setProgress([]);
    try {
      const params = new URLSearchParams({ exerciseName: name });
      const res = await fetch(`${API_ENDPOINTS.EXERCISE_PROGRESS}?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data: ProgressEntry[] = await res.json();
      setProgress(data);
    } catch {
      setProgress([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(name: string) {
    setSelectedExercise(name);
    setSearch("");
    setDropdownVisible(false);
    loadProgress(name);
  }

  const chartData = progress.length > 1
    ? {
        labels: progress.map((p) => {
          const d = new Date(p.date);
          return `${d.getMonth() + 1}/${d.getDate()}`;
        }),
        datasets: [
          {
            data: progress.map((p) =>
              chartMode === "weight" ? p.maxWeight : p.totalVolume
            ),
            strokeWidth: 2,
          },
        ],
      }
    : null;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: "Exercise Progress" }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>📈 Exercise Progress</Text>
        <Text style={styles.description}>
          Select an exercise to view your weight and volume trends over time.
        </Text>

        {/* Exercise selector */}
        <View style={[styles.field, { zIndex: 100 }]}>
          <Text style={styles.label}>Exercise</Text>
          <TextInput
            style={styles.input}
            placeholder="Search exercise..."
            placeholderTextColor="#7b6f47"
            value={dropdownVisible ? search : selectedExercise}
            onFocus={() => {
              setDropdownVisible(true);
              setSearch(selectedExercise);
            }}
            onChangeText={(t) => {
              setSearch(t);
              setDropdownVisible(true);
            }}
            onBlur={() => setTimeout(() => setDropdownVisible(false), 150)}
          />
          {dropdownVisible && (
            <View style={styles.dropdown}>
              {loadingNames ? (
                <SpinningDumbbell size={24} />
              ) : (
                <FlatList
                  data={exerciseNames.filter((ex) =>
                    search.length === 0
                      ? true
                      : ex.name.toLowerCase().includes(search.toLowerCase())
                  )}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <Pressable style={styles.dropdownItem} onPress={() => handleSelect(item.name)}>
                      <Text style={styles.dropdownText}>{item.name}</Text>
                    </Pressable>
                  )}
                  style={{ maxHeight: 180, backgroundColor: "#222", borderRadius: 10 }}
                  keyboardShouldPersistTaps="handled"
                />
              )}
            </View>
          )}
        </View>

        {/* Loading */}
        {loading && (
          <View style={{ paddingVertical: 24, alignItems: "center" }}>
            <SpinningDumbbell size={32} />
          </View>
        )}

        {/* Chart */}
        {!loading && selectedExercise && progress.length > 1 && chartData && (
          <View style={styles.chartCard}>
            <View style={styles.chartToggleRow}>
              <Pressable
                style={[styles.chartToggle, chartMode === "weight" && styles.chartToggleActive]}
                onPress={() => setChartMode("weight")}
              >
                <Text
                  style={[styles.chartToggleText, chartMode === "weight" && styles.chartToggleTextActive]}
                >
                  Max Weight
                </Text>
              </Pressable>
              <Pressable
                style={[styles.chartToggle, chartMode === "volume" && styles.chartToggleActive]}
                onPress={() => setChartMode("volume")}
              >
                <Text
                  style={[styles.chartToggleText, chartMode === "volume" && styles.chartToggleTextActive]}
                >
                  Total Volume
                </Text>
              </Pressable>
            </View>
            <LineChart
              data={chartData}
              width={SCREEN_WIDTH - 72}
              height={200}
              yAxisSuffix={chartMode === "weight" ? ` ${unit}` : ""}
              chartConfig={{
                backgroundColor: "#111",
                backgroundGradientFrom: "#111",
                backgroundGradientTo: "#1a1a1a",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(246, 200, 70, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(237, 227, 184, ${opacity})`,
                propsForDots: {
                  r: "5",
                  strokeWidth: "2",
                  stroke: "#F6C846",
                },
                propsForBackgroundLines: {
                  strokeDasharray: "",
                  stroke: "#333",
                },
              }}
              bezier
              style={{ borderRadius: 12 }}
            />
          </View>
        )}

        {/* No data message */}
        {!loading && selectedExercise && progress.length === 0 && (
          <Text style={styles.emptyText}>
            No data yet for {selectedExercise}. Start logging to see your progress!
          </Text>
        )}

        {!loading && selectedExercise && progress.length === 1 && (
          <Text style={styles.emptyText}>
            Only 1 session logged for {selectedExercise}. Log more sessions to see a chart!
          </Text>
        )}

        {/* Session history list */}
        {!loading && progress.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.sectionTitle}>Session History</Text>
            {progress.map((entry, idx) => (
              <View key={idx} style={styles.historyCard}>
                <Text style={styles.historyDate}>
                  {new Date(entry.date).toLocaleDateString()}
                </Text>
                <View style={styles.historyStats}>
                  <Text style={styles.historyStat}>Max: {entry.maxWeight} {unit}</Text>
                  <Text style={styles.historyStat}>Volume: {entry.totalVolume} {unit}</Text>
                  {entry.bestSet && (
                    <Text style={styles.historyStat}>
                      Best: {entry.bestSet.weight} × {entry.bestSet.reps}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
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
    paddingBottom: 40,
  },
  heading: {
    fontSize: 24,
    fontWeight: "900",
    color: "#F6C846",
    marginBottom: 8,
  },
  description: {
    color: "#EDE3B8",
    marginBottom: 20,
    lineHeight: 20,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    color: "#EDE3B8",
    marginBottom: 8,
    fontWeight: "700",
  },
  input: {
    backgroundColor: "#111",
    borderColor: "#333",
    borderWidth: 1,
    borderRadius: 14,
    color: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  dropdown: {
    position: "absolute",
    top: 70,
    left: 0,
    right: 0,
    backgroundColor: "#222",
    borderColor: "#333",
    borderWidth: 1,
    borderRadius: 10,
    zIndex: 100,
    maxHeight: 180,
    elevation: 5,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomColor: "#333",
    borderBottomWidth: 1,
  },
  dropdownText: {
    color: "#fff",
    fontSize: 16,
  },
  chartCard: {
    backgroundColor: "#111",
    borderColor: "#333",
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  chartToggleRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  chartToggle: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#1a1a1a",
    borderColor: "#333",
    borderWidth: 1,
    alignItems: "center",
  },
  chartToggleActive: {
    backgroundColor: "#F6C846",
    borderColor: "#F6C846",
  },
  chartToggleText: {
    color: "#888",
    fontWeight: "700",
    fontSize: 13,
  },
  chartToggleTextActive: {
    color: "#050505",
  },
  emptyText: {
    color: "#888",
    fontSize: 15,
    textAlign: "center",
    paddingVertical: 20,
  },
  sectionTitle: {
    color: "#F6C846",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
  },
  historySection: {
    marginTop: 8,
  },
  historyCard: {
    backgroundColor: "#111",
    borderColor: "#333",
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  historyDate: {
    color: "#F6C846",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
  },
  historyStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  historyStat: {
    color: "#EDE3B8",
    fontSize: 13,
  },
});
