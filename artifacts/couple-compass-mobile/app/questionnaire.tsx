import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
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
  useListQuestions,
  useSubmitResponses,
} from "@workspace/api-client-react";

import { useColors } from "@/hooks/useColors";

const CATEGORY_LABELS: Record<string, string> = {
  values: "Core Values",
  life_plans: "Life Plans",
  finances: "Finances",
  family: "Family & Kids",
  lifestyle: "Lifestyle",
  communication: "Communication",
  intimacy: "Intimacy",
  growth: "Personal Growth",
};

type Question = {
  id: number;
  category: string;
  text: string;
  type: "scale" | "choice" | "open";
  options?: string[] | null;
  weight: number;
};

function answerStorageKey(sessionCode: string, slot: string) {
  return `cc_ans_${sessionCode}_${slot}`;
}
function phaseStorageKey(sessionCode: string, slot: string) {
  return `cc_phase_${sessionCode}_${slot}`;
}

export default function QuestionnaireScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { sessionCode, partnerSlot, name } = useLocalSearchParams<{
    sessionCode: string;
    partnerSlot: string;
    name: string;
  }>();

  const { data: allQuestions, isLoading: questionsLoading } = useListQuestions();
  const submitMutation = useSubmitResponses();

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [catIndex, setCatIndex] = useState(0);
  const [showReview, setShowReview] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const categories = allQuestions
    ? [...new Set((allQuestions as Question[]).map((q) => q.category))]
    : [];
  const currentCat = categories[catIndex] ?? "";
  const catQuestions =
    (allQuestions as Question[] | undefined)?.filter(
      (q) => q.category === currentCat
    ) ?? [];
  const totalCats = categories.length;

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  useEffect(() => {
    (async () => {
      try {
        const savedAns = await AsyncStorage.getItem(
          answerStorageKey(sessionCode, partnerSlot)
        );
        const savedPhase = await AsyncStorage.getItem(
          phaseStorageKey(sessionCode, partnerSlot)
        );
        if (savedAns) setAnswers(JSON.parse(savedAns));
        if (savedPhase) setCatIndex(parseInt(savedPhase, 10));
      } catch {}
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!allQuestions || !loaded) return;
    setAnswers((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const q of catQuestions) {
        if (!(q.id in next)) {
          if (q.type === "scale") {
            next[q.id] = "3";
            changed = true;
          } else if (q.type === "open") {
            next[q.id] = "";
            changed = true;
          }
        }
      }
      return changed ? next : prev;
    });
  }, [catIndex, allQuestions, loaded]);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(
      answerStorageKey(sessionCode, partnerSlot),
      JSON.stringify(answers)
    ).catch(() => {});
  }, [answers, loaded]);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(
      phaseStorageKey(sessionCode, partnerSlot),
      String(catIndex)
    ).catch(() => {});
  }, [catIndex, loaded]);

  const setAnswer = useCallback((id: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }, []);

  const allCatAnswered = catQuestions.every((q) =>
    q.type === "choice"
      ? answers[q.id] !== undefined && answers[q.id] !== ""
      : q.id in answers
  );

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (catIndex < totalCats - 1) {
      setCatIndex((c) => c + 1);
    } else {
      setShowReview(true);
    }
  };

  const handleBack = () => {
    if (showReview) {
      setShowReview(false);
      return;
    }
    if (catIndex > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCatIndex((c) => c - 1);
    } else {
      router.back();
    }
  };

  const handleSubmit = () => {
    const answerArray = Object.entries(answers).map(([questionId, value]) => ({
      questionId: parseInt(questionId, 10),
      value,
    }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    submitMutation.mutate(
      {
        sessionCode,
        data: {
          partnerSlot: partnerSlot as "partner1" | "partner2",
          partnerName: name ?? partnerSlot,
          answers: answerArray,
        },
      },
      {
        onSuccess: () => {
          AsyncStorage.removeItem(
            answerStorageKey(sessionCode, partnerSlot)
          ).catch(() => {});
          AsyncStorage.removeItem(
            phaseStorageKey(sessionCode, partnerSlot)
          ).catch(() => {});
          router.replace({
            pathname: "/waiting",
            params: { sessionCode, partnerSlot },
          });
        },
        onError: () =>
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
      }
    );
  };

  if (questionsLoading || !loaded) {
    return (
      <LinearGradient colors={["#eaf3ff", "#fce8ec"]} style={styles.center}>
        <ActivityIndicator size="large" color="#e8607a" />
        <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
          Loading questions…
        </Text>
      </LinearGradient>
    );
  }

  if (showReview && allQuestions) {
    return (
      <LinearGradient colors={["#eaf3ff", "#fce8ec"]} style={{ flex: 1 }}>
        <View style={[styles.header, { paddingTop: topPad + 12 }]}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#1a3560" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Review Answers</Text>
          <View style={{ width: 40 }} />
        </View>
        <ScrollView
          contentContainerStyle={{
            padding: 20,
            paddingBottom: bottomPad + 100,
          }}
        >
          {categories.map((cat, ci) => {
            const qs = (allQuestions as Question[]).filter(
              (q) => q.category === cat
            );
            return (
              <View
                key={cat}
                style={[styles.reviewCard, { borderColor: colors.border }]}
              >
                <View style={styles.reviewCardHeader}>
                  <Text
                    style={[
                      styles.reviewCatLabel,
                      { color: colors.foreground },
                    ]}
                  >
                    {CATEGORY_LABELS[cat] ?? cat}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setShowReview(false);
                      setCatIndex(ci);
                    }}
                    style={styles.editBtn}
                  >
                    <Ionicons name="pencil" size={12} color="#e8607a" />
                    <Text style={styles.editBtnText}>Edit</Text>
                  </TouchableOpacity>
                </View>
                {qs.map((q) => (
                  <View key={q.id} style={styles.reviewRow}>
                    <Text
                      style={[
                        styles.reviewQ,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      {q.text}
                    </Text>
                    <Text
                      style={[styles.reviewA, { color: colors.foreground }]}
                    >
                      {q.type === "choice" && q.options && answers[q.id] !== undefined
                        ? q.options[parseInt(answers[q.id], 10)] ?? answers[q.id]
                        : answers[q.id] ?? "—"}
                    </Text>
                  </View>
                ))}
              </View>
            );
          })}
        </ScrollView>
        <View style={[styles.navBar, { paddingBottom: bottomPad + 16 }]}>
          <TouchableOpacity
            style={[
              styles.nextBtn,
              {
                backgroundColor: colors.primary,
                opacity: submitMutation.isPending ? 0.6 : 1,
              },
            ]}
            onPress={handleSubmit}
            disabled={submitMutation.isPending}
            testID="btn-submit"
          >
            {submitMutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="send" size={18} color="#fff" />
                <Text style={styles.nextBtnText}>Confirm & Submit</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  const progress = totalCats > 0 ? (catIndex + 1) / totalCats : 0;

  return (
    <LinearGradient colors={["#eaf3ff", "#fce8ec"]} style={{ flex: 1 }}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#1a3560" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {CATEGORY_LABELS[currentCat] ?? currentCat}
        </Text>
        <Text style={[styles.stepLabel, { color: colors.mutedForeground }]}>
          {catIndex + 1}/{totalCats}
        </Text>
      </View>

      <View style={[styles.progressBg, { backgroundColor: colors.muted }]}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${progress * 100}%` as `${number}%`,
              backgroundColor: colors.primary,
            },
          ]}
        />
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 20,
          gap: 16,
          paddingBottom: bottomPad + 100,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {catQuestions.map((q) => (
          <View
            key={q.id}
            style={[
              styles.questionCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text
              style={[styles.questionText, { color: colors.foreground }]}
            >
              {q.text}
            </Text>

            {q.type === "scale" && (
              <View>
                <View style={styles.scaleRow}>
                  {[1, 2, 3, 4, 5].map((v) => {
                    const selected = answers[q.id] === String(v);
                    return (
                      <TouchableOpacity
                        key={v}
                        style={[
                          styles.scaleBtn,
                          {
                            borderColor: selected
                              ? colors.primary
                              : colors.border,
                            backgroundColor: selected
                              ? colors.primary
                              : colors.card,
                          },
                        ]}
                        onPress={() => {
                          setAnswer(q.id, String(v));
                          Haptics.selectionAsync();
                        }}
                      >
                        <Text
                          style={[
                            styles.scaleBtnText,
                            {
                              color: selected ? "#fff" : colors.foreground,
                            },
                          ]}
                        >
                          {v}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <View style={styles.scaleHints}>
                  <Text style={[styles.scaleHint, { color: colors.mutedForeground }]}>Disagree</Text>
                  <Text style={[styles.scaleHint, { color: colors.mutedForeground }]}>Agree</Text>
                </View>
              </View>
            )}

            {q.type === "choice" && q.options && (
              <View style={styles.choiceCol}>
                {q.options.map((opt, oi) => {
                  const selected = answers[q.id] === String(oi);
                  return (
                    <TouchableOpacity
                      key={oi}
                      style={[
                        styles.choiceBtn,
                        {
                          borderColor: selected
                            ? colors.primary
                            : colors.border,
                          backgroundColor: selected
                            ? colors.secondary
                            : colors.card,
                        },
                      ]}
                      onPress={() => {
                        setAnswer(q.id, String(oi));
                        Haptics.selectionAsync();
                      }}
                    >
                      <View
                        style={[
                          styles.radioOuter,
                          {
                            borderColor: selected
                              ? colors.primary
                              : colors.border,
                          },
                        ]}
                      >
                        {selected && (
                          <View
                            style={[
                              styles.radioInner,
                              { backgroundColor: colors.primary },
                            ]}
                          />
                        )}
                      </View>
                      <Text
                        style={[
                          styles.choiceBtnText,
                          { color: colors.foreground },
                        ]}
                      >
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {q.type === "open" && (
              <TextInput
                style={[
                  styles.openInput,
                  { borderColor: colors.border, color: colors.foreground },
                ]}
                value={answers[q.id] ?? ""}
                onChangeText={(v) => setAnswer(q.id, v)}
                placeholder="Share your thoughts…"
                placeholderTextColor={colors.mutedForeground}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            )}
          </View>
        ))}
      </ScrollView>

      <View style={[styles.navBar, { paddingBottom: bottomPad + 16 }]}>
        <TouchableOpacity
          style={[
            styles.nextBtn,
            {
              backgroundColor: allCatAnswered
                ? colors.primary
                : colors.muted,
            },
          ]}
          onPress={handleNext}
          disabled={!allCatAnswered}
          testID="btn-next"
        >
          <Text
            style={[
              styles.nextBtnText,
              {
                color: allCatAnswered ? "#fff" : colors.mutedForeground,
              },
            ]}
          >
            {catIndex < totalCats - 1 ? "Next" : "Review Answers"}
          </Text>
          <Ionicons
            name="arrow-forward"
            size={18}
            color={allCatAnswered ? "#fff" : colors.mutedForeground}
          />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  loadingText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
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
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#1a3560",
  },
  stepLabel: { fontSize: 13, fontFamily: "Inter_500Medium" },
  progressBg: { height: 3, marginHorizontal: 20, borderRadius: 2 },
  progressFill: { height: 3, borderRadius: 2 },
  questionCard: {
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 18,
    shadowColor: "#1a3560",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  questionText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    lineHeight: 22,
    marginBottom: 16,
  },
  scaleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  scaleBtn: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  scaleBtnText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  scaleHints: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  scaleHint: { fontSize: 10, fontFamily: "Inter_400Regular" },
  choiceCol: { gap: 8 },
  choiceBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: { width: 10, height: 10, borderRadius: 5 },
  choiceBtnText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    flex: 1,
  },
  openInput: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    minHeight: 90,
  },
  navBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: "rgba(234,243,255,0.95)",
    borderTopWidth: 1,
    borderTopColor: "rgba(184,212,240,0.4)",
  },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    paddingVertical: 16,
  },
  nextBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  reviewCard: {
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderRadius: 16,
    marginBottom: 12,
    overflow: "hidden",
  },
  reviewCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(234,243,255,0.7)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(184,212,240,0.3)",
  },
  reviewCatLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#fce8ec",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  editBtnText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "#e8607a",
  },
  reviewRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(184,212,240,0.15)",
  },
  reviewQ: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginBottom: 3,
    lineHeight: 16,
  },
  reviewA: { fontSize: 14, fontFamily: "Inter_500Medium" },
});
