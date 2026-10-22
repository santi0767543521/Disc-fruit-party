import React from 'react';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  Line,
  LinearGradient,
  Path,
  RadialGradient,
  Stop,
} from 'react-native-svg';
import { FruitType } from '../types/sensory';

interface FruitSvgArtProps {
  type: FruitType;
  size: number;
  isWinking?: boolean;
}

interface KawaiiFaceProps {
  cx: number;
  cy: number;
  scale?: number;
  isWinking?: boolean;
  cheekColor?: string;
}

/**
 * Reusable Kawaii face with glossy eyes, catchlight sparkles, rosy cheeks,
 * and an animated wink + excited smile when tapped.
 */
const KawaiiFace: React.FC<KawaiiFaceProps> = ({
  cx,
  cy,
  scale = 1,
  isWinking = false,
  cheekColor = '#FF6B9D',
}) => {
  const eyeOffsetX = 19 * scale;
  const cheekOffsetX = 28 * scale;
  const cheekOffsetY = 8 * scale;
  const eyeRadius = 6.2 * scale;

  return (
    <G>
      {/* Rosy Cheeks */}
      <Ellipse
        cx={cx - cheekOffsetX}
        cy={cy + cheekOffsetY}
        rx={8.5 * scale}
        ry={5.2 * scale}
        fill={cheekColor}
        opacity={0.82}
      />
      <Ellipse
        cx={cx + cheekOffsetX}
        cy={cy + cheekOffsetY}
        rx={8.5 * scale}
        ry={5.2 * scale}
        fill={cheekColor}
        opacity={0.82}
      />

      {/* Left Eye */}
      <Circle cx={cx - eyeOffsetX} cy={cy} r={eyeRadius} fill="#18121E" />
      <Circle
        cx={cx - eyeOffsetX - 2 * scale}
        cy={cy - 2.2 * scale}
        r={2.3 * scale}
        fill="#FFFFFF"
      />
      <Circle
        cx={cx - eyeOffsetX + 2 * scale}
        cy={cy + 2 * scale}
        r={1.1 * scale}
        fill="#FFFFFF"
      />

      {/* Right Eye (Winks when tapped!) */}
      {isWinking ? (
        <Path
          d={`M ${cx + eyeOffsetX - 6.5 * scale} ${cy + 1 * scale} Q ${
            cx + eyeOffsetX
          } ${cy - 7 * scale} ${cx + eyeOffsetX + 6.5 * scale} ${
            cy + 1 * scale
          }`}
          stroke="#18121E"
          strokeWidth={3.5 * scale}
          strokeLinecap="round"
          fill="none"
        />
      ) : (
        <G>
          <Circle cx={cx + eyeOffsetX} cy={cy} r={eyeRadius} fill="#18121E" />
          <Circle
            cx={cx + eyeOffsetX - 2 * scale}
            cy={cy - 2.2 * scale}
            r={2.3 * scale}
            fill="#FFFFFF"
          />
          <Circle
            cx={cx + eyeOffsetX + 2 * scale}
            cy={cy + 2 * scale}
            r={1.1 * scale}
            fill="#FFFFFF"
          />
        </G>
      )}

      {/* Kawaii Smile / Excited Open Laugh */}
      {isWinking ? (
        <G>
          <Path
            d={`M ${cx - 10 * scale} ${cy + 5 * scale} Q ${cx} ${
              cy + 21 * scale
            } ${cx + 10 * scale} ${cy + 5 * scale} Z`}
            fill="#9E1946"
            stroke="#18121E"
            strokeWidth={2.4 * scale}
            strokeLinejoin="round"
          />
          <Path
            d={`M ${cx - 5.5 * scale} ${cy + 11 * scale} Q ${cx} ${
              cy + 16 * scale
            } ${cx + 5.5 * scale} ${cy + 11 * scale}`}
            fill="#FF7096"
          />
        </G>
      ) : (
        <Path
          d={`M ${cx - 9 * scale} ${cy + 5 * scale} Q ${cx} ${
            cy + 15 * scale
          } ${cx + 9 * scale} ${cy + 5 * scale}`}
          stroke="#18121E"
          strokeWidth={3.2 * scale}
          strokeLinecap="round"
          fill="none"
        />
      )}
    </G>
  );
};

export const FruitSvgArt: React.FC<FruitSvgArtProps> = React.memo(
  ({ type, size, isWinking = false }) => {
    switch (type) {
      case 'pineapple':
        return (
          <Svg width={size} height={size} viewBox="0 0 200 200">
            <Defs>
              <RadialGradient id="pineGlow" cx="50%" cy="55%" r="48%">
                <Stop offset="0%" stopColor="#FFE600" stopOpacity="0.48" />
                <Stop offset="70%" stopColor="#FFAE00" stopOpacity="0.14" />
                <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </RadialGradient>
              <LinearGradient id="pineBody" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor="#FFEE32" />
                <Stop offset="100%" stopColor="#FF9E00" />
              </LinearGradient>
            </Defs>

            {/* Subtle Outer Glow */}
            <Circle cx="100" cy="108" r="92" fill="url(#pineGlow)" />

            {/* Spiky Green Crown */}
            <Path
              d="M 100 12 L 82 58 L 118 58 Z"
              fill="#2DC653"
              stroke="#1B8A38"
              strokeWidth="2.5"
            />
            <Path
              d="M 70 22 L 74 64 L 104 58 Z"
              fill="#38E54D"
              stroke="#1B8A38"
              strokeWidth="2.5"
            />
            <Path
              d="M 130 22 L 126 64 L 96 58 Z"
              fill="#38E54D"
              stroke="#1B8A38"
              strokeWidth="2.5"
            />
            <Path
              d="M 50 40 L 72 72 L 92 62 Z"
              fill="#25A244"
              stroke="#1B8A38"
              strokeWidth="2.5"
            />
            <Path
              d="M 150 40 L 128 72 L 108 62 Z"
              fill="#25A244"
              stroke="#1B8A38"
              strokeWidth="2.5"
            />

            {/* Little Dancing Arms */}
            <Path
              d="M 52 115 Q 28 100 32 86"
              stroke="#FFBE0B"
              strokeWidth="8"
              strokeLinecap="round"
              fill="none"
            />
            <Path
              d="M 148 115 Q 172 100 168 86"
              stroke="#FFBE0B"
              strokeWidth="8"
              strokeLinecap="round"
              fill="none"
            />

            {/* Golden Pineapple Body */}
            <Ellipse
              cx="100"
              cy="122"
              rx="52"
              ry="60"
              fill="url(#pineBody)"
              stroke="#FF8800"
              strokeWidth="4"
            />

            {/* Pineapple Diamond Crosshatch Lines */}
            <G stroke="#E87A00" strokeWidth="2.2" opacity="0.42">
              <Line x1="65" y1="80" x2="135" y2="155" />
              <Line x1="55" y1="105" x2="118" y2="172" />
              <Line x1="82" y1="68" x2="145" y2="132" />
              <Line x1="135" y1="80" x2="65" y2="155" />
              <Line x1="145" y1="105" x2="82" y2="172" />
              <Line x1="118" y1="68" x2="55" y2="132" />
            </G>

            {/* Glossy Highlight */}
            <Ellipse
              cx="76"
              cy="86"
              rx="10"
              ry="18"
              transform="rotate(-22 76 86)"
              fill="#FFFFFF"
              opacity="0.45"
            />

            {/* Kawaii Face */}
            <KawaiiFace
              cx={100}
              cy={118}
              scale={1.08}
              isWinking={isWinking}
              cheekColor="#FF5D8F"
            />
          </Svg>
        );

      case 'watermelon':
        return (
          <Svg width={size} height={size} viewBox="0 0 200 200">
            <Defs>
              <RadialGradient id="melonGlow" cx="50%" cy="55%" r="48%">
                <Stop offset="0%" stopColor="#FF2A55" stopOpacity="0.46" />
                <Stop offset="70%" stopColor="#2EC4B6" stopOpacity="0.16" />
                <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </RadialGradient>
              <LinearGradient id="melonFlesh" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor="#FF477E" />
                <Stop offset="100%" stopColor="#FF0A54" />
              </LinearGradient>
            </Defs>

            {/* Outer Glow */}
            <Circle cx="100" cy="106" r="92" fill="url(#melonGlow)" />

            {/* Outer Dark Green Rind */}
            <Path
              d="M 24 85 A 76 76 0 0 0 176 85 L 100 26 Z"
              fill="#2DC653"
              stroke="#1B8A38"
              strokeWidth="4"
              strokeLinejoin="round"
            />

            {/* Inner Light Cream/Green Rind */}
            <Path
              d="M 33 85 A 67 67 0 0 0 167 85 L 100 33 Z"
              fill="#D8F3DC"
            />

            {/* Juicy Red Watermelon Flesh */}
            <Path
              d="M 40 85 A 60 60 0 0 0 160 85 L 100 38 Z"
              fill="url(#melonFlesh)"
            />

            {/* Watermelon Seeds */}
            <G fill="#1F1A24">
              <Ellipse
                cx="64"
                cy="88"
                rx="3.2"
                ry="5.5"
                transform="rotate(20 64 88)"
              />
              <Ellipse
                cx="136"
                cy="88"
                rx="3.2"
                ry="5.5"
                transform="rotate(-20 136 88)"
              />
              <Ellipse
                cx="56"
                cy="112"
                rx="3.2"
                ry="5.5"
                transform="rotate(32 56 112)"
              />
              <Ellipse
                cx="144"
                cy="112"
                rx="3.2"
                ry="5.5"
                transform="rotate(-32 144 112)"
              />
              <Ellipse cx="100" cy="60" rx="3" ry="5" />
            </G>

            {/* Kawaii Face */}
            <KawaiiFace
              cx={100}
              cy={102}
              scale={1.05}
              isWinking={isWinking}
              cheekColor="#FF99AC"
            />
          </Svg>
        );

      case 'orange':
        return (
          <Svg width={size} height={size} viewBox="0 0 200 200">
            <Defs>
              <RadialGradient id="orangeGlow" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="#FF9E00" stopOpacity="0.5" />
                <Stop offset="70%" stopColor="#FF6D00" stopOpacity="0.16" />
                <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </RadialGradient>
              <RadialGradient id="orangeSegment" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="#FFE66D" />
                <Stop offset="60%" stopColor="#FF9E00" />
                <Stop offset="100%" stopColor="#FF6D00" />
              </RadialGradient>
            </Defs>

            {/* Glowing Aura */}
            <Circle cx="100" cy="100" r="94" fill="url(#orangeGlow)" />

            {/* Outer Orange Peel */}
            <Circle
              cx="100"
              cy="100"
              r="68"
              fill="#FF7B00"
              stroke="#FF5400"
              strokeWidth="4"
            />

            {/* Soft Pith Ring */}
            <Circle cx="100" cy="100" r="60" fill="#FFF3B0" />

            {/* Citrus Wheel Flesh */}
            <Circle cx="100" cy="100" r="54" fill="url(#orangeSegment)" />

            {/* Citrus Segment Spokes */}
            <G stroke="#FFF3B0" strokeWidth="3.5" opacity="0.78">
              <Line x1="100" y1="46" x2="100" y2="154" />
              <Line x1="46" y1="100" x2="154" y2="100" />
              <Line x1="62" y1="62" x2="138" y2="138" />
              <Line x1="138" y1="62" x2="62" y2="138" />
            </G>

            {/* Center Face Medallion */}
            <Circle cx="100" cy="100" r="34" fill="#FFB703" opacity="0.92" />

            {/* Specular Shine */}
            <Ellipse
              cx="74"
              cy="66"
              rx="10"
              ry="5"
              transform="rotate(-35 74 66)"
              fill="#FFFFFF"
              opacity="0.55"
            />

            {/* Kawaii Face */}
            <KawaiiFace
              cx={100}
              cy={98}
              scale={0.96}
              isWinking={isWinking}
              cheekColor="#FF4D6D"
            />
          </Svg>
        );

      case 'strawberry':
        return (
          <Svg width={size} height={size} viewBox="0 0 200 200">
            <Defs>
              <RadialGradient id="berryGlow" cx="50%" cy="54%" r="48%">
                <Stop offset="0%" stopColor="#FF1E56" stopOpacity="0.48" />
                <Stop offset="70%" stopColor="#FF758F" stopOpacity="0.15" />
                <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </RadialGradient>
              <LinearGradient id="berryGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor="#FF3366" />
                <Stop offset="100%" stopColor="#D90429" />
              </LinearGradient>
            </Defs>

            {/* Outer Glow */}
            <Circle cx="100" cy="106" r="92" fill="url(#berryGlow)" />

            {/* Plump Strawberry Body */}
            <Path
              d="M 100 174 C 66 174 42 126 46 86 C 49 58 74 52 100 58 C 126 52 151 58 154 86 C 158 126 134 174 100 174 Z"
              fill="url(#berryGrad)"
              stroke="#B5002A"
              strokeWidth="4"
            />

            {/* Leafy Green Calyx Crown */}
            <Path
              d="M 100 32 L 94 56 L 62 44 L 82 66 L 54 70 L 88 74 L 100 62 L 112 74 L 146 70 L 118 66 L 138 44 L 106 56 Z"
              fill="#38E54D"
              stroke="#1B8A38"
              strokeWidth="3"
              strokeLinejoin="round"
            />

            {/* Golden Strawberry Seeds */}
            <G fill="#FFE66D">
              <Ellipse cx="66" cy="88" rx="2.6" ry="4.2" />
              <Ellipse cx="134" cy="88" rx="2.6" ry="4.2" />
              <Ellipse cx="58" cy="116" rx="2.6" ry="4.2" />
              <Ellipse cx="142" cy="116" rx="2.6" ry="4.2" />
              <Ellipse cx="78" cy="146" rx="2.6" ry="4.2" />
              <Ellipse cx="122" cy="146" rx="2.6" ry="4.2" />
              <Ellipse cx="100" cy="158" rx="2.6" ry="4.2" />
              <Ellipse cx="100" cy="80" rx="2.4" ry="3.8" />
            </G>

            {/* Glossy Highlight */}
            <Ellipse
              cx="70"
              cy="82"
              rx="7"
              ry="14"
              transform="rotate(-20 70 82)"
              fill="#FFFFFF"
              opacity="0.45"
            />

            {/* Kawaii Face */}
            <KawaiiFace
              cx={100}
              cy={112}
              scale={1.04}
              isWinking={isWinking}
              cheekColor="#FF99AC"
            />
          </Svg>
        );

      case 'cherries':
        return (
          <Svg width={size} height={size} viewBox="0 0 200 200">
            <Defs>
              <RadialGradient id="cherryGlow" cx="50%" cy="58%" r="48%">
                <Stop offset="0%" stopColor="#FF0A54" stopOpacity="0.46" />
                <Stop offset="70%" stopColor="#38E54D" stopOpacity="0.14" />
                <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </RadialGradient>
            </Defs>

            {/* Outer Glow */}
            <Circle cx="100" cy="108" r="94" fill="url(#cherryGlow)" />

            {/* Joined Curved Green Stems */}
            <Path
              d="M 62 114 Q 68 56 104 30 Q 126 62 138 118"
              stroke="#38E54D"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />

            {/* Top Leaf */}
            <Path
              d="M 104 30 Q 138 18 148 38 Q 124 48 104 30 Z"
              fill="#52B788"
              stroke="#2D6A4F"
              strokeWidth="2.5"
            />

            {/* Left Cherry */}
            <Circle
              cx="60"
              cy="132"
              r="36"
              fill="#FF0A54"
              stroke="#A4133C"
              strokeWidth="3.5"
            />
            <Ellipse
              cx="45"
              cy="114"
              rx="6"
              ry="10"
              transform="rotate(-25 45 114)"
              fill="#FFFFFF"
              opacity="0.5"
            />
            <KawaiiFace
              cx={60}
              cy={132}
              scale={0.68}
              isWinking={isWinking}
              cheekColor="#FF8FA3"
            />

            {/* Right Cherry */}
            <Circle
              cx="140"
              cy="136"
              r="36"
              fill="#FF165D"
              stroke="#A4133C"
              strokeWidth="3.5"
            />
            <Ellipse
              cx="125"
              cy="118"
              rx="6"
              ry="10"
              transform="rotate(-25 125 118)"
              fill="#FFFFFF"
              opacity="0.5"
            />
            <KawaiiFace
              cx={140}
              cy={136}
              scale={0.68}
              isWinking={isWinking}
              cheekColor="#FF8FA3"
            />
          </Svg>
        );

      case 'banana':
        return (
          <Svg width={size} height={size} viewBox="0 0 200 200">
            <Defs>
              <RadialGradient id="bananaGlow" cx="50%" cy="54%" r="48%">
                <Stop offset="0%" stopColor="#FFEA00" stopOpacity="0.46" />
                <Stop offset="70%" stopColor="#FFB703" stopOpacity="0.14" />
                <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </RadialGradient>
            </Defs>

            {/* Outer Glow */}
            <Circle cx="100" cy="105" r="92" fill="url(#bananaGlow)" />

            {/* Inner Creamy Peeled Banana Top */}
            <Path
              d="M 74 118 L 74 62 Q 74 32 100 32 Q 126 32 126 62 L 126 118 Z"
              fill="#FFF3B0"
              stroke="#E9C46A"
              strokeWidth="3.5"
            />

            {/* Dancing Peel Arms (Left & Right) */}
            <Path
              d="M 74 108 Q 34 98 26 130 Q 46 144 76 124 Z"
              fill="#FFEA00"
              stroke="#D4A000"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            <Path
              d="M 126 108 Q 166 98 174 130 Q 154 144 124 124 Z"
              fill="#FFEA00"
              stroke="#D4A000"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />

            {/* Lower Golden Banana Peel Jacket */}
            <Path
              d="M 70 108 Q 68 170 100 176 Q 132 170 130 108 Q 100 120 70 108 Z"
              fill="#FFD60A"
              stroke="#D4A000"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />

            {/* Front Center Peel Flap */}
            <Path
              d="M 76 110 Q 100 142 124 110 Q 100 124 76 110 Z"
              fill="#FFEE32"
              stroke="#D4A000"
              strokeWidth="3"
            />

            {/* Kawaii Face on Creamy Upper Banana */}
            <KawaiiFace
              cx={100}
              cy={76}
              scale={0.82}
              isWinking={isWinking}
              cheekColor="#FF758F"
            />
          </Svg>
        );

      case 'avocado':
        return (
          <Svg width={size} height={size} viewBox="0 0 200 200">
            <Defs>
              <RadialGradient id="avoGlow" cx="50%" cy="54%" r="48%">
                <Stop offset="0%" stopColor="#7AE582" stopOpacity="0.46" />
                <Stop offset="70%" stopColor="#38B000" stopOpacity="0.14" />
                <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </RadialGradient>
              <RadialGradient id="pitGrad" cx="40%" cy="38%" r="55%">
                <Stop offset="0%" stopColor="#B07D52" />
                <Stop offset="100%" stopColor="#6F4518" />
              </RadialGradient>
            </Defs>

            {/* Outer Glow */}
            <Circle cx="100" cy="106" r="92" fill="url(#avoGlow)" />

            {/* Outer Dark Green Avocado Skin */}
            <Path
              d="M 100 26 C 72 26 56 64 50 108 C 44 150 68 176 100 176 C 132 176 156 150 150 108 C 144 64 128 26 100 26 Z"
              fill="#2D6A4F"
              stroke="#1B4332"
              strokeWidth="4"
            />

            {/* Creamy Lime-Green Avocado Flesh */}
            <Path
              d="M 100 34 C 76 34 63 68 58 108 C 53 144 73 168 100 168 C 127 168 147 144 142 108 C 137 68 124 34 100 34 Z"
              fill="#B7E4C7"
              stroke="#74C69D"
              strokeWidth="3"
            />

            {/* Visible Round Brown Pit */}
            <Circle
              cx="100"
              cy="128"
              r="26"
              fill="url(#pitGrad)"
              stroke="#582F0E"
              strokeWidth="3"
            />
            <Ellipse
              cx="90"
              cy="118"
              rx="6"
              ry="4"
              transform="rotate(-25 90 118)"
              fill="#FFFFFF"
              opacity="0.4"
            />

            {/* Kawaii Face Above Pit */}
            <KawaiiFace
              cx={100}
              cy={76}
              scale={0.85}
              isWinking={isWinking}
              cheekColor="#FF758F"
            />
          </Svg>
        );
    }
  }
);
