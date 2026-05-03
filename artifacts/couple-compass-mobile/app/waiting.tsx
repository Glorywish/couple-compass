import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGetSessionStatus } from "@workspace/api-client-react";

import { useColors } from "@/hooks/useColors";

export default function WaitingScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { sessionCode, partnerSlot } = useLocalSearchParams<{
    sessionCode: string;
    partnerSlot: string;
  }>();

  const pulse = useSharedValue(1);
  const ringOpacity = useSharedValue(1);

  const { data: status } = useGetSessionStatus(sessionCode, {
    query: { refetchInterval: 5000 },
  });

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.18, { duration: 900 }),
        withTiming(1, { duration: 900 })
      ),
      -1,
      true
    );
    ringOpacity.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 1100 }),
        withTiming(1, { duration: 1100 })
      ),
      -1,
      true
    );
  }, []);

  useEffect(() => {
    if (!status?.bothCompleted) return;
    const timer = setTimeout(() => {
      router.replace({ pathname: "/report", params: { sessionCode } });
    }, 1400);
    return () => clearTimeout(timer);
  }, [status?.bothCompleted, sessionCode]);

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: ringOpacity.value,
  }));

  const mySlot = partnerSlot;
  const myName =
    mySlot === "partner1" ? status?.partner1Name : status?.partner2Name;
  const partnerName =
    mySlot === "partner1" ? status?.partner2Name : status?.partner1Name;

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <LinearGradient
      colors={["#eaf3ff", "#fce8ec"]}
      style={[
        styles.container,
        { paddingTop: topPad + 40, paddingBottom: bottomPad + 24 },
      ]}
    >
      <View style={styles.iconGroup}>
        <Animated.View style={[styles.ring, ringStyle]} />
        <Animated.View style={[styles.heartWrap, heartStyle]}>
          <LinearGradient
            colors={["#e8607a", "#c0405a"]}
            style={styles.heartBg}
          >
            <Ionicons name="heart" size={48} color="#fff" />
          </LinearGradient>
        </Animated.View>
      </View>

      <Text style={[styles.title, { color: colors.foreground }]}>
        {status?.bothCompleted ? "Both ready!" : "Waiting for your partner"}
      </Text>

      {!status?.bothCompleted ? (
        <Text
          style={[styles.subText, { color: colors.mutedForeground }]}
        >
          {partnerName ? (
            <>
              Waiting for{" "}
              <Text style={{ fontFamily: "Inter_600SemiBold", color: colors.foreground }}>
                {partnerName}
              </Text>{" "}
              to finish
            </>
          ) : (
            "Your partner hasn't joined yet"
          )}
        </Text>
      ) : (
        <Text style={[styles.subText, { color: colors.mutedForeground }]}>
          Generating your compatibility report…
        </Text>
      )}

      <View style={styles.statusRow}>
        <View
          style={[
            styles.statusCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Ionicons
            name={status?.partner1Completed ? "checkmark-circle" : "time-outline"}
            size={22}
            color={status?.partner1Completed ? "#22c55e" : colors.mutedForeground}
          />
          <Text style={[styles.statusName, { color: colors.foreground }]}>
            {status?.partner1Name ?? "Partner 1"}
          </Text>
          <Text
            style={[
              styles.statusLabel,
              {
                color: status?.partner1Completed
                  ? "#22c55e"
                  : colors.mutedForeground,
              },
            ]}
          >
            {status?.partner1Completed ? "Done" : "In progress"}
          </Text>
        </View>

        <View
          style={[
            styles.statusCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Ionicons
            name={status?.partner2Completed ? "checkmark-circle" : "time-outline"}
            size={22}
            color={status?.partner2Completed ? "#22c55e" : colors.mutedForeground}
          />
          <Text style={[styles.statusName, { color: colors.foreground }]}>
            {status?.partner2Name ?? "Partner 2"}
          </Text>
          <Text
            style={[
              styles.statusLabel,
              {
                color: status?.partner2Completed
                  ? "#22c55e"
                  : colors.mutedForeground,
              },
            ]}
          >
            {status?.partner2Completed ? "Done" : "Waiting…"}
          </Text>
        </View>
      </View>

      {myName && (
        <Text style={[styles.footerText, { color: "rgba(26,53,96,0.3)" }]}>
          You are logged in as {myName}
        </Text>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", paddingHorizontal: 24 },
  iconGroup: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    width: 130,
    height: 130,
  },
  ring: {
    position: "absolute",
    width: 124,
    height: 124,
    borderRadius: 62,
    borderWidth: 2,
    borderColor: "#e8607a",
  },
  heartWrap: {},
  heartBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#e8607a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 40,
    paddingHorizontal: 16,
  },
  statusRow: { flexDirection: "row", gap: 12, width: "100%" },
  statusCard: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 6,
  },
  statusName: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
  },
  statusLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  footerText: {
    marginTop: "auto",
    paddingTop: 32,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
});
