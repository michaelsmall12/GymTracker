import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { API_ENDPOINTS } from "../constants/api";

function formatRelativeDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
}

export default function Index() {
  const router = useRouter();
  const [lastSession, setLastSession] = useState<any>(null);

  useEffect(() => {
    fetch(API_ENDPOINTS.GYM_SESSIONS)
      .then(res => res.json())
      .then((data: any[]) => {
        if (data.length > 0) {
          const sorted = [...data].sort(
            (a, b) => new Date(b.dateStarted).getTime() - new Date(a.dateStarted).getTime()
          );
          setLastSession(sorted[0]);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: "Home" }} />
      <View style={styles.logoCard}>
        <View style={styles.logoMark}>
          <Text style={styles.logoIcon}>🏋️</Text>
          <View style={styles.logoBarbellBar}>
            <View style={styles.logoBarbellPlateLeft} />
            <View style={styles.logoBarbellStem} />
            <View style={styles.logoBarbellPlateRight} />
          </View>
        </View>
        <Text style={styles.title}>GymTracker</Text>
        <Text style={styles.subtitle}>Review past routines or start a new workout session</Text>
      </View>

      {lastSession && (
        <Pressable
          style={styles.lastSessionCard}
          onPress={() => router.push(`/session/${lastSession.id}`)}
        >
          <Text style={styles.lastSessionLabel}>Last Session</Text>
          <Text style={styles.lastSessionLocation}>
            {lastSession.location?.name ?? "Unknown location"}
          </Text>
          <Text style={styles.lastSessionDate}>
            {formatRelativeDate(lastSession.dateStarted)}
          </Text>
        </Pressable>
      )}

      <View style={styles.footer}>
        <Pressable style={styles.actionButton} onPress={() => router.push("/new-session")}> 
          <Text style={styles.actionText}>Start New Session</Text>
        </Pressable>

        <Pressable style={styles.actionButton} onPress={() => router.push("/previous-sessions")}> 
          <Text style={styles.actionText}>View Previous Sessions</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#000000",
  },
  logoCard: {
    alignItems: "center",
    marginTop: 50,
  },
  logoMark: {
    alignItems: "center",
    marginBottom: 20,
  },
  logoIcon: {
    fontSize: 56,
    marginBottom: 6,
  },
  logoBarbellBar: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoBarbellPlateLeft: {
    width: 10,
    height: 28,
    backgroundColor: "#F6C846",
    borderRadius: 3,
  },
  logoBarbellStem: {
    width: 60,
    height: 6,
    backgroundColor: "#F6C846",
    borderRadius: 3,
  },
  logoBarbellPlateRight: {
    width: 10,
    height: 28,
    backgroundColor: "#F6C846",
    borderRadius: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#F6C846",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  lastSessionCard: {
    backgroundColor: "#111",
    borderColor: "#333",
    borderWidth: 1,
    borderRadius: 14,
    padding: 18,
    width: "100%",
    alignItems: "center",
  },
  lastSessionLabel: {
    color: "#888",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  lastSessionLocation: {
    color: "#F6C846",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  lastSessionDate: {
    color: "#EDE3B8",
    fontSize: 14,
  },
  footer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 50,
  },
  actionButton: {
    backgroundColor: "#F6C846",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginBottom: 15,
    width: "100%",
    alignItems: "center",
  },
  actionText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
  },
});