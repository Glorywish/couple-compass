import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCreateSession } from "@workspace/api-client-react";

import { useColors } from "@/hooks/useColors";

type Session = { sessionCode: string; partner1Name: string };

export default function StartScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [shared, setShared] = useState(false);
  const createSession = useCreateSession();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleCreate = () => {
    if (!name.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    createSession.mutate(
      { data: { partner1Name: name.trim() } },
      {
        onSuccess: (d) =>
          setSession({
            sessionCode: d.sessionCode,
            partner1Name: d.partner1Name,
          }),
      }
    );
  };

  const handleShare = async () => {
    if (!session) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (Platform.OS === "web") {
      try {
        await navigator.clipboard.writeText(session.sessionCode);
        setShared(true);
        setTimeout(() => setShared(false), 2500);
      } catch {}
    } else {
      await Share.share({ message: `Join me on Couple Compass! Code: ${session.sessionCode}` });
      setShared(true);
      setTimeout(() => setShared(false), 2500);
    }
  };

  const handleBegin = () => {
    if (!session) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: "/questionnaire",
      params: {
        sessionCode: session.sessionCode,
        partnerSlot: "partner1",
        name: session.partner1Name,
      },
    });
  };

  return (
    <LinearGradient colors={["#eaf3ff", "#fce8ec"]} style={styles.gradient}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: topPad + 16, paddingBottom: bottomPad + 24 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
              testID="btn-back"
            >
              <Ionicons name="arrow-back" size={22} color="#1a3560" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Start a Session</Text>
            <View style={{ width: 40 }} />
          </View>

          {!session ? (
            <View style={styles.form}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>
                YOUR NAME
              </Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border }]}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor={colors.mutedForeground}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleCreate}
                testID="input-name"
              />
              <Text style={[styles.hint, { color: colors.mutedForeground }]}>
                Your partner will join with the code you receive next.
              </Text>
              <TouchableOpacity
                style={[
                  styles.btn,
                  {
                    backgroundColor: colors.primary,
                    opacity: name.trim() ? 1 : 0.5,
                  },
                ]}
                onPress={handleCreate}
                disabled={!name.trim() || createSession.isPending}
                testID="btn-create"
              >
                {createSession.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="compass" size={18} color="#fff" />
                    <Text style={styles.btnText}>Create Session</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.created}>
              <Text
                style={[styles.createdGreet, { color: colors.mutedForeground }]}
              >
                Hi, {session.partner1Name}!
              </Text>
              <Text
                style={[
                  styles.createdSubtitle,
                  { color: colors.foreground },
                ]}
              >
                Share this code with your partner
              </Text>

              <View
                style={[
                  styles.codeCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.codeLabel,
                    { color: colors.mutedForeground },
                  ]}
                >
                  SESSION CODE
                </Text>
                <Text
                  style={[styles.codeText, { color: colors.primary }]}
                  testID="session-code"
                >
                  {session.sessionCode}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.shareBtn,
                    { backgroundColor: colors.secondary },
                  ]}
                  onPress={handleShare}
                  testID="btn-share"
                >
                  <Ionicons
                    name={shared ? "checkmark" : "share-outline"}
                    size={16}
                    color={shared ? "#22c55e" : colors.primary}
                  />
                  <Text
                    style={[
                      styles.shareBtnText,
                      { color: shared ? "#22c55e" : colors.primary },
                    ]}
                  >
                    {shared
                      ? Platform.OS === "web"
                        ? "Copied!"
                        : "Shared!"
                      : Platform.OS === "web"
                        ? "Copy Code"
                        : "Share Code"}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text
                style={[
                  styles.instructionText,
                  { color: colors.mutedForeground },
                ]}
              >
                Ask your partner to open Couple Compass, tap "Join Partner", and
                enter this code. Answer independently and your report will be
                ready when you're both done.
              </Text>

              <TouchableOpacity
                style={[styles.btn, { backgroundColor: colors.primary }]}
                onPress={handleBegin}
                testID="btn-begin"
              >
                <Ionicons name="arrow-forward-circle" size={20} color="#fff" />
                <Text style={styles.btnText}>Begin My Questions</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  scroll: { paddingHorizontal: 24, flexGrow: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(26,53,96,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    color: "#1a3560",
  },
  form: { gap: 12 },
  label: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 17,
    fontFamily: "Inter_400Regular",
    color: "#1a3560",
  },
  hint: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 19,
    marginTop: 4,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 8,
  },
  btnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  created: { gap: 16 },
  createdGreet: { fontSize: 15, fontFamily: "Inter_400Regular" },
  createdSubtitle: { fontSize: 22, fontFamily: "Inter_700Bold" },
  codeCard: {
    borderWidth: 1.5,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    gap: 12,
  },
  codeLabel: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  codeText: {
    fontSize: 38,
    fontFamily: "Inter_700Bold",
    letterSpacing: 6,
  },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  shareBtnText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  instructionText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
    textAlign: "center",
  },
});
