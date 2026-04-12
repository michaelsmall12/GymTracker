


import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { API_ENDPOINTS } from "../constants/api";

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function PreviousSessions() {
  const router = useRouter();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteId, setShowDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteButtonY, setDeleteButtonY] = useState<number | null>(null);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch(API_ENDPOINTS.GYM_SESSIONS)
      .then(res => res.json())
      .then(data => setSessions(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredSessions = useMemo(() => {
    if (!filter) return sessions;
    return sessions.filter(s =>
      (s.location?.name ?? "").toLowerCase().includes(filter.toLowerCase())
    );
  }, [sessions, filter]);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Previous Sessions</Text>
      <Text style={styles.description}>View and manage your previous gym sessions.</Text>
      <View style={styles.filterRow}>
        <TextInput
          style={styles.filterInput}
          placeholder="Filter by location..."
          placeholderTextColor="#888"
          value={filter}
          onChangeText={setFilter}
        />
      </View>
      {loading ? (
        <ActivityIndicator style={styles.loading} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : filteredSessions.length === 0 ? (
        <Text style={styles.emptyText}>No sessions found.</Text>
      ) : (
        <ScrollView style={styles.sessionList} contentContainerStyle={styles.sessionListContent}>
          {filteredSessions.map(session => (
            <SessionCard
              key={session.id}
              session={session}
              onDelete={async () => {
                setDeletingId(session.id);
                setError(null);
                try {
                  const res = await fetch(API_ENDPOINTS.GYM_SESSIONS, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify( session.id ),
                  });
                  setDeleteButtonY(null);
                } catch (err) {
                  setError(err instanceof Error ? err.message : String(err));
                } finally {
                  setDeletingId(null);
                }
              }}
              showDelete={showDeleteId === session.id}
              setShowDeleteId={setShowDeleteId}
              deletingId={deletingId}
              router={router}
            />
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

// SessionCard component for per-card overlay logic
function SessionCard({ session, onDelete, showDelete, setShowDeleteId, deletingId, router }: any) {
  return (
    <View style={styles.sessionCard}>
      <TouchableOpacity
        style={styles.sessionHeader}
        activeOpacity={0.7}
        onPress={() => setShowDeleteId(showDelete ? null : session.id)}
      >
        <Text style={styles.sessionLocation}>{session.location?.name ?? "Unknown location"}</Text>
        <Text style={styles.sessionDate}>{formatDate(session.dateStarted)}</Text>
        <Text style={styles.menuDots}>⋮</Text>
      </TouchableOpacity>
      <Pressable
        onPress={() => router.push(`/session/${session.id}`)}
        style={{paddingTop: 6, paddingBottom: 2}}
      >
        <Text style={styles.sessionDetail}>Duration: {session.duration ?? "N/A"}</Text>
        {session.notes ? <Text style={styles.sessionNotes}>{session.notes}</Text> : null}
      </Pressable>
      {showDelete && (
        <View
          style={[styles.deleteOverlayRoot, { left: 30, right: 30 }]}
          pointerEvents="box-none"
        >
          <View style={styles.deleteContainer} pointerEvents="box-none">
            <TouchableOpacity
              style={styles.deleteButton}
              disabled={deletingId === session.id}
              onPress={onDelete}
            >
              <Text style={styles.deleteButtonText}>{deletingId === session.id ? 'Deleting...' : 'Delete'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
    backgroundColor: "#181818",
    borderRadius: 14,
    marginBottom: 18,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  sessionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  sessionLocation: {
    color: "#F6C846",
    fontWeight: "700",
    fontSize: 16,
    flex: 1,
  },
  sessionDate: {
    color: "#EDE3B8",
    fontSize: 13,
    marginLeft: 10,
  },
  menuDots: {
    color: "#888",
    fontSize: 22,
    marginLeft: 12,
    marginRight: 0,
  },
  sessionDetail: {
    color: "#EDE3B8",
    fontSize: 14,
    marginBottom: 2,
  },
  sessionNotes: {
    color: "#aaa",
    fontSize: 13,
    marginTop: 2,
  },
  backButton: {
    marginTop: 18,
    alignSelf: "center",
    backgroundColor: "#222",
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  backText: {
    color: "#F6C846",
    fontWeight: "700",
    fontSize: 16,
  },
  deleteOverlayRoot: {
    position: "absolute",
    zIndex: 100,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingVertical: 40,
    borderRadius: 16,
  },
  deleteContainer: {
    backgroundColor: "#222",
    borderRadius: 14,
    padding: 18,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  deleteButton: {
    backgroundColor: "#F44336",
    borderRadius: 8,
    paddingHorizontal: 28,
    paddingVertical: 12,
    marginTop: 4,
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
