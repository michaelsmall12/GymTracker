import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, SafeAreaView, StyleSheet, Text, View } from "react-native";
import SpinningDumbbell from "../../components/SpinningDumbbell";
import { API_ENDPOINTS } from "../../constants/api";

export default function SessionDetail() {
  const { id } = useLocalSearchParams();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSession() {
      if (!id) {
        setError("Session ID is missing.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_ENDPOINTS.GYM_SESSIONS}/${id}`);
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        const data = await res.json();
        setSession(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, [id]);

  // Helper functions
  function formatDate(dateString: string) {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: "Session Details" }} />
        <SpinningDumbbell size={48} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: "Session Details" }} />
        <Text style={styles.errorText}>{error}</Text>
      </SafeAreaView>
    );
  }

  if (!session) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: "Session Details" }} />
        <Text style={styles.empty}>Session not found.</Text>
      </SafeAreaView>
    );
  }

  const exercises = session.exercises ?? [];
  const totalSets = exercises.reduce((sum: number, ex: any) => sum + (ex.liftSets?.length ?? 0), 0);
  const totalWeight = exercises.reduce(
    (sum: number, ex: any) =>
      sum + (ex.liftSets ?? []).reduce((s: number, set: any) => s + (set.weight ?? 0) * (set.reps ?? 0), 0),
    0
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: "Session Details" }} />
      <Text style={styles.date}>{formatDate(session.dateStarted)}</Text>
      {session.location?.name && (
        <Text style={styles.location}>{session.location.name}</Text>
      )}

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{exercises.length}</Text>
          <Text style={styles.statLabel}>Exercises</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{totalSets}</Text>
          <Text style={styles.statLabel}>Sets</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{totalWeight}</Text>
          <Text style={styles.statLabel}>Total Volume</Text>
        </View>
      </View>

      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={exercises}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item: exercise }: { item: any }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.exerciseName}>
                {exercise.exerciseName?.name ?? "Unknown Exercise"}
              </Text>
              <Text style={styles.exerciseDetail}>
                {exercise.liftSets?.length ?? 0} sets
              </Text>
            </View>
            {(exercise.liftSets ?? []).length > 0 ? (
              <View style={styles.setsContainer}>
                {exercise.liftSets.map((set: any, idx: number) => (
                  <View key={set.id} style={styles.setRow}>
                    <Text style={styles.setText}>
                      Set {idx + 1}: {set.reps} reps × {set.weight} lbs
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.setsEmpty}>No sets recorded</Text>
            )}
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No exercises in this session.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050505",
    padding: 20,
  },
  date: {
    color: "#F6C846",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
  },
  location: {
    color: "#EDE3B8",
    fontSize: 16,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#111",
    borderColor: "#333",
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    marginHorizontal: 4,
  },
  statValue: {
    color: "#F6C846",
    fontSize: 22,
    fontWeight: "700",
  },
  statLabel: {
    color: "#EDE3B8",
    fontSize: 12,
    marginTop: 2,
  },
  errorText: {
    color: "#ff4444",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
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
  exerciseDetail: {
    color: "#EDE3B8",
    marginBottom: 4,
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
  }
});
