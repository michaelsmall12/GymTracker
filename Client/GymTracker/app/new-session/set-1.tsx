import * as Haptics from "expo-haptics";
import { Stack, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, Keyboard, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, Vibration, View } from "react-native";
import SpinningDumbbell from "../../components/SpinningDumbbell";
import { API_ENDPOINTS } from "../../constants/api";
import { useLocationContext } from "../LocationContext";
import { useUnits } from "../UnitsContext";

interface SetEntry {
  reps: number;
  weight: number;
}

interface ExerciseEntry {
  exerciseName: string;
  sets: SetEntry[];
}

export default function SessionBuilder() {
  const router = useRouter();
  const { location: locationObj } = useLocationContext();
  const { unit } = useUnits();

  // Completed exercises
  const [exercises, setExercises] = useState<ExerciseEntry[]>([]);

  // Current exercise form
  const [exerciseType, setExerciseType] = useState("");
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Exercise name lookup
  const [exerciseNames, setExerciseNames] = useState<{ id: string; name: string }[]>([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [addingNewName, setAddingNewName] = useState(false);
  const [loadingNames, setLoadingNames] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const scrollRef = useRef<ScrollView>(null);

  // Sets for the current exercise being built
  const [currentSets, setCurrentSets] = useState<SetEntry[]>([]);

  // Insights modal
  const [insightsVisible, setInsightsVisible] = useState(false);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [exerciseHistory, setExerciseHistory] = useState<
    { date: string; sets: { reps: number; weight: number }[] }[]
  >([]);

  // Rest timer
  const REST_PRESETS = [60, 90, 120, 180];
  const [restDuration, setRestDuration] = useState(90);
  const [restSecondsLeft, setRestSecondsLeft] = useState(0);
  const [restActive, setRestActive] = useState(false);
  const restIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRestTimer = useCallback(() => {
    if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    setRestSecondsLeft(restDuration);
    setRestActive(true);
    restIntervalRef.current = setInterval(() => {
      setRestSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(restIntervalRef.current!);
          restIntervalRef.current = null;
          setRestActive(false);
          // Alert the user
          if (Platform.OS !== "web") {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Vibration.vibrate([0, 400, 200, 400]);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [restDuration]);

  function skipRestTimer() {
    if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    restIntervalRef.current = null;
    setRestActive(false);
    setRestSecondsLeft(0);
  }

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    fetchExerciseNames();
  }, []);

  async function fetchExerciseNames() {
    setLoadingNames(true);
    try {
      const res = await fetch(API_ENDPOINTS.EXERCISE_NAMES);
      if (!res.ok) throw new Error("Failed to fetch exercise names");
      const data = await res.json();
      setExerciseNames(data);
    } catch (e) {
      setMessage("Could not load exercise names");
    } finally {
      setLoadingNames(false);
    }
  }

  async function fetchExerciseHistory(name: string) {
    setInsightsLoading(true);
    setExerciseHistory([]);
    setInsightsVisible(true);
    try {
      if (!locationObj?.id) {
        setMessage("Location is missing.");
        setInsightsVisible(false);
        return;
      }
      const params = new URLSearchParams({
        exerciseName: name,
        locationId: locationObj.id,
      });
      const res = await fetch(`${API_ENDPOINTS.EXERCISE_HISTORY}?${params}`);
      if (!res.ok) throw new Error("Failed to fetch exercise history");
      const data: { date: string; sets: { reps: number; weight: number }[] }[] = await res.json();
      setExerciseHistory(data);
    } catch {
      setMessage("Could not load exercise history");
      setInsightsVisible(false);
    } finally {
      setInsightsLoading(false);
    }
  }

  async function handleAddNewExerciseName(newName: string) {
    const trimmed = newName.trim();
    const existing = exerciseNames.find(
      (ex) => ex.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (existing) {
      setExerciseType(existing.name);
      setDropdownVisible(false);
      setAddingNewName(false);
      setSearch("");
      Keyboard.dismiss();
      return;
    }

    try {
      const res = await fetch(API_ENDPOINTS.EXERCISE_NAMES, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(trimmed),
      });
      if (res.status === 409) {
        await fetchExerciseNames();
        setExerciseType(trimmed);
        setDropdownVisible(false);
        setAddingNewName(false);
        setSearch("");
        Keyboard.dismiss();
        return;
      }
      if (!res.ok) throw new Error("Failed to add new exercise name");
      const added = await res.json();
      setExerciseNames((prev) => [...prev, added]);
      setExerciseType(trimmed);
      setDropdownVisible(false);
      setAddingNewName(false);
      setSearch("");
      Keyboard.dismiss();
    } catch (e) {
      setMessage("Could not add new exercise name");
    }
  }

  function validateCurrentSet(): boolean {
    if (!exerciseType.trim()) {
      setMessage("Please select an exercise.");
      return false;
    }
    if (!weight.trim() || !reps.trim()) {
      setMessage("Weight and reps are required.");
      return false;
    }
    const weightNum = Number(weight);
    const repsNum = Number(reps);
    if (isNaN(weightNum) || weightNum <= 0) {
      setMessage("Please enter a valid weight.");
      return false;
    }
    if (isNaN(repsNum) || repsNum <= 0 || !Number.isInteger(repsNum)) {
      setMessage("Please enter a valid number of reps.");
      return false;
    }
    return true;
  }

  function handleAddSet() {
    if (!validateCurrentSet()) return;
    setMessage(null);
    const newSet: SetEntry = { reps: Number(reps), weight: Number(weight) };
    setCurrentSets((prev) => [...prev, newSet]);
    setWeight("");
    setReps("");
    startRestTimer();
    scrollRef.current?.scrollToEnd({ animated: true });
  }

  function handleAddExercise() {
    // If there are unfilled weight/reps, add the set first
    if (weight.trim() && reps.trim()) {
      if (!validateCurrentSet()) return;
      const newSet: SetEntry = { reps: Number(reps), weight: Number(weight) };
      const allSets = [...currentSets, newSet];
      commitExercise(allSets);
    } else if (currentSets.length > 0) {
      commitExercise(currentSets);
    } else {
      setMessage("Add at least one set before adding another exercise.");
      return;
    }
  }

  function commitExercise(sets: SetEntry[]) {
    setExercises((prev) => [...prev, { exerciseName: exerciseType.trim(), sets }]);
    setExerciseType("");
    setCurrentSets([]);
    setWeight("");
    setReps("");
    setSearch("");
    setMessage(null);
    scrollRef.current?.scrollToEnd({ animated: true });
  }

  function handleRemoveExercise(index: number) {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  }

  function handleRemoveCurrentSet(index: number) {
    setCurrentSets((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleFinishSession() {
    // Commit any pending current exercise
    let allExercises = [...exercises];
    if (exerciseType.trim() && (currentSets.length > 0 || (weight.trim() && reps.trim()))) {
      let sets = [...currentSets];
      if (weight.trim() && reps.trim()) {
        if (!validateCurrentSet()) return;
        sets.push({ reps: Number(reps), weight: Number(weight) });
      }
      if (sets.length > 0) {
        allExercises.push({ exerciseName: exerciseType.trim(), sets });
      }
    }

    if (allExercises.length === 0) {
      setMessage("Add at least one exercise with a set before finishing.");
      return;
    }

    if (!locationObj) {
      setMessage("Location is missing. Please go back and select a location.");
      return;
    }

    setSaving(true);
    setMessage(null);

    const payload = {
      location: locationObj,
      exercises: allExercises.map((ex) => ({
        exerciseName: { name: ex.exerciseName },
        liftSets: ex.sets.map((s) => ({ reps: s.reps, weight: s.weight })),
      })),
    };

    try {
      const response = await fetch(API_ENDPOINTS.GYM_SESSIONS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`Server returned ${response.status}`);
      const { id: sessionId } = await response.json();

      // Mark session as complete
      await fetch(`${API_ENDPOINTS.GYM_SESSIONS}/${sessionId}/complete`, {
        method: "PUT",
      });

      router.replace("/");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setSaving(false);
    }
  }

  const totalSets = exercises.reduce((s, ex) => s + ex.sets.length, 0) + currentSets.length;

  return (
    <ScrollView ref={scrollRef} style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ title: "Build Your Workout" }} />

      <View style={styles.field}>
        <Text style={styles.locationLabel}>{locationObj?.name ?? "Unknown"}</Text>
      </View>

      {/* Summary of completed exercises */}
      {exercises.length > 0 && (
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Exercises Added</Text>
          {exercises.map((ex, exIdx) => (
            <View key={exIdx} style={styles.summaryCard}>
              <View style={styles.summaryCardHeader}>
                <Text style={styles.summaryExName}>{ex.exerciseName}</Text>
                <Pressable onPress={() => handleRemoveExercise(exIdx)} hitSlop={8}>
                  <Text style={styles.removeText}>×</Text>
                </Pressable>
              </View>
              {ex.sets.map((s, sIdx) => (
                <Text key={sIdx} style={styles.summarySetText}>
                  Set {sIdx + 1}: {s.reps} reps × {s.weight} {unit}
                </Text>
              ))}
            </View>
          ))}
        </View>
      )}

      {/* Current exercise form */}
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>
          {exercises.length === 0 ? "Add Exercise" : "Add Another Exercise"}
        </Text>

        <View style={[styles.field, { zIndex: 100 }]}>
          <Text style={styles.label}>Exercise</Text>
          <View style={{ zIndex: 100 }}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="Bench press, Squat, Deadlift"
              placeholderTextColor="#7b6f47"
              value={dropdownVisible ? search : exerciseType}
              onFocus={() => {
                setDropdownVisible(true);
                setSearch(exerciseType);
              }}
              onChangeText={(text) => {
                setSearch(text);
                if (text === "") setExerciseType("");
                setDropdownVisible(true);
              }}
              onBlur={() => {
                setTimeout(() => setDropdownVisible(false), 150);
              }}
              autoCorrect={false}
              autoCapitalize="words"
              editable={currentSets.length === 0}
            />
            {dropdownVisible && (
              <View style={styles.dropdown}>
                {loadingNames ? (
                  <SpinningDumbbell size={24} />
                ) : (
                  <FlatList
                    data={exerciseNames.filter((ex) =>
                      (search || "").length === 0
                        ? true
                        : ex.name.toLowerCase().includes(search.toLowerCase())
                    )}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.dropdownItem}
                        onPress={() => {
                          setExerciseType(item.name);
                          setDropdownVisible(false);
                          setSearch("");
                          Keyboard.dismiss();
                        }}
                      >
                        <Text style={styles.dropdownText}>{item.name}</Text>
                      </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                      search.length > 0 ? (
                        <TouchableOpacity
                          style={styles.dropdownItem}
                          onPress={() => setAddingNewName(true)}
                        >
                          <Text style={styles.dropdownText}>Add "{search}"</Text>
                        </TouchableOpacity>
                      ) : null
                    }
                    style={{ maxHeight: 180, backgroundColor: "#222", borderRadius: 10 }}
                    keyboardShouldPersistTaps="handled"
                  />
                )}
              </View>
            )}
          </View>
          {addingNewName && search.length > 0 && (
            <View style={{ marginTop: 8 }}>
              <Pressable
                style={[styles.secondaryButton, { marginBottom: 8 }]}
                onPress={() => handleAddNewExerciseName(search)}
              >
                <Text style={styles.secondaryButtonText}>Add "{search}" as new exercise</Text>
              </Pressable>
              <Pressable
                style={styles.primaryButton}
                onPress={() => { setAddingNewName(false); setSearch(""); }}
              >
                <Text style={styles.primaryButtonText}>Cancel</Text>
              </Pressable>
            </View>
          )}
        </View>

        {exerciseType.trim().length > 0 && (
          <Pressable
            style={styles.insightsButton}
            onPress={() => fetchExerciseHistory(exerciseType)}
          >
            <Text style={styles.insightsButtonText}>📊 View Last Performance</Text>
          </Pressable>
        )}

        {/* Sets already added to this exercise */}
        {currentSets.length > 0 && (
          <View style={styles.currentSetsSection}>
            {currentSets.map((s, idx) => (
              <View key={idx} style={styles.currentSetRow}>
                <Text style={styles.currentSetText}>
                  Set {idx + 1}: {s.reps} reps × {s.weight} {unit}
                </Text>
                <Pressable onPress={() => handleRemoveCurrentSet(idx)} hitSlop={8}>
                  <Text style={styles.removeText}>×</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {/* Rest timer */}
        {(restActive || restSecondsLeft === 0 && currentSets.length > 0) && (
          <View style={restActive ? styles.timerBanner : styles.timerBannerDone}>
            {restActive ? (
              <>
                <Text style={styles.timerLabel}>⏱ Rest</Text>
                <Text style={styles.timerCount}>
                  {Math.floor(restSecondsLeft / 60)}:{(restSecondsLeft % 60).toString().padStart(2, "0")}
                </Text>
                <Pressable onPress={skipRestTimer} hitSlop={8}>
                  <Text style={styles.timerSkip}>Skip</Text>
                </Pressable>
              </>
            ) : (
              <Text style={styles.timerDoneText}>✅ Rest complete — ready for next set!</Text>
            )}
          </View>
        )}

        {/* Rest duration presets */}
        {currentSets.length > 0 && (
          <View style={styles.restPresetsRow}>
            <Text style={styles.restPresetsLabel}>Rest:</Text>
            {REST_PRESETS.map((sec) => (
              <Pressable
                key={sec}
                style={[
                  styles.restPresetChip,
                  restDuration === sec && styles.restPresetChipActive,
                ]}
                onPress={() => setRestDuration(sec)}
              >
                <Text
                  style={[
                    styles.restPresetText,
                    restDuration === sec && styles.restPresetTextActive,
                  ]}
                >
                  {sec >= 60 ? `${sec / 60}m` : `${sec}s`}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Weight / Reps inputs */}
        <View style={styles.row}>
          <View style={[styles.field, styles.halfField]}>
            <Text style={styles.label}>Weight ({unit})</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 135"
              placeholderTextColor="#7b6f47"
              keyboardType="numeric"
              value={weight}
              onChangeText={(t) => setWeight(t.replace(/[^0-9.]/g, ""))}
            />
          </View>
          <View style={[styles.field, styles.halfField]}>
            <Text style={styles.label}>Reps</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 8"
              placeholderTextColor="#7b6f47"
              keyboardType="numeric"
              value={reps}
              onChangeText={(t) => setReps(t.replace(/[^0-9]/g, ""))}
            />
          </View>
        </View>

        {/* Action buttons */}
        <Pressable style={styles.secondaryButton} onPress={handleAddSet}>
          <Text style={styles.secondaryButtonText}>
            + Add Set {currentSets.length > 0 ? `(Set ${currentSets.length + 1})` : ""}
          </Text>
        </Pressable>

        <Pressable
          style={[styles.outlineButton, { marginTop: 10 }]}
          onPress={handleAddExercise}
        >
          <Text style={styles.outlineButtonText}>+ Save Exercise & Add Another</Text>
        </Pressable>
      </View>

      {message ? <Text style={styles.message}>{message}</Text> : null}

      {/* Finish session */}
      <Pressable
        style={[styles.primaryButton, { marginTop: 20 }]}
        onPress={handleFinishSession}
        disabled={saving}
      >
        {saving ? (
          <SpinningDumbbell size={22} color="#050505" />
        ) : (
          <Text style={styles.primaryButtonText}>
            Finish Session ({exercises.length + (exerciseType.trim() ? 1 : 0)} exercise{exercises.length + (exerciseType.trim() ? 1 : 0) !== 1 ? "s" : ""}, {totalSets + (weight.trim() && reps.trim() ? 1 : 0)} set{totalSets + (weight.trim() && reps.trim() ? 1 : 0) !== 1 ? "s" : ""})
          </Text>
        )}
      </Pressable>

      {/* Insights Modal */}
      <Modal
        visible={insightsVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setInsightsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>📊 {exerciseType}</Text>
              <Pressable onPress={() => setInsightsVisible(false)} hitSlop={8}>
                <Text style={styles.modalClose}>✕</Text>
              </Pressable>
            </View>

            {insightsLoading ? (
              <View style={{ paddingVertical: 24, alignItems: "center" }}>
                <SpinningDumbbell size={32} />
              </View>
            ) : exerciseHistory.length === 0 ? (
              <Text style={styles.modalEmpty}>
                No previous data for this exercise. This is your first time — just go for it!
              </Text>
            ) : (
              <ScrollView style={{ maxHeight: 350 }}>
                {exerciseHistory.map((entry, idx) => {
                  const maxWeight = Math.max(...entry.sets.map((s) => s.weight));
                  const totalVolume = entry.sets.reduce(
                    (sum, s) => sum + s.weight * s.reps,
                    0
                  );
                  return (
                    <View key={idx} style={styles.insightCard}>
                      <Text style={styles.insightDate}>
                        {idx === 0 ? "Last Session" : `${idx + 1} sessions ago`} —{" "}
                        {new Date(entry.date).toLocaleDateString()}
                      </Text>
                      {entry.sets.map((s, sIdx) => (
                        <Text key={sIdx} style={styles.insightSet}>
                          Set {sIdx + 1}: {s.reps} reps × {s.weight} {unit}
                        </Text>
                      ))}
                      <View style={styles.insightStatsRow}>
                        <Text style={styles.insightStat}>Max: {maxWeight} {unit}</Text>
                        <Text style={styles.insightStat}>Volume: {totalVolume} {unit}</Text>
                      </View>
                    </View>
                  );
                })}

                {exerciseHistory.length > 0 && (
                  <View style={styles.suggestionCard}>
                    <Text style={styles.suggestionTitle}>💡 Progressive Overload</Text>
                    <Text style={styles.suggestionText}>
                      Last time your top set was{" "}
                      {Math.max(...exerciseHistory[0].sets.map((s) => s.weight))} {unit} ×{" "}
                      {exerciseHistory[0].sets.find(
                        (s) =>
                          s.weight ===
                          Math.max(...exerciseHistory[0].sets.map((s) => s.weight))
                      )?.reps ?? 0}{" "}
                      reps. Try adding {unit === "kg" ? "2.5 kg" : "5 lbs"} or 1 extra rep today!
                    </Text>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#000",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  field: {
    marginBottom: 16,
  },
  locationLabel: {
    color: "#888",
    fontSize: 14,
    fontWeight: "600",
  },
  sectionTitle: {
    color: "#F6C846",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 12,
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
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  dropdown: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: "#222",
    borderColor: "#333",
    borderWidth: 1,
    borderRadius: 10,
    zIndex: 100,
    maxHeight: 180,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
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
  // Summary section
  summarySection: {
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: "#111",
    borderColor: "#333",
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  summaryCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryExName: {
    color: "#F6C846",
    fontSize: 16,
    fontWeight: "700",
  },
  summarySetText: {
    color: "#EDE3B8",
    fontSize: 14,
    marginBottom: 2,
  },
  removeText: {
    color: "#F44336",
    fontSize: 22,
    fontWeight: "700",
    paddingHorizontal: 4,
  },
  // Current sets
  formSection: {
    backgroundColor: "#0a0a0a",
    borderColor: "#222",
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginBottom: 8,
  },
  currentSetsSection: {
    marginBottom: 12,
    backgroundColor: "#111",
    borderRadius: 10,
    padding: 10,
  },
  currentSetRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  currentSetText: {
    color: "#EDE3B8",
    fontSize: 14,
  },
  // Buttons
  primaryButton: {
    backgroundColor: "#F6C846",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#050505",
    fontWeight: "700",
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: "#333",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#F6C846",
    fontWeight: "700",
    fontSize: 15,
  },
  outlineButton: {
    backgroundColor: "transparent",
    borderColor: "#F6C846",
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  outlineButtonText: {
    color: "#F6C846",
    fontWeight: "700",
    fontSize: 15,
  },
  message: {
    color: "#ff8a8a",
    marginTop: 12,
    marginBottom: 4,
  },
  // Insights button
  insightsButton: {
    backgroundColor: "transparent",
    borderColor: "#4A90D9",
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 8,
  },
  insightsButtonText: {
    color: "#4A90D9",
    fontWeight: "700",
    fontSize: 14,
  },
  // Insights modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    padding: 20,
  },
  modalBox: {
    backgroundColor: "#111",
    borderColor: "#333",
    borderWidth: 1,
    borderRadius: 18,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    color: "#F6C846",
    fontSize: 18,
    fontWeight: "800",
    flex: 1,
  },
  modalClose: {
    color: "#888",
    fontSize: 20,
    fontWeight: "700",
    paddingLeft: 12,
  },
  modalEmpty: {
    color: "#888",
    fontSize: 15,
    textAlign: "center",
    paddingVertical: 20,
  },
  insightCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  insightDate: {
    color: "#F6C846",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
  },
  insightSet: {
    color: "#EDE3B8",
    fontSize: 14,
    marginBottom: 2,
  },
  insightStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingTop: 8,
    borderTopColor: "#333",
    borderTopWidth: 1,
  },
  insightStat: {
    color: "#888",
    fontSize: 13,
    fontWeight: "600",
  },
  suggestionCard: {
    backgroundColor: "#1a2a1a",
    borderColor: "#2a5a2a",
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginTop: 4,
    marginBottom: 8,
  },
  suggestionTitle: {
    color: "#6BCB77",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 6,
  },
  suggestionText: {
    color: "#EDE3B8",
    fontSize: 14,
    lineHeight: 20,
  },
  // Rest timer
  timerBanner: {
    backgroundColor: "#1a1a2e",
    borderColor: "#4A90D9",
    borderWidth: 1,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  timerBannerDone: {
    backgroundColor: "#1a2a1a",
    borderColor: "#2a5a2a",
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    alignItems: "center",
  },
  timerLabel: {
    color: "#4A90D9",
    fontSize: 15,
    fontWeight: "700",
  },
  timerCount: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
  timerSkip: {
    color: "#F6C846",
    fontSize: 14,
    fontWeight: "700",
  },
  timerDoneText: {
    color: "#6BCB77",
    fontSize: 14,
    fontWeight: "700",
  },
  restPresetsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  restPresetsLabel: {
    color: "#888",
    fontSize: 13,
    fontWeight: "600",
  },
  restPresetChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#1a1a1a",
    borderColor: "#333",
    borderWidth: 1,
  },
  restPresetChipActive: {
    backgroundColor: "#4A90D9",
    borderColor: "#4A90D9",
  },
  restPresetText: {
    color: "#888",
    fontSize: 13,
    fontWeight: "600",
  },
  restPresetTextActive: {
    color: "#fff",
  },
});
