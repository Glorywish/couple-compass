import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  getGetSessionQueryKey,
  useGetSession,
} from "@workspace/api-client-react";

import { useColors } from "@/hooks/useColors";

export default function JoinScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const { data: session, isError, isLoading } = useGetSession(
    code.toUpperCase().trim(),
    {
      query: {
        enabled: submitted && !!code.trim(),
        queryKey: getGetSessionQueryKey(code.toUpperCase().trim()),
      },
    }
  );

  useEffect(() => {
    if (submitted && session && name.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace({
        pathname: "/questionnaire",
        params: {
          sessionCode: session.sessionCode,
          partnerSlot: "partner2",
          name: name.trim(),
        },
      });
    }
  }, [session, submitted, name]);

  useEffect(() => {
    if (submitted && isError) {
      setError("Session not found. Please check the code and try again.");
      setSubmitted(false);
    }
  }, [isError, submitted]);

  const handleJoin = () => {
    if (!code.trim() || !name.trim()) return;
    setError("");
    setSubmitted(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
            <Text style={styles.headerTitle}>Join a Session</Text>
            <View style={{ width: 40 }} />
          </View>

          <Text style={[styles.titleHint, { color: colors.mutedForeground }]}>
            Enter the session code your partner shared with you
          </Text>

          <View style={styles.form}>
            <View>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>
                SESSION CODE
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.codeInput,
                  { borderColor: error ? "#ef4444" : colors.border },
                ]}
                value={code}
                onChangeText={(t) => {
                  setCode(t.toUpperCase());
                  setError("");
                }}
                placeholder="XXXXXXXX"
                placeholderTextColor={colors.mutedForeground}
                autoCapitalize="characters"
                maxLength={8}
                autoFocus
                testID="input-code"
              />
            </View>

            <View>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>
                YOUR NAME
              </Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border }]}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor={colors.mutedForeground}
                returnKeyType="done"
                onSubmitEditing={handleJoin}
                testID="input-name"
              />
            </View>

            {!!error && (
              <View style={styles.errorRow}>
                <Ionicons name="alert-circle" size={16} color="#ef4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.btn,
                {
                  backgroundColor: colors.primary,
                  opacity: code.trim() && name.trim() ? 1 : 0.5,
                },
              ]}
              onPress={handleJoin}
              disabled={!code.trim() || !name.trim() || (submitted && isLoading)}
              testID="btn-join"
            >
              {submitted && isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="people" size={18} color="#fff" />
                  <Text style={styles.btnText}>Join Session</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
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
    marginBottom: 24,
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
  titleHint: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
    marginBottom: 28,
  },
  form: { gap: 20 },
  label: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: "#1a3560",
  },
  codeInput: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    letterSpacing: 4,
    textAlign: "center",
  },
  errorRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  errorText: {
    color: "#ef4444",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    flex: 1,
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
});
