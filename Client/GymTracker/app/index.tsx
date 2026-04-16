import { Stack, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { API_ENDPOINTS } from "../constants/api";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatRelativeDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
}

function getWeekDays(weekOffset: number): { date: Date; label: string; dateStr: string }[] {
  const today = new Date();
  const days: { date: Date; label: string; dateStr: string }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i - weekOffset * 7);
    days.push({
      date: d,
      label: DAY_NAMES[d.getDay()],
      dateStr: d.toISOString().split("T")[0],
    });
  }
  return days;
}

function formatWeekRange(days: { date: Date }[]) {
  const start = days[0].date;
  const end = days[days.length - 1].date;
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${start.toLocaleDateString(undefined, opts)} — ${end.toLocaleDateString(undefined, opts)}`;
}

export default function Index() {
  const router = useRouter();
  const [lastSession, setLastSession] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [weekOffset, setWeekOffset] = useState(0);

  const loadSessions = useCallback(() => {
    fetch(API_ENDPOINTS.GYM_SESSIONS)
      .then(res => res.json())
      .then((data: any[]) => {
        setSessions(data);
        if (data.length > 0) {
          const sorted = [...data].sort(
            (a, b) => new Date(b.dateStarted).getTime() - new Date(a.dateStarted).getTime()
          );
          setLastSession(sorted[0]);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const weekDays = getWeekDays(weekOffset);
  const sessionDates = new Set(
    sessions.map((s) => new Date(s.dateStarted).toISOString().split("T")[0])
  );

  const weekSessionCount = weekDays.filter((d) => sessionDates.has(d.dateStr)).length;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: "Home" }} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoCard}>
          <Text style={styles.logoIcon}>🏋️</Text>
          <View>
            <Text style={styles.title}>GymTracker</Text>
            <Text style={styles.subtitle}>Track your progress</Text>
          </View>
        </View>

        {/* 7-day activity chart */}
        <View style={styles.weekCard}>
          <View style={styles.weekHeader}>
            <Pressable onPress={() => setWeekOffset((w) => w + 1)} hitSlop={12}>
              <Text style={styles.weekArrow}>‹</Text>
            </Pressable>
            <Text style={styles.weekTitle}>{formatWeekRange(weekDays)}</Text>
            <Pressable
              onPress={() => setWeekOffset((w) => Math.max(0, w - 1))}
              hitSlop={12}
              disabled={weekOffset === 0}
            >
              <Text style={[styles.weekArrow, weekOffset === 0 && { opacity: 0.3 }]}>›</Text>
            </Pressable>
          </View>
          <View style={styles.weekRow}>
            {weekDays.map((day) => {
              const active = sessionDates.has(day.dateStr);
              const isToday = day.dateStr === new Date().toISOString().split("T")[0];
              return (
                <View key={day.dateStr} style={styles.dayColumn}>
                  <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>{day.label}</Text>
                  <View
                    style={[
                      styles.dayDot,
                      active ? styles.dayDotActive : styles.dayDotInactive,
                      isToday && !active && styles.dayDotToday,
                    ]}
                  >
                    <Text style={styles.dayDate}>{day.date.getDate()}</Text>
                  </View>
                </View>
              );
            })}
          </View>
          <Text style={styles.weekSummary}>
            {weekSessionCount} session{weekSessionCount !== 1 ? "s" : ""} this week
          </Text>
        </View>

        {lastSession && (
          <Pressable
            style={styles.lastSessionCard}
            onPress={() => router.push(`/session/${lastSession.id}`)}
          >
            <Text style={styles.lastSessionLabel}>Last Session</Text>
            <Text style={styles.lastSessionLocation}>
              {lastSession.location?.name ?? "Unknown location"}
              <Text style={styles.lastSessionDate}>
                {"  ·  "}{formatRelativeDate(lastSession.dateStarted)}
              </Text>
            </Text>
          </Pressable>
        )}

        {/* 2×2 action grid */}
        <View style={styles.gridContainer}>
          <View style={styles.gridRow}>
            <Pressable style={styles.gridCard} onPress={() => router.push("/new-session")}>
              <Text style={styles.gridIcon}>➕</Text>
              <Text style={styles.gridLabel}>New Session</Text>
            </Pressable>
            <Pressable style={styles.gridCard} onPress={() => router.push("/previous-sessions")}>
              <Text style={styles.gridIcon}>📋</Text>
              <Text style={styles.gridLabel}>History</Text>
            </Pressable>
          </View>
          <View style={styles.gridRow}>
            <Pressable style={styles.gridCard} onPress={() => router.push("/exercise-progress")}>
              <Text style={styles.gridIcon}>📈</Text>
              <Text style={styles.gridLabel}>Progress</Text>
            </Pressable>
            <Pressable style={styles.gridCard} onPress={() => router.push("/settings")}>
              <Text style={styles.gridIcon}>⚙️</Text>
              <Text style={styles.gridLabel}>Settings</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  scrollContent: {
    alignItems: "center",
    padding: 20,
    paddingBottom: 40,
  },
  logoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginTop: 16,
    marginBottom: 20,
  },
  logoIcon: {
    fontSize: 36,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#F6C846",
  },
  subtitle: {
    fontSize: 13,
    color: "#888",
  },
  lastSessionCard: {
    backgroundColor: "#111",
    borderColor: "#333",
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    width: "100%",
    alignItems: "center",
    marginBottom: 4,
  },
  lastSessionLabel: {
    color: "#888",
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  lastSessionLocation: {
    color: "#F6C846",
    fontSize: 16,
    fontWeight: "700",
  },
  lastSessionDate: {
    color: "#EDE3B8",
    fontSize: 14,
    fontWeight: "400",
  },
  // 2×2 action grid
  gridContainer: {
    width: "100%",
    marginTop: 16,
    gap: 12,
  },
  gridRow: {
    flexDirection: "row",
    gap: 12,
  },
  gridCard: {
    flex: 1,
    backgroundColor: "#111",
    borderColor: "#333",
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  gridIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  gridLabel: {
    color: "#EDE3B8",
    fontSize: 14,
    fontWeight: "700",
  },
  // Week activity chart
  weekCard: {
    backgroundColor: "#111",
    borderColor: "#333",
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    width: "100%",
    marginBottom: 16,
  },
  weekHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  weekArrow: {
    color: "#F6C846",
    fontSize: 28,
    fontWeight: "700",
    paddingHorizontal: 8,
  },
  weekTitle: {
    color: "#EDE3B8",
    fontSize: 14,
    fontWeight: "600",
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dayColumn: {
    alignItems: "center",
    flex: 1,
  },
  dayLabel: {
    color: "#888",
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 6,
  },
  dayLabelToday: {
    color: "#F6C846",
  },
  dayDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  dayDotActive: {
    backgroundColor: "#2a5a2a",
    borderColor: "#6BCB77",
    borderWidth: 2,
  },
  dayDotInactive: {
    backgroundColor: "#1a1a1a",
    borderColor: "#333",
    borderWidth: 1,
  },
  dayDotToday: {
    borderColor: "#F6C846",
    borderWidth: 2,
  },
  dayDate: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  weekSummary: {
    color: "#888",
    fontSize: 12,
    textAlign: "center",
    marginTop: 12,
  },
});