import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function Index() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.logoCard}>
        <View style={styles.logoMark}>
          <Text style={styles.logoMarkText}>GT</Text>
        </View>
        <Text style={styles.title}>GymTracker</Text>
        <Text style={styles.subtitle}>Review past routines or start a new workout session</Text>
      </View>

      <View style={styles.footer}>
        <Pressable style={styles.actionButton} onPress={() => router.push("/new-session")}> 
          <Text style={styles.actionText}>Start New Session</Text>
        </Pressable>

        <Pressable style={styles.actionButton} onPress={() => router.push("/previous-sessions")}> 
          <Text style={styles.actionText}>View Previous Sessions</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between", // title top, footer bottom
    alignItems: "center",
    padding: 20,
    backgroundColor: "#000000", // Black background
  },
  logoCard: {
    alignItems: "center",
    marginTop: 50,
  },
  logoMark: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFD700", // Gold
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  logoMarkText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000000", // Black text on gold
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFD700", // Gold
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#FFFFFF", // White
    textAlign: "center",
    paddingHorizontal: 20,
  },
  footer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 50,
  },
  actionButton: {
    backgroundColor: "#FFD700", // Gold
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginBottom: 15,
    width: 240,
    alignItems: "center",
  },
  actionText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000", // Black text on gold
  },
});