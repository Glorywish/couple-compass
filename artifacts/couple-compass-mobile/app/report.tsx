import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Circle, Svg, Text as SvgText } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGetReport } from "@workspace/api-client-react";

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

const ALIGNMENT_COLORS: Record<string, string> = {
  high: "#22c55e",
  medium: "#f59e0b",
  low: "#e8607a",
};

type CompatibilityReport = {
  overallScore: number;
  partner1Name: string;
  partner2Name: string;
  summary: string;
  categoryScores: {
    category: string;
    label: string;
    score: number;
    alignment: string;
  }[];
  alignedAreas: {
    questionText: string;
    partner1Answer: string;
    partner2Answer: string;
    note?: string | null;
  }[];
  differingAreas: {
    questionText: string;
    partner1Answer: string;
    partner2Answer: string;
    note?: string | null;
  }[];
  discussionPrompts: string[];
};

function ScoreGauge({ score }: { score: number }) {
  const r = 52;
  const cx = 70;
  const cy = 70;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <Svg width={140} height={140} viewBox="0 0 140 140">
      <Circle
        cx={cx}
        cy={cy}
        r={r}
        stroke="#3a5a8a"
        strokeWidth={10}
        fill="none"
      />
      <Circle
        cx={cx}
        cy={cy}
        r={r}
        stroke="#e8607a"
        strokeWidth={10}
        fill="none"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
      />
      <SvgText
        x={cx}
        y={cy + 10}
        textAnchor="middle"
        fontSize={28}
        fontWeight="bold"
        fill="#ffffff"
      >
        {score}
      </SvgText>
      <SvgText
        x={cx}
        y={cy + 28}
        textAnchor="middle"
        fontSize={11}
        fill="rgba(255,255,255,0.5)"
      >
        / 100
      </SvgText>
    </Svg>
  );
}

export default function ReportScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { sessionCode } = useLocalSearchParams<{ sessionCode: string }>();

  const { data, isLoading, isError } = useGetReport(sessionCode, {
    query: { refetchInterval: 3000 },
  });

  const report =
    data && typeof (data as CompatibilityReport).overallScore === "number"
      ? (data as CompatibilityReport)
      : undefined;

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleShare = async () => {
    const domain = process.env.EXPO_PUBLIC_DOMAIN;
    const url = `https://${domain}/report/${sessionCode}`;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (Platform.OS === "web") {
      try {
        await navigator.clipboard.writeText(url);
      } catch {}
    } else {
      await Share.share({ url, message: url });
    }
  };

  if (isLoading || !report) {
    return (
      <LinearGradient colors={["#eaf3ff", "#fce8ec"]} style={styles.center}>
        <ActivityIndicator size="large" color="#e8607a" />
        <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
          Generating your report…
        </Text>
      </LinearGradient>
    );
  }

  if (isError) {
    return (
      <LinearGradient colors={["#eaf3ff", "#fce8ec"]} style={styles.center}>
        <Ionicons name="alert-circle" size={40} color="#e8607a" />
        <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
          Failed to load report
        </Text>
        <TouchableOpacity
          onPress={() => router.replace("/")}
          style={[styles.retryBtn, { backgroundColor: colors.primary }]}
        >
          <Text style={{ color: "#fff", fontFamily: "Inter_600SemiBold" }}>
            Go Home
          </Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  const score = Math.round(report.overallScore);
  const badge =
    score >= 75 ? "Great Match" : score >= 50 ? "Good Potential" : "Worth Exploring";

  return (
    <LinearGradient colors={["#eaf3ff", "#fce8ec"]} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: bottomPad + 32 }}>
        {/* Hero */}
        <LinearGradient
          colors={["#1a3560", "#2a4a78"]}
          style={[styles.hero, { paddingTop: topPad + 28 }]}
        >
          <Text style={styles.heroMeta}>Compatibility Report</Text>
          <Text style={styles.heroNames}>
            {report.partner1Name} & {report.partner2Name}
          </Text>
          <ScoreGauge score={score} />
          <View style={styles.badgeRow}>
            <Text style={styles.badge}>{badge}</Text>
          </View>
          <Text style={styles.heroSummary}>{report.summary}</Text>

          <TouchableOpacity onPress={handleShare} style={styles.shareRow}>
            <Ionicons name="share-outline" size={14} color="rgba(255,255,255,0.6)" />
            <Text style={styles.shareText}>
              {Platform.OS === "web" ? "Copy report link" : "Share report"}
            </Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Category scores */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Category Breakdown
          </Text>
          {report.categoryScores.map((cs) => (
            <View
              key={cs.category}
              style={[
                styles.catCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.catRow}>
                <Text style={[styles.catName, { color: colors.foreground }]}>
                  {CATEGORY_LABELS[cs.category] ?? cs.label}
                </Text>
                <Text
                  style={[
                    styles.catScore,
                    {
                      color:
                        ALIGNMENT_COLORS[cs.alignment] ?? colors.mutedForeground,
                    },
                  ]}
                >
                  {Math.round(cs.score)}%
                </Text>
              </View>
              <View
                style={[styles.barBg, { backgroundColor: colors.muted }]}
              >
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${cs.score}%` as `${number}%`,
                      backgroundColor:
                        ALIGNMENT_COLORS[cs.alignment] ?? colors.primary,
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>

        {/* Aligned areas */}
        {report.alignedAreas.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="heart-circle" size={20} color="#22c55e" />
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                Where You Align
              </Text>
            </View>
            {report.alignedAreas.map((a, i) => (
              <View
                key={i}
                style={[styles.areaCard, styles.areaCardGreen]}
              >
                <Text style={styles.areaQGreen}>{a.questionText}</Text>
                <View style={styles.answersRow}>
                  <View style={[styles.chip, styles.chipGreen]}>
                    <Text style={styles.chipTextGreen}>
                      {report.partner1Name}: {a.partner1Answer}
                    </Text>
                  </View>
                  <View style={[styles.chip, styles.chipGreen]}>
                    <Text style={styles.chipTextGreen}>
                      {report.partner2Name}: {a.partner2Answer}
                    </Text>
                  </View>
                </View>
                {a.note && (
                  <Text style={styles.noteGreen}>{a.note}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Differing areas */}
        {report.differingAreas.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="git-compare-outline" size={20} color="#f59e0b" />
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                Areas to Discuss
              </Text>
            </View>
            {report.differingAreas.map((a, i) => (
              <View
                key={i}
                style={[styles.areaCard, styles.areaCardAmber]}
              >
                <Text style={styles.areaQAmber}>{a.questionText}</Text>
                <View style={styles.answersRow}>
                  <View style={[styles.chip, styles.chipAmber]}>
                    <Text style={styles.chipTextAmber}>
                      {report.partner1Name}: {a.partner1Answer}
                    </Text>
                  </View>
                  <View style={[styles.chip, styles.chipAmber]}>
                    <Text style={styles.chipTextAmber}>
                      {report.partner2Name}: {a.partner2Answer}
                    </Text>
                  </View>
                </View>
                {a.note && (
                  <Text style={styles.noteAmber}>{a.note}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Discussion prompts */}
        {report.discussionPrompts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="chatbubbles-outline" size={20} color="#e8607a" />
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                Conversation Starters
              </Text>
            </View>
            {report.discussionPrompts.map((p, i) => (
              <View
                key={i}
                style={[
                  styles.promptCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={[styles.promptNum, { color: colors.primary }]}>
                  {i + 1}
                </Text>
                <Text
                  style={[styles.promptText, { color: colors.foreground }]}
                >
                  {p}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ paddingHorizontal: 24, marginTop: 12 }}>
          <TouchableOpacity
            style={[styles.homeBtn, { backgroundColor: colors.primary }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.replace("/");
            }}
          >
            <Ionicons name="home" size={18} color="#fff" />
            <Text style={styles.homeBtnText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  loadingText: { fontSize: 15, fontFamily: "Inter_400Regular" },
  retryBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  hero: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 8,
  },
  heroMeta: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.45)",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  heroNames: {
    fontSize: 21,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    textAlign: "center",
  },
  badgeRow: { marginTop: 4 },
  badge: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "#e8607a",
    backgroundColor: "#fce8ec",
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 20,
  },
  heroSummary: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.72)",
    lineHeight: 20,
    textAlign: "center",
    paddingHorizontal: 8,
  },
  shareRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
    marginTop: 4,
  },
  shareText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.55)",
  },
  section: { paddingHorizontal: 20, paddingTop: 24, gap: 10 },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  catCard: {
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  catRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  catName: { fontSize: 14, fontFamily: "Inter_500Medium" },
  catScore: { fontSize: 15, fontFamily: "Inter_700Bold" },
  barBg: { height: 6, borderRadius: 3 },
  barFill: { height: 6, borderRadius: 3 },
  areaCard: {
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  areaCardGreen: { backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" },
  areaCardAmber: { backgroundColor: "#fffbeb", borderColor: "#fde68a" },
  areaQGreen: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    lineHeight: 18,
    color: "#166534",
  },
  areaQAmber: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    lineHeight: 18,
    color: "#92400e",
  },
  answersRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  chipGreen: { backgroundColor: "#dcfce7" },
  chipAmber: { backgroundColor: "#fef3c7" },
  chipTextGreen: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "#166534",
  },
  chipTextAmber: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "#92400e",
  },
  noteGreen: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
    color: "#166534",
  },
  noteAmber: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
    color: "#92400e",
  },
  promptCard: {
    flexDirection: "row",
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    alignItems: "flex-start",
  },
  promptNum: { fontSize: 16, fontFamily: "Inter_700Bold", marginTop: 1 },
  promptText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
    flex: 1,
  },
  homeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    paddingVertical: 16,
  },
  homeBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
});
