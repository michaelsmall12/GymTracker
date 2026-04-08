import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { API_ENDPOINTS } from "../constants/api";

interface Location {
  name: string;
}

export default function NewSession() {
  const router = useRouter();
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
      const data: string[] = await response.json();

const formatted: Location[] = data.map((name) => ({ name }));

setLocations(formatted);
    } catch (err) {
      setError("Failed to load locations. You can still add a new one.");
    } finally {
      setLoading(false);
    }
  }

  function handleSelectLocation(location: Location) {
    setSelectedLocation(location.name);
    setAddingNew(false);
    setError(null);
  }

  async function addNewLocation(name: string) {
    try {
      const response = await fetch(API_ENDPOINTS.LOCATIONS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(name),
      });
      if (!response.ok) throw new Error("Failed to add location");
      // Assuming it returns the new location or something, but for now, just add to local state
      const newLoc: Location = {  name }; // temp id
      setLocations(prev => [...prev, newLoc]);
      return true;
    } catch (err) {
      setError("Failed to add new location.");
      return false;
    }}
  function handleAddNew() {
    setAddingNew(true);
    setSelectedLocation(null);
    setNewLocation("");
    setError(null);
  }

  async function handleContinue() {
    const location = selectedLocation || newLocation.trim();
    if (!location) {
      setError("Please select or enter a location.");
      return;
    }

    // If adding new, post to API
    if (addingNew && newLocation.trim()) {
      const success = await addNewLocation(newLocation.trim());
      if (!success) return;
    }

    router.push({
      pathname: "/new-session/set-1",
      params: { location },
    });
}

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={styles.loadingText}>Loading previous locations...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "New Session" }} />

      <Text style={styles.heading}>Start a New Session</Text>
      <Text style={styles.description}>Select a previous gym location or add a new one.</Text>

      <View style={styles.content}>
        <Text style={styles.subheading}>Previous Locations</Text>
        {locations.length > 0 ? (
          <FlatList
            data={locations}
            keyExtractor={(item) => item.name}
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

      <Pressable style={styles.actionButton} onPress={handleContinue}>
        <Text style={styles.actionText}>Continue to Set 1</Text>
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
    maxHeight: 200,
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
});
