import { Stack, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { FlatList, Keyboard, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import SpinningDumbbell from "../../components/SpinningDumbbell";
import { API_ENDPOINTS } from "../../constants/api";
import { useLocationContext } from "../LocationContext";

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

  async function handleAddNewExerciseName(newName: string) {
    try {
      const res = await fetch(API_ENDPOINTS.EXERCISE_NAMES, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify( newName ),
      });
      if (!res.ok) throw new Error("Failed to add new exercise name");
      const added = await res.json();
      setExerciseNames((prev) => [...prev, added]);
      setExerciseType(newName);
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
                  Set {sIdx + 1}: {s.reps} reps × {s.weight} lbs
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
              value={search || exerciseType}
              onFocus={() => {
                setDropdownVisible(true);
                setSearch("");
              }}
              onChangeText={(text) => {
                setSearch(text);
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

        {/* Sets already added to this exercise */}
        {currentSets.length > 0 && (
          <View style={styles.currentSetsSection}>
            {currentSets.map((s, idx) => (
              <View key={idx} style={styles.currentSetRow}>
                <Text style={styles.currentSetText}>
                  Set {idx + 1}: {s.reps} reps × {s.weight} lbs
                </Text>
                <Pressable onPress={() => handleRemoveCurrentSet(idx)} hitSlop={8}>
                  <Text style={styles.removeText}>×</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {/* Weight / Reps inputs */}
        <View style={styles.row}>
          <View style={[styles.field, styles.halfField]}>
            <Text style={styles.label}>Weight (lbs)</Text>
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
});
