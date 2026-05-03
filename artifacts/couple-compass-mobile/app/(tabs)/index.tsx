import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1400 }),
        withTiming(1, { duration: 1400 })
      ),
      -1,
      true
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/start");
  };

  const handleJoin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/join");
  };

  return (
    <LinearGradient
      colors={["#eaf3ff", "#fce8ec"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.container,
        { paddingTop: topPad + 32, paddingBottom: bottomPad + 24 },
      ]}
    >
      <Animated.View style={[styles.iconWrap, animStyle]}>
        <LinearGradient colors={["#e8607a", "#b84060"]} style={styles.iconBg}>
          <Ionicons name="heart" size={44} color="#fff" />
        </LinearGradient>
      </Animated.View>

      <Text style={[styles.title, { color: colors.foreground }]}>
        Couple Compass
      </Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
        Explore your compatibility together
      </Text>

      <View style={styles.cards}>
        <TouchableOpacity
          style={[
            styles.card,
            {
              backgroundColor: colors.primary,
              shadowColor: colors.primary,
            },
          ]}
          onPress={handleStart}
          activeOpacity={0.88}
          testID="btn-start"
        >
          <View style={styles.cardIconRow}>
            <View style={styles.cardIconBg}>
              <Ionicons name="compass" size={22} color={colors.primary} />
            </View>
          </View>
          <Text style={[styles.cardTitle, { color: "#fff" }]}>
            Start Journey
          </Text>
          <Text style={[styles.cardDesc, { color: "rgba(255,255,255,0.8)" }]}>
            Create a session and invite your partner
          </Text>
          <Ionicons
            name="arrow-forward"
            size={18}
            color="rgba(255,255,255,0.9)"
            style={styles.cardArrow}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.card,
            { backgroundColor: "#fff", shadowColor: "#1a3560" },
          ]}
          onPress={handleJoin}
          activeOpacity={0.88}
          testID="btn-join"
        >
          <View style={styles.cardIconRow}>
            <View style={[styles.cardIconBg, { backgroundColor: "#eaf3ff" }]}>
              <Ionicons name="people" size={22} color={colors.primary} />
            </View>
          </View>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>
            Join Partner
          </Text>
          <Text style={[styles.cardDesc, { color: colors.mutedForeground }]}>
            Enter the session code your partner shared
          </Text>
          <Ionicons
            name="arrow-forward"
            size={18}
            color={colors.primary}
            style={styles.cardArrow}
          />
        </TouchableOpacity>
      </View>

      <Text style={[styles.footer, { color: "rgba(26,53,96,0.3)" }]}>
        Couple Compass · Privacy-first compatibility
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", paddingHorizontal: 24 },
  iconWrap: { marginBottom: 24 },
  iconBg: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#e8607a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
  },
  title: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginBottom: 48,
    lineHeight: 22,
  },
  cards: { width: "100%", gap: 14 },
  card: {
    borderRadius: 20,
    padding: 22,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  cardIconRow: { marginBottom: 12 },
  cardIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  cardArrow: { position: "absolute", bottom: 22, right: 22 },
  footer: {
    marginTop: "auto",
    paddingTop: 32,
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.3,
  },
});
