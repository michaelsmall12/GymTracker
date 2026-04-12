// Helper to format ISO date string as dd-mm-yyyy
function formatDate(dateString?: string): string {
  if (!dateString) return "No date";
  // Handle cases like 0001-01-01T00:00:00
  const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return dateString;
  const [, year, month, day] = match;
  return `${day}-${month}-${year}`;
}
import { Stack, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { API_ENDPOINTS } from "../constants/api";

import type { Location } from "./LocationContext";

type SessionItem = {
  id: string;
  dateStarted?: string;
  duration?: string;
  notes?: string;
  location?: Location;
};

export default function PreviousSessions() {
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationFilter, setLocationFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    async function loadSessions() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(API_ENDPOINTS.GYM_SESSIONS);
        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`);
        }

        const data = await response.json();
        const sessionsArray = Array.isArray(data) ? data : (data.sessions ? data.sessions : [data]);
        setSessions(sessionsArray);

        const uniqueLocations = Array.from(
          new Set(
            sessionsArray
              .map((s: SessionItem) => s.location?.name)
              .filter(Boolean)
          )
        );
        setLocations(uniqueLocations as string[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    }

    loadSessions();
  }, []);

  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      const matchesLocation = locationFilter
        ? session.location?.name?.toLowerCase().includes(locationFilter.toLowerCase())
        : true;
      const matchesDate = dateFilter ? session.dateStarted?.includes(dateFilter) : true;
      return matchesLocation && matchesDate;
    });
  }, [sessions, locationFilter, dateFilter]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Previous Sessions" }} />
      <Text style={styles.heading}>Previous Sessions</Text>

      <Text style={styles.description}>Filter completed sessions by location or date, then tap a session to review exercises and sets.</Text>

      <View style={styles.filterRow}>
        <TextInput
          style={styles.filterInput}
          placeholder="Filter location"
          placeholderTextColor="#c7b77d"
          value={locationFilter}
          onChangeText={setLocationFilter}
        />
        <TextInput
          style={styles.filterInput}
          placeholder="Date (YYYY-MM-DD)"
          placeholderTextColor="#c7b77d"
          value={dateFilter}
          onChangeText={setDateFilter}
        />
      </View>

      {locations.length > 0 && (
        <ScrollView horizontal style={styles.chipScroll} contentContainerStyle={styles.chipContent}>
          {locations.map((locationName) => (
            <Pressable
              key={locationName}
              style={[styles.chip, locationFilter === locationName && styles.chipActive]}
              onPress={() => setLocationFilter(locationName)}
            >
              <Text style={[styles.chipText, locationFilter === locationName && styles.chipTextActive]}>{locationName}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#F6C846" style={styles.loading} />
      ) : error ? (
        <Text style={styles.error}>Unable to load sessions. {error}</Text>
      ) : filteredSessions.length === 0 ? (
        <Text style={styles.emptyText}>No sessions match the selected filters.</Text>
      ) : (
        <ScrollView style={styles.sessionList} contentContainerStyle={styles.sessionListContent}>
          {filteredSessions.map((session) => (
            <Pressable
              key={session.id}
              style={styles.sessionCard}
              onPress={() => router.push(`/session/${session.id}`)}
            >
              <View style={styles.sessionHeader}>
                <Text style={styles.sessionLocation}>{session.location?.name ?? "Unknown location"}</Text>
                <Text style={styles.sessionDate}>{formatDate(session.dateStarted)}</Text>
              </View>
              <Text style={styles.sessionDetail}>Duration: {session.duration ?? "N/A"}</Text>
              {session.notes ? <Text style={styles.sessionNotes}>{session.notes}</Text> : null}
            </Pressable>
          ))}
        </ScrollView>
      )}

      <Pressable
        style={styles.backButton}
        onPress={() => {
          // @ts-ignore: canGoBack is available in expo-router >=2.0.0
          if (typeof router.canGoBack === "function" && router.canGoBack()) {
            router.back();
          } else {
            router.replace("/");
          }
        }}
      >
        <Text style={styles.backText}>Back</Text>
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
    fontSize: 28,
    fontWeight: "900",
    color: "#F6C846",
    marginBottom: 8,
  },
  description: {
    color: "#EDE3B8",
    marginBottom: 14,
    lineHeight: 20,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  filterInput: {
    flex: 1,
    backgroundColor: "#111",
    borderColor: "#333",
    borderWidth: 1,
    borderRadius: 12,
    color: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  chipScroll: {
    maxHeight: 40,
    marginBottom: 14,
  },
  chipContent: {
    alignItems: "center",
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#1a1a1a",
    borderColor: "#444",
    borderWidth: 1,
    marginRight: 10,
  },
  chipActive: {
    backgroundColor: "#F6C846",
  },
  chipText: {
    color: "#EDE3B8",
    fontWeight: "600",
  },
  chipTextActive: {
    color: "#050505",
  },
  loading: {
    marginTop: 24,
  },
  error: {
    color: "#ff7f7f",
    marginTop: 12,
  },
  emptyText: {
    marginTop: 24,
    color: "#EDE3B8",
  },
  sessionList: {
    flex: 1,
  },
  sessionListContent: {
    paddingBottom: 20,
  },
  sessionCard: {
    backgroundColor: "#111",
    borderColor: "#333",
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sessionLocation: {
    color: "#F6C846",
    fontSize: 18,
    fontWeight: "700",
  },
  sessionDate: {
    color: "#EDE3B8",
    fontSize: 16,
  },
  sessionDetail: {
    color: "#fff",
    marginBottom: 6,
  },
  sessionNotes: {
    color: "#C7B77D",
  },
  backButton: {
    marginTop: 12,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#F6C846",
  },
  backText: {
    color: "#050505",
    fontWeight: "700",
    fontSize: 16,
  },
});
