import React from "react";
import Svg, { Circle, Path, Polygon, Text as SvgText } from "react-native-svg";

export function HeartCompass({ size = 130 }: { size?: number }) {
  const h = size * (215 / 220);
  return (
    <Svg width={size} height={h} viewBox="0 0 220 215" fill="none">
      <Path
        d="M110,188 C55,152 12,118 12,76 C12,47 34,26 66,26 C84,26 100,35 110,48 C120,35 136,26 154,26 C186,26 208,47 208,76 C208,118 165,152 110,188 Z"
        fill="none"
        stroke="rgba(232,96,122,0.18)"
        strokeWidth="14"
      />
      <Path
        d="M110,188 C55,152 12,118 12,76 C12,47 34,26 66,26 C84,26 100,35 110,48 C120,35 136,26 154,26 C186,26 208,47 208,76 C208,118 165,152 110,188 Z"
        fill="rgba(252,232,236,0.6)"
        stroke="rgba(232,96,122,0.55)"
        strokeWidth="1.5"
      />
      <Path
        d="M110,175 C65,143 28,113 28,79 C28,57 46,40 70,40 C86,40 100,49 110,61 C120,49 134,40 150,40 C174,40 192,57 192,79 C192,113 155,143 110,175 Z"
        fill="rgba(255,255,255,0.72)"
      />
      <Polygon
        points="110,50 116,100 110,92 104,100"
        fill="#e8607a"
        opacity="0.9"
      />
      <Polygon
        points="110,175 116,120 110,128 104,120"
        fill="rgba(184,212,240,0.6)"
      />
      <Polygon
        points="168,90 118,96 126,90 118,84"
        fill="rgba(232,96,122,0.3)"
      />
      <Polygon
        points="52,90 102,96 94,90 102,84"
        fill="rgba(184,212,240,0.35)"
      />
      <Circle cx="110" cy="92" r="6" fill="#e8607a" />
      <Circle cx="110" cy="92" r="3" fill="white" />
      <SvgText
        x="110"
        y="44"
        textAnchor="middle"
        fontSize="10"
        fontWeight="700"
        fill="#e8607a"
      >
        N
      </SvgText>
      <SvgText
        x="110"
        y="183"
        textAnchor="middle"
        fontSize="9"
        fill="rgba(26,53,96,0.4)"
      >
        S
      </SvgText>
      <SvgText
        x="170"
        y="93"
        textAnchor="middle"
        fontSize="9"
        fill="rgba(26,53,96,0.4)"
      >
        E
      </SvgText>
      <SvgText
        x="50"
        y="93"
        textAnchor="middle"
        fontSize="9"
        fill="rgba(26,53,96,0.4)"
      >
        W
      </SvgText>
      <Path
        d="M110,24 C107,21 103,20 103,23.5 C103,26 106,27.5 110,30 C114,27.5 117,26 117,23.5 C117,20 113,21 110,24 Z"
        fill="#e8607a"
        opacity="0.7"
      />
    </Svg>
  );
}
