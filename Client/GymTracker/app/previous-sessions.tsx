


import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
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
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
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
              onRequestDelete={() => setDeleteTarget(session)}
              router={router}
            />
          ))}
        </ScrollView>
      )}
      <Modal
        visible={deleteTarget !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteTarget(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Delete Session</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to delete this session?
            </Text>
            <View style={styles.modalButtons}>
              <Pressable
                style={styles.modalCancelButton}
                onPress={() => setDeleteTarget(null)}
              >
                <Text style={styles.modalCancelText}>No</Text>
              </Pressable>
              <Pressable
                style={styles.modalDeleteButton}
                disabled={deletingId !== null}
                onPress={async () => {
                  if (!deleteTarget) return;
                  setDeletingId(deleteTarget.id);
                  setError(null);
                  try {
                    await fetch(API_ENDPOINTS.GYM_SESSIONS, {
                      method: 'DELETE',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(deleteTarget.id),
                    });
                    setSessions(prev => prev.filter(s => s.id !== deleteTarget.id));
                  } catch (err) {
                    setError(err instanceof Error ? err.message : String(err));
                  } finally {
                    setDeletingId(null);
                    setDeleteTarget(null);
                  }
                }}
              >
                <Text style={styles.modalDeleteText}>
                  {deletingId ? 'Deleting...' : 'Yes'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

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
function SessionCard({ session, onRequestDelete, router }: any) {
  return (
    <View style={styles.sessionCard}>
      <TouchableOpacity
        style={styles.sessionHeader}
        activeOpacity={0.7}
        onPress={() => router.push(`/session/${session.id}`)}
      >
        <Text style={styles.sessionLocation}>{session.location?.name ?? "Unknown location"}</Text>
        <Text style={styles.sessionDate}>{formatDate(session.dateStarted)}</Text>
        <Pressable onPress={onRequestDelete} hitSlop={8}>
          <Text style={styles.menuDots}>⋮</Text>
        </Pressable>
      </TouchableOpacity>
      <Pressable
        onPress={() => router.push(`/session/${session.id}`)}
        style={{paddingTop: 6, paddingBottom: 2}}
      >
        <Text style={styles.sessionDetail}>Duration: {session.duration ?? "N/A"}</Text>
        {session.notes ? <Text style={styles.sessionNotes}>{session.notes}</Text> : null}
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#1a1a1a",
    borderRadius: 18,
    padding: 28,
    width: "80%",
    maxWidth: 340,
    alignItems: "center",
    borderColor: "#333",
    borderWidth: 1,
  },
  modalTitle: {
    color: "#F6C846",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 10,
  },
  modalMessage: {
    color: "#EDE3B8",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 14,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: "#333",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  modalCancelText: {
    color: "#EDE3B8",
    fontWeight: "700",
    fontSize: 15,
  },
  modalDeleteButton: {
    flex: 1,
    backgroundColor: "#F44336",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  modalDeleteText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
