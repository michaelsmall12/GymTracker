import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";
import SpinningDumbbell from "../components/SpinningDumbbell";
import { API_ENDPOINTS } from "../constants/api";
import { useLocationContext } from "./LocationContext";

interface Location {
  id: string;
  name: string;
}

export default function NewSession() {
  const router = useRouter();
  const { setLocation } = useLocationContext();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [newLocation, setNewLocation] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLocations();
  }, []);

  async function fetchLocations() {
    try {
      const response = await fetch(API_ENDPOINTS.LOCATIONS);
      if (!response.ok) throw new Error("Failed to fetch locations");
      const data: Location[] = await response.json();
      setLocations(data);
    } catch (err) {
      setError("Failed to load locations. You can still add a new one.");
    } finally {
      setLoading(false);
    }
  }

  function handleSelectLocation(location: Location) {
    setSelectedLocation(location.name);
    setLocation(location);
    setAddingNew(false);
    setError(null);
  }

  async function addNewLocation(name: string): Promise<Location | null> {
    try {
      const response = await fetch(API_ENDPOINTS.LOCATIONS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(name),
      });
      if (!response.ok) throw new Error("Failed to add location");
      await fetchLocations();
      const refreshed = locations.find(l => l.name === name);
      if (refreshed) return refreshed;
      const data = await response.json().catch(() => null);
      if (data && data.id) return data as Location;
      return { id: Date.now().toString(), name };
    } catch (err) {
      setError("Failed to add new location.");
      return null;
    }
  }

  function handleAddNew() {
    setAddingNew(true);
    setSelectedLocation(null);
    setNewLocation("");
    setError(null);
  }

  const canContinue = addingNew ? newLocation.trim().length > 0 : selectedLocation !== null;

  async function handleContinue() {
    let locationObj: Location | null = null;
    if (addingNew && newLocation.trim()) {
      locationObj = await addNewLocation(newLocation.trim());
      if (!locationObj) return;
      setLocation(locationObj);
    } else {
      locationObj = locations.find(l => l.name === selectedLocation) || null;
      setLocation(locationObj);
    }
    if (!locationObj) {
      setError("Please select or enter a location.");
      return;
    }
    router.push("/new-session/set-1");
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: "Choose Location" }} />
        <SpinningDumbbell size={48} />
        <Text style={styles.loadingText}>Loading previous locations...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: "Choose Location" }} />

      <Text style={styles.heading}>Start a New Session</Text>
      <Text style={styles.description}>Select a previous gym location or add a new one.</Text>

      <View style={styles.content}>
        <Text style={styles.subheading}>Previous Locations</Text>
        {locations.length > 0 ? (
          <FlatList
            data={locations}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable
                style={[
                  styles.locationButton,
                  selectedLocation === item.name && styles.selectedLocationButton,
                ]}
                onPress={() => handleSelectLocation(item)}
              >
                <Text
                  style={[
                    styles.locationText,
                    selectedLocation === item.name && styles.selectedLocationText,
                  ]}
                >
                  {item.name}
                </Text>
              </Pressable>
            )}
            style={styles.locationList}
          />
        ) : (
          <Text style={styles.noLocationsText}>No previous locations found.</Text>
        )}

        <Pressable style={styles.addNewButton} onPress={handleAddNew}>
          <Text style={styles.addNewText}>+ Add New Location</Text>
        </Pressable>

        {addingNew && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>New Location</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter new gym location"
              placeholderTextColor="#7b6f47"
              value={newLocation}
              onChangeText={setNewLocation}
              autoFocus
            />
          </View>
        )}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        style={[styles.actionButton, !canContinue && styles.actionButtonDisabled]}
        onPress={handleContinue}
        disabled={!canContinue}
      >
        <Text style={styles.actionText}>Continue</Text>
      </Pressable>
    </SafeAreaView>
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
    marginBottom: 12,
  },
  description: {
    color: "#EDE3B8",
    marginBottom: 24,
    lineHeight: 22,
  },
  content: {
    flex: 1,
  },
  subheading: {
    color: "#EDE3B8",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  locationList: {
    flex: 1,
    marginBottom: 16,
  },
  locationButton: {
    backgroundColor: "#111",
    borderColor: "#333",
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  selectedLocationButton: {
    backgroundColor: "#F6C846",
    borderColor: "#F6C846",
  },
  locationText: {
    color: "#EDE3B8",
    fontSize: 16,
  },
  selectedLocationText: {
    color: "#000",
  },
  noLocationsText: {
    color: "#7b6f47",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  addNewButton: {
    backgroundColor: "#333",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  addNewText: {
    color: "#F6C846",
    fontSize: 16,
    fontWeight: "600",
  },
  formGroup: {
    marginBottom: 12,
  },
  label: {
    color: "#EDE3B8",
    marginBottom: 8,
    fontSize: 16,
    fontWeight: "600",
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
  error: {
    color: "#ff8a8a",
    marginBottom: 16,
  },
  actionButton: {
    marginTop: 24,
    backgroundColor: "#F6C846",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  actionText: {
    color: "#050505",
    fontWeight: "700",
    fontSize: 16,
  },
  loadingText: {
    color: "#EDE3B8",
    fontSize: 16,
    marginTop: 16,
  },
  actionButtonDisabled: {
    opacity: 0.4,
  },
});
