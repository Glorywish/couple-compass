import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";
import { ArrowRight, Heart } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const CIH_RIB   = "230 640 5881663211034200 41";
const CIH_IBAN  = "MA64 2306 4058 8166 3211 0342 0041";
const CIH_SWIFT = "CIHMMAMC";

const BASE = import.meta.env.BASE_URL;

const SPARKLES = Array.from({ length: 20 }, (_, i) => ({
  id: i, x: (i * 41 + 13) % 100, y: (i * 57 + 9) % 100,
  r: 1.5 + (i % 3), dur: 3 + (i % 5) * 0.7, delay: -(i * 0.5) % 4,
  color: i % 3 === 0 ? "#e8607a" : i % 3 === 1 ? "#b8d4f0" : "#f0a0b0",
}));

function HeartCompass({ size = 220 }: { size?: number }) {
  return (
    <svg width={size} height={size * (215 / 220)} viewBox="0 0 220 215" fill="none">
      <path d="M110,188 C55,152 12,118 12,76 C12,47 34,26 66,26 C84,26 100,35 110,48 C120,35 136,26 154,26 C186,26 208,47 208,76 C208,118 165,152 110,188 Z"
        fill="none" stroke="rgba(232,96,122,0.18)" strokeWidth="14" />
      <path d="M110,188 C55,152 12,118 12,76 C12,47 34,26 66,26 C84,26 100,35 110,48 C120,35 136,26 154,26 C186,26 208,47 208,76 C208,118 165,152 110,188 Z"
        fill="rgba(252,232,236,0.6)" stroke="rgba(232,96,122,0.55)" strokeWidth="1.5" />
      <path d="M110,175 C65,143 28,113 28,79 C28,57 46,40 70,40 C86,40 100,49 110,61 C120,49 134,40 150,40 C174,40 192,57 192,79 C192,113 155,143 110,175 Z"
        fill="rgba(255,255,255,0.72)" />
      <polygon points="110,50 116,100 110,92 104,100" fill="#e8607a" opacity="0.9" />
      <polygon points="110,175 116,120 110,128 104,120" fill="rgba(184,212,240,0.6)" />
      <polygon points="168,90 118,96 126,90 118,84" fill="rgba(232,96,122,0.3)" />
      <polygon points="52,90 102,96 94,90 102,84" fill="rgba(184,212,240,0.35)" />
      <circle cx="110" cy="92" r="6" fill="#e8607a" />
      <circle cx="110" cy="92" r="3" fill="white" />
      <text x="110" y="44" textAnchor="middle" dominantBaseline="middle" fontSize="10" fontFamily="Inter,sans-serif" fontWeight="700" letterSpacing="0.1em" fill="#e8607a">N</text>
      <text x="110" y="183" textAnchor="middle" dominantBaseline="middle" fontSize="9" fontFamily="Inter,sans-serif" fontWeight="500" fill="rgba(26,53,96,0.4)">S</text>
      <text x="170" y="93" textAnchor="middle" dominantBaseline="middle" fontSize="9" fontFamily="Inter,sans-serif" fontWeight="500" fill="rgba(26,53,96,0.4)">E</text>
      <text x="50" y="93" textAnchor="middle" dominantBaseline="middle" fontSize="9" fontFamily="Inter,sans-serif" fontWeight="500" fill="rgba(26,53,96,0.4)">W</text>
      <path d="M110,24 C107,21 103,20 103,23.5 C103,26 106,27.5 110,30 C114,27.5 117,26 117,23.5 C117,20 113,21 110,24 Z" fill="#e8607a" opacity="0.7" />
    </svg>
  );
}

const STEP_ICONS = ["01", "02", "03"];

function useHeartBloom() {
  const [bloom, setBloom] = useState<{ x: number; y: number } | null>(null);
  const trigger = (e: React.MouseEvent, cb: () => void) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setBloom({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    setTimeout(() => { cb(); setTimeout(() => setBloom(null), 400); }, 480);
  };
  return { bloom, trigger };
}

type HomeT = ReturnType<typeof useI18n>["data"]["ui"]["home"];

function HomeSupportSection({ t }: { t: HomeT }) {
  const { data: locData } = useI18n();
  const serifFont = locData.meta.dir === "rtl" ? "'Amiri', serif" : "'DM Serif Display', serif";
  const [ribCopied, setRibCopied] = useState(false);
  const [ibanCopied, setIbanCopied] = useState(false);
  const [swiftCopied, setSwiftCopied] = useState(false);

  const copySwift = () => {
    navigator.clipboard.writeText(CIH_SWIFT).then(() => {
      setSwiftCopied(true);
      setTimeout(() => setSwiftCopied(false), 2500);
    });
  };

  const copy = (text: string, which: "rib" | "iban") => {
    navigator.clipboard.writeText(text).then(() => {
      if (which === "rib") { setRibCopied(true); setTimeout(() => setRibCopied(false), 2500); }
      else { setIbanCopied(true); setTimeout(() => setIbanCopied(false), 2500); }
    });
  };

  return (
    <div style={{ background: "white", borderTop: "1px solid rgba(184,212,240,0.4)", padding: "80px 24px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 40 }}>

        {/* Donation block */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
          style={{ background: "linear-gradient(135deg,#fce8ec 0%,#eaf3ff 100%)", border: "1px solid rgba(232,96,122,0.18)", borderRadius: 24, padding: "40px 36px", textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: 16 }}>💛</div>
          <h2 style={{ fontFamily: serifFont, fontSize: "clamp(22px,4vw,30px)", color: "#1a3560", marginBottom: 10 }}>{t.supportTitle}</h2>
          <p style={{ fontSize: "0.88rem", color: "rgba(26,53,96,0.5)", lineHeight: 1.8, maxWidth: 480, margin: "0 auto 28px" }}>{t.supportDesc}</p>

          {/* Buttons row */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginBottom: 24 }}>
            <a href="https://paypal.me/morganamona" target="_blank" rel="noreferrer"
              style={{ background: "#003087", borderRadius: 12, padding: "12px 24px", color: "white", fontSize: "0.78rem", fontWeight: 700, textDecoration: "none", letterSpacing: "0.07em", textTransform: "uppercase", boxShadow: "0 3px 14px rgba(0,48,135,0.22)", display: "inline-flex", alignItems: "center", gap: 8 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.816-5.09a.932.932 0 0 1 .92-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.774-4.471z"/></svg>
              {t.supportPaypal}
            </a>
            <button onClick={() => copy(CIH_RIB, "rib")}
              style={{ background: "white", border: "1.5px solid rgba(26,53,96,0.15)", borderRadius: 12, padding: "12px 24px", color: "#1a3560", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", cursor: "pointer", fontFamily: "Inter,sans-serif", display: "inline-flex", alignItems: "center", gap: 8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              {ribCopied ? t.supportCihCopied : t.supportCihCopy}
            </button>
            <button onClick={() => copy(CIH_IBAN, "iban")}
              style={{ background: "white", border: "1.5px solid rgba(26,53,96,0.15)", borderRadius: 12, padding: "12px 24px", color: "#1a3560", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", cursor: "pointer", fontFamily: "Inter,sans-serif", display: "inline-flex", alignItems: "center", gap: 8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              {ibanCopied ? t.supportIbanCopied : t.supportIbanCopy}
            </button>
          </div>

          {/* Bank details */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 460, margin: "0 auto", textAlign: "left" }}>
            <div style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(26,53,96,0.08)", borderRadius: 10, padding: "10px 16px" }}>
              <p style={{ margin: "0 0 2px", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.14em", color: "rgba(26,53,96,0.35)", fontWeight: 600 }}>CIH Bank — RIB</p>
              <p style={{ margin: 0, fontFamily: "monospace", fontSize: "0.85rem", color: "#1a3560", letterSpacing: "0.04em" }}>{CIH_RIB}</p>
            </div>
            <div style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(26,53,96,0.08)", borderRadius: 10, padding: "10px 16px" }}>
              <p style={{ margin: "0 0 2px", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.14em", color: "rgba(26,53,96,0.35)", fontWeight: 600 }}>IBAN</p>
              <p style={{ margin: 0, fontFamily: "monospace", fontSize: "0.85rem", color: "#1a3560", letterSpacing: "0.04em" }}>{CIH_IBAN}</p>
            </div>
            <div style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(26,53,96,0.08)", borderRadius: 10, padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div>
                <p style={{ margin: "0 0 2px", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.14em", color: "rgba(26,53,96,0.35)", fontWeight: 600 }}>BIC / SWIFT</p>
                <p style={{ margin: 0, fontFamily: "monospace", fontSize: "0.85rem", color: "#1a3560", letterSpacing: "0.1em" }}>{CIH_SWIFT}</p>
              </div>
              <button onClick={copySwift}
                style={{ background: "transparent", border: "1px solid rgba(26,53,96,0.15)", borderRadius: 8, padding: "5px 10px", color: swiftCopied ? "#27ae60" : "rgba(26,53,96,0.45)", fontSize: "0.62rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", fontFamily: "Inter,sans-serif", display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", transition: "color 0.2s,border-color 0.2s" }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                {swiftCopied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        </motion.div>

        {/* LinkedIn block */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, background: "#f5f8ff", border: "1px solid rgba(184,212,240,0.5)", borderRadius: 18, padding: "24px 28px" }}>
          <div>
            <p style={{ margin: "0 0 4px", fontFamily: serifFont, fontSize: "1.05rem", color: "#1a3560" }}>{t.linkedinLabel}</p>
            <p style={{ margin: 0, fontSize: "0.78rem", color: "rgba(26,53,96,0.4)" }}>linkedin.com/in/majdaki</p>
          </div>
          <a href="https://www.linkedin.com/in/majdaki" target="_blank" rel="noreferrer"
            style={{ background: "#0077b5", borderRadius: 12, padding: "11px 22px", color: "white", fontSize: "0.78rem", fontWeight: 700, textDecoration: "none", letterSpacing: "0.07em", textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: 8, whiteSpace: "nowrap", boxShadow: "0 3px 14px rgba(0,119,181,0.25)", flexShrink: 0 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>
            {t.linkedinBtn}
          </a>
        </motion.div>

      </div>
    </div>
  );
}

export default function Home() {
  const [, setLocation] = useLocation();
  const { data } = useI18n();
  const t = data.ui;
  const serifFont = data.meta.dir === "rtl" ? "'Amiri', serif" : "'DM Serif Display', serif";
  const { bloom, trigger } = useHeartBloom();

  return (
    <div style={{ background: "linear-gradient(160deg,#eaf3ff 0%,#fce8ec 50%,#eaf3ff 100%)", minHeight: "100vh", color: "#1a3560", overflowX: "hidden" }}>

      {/* bloom overlay */}
      <AnimatePresence>
        {bloom && (
          <motion.div key="bloom"
            initial={{ scale: 0, opacity: 0.9, borderRadius: "50%" }}
            animate={{ scale: 28, opacity: 1, borderRadius: "50%" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: "fixed", zIndex: 9999, pointerEvents: "none", width: 80, height: 80,
              left: bloom.x - 40, top: bloom.y - 40,
              background: "radial-gradient(circle, #fce8ec 0%, #e8607a 60%)" }}
          />
        )}
      </AnimatePresence>

      {/* sparkles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
        {SPARKLES.map(s => (
          <div key={s.id} className="absolute rounded-full"
            style={{ left:`${s.x}%`, top:`${s.y}%`, width:s.r*2, height:s.r*2, background:s.color, animation:`twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`, opacity:0 }} />
        ))}
      </div>

      {/* ── HERO ── */}
      <div className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-16 pb-24">
        <div style={{ position:"absolute", top:"8%", left:"50%", transform:"translateX(-50%)", width:340, height:340, borderRadius:"50%", background:"radial-gradient(circle,rgba(232,96,122,0.13) 0%,transparent 70%)", pointerEvents:"none" }} />

        <motion.div initial={{ opacity:0, scale:0.7, y:20 }} animate={{ opacity:1, scale:1, y:0 }} transition={{ duration:1.0, ease:[0.16,1,0.3,1] }}
          style={{ animation:"heartbeat 3.5s ease-in-out infinite", filter:"drop-shadow(0 8px 32px rgba(232,96,122,0.22))", marginBottom:36 }}>
          <HeartCompass size={210} />
        </motion.div>

        <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.8, delay:0.3, ease:[0.16,1,0.3,1] }} className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-5">
            <div style={{ width:24, height:1, background:"rgba(232,96,122,0.4)" }} />
            <span style={{ fontSize:"0.66rem", letterSpacing:"0.22em", textTransform:"uppercase", color:"#e8607a", fontWeight:600 }}>{t.home.badge}</span>
            <div style={{ width:24, height:1, background:"rgba(232,96,122,0.4)" }} />
          </div>
          <h1 style={{ fontSize:"clamp(38px,7vw,70px)", fontFamily:serifFont, fontWeight:400, lineHeight:1.06, color:"#1a3560", marginBottom:"1.2rem" }}>
            {t.home.title1}<br />
            <em style={{ fontStyle:"italic", color:"#e8607a" }}>{t.home.title2}</em>
          </h1>
          <p style={{ fontSize:"1rem", color:"rgba(26,53,96,0.55)", maxWidth:440, margin:"0 auto 2.5rem", lineHeight:1.8, fontWeight:300 }}>
            {t.home.desc}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.button whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }}
              onClick={e => trigger(e, () => setLocation("/start"))}
              data-testid="button-start-session"
              style={{ display:"flex", alignItems:"center", gap:10, justifyContent:"center", background:"#e8607a", color:"white", border:"none", borderRadius:14, padding:"14px 32px", fontSize:"0.83rem", fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase", cursor:"pointer", fontFamily:"Inter,sans-serif", boxShadow:"0 4px 22px rgba(232,96,122,0.38)" }}>
              {t.home.cta1} <ArrowRight size={14} />
            </motion.button>
            <motion.button whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }}
              onClick={e => trigger(e, () => setLocation("/join"))}
              data-testid="button-join-session"
              style={{ display:"flex", alignItems:"center", gap:10, justifyContent:"center", background:"rgba(255,255,255,0.75)", color:"#1a3560", border:"1px solid rgba(26,53,96,0.14)", borderRadius:14, padding:"14px 32px", fontSize:"0.83rem", fontWeight:500, letterSpacing:"0.06em", textTransform:"uppercase", cursor:"pointer", fontFamily:"Inter,sans-serif" }}>
              {t.home.cta2}
            </motion.button>
          </div>

          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:1.1 }}
            style={{ marginTop:20, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <a href="/mobile/" target="_blank" rel="noreferrer"
              style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(255,255,255,0.65)", border:"1px solid rgba(26,53,96,0.1)", borderRadius:24, padding:"7px 18px 7px 14px", fontSize:"0.72rem", fontWeight:500, color:"rgba(26,53,96,0.5)", textDecoration:"none", backdropFilter:"blur(8px)", transition:"all 0.2s" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><circle cx="12" cy="17" r="1"/></svg>
              Also available as a mobile app
            </a>
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.4 }}
          className="absolute bottom-10 flex flex-col items-center gap-2"
          style={{ animation:"pulse-soft 2.5s ease-in-out infinite", color:"rgba(232,96,122,0.5)" }}>
          <span style={{ fontSize:"0.6rem", letterSpacing:"0.25em", textTransform:"uppercase" }}>{t.home.scroll}</span>
          <div style={{ width:1, height:32, background:"linear-gradient(to bottom,rgba(232,96,122,0.6),transparent)" }} />
        </motion.div>
      </div>

      {/* ── EDITORIAL 1: City couple — text left, image right ── */}
      <div style={{ background:"white", borderTop:"1px solid rgba(184,212,240,0.4)", overflow:"hidden" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", padding:"80px 32px" }}>
          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">

            {/* Text column */}
            <motion.div initial={{ opacity:0, x:-32 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ duration:0.8, ease:[0.16,1,0.3,1] }}
              style={{ flex:1 }}>
              <p style={{ fontSize:"0.62rem", letterSpacing:"0.22em", textTransform:"uppercase", color:"#e8607a", fontWeight:600, marginBottom:14 }}>
                {t.home.coupleSection}
              </p>
              <h2 style={{ fontFamily:serifFont, fontSize:"clamp(32px,4.5vw,50px)", color:"#1a3560", lineHeight:1.1, marginBottom:28 }}>
                <em style={{ fontStyle:"italic", color:"#e8607a" }}>{t.home.coupleSectionHeading}</em>
              </h2>

              <div style={{ display:"flex", flexDirection:"column", gap:16, marginBottom:32 }}>
                <div style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
                  <Heart size={14} color="#e8607a" fill="rgba(232,96,122,0.3)" style={{ marginTop:4, flexShrink:0 }} />
                  <p style={{ fontFamily:serifFont, fontSize:"1.1rem", color:"rgba(26,53,96,0.7)", fontStyle:"italic", lineHeight:1.7 }}>
                    {t.home.coupleQuote1}
                  </p>
                </div>
                <div style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
                  <Heart size={14} color="#b8d4f0" fill="rgba(184,212,240,0.3)" style={{ marginTop:4, flexShrink:0 }} />
                  <p style={{ fontFamily:serifFont, fontSize:"1.1rem", color:"rgba(26,53,96,0.7)", fontStyle:"italic", lineHeight:1.7 }}>
                    {t.home.coupleQuote2}
                  </p>
                </div>
              </div>

              <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                onClick={e => trigger(e, () => setLocation("/start"))}
                style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(232,96,122,0.1)", border:"1px solid rgba(232,96,122,0.3)", borderRadius:12, padding:"11px 22px", color:"#e8607a", fontSize:"0.78rem", fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase", cursor:"pointer", fontFamily:"Inter,sans-serif" }}>
                {t.home.cta1} <ArrowRight size={12} />
              </motion.button>
            </motion.div>

            {/* Image column */}
            <motion.div initial={{ opacity:0, x:32, scale:0.96 }} whileInView={{ opacity:1, x:0, scale:1 }} viewport={{ once:true }} transition={{ duration:0.9, ease:[0.16,1,0.3,1] }}
              style={{ flexShrink:0, width:"100%", maxWidth:360, position:"relative" }}>
              <div style={{ borderRadius:28, overflow:"hidden", boxShadow:"0 20px 64px rgba(232,96,122,0.18)" }}>
                <img src={`${BASE}couple-city.png`} alt="Couple walking together at golden hour"
                  style={{ width:"100%", aspectRatio:"3/4", objectFit:"cover", display:"block" }} />
              </div>
              {/* floating badge */}
              <motion.div
                initial={{ opacity:0, y:12 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:0.4, duration:0.6 }}
                style={{ position:"absolute", bottom:-16, left:-16, background:"white", border:"1px solid rgba(232,96,122,0.2)", borderRadius:16, padding:"12px 18px", boxShadow:"0 8px 32px rgba(232,96,122,0.14)", display:"flex", alignItems:"center", gap:10 }}>
                <Heart size={16} color="#e8607a" fill="rgba(232,96,122,0.2)" />
                <p style={{ fontFamily:serifFont, fontSize:"0.88rem", color:"#1a3560", fontStyle:"italic", whiteSpace:"nowrap" }}>
                  {t.home.badge}
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <div style={{ background:"linear-gradient(180deg,#f8f4f0 0%,white 100%)", color:"#1a3560", padding:"80px 24px", borderTop:"1px solid rgba(184,212,240,0.4)" }}>
        <div style={{ maxWidth:760, margin:"0 auto" }}>
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.6 }} className="text-center mb-14">
            <p style={{ fontSize:"0.65rem", letterSpacing:"0.22em", textTransform:"uppercase", color:"#e8607a", fontWeight:600, marginBottom:12 }}>{t.home.howTitle}</p>
            <h2 style={{ fontFamily:serifFont, fontSize:"clamp(28px,5vw,40px)", color:"#1a3560", lineHeight:1.15, marginBottom:12 }}>
              {t.home.howTitle}
            </h2>
            <p style={{ fontSize:"0.92rem", color:"rgba(26,53,96,0.5)", maxWidth:420, margin:"0 auto", lineHeight:1.8 }}>{t.home.howDesc}</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {t.home.steps.map((step, i) => (
              <motion.div key={i} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.1, duration:0.5 }}
                style={{ background:i%2===0?"#fce8ec":"#eaf3ff", border:"1px solid rgba(184,212,240,0.35)", borderRadius:18, padding:"28px 22px", boxShadow:"0 2px 18px rgba(26,53,96,0.05)" }}>
                <div style={{ width:44, height:44, borderRadius:12, background:"#e8607a", color:"white", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.78rem", fontWeight:700, letterSpacing:"0.04em", marginBottom:16, boxShadow:"0 4px 12px rgba(232,96,122,0.25)" }}>
                  {STEP_ICONS[i]}
                </div>
                <h3 style={{ fontFamily:serifFont, fontSize:"1.2rem", color:"#1a3560", marginBottom:8 }}>{step.title}</h3>
                <p style={{ fontSize:"0.87rem", color:"rgba(26,53,96,0.55)", lineHeight:1.8 }}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── EDITORIAL 2: Beach couple — image left, quote right ── */}
      <div style={{ background:"linear-gradient(135deg,#eaf3ff 0%,#fce8ec 100%)", borderTop:"1px solid rgba(232,96,122,0.1)", overflow:"hidden" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", padding:"80px 32px" }}>
          <div className="flex flex-col-reverse md:flex-row items-center gap-12 md:gap-20">

            {/* Image column */}
            <motion.div initial={{ opacity:0, x:-32, scale:0.96 }} whileInView={{ opacity:1, x:0, scale:1 }} viewport={{ once:true }} transition={{ duration:0.9, ease:[0.16,1,0.3,1] }}
              style={{ flexShrink:0, width:"100%", maxWidth:360, position:"relative" }}>
              <div style={{ borderRadius:28, overflow:"hidden", boxShadow:"0 20px 64px rgba(184,212,240,0.4)" }}>
                <img src={`${BASE}couple-beach.png`} alt="Couple walking on beach at sunrise"
                  style={{ width:"100%", aspectRatio:"3/4", objectFit:"cover", display:"block" }} />
              </div>
              {/* floating score badge */}
              <motion.div
                initial={{ opacity:0, y:-12 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:0.4, duration:0.6 }}
                style={{ position:"absolute", top:-16, right:-16, background:"#e8607a", borderRadius:16, padding:"10px 16px", boxShadow:"0 8px 24px rgba(232,96,122,0.3)", display:"flex", alignItems:"center", gap:8 }}>
                <Heart size={14} color="white" fill="white" />
                <p style={{ fontFamily:serifFont, fontSize:"0.85rem", color:"white", fontWeight:400, fontStyle:"italic", whiteSpace:"nowrap" }}>
                  Couple Compass
                </p>
              </motion.div>
            </motion.div>

            {/* Text column */}
            <motion.div initial={{ opacity:0, x:32 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ duration:0.8, ease:[0.16,1,0.3,1] }}
              style={{ flex:1 }}>
              <Heart size={22} color="#e8607a" fill="rgba(232,96,122,0.2)" style={{ marginBottom:20 }} />
              <p style={{ fontFamily:serifFont, fontSize:"clamp(1.2rem,2.5vw,1.7rem)", color:"#1a3560", fontStyle:"italic", lineHeight:1.7, marginBottom:28 }}>
                {t.home.coupleQuote3}
              </p>
              <div style={{ width:40, height:2, background:"rgba(232,96,122,0.4)", marginBottom:24 }} />
              <p style={{ fontSize:"0.72rem", color:"rgba(26,53,96,0.4)", letterSpacing:"0.14em", textTransform:"uppercase", fontWeight:600, marginBottom:28 }}>
                Couple Compass
              </p>
              <p style={{ fontSize:"0.9rem", color:"rgba(26,53,96,0.5)", lineHeight:1.8, marginBottom:28 }}>
                {t.home.dimensionsDesc}
              </p>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {Object.values(t.categories).map((cat) => (
                  <span key={cat} style={{ background:"rgba(255,255,255,0.75)", border:"1px solid rgba(232,96,122,0.22)", color:"#c03060", borderRadius:999, padding:"5px 14px", fontSize:"0.78rem", fontWeight:500 }}>
                    {cat}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── QURAN VERSE ── */}
      <div style={{ background: "linear-gradient(135deg,#1a3560 0%,#0d2040 100%)", padding: "72px 24px", textAlign: "center" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
          style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ width: 36, height: 2, background: "rgba(232,96,122,0.6)", margin: "0 auto 32px" }} />
          <p style={{ fontFamily: "'Amiri', serif", fontSize: "clamp(20px,3.5vw,30px)", color: "rgba(255,255,255,0.92)", lineHeight: 1.9, direction: "rtl", marginBottom: 24, letterSpacing: "0.02em" }}>
            وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً
          </p>
          <p style={{ fontFamily: serifFont, fontSize: "clamp(0.9rem,2vw,1.1rem)", color: "rgba(232,96,122,0.85)", fontStyle: "italic", lineHeight: 1.8, maxWidth: 560, margin: "0 auto 20px" }}>
            "{t.home.quranVerseTranslation}"
          </p>
          <p style={{ fontSize: "0.62rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", fontWeight: 600 }}>
            {t.home.quranVerseRef}
          </p>
          <div style={{ width: 36, height: 2, background: "rgba(232,96,122,0.6)", margin: "32px auto 0" }} />
        </motion.div>
      </div>

      {/* ── SUPPORT + LINKEDIN ── */}
      <HomeSupportSection t={t.home} />

      {/* ── FOOTER CTA ── */}
      <div style={{ background:"white", padding:"88px 24px", textAlign:"center", borderTop:"1px solid rgba(184,212,240,0.4)" }}>
        <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.6 }}>
          <Heart size={28} color="#e8607a" fill="#e8607a" style={{ margin:"0 auto 18px", opacity:0.85 }} />
          <h2 style={{ fontFamily:serifFont, fontSize:"clamp(28px,5vw,42px)", color:"#1a3560", marginBottom:12, lineHeight:1.15 }}>
            <em style={{ fontStyle:"italic" }}>{t.home.footerCta1}</em>
          </h2>
          <p style={{ fontSize:"0.92rem", color:"rgba(26,53,96,0.5)", maxWidth:380, margin:"0 auto 36px", lineHeight:1.8 }}>{t.home.footerCta2}</p>
          <motion.button whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }}
            onClick={e => trigger(e, () => setLocation("/start"))}
            data-testid="button-footer-cta"
            style={{ display:"inline-flex", alignItems:"center", gap:10, background:"#e8607a", color:"white", border:"none", borderRadius:14, padding:"14px 36px", fontSize:"0.83rem", fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase", cursor:"pointer", fontFamily:"Inter,sans-serif", boxShadow:"0 4px 20px rgba(232,96,122,0.32)" }}>
            {t.home.footerBtn} <ArrowRight size={14} />
          </motion.button>
        </motion.div>
        <div style={{ marginTop:64, borderTop:"1px solid rgba(26,53,96,0.07)", paddingTop:28 }}>
          <p style={{ fontFamily:serifFont, fontSize:"1.1rem", color:"rgba(26,53,96,0.28)", fontStyle:"italic" }}>Couple Compass</p>
        </div>
      </div>
    </div>
  );
}
