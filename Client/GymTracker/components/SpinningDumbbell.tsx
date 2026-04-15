import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

interface Props {
  size?: number;
  color?: string;
}

export default function SpinningDumbbell({ size = 32, color = "#F6C846" }: Props) {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [spin]);

  const rotation = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const plateW = size * 0.18;
  const plateH = size * 0.6;
  const stemW = size * 0.5;
  const stemH = size * 0.12;

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ rotate: rotation }] }]}>      
      <View style={styles.barbell}>
        <View style={[styles.plate, { width: plateW, height: plateH, backgroundColor: color, borderRadius: plateW * 0.3 }]} />
        <View style={[styles.stem, { width: stemW, height: stemH, backgroundColor: color, borderRadius: stemH * 0.5 }]} />
        <View style={[styles.plate, { width: plateW, height: plateH, backgroundColor: color, borderRadius: plateW * 0.3 }]} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  barbell: {
    flexDirection: "row",
    alignItems: "center",
  },
  plate: {},
  stem: {},
});
