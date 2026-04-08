import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { API_ENDPOINTS } from "../../constants/api";

export default function NewSessionSet1() {
  const router = useRouter();
  const { location } = useLocalSearchParams();
  const [exerciseType, setExerciseType] = useState("");
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSaveSet1() {
    if (!exerciseType.trim() || !weight.trim() || !reps.trim()) {
      setMessage("Exercise type, weight and reps are required.");
      return;
    }

    if (!location) {
      setMessage("Location is missing. Please return and set the location first.");
      return;
    }

    setSaving(true);
    setMessage(null);

    const payload = {
      location,
      exercises: [
        {
          name: exerciseType.trim(),
          weight: weight.trim(),
          reps: Number(reps),
          notes: notes.trim(),
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
        <Text style={styles.value}>{location ?? "Unknown"}</Text>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Exercise type</Text>
        <TextInput
          style={styles.input}
          placeholder="Bench press, Squat, Deadlift"
          placeholderTextColor="#7b6f47"
          value={exerciseType}
          onChangeText={setExerciseType}
        />
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
