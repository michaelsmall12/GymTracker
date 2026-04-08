import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { API_ENDPOINTS } from "../../constants/api";

type ExerciseItem = {
  id: string;
  name?: string;
  weight?: string;
  reps?: number;
  notes?: string;
};

type SetItem = {
  id: string;
  weight?: string;
  reps?: number;
  notes?: string;
  timestamp?: string;
};

export default function SessionDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [exercises, setExercises] = useState<ExerciseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [setsByExercise, setSetsByExercise] = useState<Record<string, SetItem[]>>({});
  const [expandedExerciseIds, setExpandedExerciseIds] = useState<string[]>([]);

  useEffect(() => {
    async function loadExercises() {
      if (!id) {
        setError("Session ID is missing.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_ENDPOINTS.GYM_SESSIONS}/${id}/exercises`);
        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`);
        }

        const data = await response.json();
        const exerciseArray = Array.isArray(data) ? data : (data.exercises ? data.exercises : [data]);
        setExercises(exerciseArray);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    }

    loadExercises();
  }, [id]);

  async function loadSets(exerciseId: string) {
    if (setsByExercise[exerciseId]) {
      setExpandedExerciseIds((ids) => ids.filter((item) => item !== exerciseId));
      return;
    }

    try {
      const response = await fetch(`${API_ENDPOINTS.GYM_SESSIONS}/${id}/exercises/${exerciseId}/sets`);
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      const setsArray = Array.isArray(data) ? data : (data.sets ? data.sets : [data]);
      setSetsByExercise((current) => ({ ...current, [exerciseId]: setsArray }));
      setExpandedExerciseIds((ids) => [...ids, exerciseId]);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: `Session ${id}` }} />
      <Text style={styles.heading}>Session Review</Text>
      <Text style={styles.description}>Load exercises from the selected session and tap any exercise to view sets.</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#F6C846" style={styles.loading} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : exercises.length === 0 ? (
        <Text style={styles.empty}>No exercises were found for this session.</Text>
      ) : (
        <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
          {exercises.map((exercise) => {
            const isExpanded = expandedExerciseIds.includes(exercise.id);
            const exerciseSets = setsByExercise[exercise.id] ?? [];
            return (
              <View key={exercise.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.exerciseName}>{exercise.name ?? "Unnamed exercise"}</Text>
                  <Pressable style={styles.viewSetsButton} onPress={() => loadSets(exercise.id)}>
                    <Text style={styles.viewSetsText}>{isExpanded ? "Hide sets" : "View sets"}</Text>
                  </Pressable>
                </View>
                <Text style={styles.exerciseDetail}>Weight: {exercise.weight ?? "—"}</Text>
                <Text style={styles.exerciseDetail}>Reps: {exercise.reps ?? "—"}</Text>
                {exercise.notes ? <Text style={styles.exerciseNote}>{exercise.notes}</Text> : null}
                {isExpanded && (
                  <View style={styles.setsContainer}>
                    {exerciseSets.length === 0 ? (
                      <Text style={styles.setsEmpty}>No sets available for this exercise.</Text>
                    ) : (
                      exerciseSets.map((setItem) => (
                        <View key={setItem.id} style={styles.setRow}>
                          <Text style={styles.setText}>Set {setItem.id}</Text>
                          <Text style={styles.setText}>Weight: {setItem.weight ?? "—"}</Text>
                          <Text style={styles.setText}>Reps: {setItem.reps ?? "—"}</Text>
                          {setItem.notes ? <Text style={styles.setNote}>{setItem.notes}</Text> : null}
                        </View>
                      ))
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}

      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>Back to Sessions</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 20,
  },
  heading: {
    color: "#F6C846",
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 8,
  },
  description: {
    color: "#EDE3B8",
    marginBottom: 16,
    lineHeight: 22,
  },
  loading: {
    marginTop: 24,
  },
  error: {
    color: "#ff7f7f",
    marginTop: 12,
  },
  empty: {
    color: "#EDE3B8",
    marginTop: 20,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#111",
    borderColor: "#333",
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  exerciseName: {
    color: "#F6C846",
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
    marginRight: 12,
  },
  viewSetsButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#F6C846",
  },
  viewSetsText: {
    color: "#050505",
    fontWeight: "700",
  },
  exerciseDetail: {
    color: "#EDE3B8",
    marginBottom: 4,
  },
  exerciseNote: {
    color: "#C7B77D",
    marginBottom: 10,
  },
  setsContainer: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#333",
    paddingTop: 12,
  },
  setsEmpty: {
    color: "#EDE3B8",
  },
  setRow: {
    marginBottom: 10,
  },
  setText: {
    color: "#fff",
  },
  setNote: {
    color: "#C7B77D",
  },
  backButton: {
    marginTop: 14,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#F6C846",
  },
  backText: {
    color: "#050505",
    fontWeight: "700",
  },
});
