export type LocaleCode = "en" | "ar" | "fr" | "es" | "zh";

export interface QuestionTranslation {
  text: string;
  options: string[] | null;
}

export interface LocaleData {
  meta: { name: string; dir: "ltr" | "rtl"; code: LocaleCode };
  ui: {
    back: string;
    next: string;
    submit: string;
    submitting: string;
    settings: { title: string; language: string };
    home: {
      badge: string;
      title1: string;
      title2: string;
      desc: string;
      cta1: string;
      cta2: string;
      howTitle: string;
      howDesc: string;
      steps: Array<{ title: string; desc: string }>;
      dimensionsTitle: string;
      dimensionsDesc: string;
      footerCta1: string;
      footerCta2: string;
      footerBtn: string;
    };
    start: {
      title: string;
      desc: string;
      label: string;
      placeholder: string;
      btn: string;
      creating: string;
      codeLabel: string;
      created: string;
      shareDesc: string;
      copyBtn: string;
      copiedBtn: string;
      readyText: string;
      startBtn: string;
    };
    join: {
      title: string;
      desc: string;
      codeLabel: string;
      codePlaceholder: string;
      nameLabel: string;
      namePlaceholder: string;
      btn: string;
      checking: string;
    };
    questionnaire: {
      loading: string;
      saved: string;
      restored: string;
      of: string;
      scaleMin: string;
      scaleMax: string;
      placeholder: string;
    };
    waiting: {
      title: string;
      titleDone: string;
      desc: string;
      descDone: string;
      completed: string;
      inProgress: string;
      waitingStatus: string;
      pollNote: string;
    };
    report: {
      title: string;
      basedOn: string;
      scoreLabel: string;
      scoreLabels: { high: string; good: string; some: string; discuss: string };
      scoresTitle: string;
      alignedTitle: string;
      differingTitle: string;
      promptsTitle: string;
      shareBtn: string;
      notReady: string;
      notReadyDesc: string;
      backHome: string;
      alignmentLabels: { high: string; medium: string; low: string };
      loading: string;
      summaryNote: string;
    };
    errors: {
      sessionNotFound: string;
      submitFailed: string;
      tryAgain: string;
      createFailed: string;
    };
    categories: {
      values: string;
      life_plans: string;
      finances: string;
      family: string;
      lifestyle: string;
      communication: string;
      intimacy: string;
      growth: string;
    };
  };
  questions: Record<number, QuestionTranslation>;
}
