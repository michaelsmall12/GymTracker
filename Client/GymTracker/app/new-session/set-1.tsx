import { Stack, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Keyboard, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { API_ENDPOINTS } from "../../constants/api";
import { useLocationContext } from "../LocationContext";


export default function NewSessionSet1() {
  const router = useRouter();
  const { location: locationObj } = useLocationContext();

  const [exerciseType, setExerciseType] = useState("");
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [exerciseNames, setExerciseNames] = useState<{ id: string; name: string }[]>([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [addingNew, setAddingNew] = useState(false);
  const [loadingNames, setLoadingNames] = useState(false);
  const inputRef = useRef<TextInput>(null);

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
        body: JSON.stringify({ name: newName }),
      });
      if (!res.ok) throw new Error("Failed to add new exercise name");
      // Add to local list
      const added = await res.json();
      setExerciseNames((prev) => [...prev, added]);
      setExerciseType(newName);
      setDropdownVisible(false);
      setAddingNew(false);
      setSearch("");
      Keyboard.dismiss();
    } catch (e) {
      setMessage("Could not add new exercise name");
    }
  }

  async function handleSaveSet1() {
    if (!exerciseType.trim() || !weight.trim() || !reps.trim()) {
      setMessage("Exercise type, weight and reps are required.");
      return;
    }

    if (!locationObj) {
      setMessage("Location is missing. Please return and set the location first.");
      return;
    }

    setSaving(true);
    setMessage(null);

    const payload = {
      location: locationObj,
      exercises: [
        {
          exerciseName: {
            name: exerciseType.trim(),
          },
          liftSets: [
            {
              reps: Number(reps),
              weight: Number(weight),
            },
          ],
        },
      ],
    };

    try {
      const response = await fetch(API_ENDPOINTS.GYM_SESSIONS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      setMessage("Session created successfully. You can add more sets after this.");
      router.replace("/");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: "New Session - Set 1" }} />

      <Text style={styles.heading}>Set 1 Details</Text>
      <Text style={styles.description}>Fill out the first exercise, weight, reps, and optional notes for this session.</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Location</Text>
        <Text style={styles.value}>{locationObj ? locationObj.name : "Unknown"}</Text>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Exercise type</Text>
        <View>
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
          />
          {dropdownVisible && (
            <View style={styles.dropdown}>
              {loadingNames ? (
                <ActivityIndicator color="#F6C846" />
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
                        onPress={() => {
                          setAddingNew(true);
                        }}
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
        {addingNew && search.length > 0 && (
          <View style={{ marginTop: 8 }}>
            <Pressable
              style={[styles.actionButton, { backgroundColor: "#333", marginBottom: 8 }]}
              onPress={() => handleAddNewExerciseName(search)}
            >
              <Text style={styles.actionText}>Add "{search}" as new exercise</Text>
            </Pressable>
            <Pressable
              style={[styles.actionButton, { backgroundColor: "#F6C846" }]}
              onPress={() => {
                setAddingNew(false);
                setSearch("");
              }}
            >
              <Text style={[styles.actionText, { color: "#050505" }]}>Cancel</Text>
            </Pressable>
          </View>
        )}
      </View>

      <View style={styles.row}>
        <View style={[styles.field, styles.halfField]}>
          <Text style={styles.label}>Weight</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 135"
            placeholderTextColor="#7b6f47"
            keyboardType="numeric"
            value={weight}
            onChangeText={setWeight}
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
            onChangeText={setReps}
          />
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          placeholder="Optional set details"
          placeholderTextColor="#7b6f47"
          value={notes}
          onChangeText={setNotes}
          multiline
        />
      </View>

      {message ? <Text style={styles.message}>{message}</Text> : null}

      <Pressable style={styles.actionButton} onPress={handleSaveSet1} disabled={saving}>
        {saving ? (
          <ActivityIndicator color="#050505" />
        ) : (
          <Text style={styles.actionText}>Save Set 1</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
  container: {
    backgroundColor: "#000",
  },
  content: {
    padding: 20,
  },
  heading: {
    color: "#F6C846",
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 10,
  },
  description: {
    color: "#EDE3B8",
    marginBottom: 24,
    lineHeight: 22,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    color: "#EDE3B8",
    marginBottom: 8,
    fontWeight: "700",
  },
  value: {
    color: "#fff",
    backgroundColor: "#111",
    borderRadius: 14,
    padding: 14,
    borderColor: "#333",
    borderWidth: 1,
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
  notesInput: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  message: {
    color: "#EDE3B8",
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: "#F6C846",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  actionText: {
    color: "#050505",
    fontWeight: "700",
    fontSize: 16,
  },
});
