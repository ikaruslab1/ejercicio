import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Zap, 
  ShieldCheck, 
  Target, 
  Maximize2,
  Gauge
} from 'lucide-react';

interface ExerciseVisualizerProps {
  exerciseId: string;
  exerciseName?: string;
  muscleGroup: string;
  machine: string;
  cue?: string;
  tempo?: string;
  onOpenFullModal?: () => void;
  heightClass?: string;
  compact?: boolean;
}

export const ExerciseVisualizer: React.FC<ExerciseVisualizerProps> = ({
  exerciseId,
  muscleGroup,
  machine,
  tempo = '3-0-1-0',
  onOpenFullModal,
  heightClass = 'h-52 sm:h-64',
  compact = false
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [currentPhase, setCurrentPhase] = useState<'concentric' | 'peak' | 'eccentric'>('concentric');
  const [phaseProgress, setPhaseProgress] = useState(0);

  // Parse tempo: e.g. "3-0-1-0" -> eccentric 3s, pause 0s, concentric 1s, pause 0s
  const tempoParts = tempo.split('-').map(p => parseInt(p) || 1);
  const eccentricTime = tempoParts[0] || 3;
  const concentricTime = tempoParts[2] || 1;
  const totalCycleSeconds = (eccentricTime + concentricTime + 1) / playbackSpeed;

  useEffect(() => {
    if (!isPlaying) return;

    const intervalTime = 50;
    const step = (intervalTime / (totalCycleSeconds * 1000)) * 100;

    const timer = setInterval(() => {
      setPhaseProgress(prev => {
        const next = (prev + step) % 100;
        if (next < 35) {
          setCurrentPhase('concentric');
        } else if (next < 50) {
          setCurrentPhase('peak');
        } else {
          setCurrentPhase('eccentric');
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlaying, totalCycleSeconds]);

  const animDuration = `${totalCycleSeconds.toFixed(2)}s`;
  const playState = isPlaying ? 'running' : 'paused';

  // Enhanced SVG Defs: High-End Smart Fit Machinery & Anatomical Shading
  const renderCommonDefs = () => (
    <defs>
      {/* Muscle Active Glow Gradients */}
      <linearGradient id="goldMuscle" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="35%" stopColor="#facc15" />
        <stop offset="100%" stopColor="#ca8a04" />
      </linearGradient>
      <linearGradient id="blueMuscle" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#93c5fd" />
        <stop offset="50%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#1d4ed8" />
      </linearGradient>
      <linearGradient id="purpleMuscle" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#d8b4fe" />
        <stop offset="50%" stopColor="#a855f7" />
        <stop offset="100%" stopColor="#6b21a8" />
      </linearGradient>
      <linearGradient id="greenMuscle" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6ee7b7" />
        <stop offset="50%" stopColor="#10b981" />
        <stop offset="100%" stopColor="#047857" />
      </linearGradient>
      <linearGradient id="pinkMuscle" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fbcfe8" />
        <stop offset="50%" stopColor="#ec4899" />
        <stop offset="100%" stopColor="#be185d" />
      </linearGradient>
      <linearGradient id="redMuscle" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fca5a5" />
        <stop offset="50%" stopColor="#ef4444" />
        <stop offset="100%" stopColor="#b91c1c" />
      </linearGradient>

      {/* Anatomical Human Body Layers */}
      <linearGradient id="bodySkin" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f8fafc" />
        <stop offset="60%" stopColor="#cbd5e1" />
        <stop offset="100%" stopColor="#94a3b8" />
      </linearGradient>
      <linearGradient id="bodySkinDark" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#94a3b8" />
        <stop offset="100%" stopColor="#475569" />
      </linearGradient>
      <linearGradient id="athleticShorts" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#334155" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>

      {/* Smart Fit Commercial Gym Machine Metallurgy & Pads */}
      <linearGradient id="machineChassis" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3f3f46" />
        <stop offset="50%" stopColor="#27272a" />
        <stop offset="100%" stopColor="#18181b" />
      </linearGradient>
      <linearGradient id="chromeSteel" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="30%" stopColor="#e4e4e7" />
        <stop offset="70%" stopColor="#a1a1aa" />
        <stop offset="100%" stopColor="#71717a" />
      </linearGradient>
      <linearGradient id="leatherUpholstery" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#27272a" />
        <stop offset="60%" stopColor="#18181b" />
        <stop offset="100%" stopColor="#09090b" />
      </linearGradient>
      <linearGradient id="sfYellowAccent" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="50%" stopColor="#eab308" />
        <stop offset="100%" stopColor="#ca8a04" />
      </linearGradient>
      <linearGradient id="weightPlates" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#18181b" />
        <stop offset="30%" stopColor="#3f3f46" />
        <stop offset="70%" stopColor="#27272a" />
        <stop offset="100%" stopColor="#18181b" />
      </linearGradient>

      {/* Grip & Diamond Plate Texture */}
      <pattern id="diamondPlate" width="12" height="12" patternUnits="userSpaceOnUse">
        <rect width="12" height="12" fill="#27272a" />
        <path d="M 0 6 L 6 0 L 12 6 L 6 12 Z" fill="#3f3f46" opacity="0.6" />
      </pattern>

      {/* Glow Filter */}
      <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3.5" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
  );

  // Render specific SVG animation based on exerciseId
  const renderExerciseSVG = () => {
    switch (exerciseId) {
      // -------------------------------------------------------------
      // DÍA 1: PECTORALES + ABDOMEN
      // -------------------------------------------------------------
      case '1-1': // Chest Press (Máquina 20)
        return (
          <svg viewBox="0 0 440 280" className="w-full h-full">
            {renderCommonDefs()}
            {/* Background Weight Stack Tower */}
            <g transform="translate(18, 40)">
              {/* Tower Frame */}
              <rect x="0" y="0" width="36" height="210" rx="6" fill="url(#machineChassis)" stroke="#52525b" strokeWidth="2" />
              {/* Chrome Guide Rods */}
              <line x1="12" y1="15" x2="12" y2="195" stroke="url(#chromeSteel)" strokeWidth="3" />
              <line x1="24" y1="15" x2="24" y2="195" stroke="url(#chromeSteel)" strokeWidth="3" />
              {/* Moving Weight Plates Stack */}
              <g style={{
                animation: `weightStackLift ${animDuration} ease-in-out infinite`,
                animationPlayState: playState
              }}>
                <rect x="5" y="110" width="26" height="14" rx="2" fill="url(#weightPlates)" stroke="#09090b" />
                <rect x="5" y="125" width="26" height="14" rx="2" fill="url(#weightPlates)" stroke="#09090b" />
                <rect x="5" y="140" width="26" height="14" rx="2" fill="url(#weightPlates)" stroke="#09090b" />
                {/* Yellow Selector Pin */}
                <circle cx="18" cy="132" r="3.5" fill="url(#sfYellowAccent)" stroke="#000" strokeWidth="1" />
              </g>
              {/* Top Pulley Wheel */}
              <circle cx="18" cy="18" r="8" fill="#71717a" stroke="#27272a" strokeWidth="2" />
              <circle cx="18" cy="18" r="2.5" fill="#facc15" />
            </g>

            {/* Connecting Steel Cables from Tower to Lever */}
            <path d="M 36 58 L 95 62" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="3 2" />

            {/* Main Machine Frame & Upholstered Seating */}
            <rect x="75" y="55" width="26" height="140" rx="8" fill="url(#leatherUpholstery)" stroke="#52525b" strokeWidth="2" />
            {/* Pad Stitching Accent */}
            <line x1="88" y1="65" x2="88" y2="185" stroke="#3f3f46" strokeWidth="1.5" strokeDasharray="4 3" />
            
            {/* Seat Cushion with Yellow Adjustment Knob */}
            <rect x="68" y="185" width="95" height="22" rx="6" fill="url(#leatherUpholstery)" stroke="#52525b" strokeWidth="2" />
            <circle cx="115" cy="212" r="5" fill="url(#sfYellowAccent)" stroke="#000" strokeWidth="1.5" />
            
            {/* Tubular Steel Legs */}
            <line x1="75" y1="205" x2="75" y2="250" stroke="url(#machineChassis)" strokeWidth="10" strokeLinecap="round" />
            <line x1="150" y1="205" x2="150" y2="250" stroke="url(#machineChassis)" strokeWidth="10" strokeLinecap="round" />
            <line x1="45" y1="250" x2="400" y2="250" stroke="#3f3f46" strokeWidth="4" />

            {/* Far Human Leg in Shadow */}
            <path d="M 135 185 L 175 190 L 185 250" fill="none" stroke="url(#bodySkinDark)" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="175" y="242" width="28" height="10" rx="3" fill="#1e293b" />

            {/* Human Anatomical Muscular Torso & Pelvis */}
            <ellipse cx="125" cy="180" rx="22" ry="18" fill="url(#athleticShorts)" />
            <path d="M 115 85 C 108 120, 112 155, 125 180" fill="none" stroke="url(#bodySkin)" strokeWidth="28" strokeLinecap="round" />
            
            {/* Head Profile */}
            <g transform="translate(110, 48)">
              <path d="M 12 0 C 22 0, 26 8, 26 18 C 26 26, 20 32, 12 32 C 4 32, 0 24, 0 16 C 0 8, 4 0, 12 0 Z" fill="url(#bodySkin)" />
              <path d="M 22 14 L 28 17 L 24 22 L 20 28" fill="none" stroke="url(#bodySkin)" strokeWidth="3" strokeLinecap="round" />
              <path d="M 4 8 C 10 2, 20 2, 24 8" stroke="#1e293b" strokeWidth="5" fill="none" strokeLinecap="round" />
              <path d="M 10 28 L 10 38 L 18 38 L 18 28" fill="url(#bodySkin)" />
            </g>

            {/* Active Pectoral Muscle Slab (Gold Contraction Glow) */}
            <path 
              d="M 125 95 C 144 95, 154 108, 148 128 C 136 135, 122 130, 122 110 Z" 
              fill="url(#goldMuscle)" 
              filter="url(#glowEffect)"
              className="animate-pulse"
            />

            {/* Near Muscular Leg (Quad + Calf + Sneaker) */}
            <g>
              <path d="M 128 180 C 145 178, 170 182, 190 188" stroke="url(#bodySkin)" strokeWidth="24" strokeLinecap="round" />
              <path d="M 128 180 L 165 185" stroke="url(#athleticShorts)" strokeWidth="26" strokeLinecap="round" />
              <circle cx="190" cy="188" r="10" fill="url(#bodySkin)" />
              <path d="M 190 188 C 200 205, 202 225, 198 248" stroke="url(#bodySkin)" strokeWidth="20" strokeLinecap="round" />
              <path d="M 188 244 L 220 244 C 225 244, 226 250, 222 252 L 184 252 Z" fill="url(#sfYellowAccent)" stroke="#000" strokeWidth="1.5" />
            </g>

            {/* Machine Convergent Lever Arm & Heavy Pivot Joint */}
            <circle cx="105" cy="58" r="12" fill="url(#machineChassis)" stroke="#71717a" strokeWidth="2" />
            <circle cx="105" cy="58" r="4" fill="url(#sfYellowAccent)" />
            
            <g style={{
              transformOrigin: '105px 58px',
              animation: `chestPressArm ${animDuration} ease-in-out infinite`,
              animationPlayState: playState
            }}>
              {/* Heavy Tubular Steel Arm */}
              <line x1="105" y1="58" x2="250" y2="115" stroke="url(#steelBar)" strokeWidth="12" strokeLinecap="round" />
              {/* Ergonomic Rubber Handle Grips */}
              <rect x="240" y="100" width="20" height="36" rx="5" fill="url(#sfYellowAccent)" stroke="#000" strokeWidth="2" />
              {/* Knurled grip detail */}
              <line x1="243" y1="108" x2="257" y2="108" stroke="#000" strokeWidth="1.5" />
              <line x1="243" y1="118" x2="257" y2="118" stroke="#000" strokeWidth="1.5" />
              <line x1="243" y1="128" x2="257" y2="128" stroke="#000" strokeWidth="1.5" />
            </g>

            {/* Articulated Human Arm (Shoulder -> Biceps -> Forearm -> Hand Grasping Handle) */}
            <g style={{
              animation: `chestPressHumanArm ${animDuration} ease-in-out infinite`,
              animationPlayState: playState
            }}>
              <ellipse cx="128" cy="100" rx="14" ry="12" fill="url(#goldMuscle)" />
              <path d="M 130 102 C 158 108, 175 116, 190 120" stroke="url(#bodySkin)" strokeWidth="18" strokeLinecap="round" />
              <circle cx="190" cy="120" r="9" fill="url(#bodySkin)" />
              <path d="M 190 120 L 246 115" stroke="url(#bodySkin)" strokeWidth="15" strokeLinecap="round" />
              {/* Hand with Anatomical Fingers Wrapped */}
              <ellipse cx="248" cy="115" rx="9" ry="8" fill="#facc15" stroke="#ca8a04" strokeWidth="2" />
            </g>

            {/* Trajectory Vector Arrow & Machine Label */}
            <path d="M 190 88 L 260 88" stroke="#eab308" strokeWidth="2.5" strokeDasharray="4 4" />
            <polygon points="268,88 260,83 260,93" fill="#eab308" />
            <text x="195" y="78" fill="#eab308" fontSize="11" fontFamily="monospace" fontWeight="bold">EMPUJE GUIADO</text>
          </svg>
        );

      case '1-2': // Pectoral Fly (Máquina 21)
        return (
          <svg viewBox="0 0 440 280" className="w-full h-full">
            {renderCommonDefs()}
            {/* Machine Top Cam & Dual Pivot Towers */}
            <rect x="190" y="40" width="60" height="170" rx="10" fill="url(#leatherUpholstery)" stroke="#52525b" strokeWidth="2" />
            
            {/* Left & Right Cam Pulleys */}
            <circle cx="140" cy="70" r="16" fill="url(#machineChassis)" stroke="#71717a" strokeWidth="2" />
            <circle cx="140" cy="70" r="6" fill="url(#sfYellowAccent)" />
            <circle cx="300" cy="70" r="16" fill="url(#machineChassis)" stroke="#71717a" strokeWidth="2" />
            <circle cx="300" cy="70" r="6" fill="url(#sfYellowAccent)" />

            {/* Human Anatomical Torso & Chest Slabs */}
            <circle cx="220" cy="70" r="18" fill="url(#bodySkin)" />
            <path d="M 205 85 L 220 95 L 235 85 L 220 78 Z" fill="url(#bodySkin)" />
            <path d="M 190 95 C 180 140, 185 180, 220 190 C 255 180, 260 140, 250 95 Z" fill="url(#bodySkin)" />

            {/* Pectoral Slabs Squeezing in Sternal Midline (Gold Glowing) */}
            <path d="M 218 100 C 200 100, 188 115, 192 135 C 202 142, 216 138, 218 115 Z" fill="url(#goldMuscle)" filter="url(#glowEffect)" />
            <path d="M 222 100 C 240 100, 252 115, 248 135 C 238 142, 224 138, 222 115 Z" fill="url(#goldMuscle)" filter="url(#glowEffect)" />
            <line x1="220" y1="98" x2="220" y2="155" stroke="#ca8a04" strokeWidth="2" />

            {/* Left Machine Lever Arm with Forearm Rest & Handgrip */}
            <g style={{
              transformOrigin: '140px 70px',
              animation: `flyLeftArm ${animDuration} ease-in-out infinite`,
              animationPlayState: playState
            }}>
              <line x1="140" y1="70" x2="80" y2="155" stroke="url(#steelBar)" strokeWidth="12" strokeLinecap="round" />
              <rect x="68" y="145" width="24" height="34" rx="6" fill="url(#leatherUpholstery)" stroke="#eab308" strokeWidth="2" />
              <rect x="75" y="115" width="10" height="28" rx="3" fill="url(#sfYellowAccent)" />
              {/* Human Arm */}
              <ellipse cx="188" cy="104" rx="14" ry="11" fill="url(#bodySkin)" />
              <path d="M 185 105 C 150 115, 115 130, 82 155" stroke="url(#bodySkin)" strokeWidth="16" strokeLinecap="round" />
              <ellipse cx="80" cy="158" rx="9" ry="8" fill="#facc15" />
            </g>

            {/* Right Machine Lever Arm */}
            <g style={{
              transformOrigin: '300px 70px',
              animation: `flyRightArm ${animDuration} ease-in-out infinite`,
              animationPlayState: playState
            }}>
              <line x1="300" y1="70" x2="360" y2="155" stroke="url(#steelBar)" strokeWidth="12" strokeLinecap="round" />
              <rect x="348" y="145" width="24" height="34" rx="6" fill="url(#leatherUpholstery)" stroke="#eab308" strokeWidth="2" />
              <rect x="355" y="115" width="10" height="28" rx="3" fill="url(#sfYellowAccent)" />
              {/* Human Arm */}
              <ellipse cx="252" cy="104" rx="14" ry="11" fill="url(#bodySkin)" />
              <path d="M 255 105 C 290 115, 325 130, 358 155" stroke="url(#bodySkin)" strokeWidth="16" strokeLinecap="round" />
              <ellipse cx="360" cy="158" rx="9" ry="8" fill="#facc15" />
            </g>
            <text x="155" y="240" fill="#eab308" fontSize="11" fontFamily="monospace" fontWeight="bold">MÁQUINA 21 · CRISTOS</text>
          </svg>
        );

      case '1-3': // Cable Crossover (Área Gris)
        return (
          <svg viewBox="0 0 440 280" className="w-full h-full">
            {renderCommonDefs()}
            {/* Dual Swivel Pulley Towers */}
            <rect x="20" y="20" width="26" height="235" rx="6" fill="url(#machineChassis)" stroke="#52525b" strokeWidth="2" />
            <rect x="394" y="20" width="26" height="235" rx="6" fill="url(#machineChassis)" stroke="#52525b" strokeWidth="2" />
            
            {/* Swivel Pulley Heads with Yellow Accent Adjusters */}
            <circle cx="33" cy="45" r="12" fill="url(#steelBar)" stroke="#000" strokeWidth="1.5" />
            <circle cx="33" cy="45" r="4" fill="url(#sfYellowAccent)" />
            <circle cx="407" cy="45" r="12" fill="url(#steelBar)" stroke="#000" strokeWidth="1.5" />
            <circle cx="407" cy="45" r="4" fill="url(#sfYellowAccent)" />

            {/* Staggered Standing Body */}
            <path d="M 220 155 L 255 205 L 260 250" stroke="url(#bodySkinDark)" strokeWidth="18" strokeLinecap="round" />
            <circle cx="210" cy="65" r="17" fill="url(#bodySkin)" />
            <path d="M 205 80 C 200 115, 205 145, 215 160" stroke="url(#bodySkin)" strokeWidth="28" strokeLinecap="round" />
            <path d="M 204 92 Q 220 102 215 125" stroke="url(#goldMuscle)" strokeWidth="14" strokeLinecap="round" filter="url(#glowEffect)" />
            
            <path d="M 215 160 L 185 205 L 180 250" stroke="url(#bodySkin)" strokeWidth="20" strokeLinecap="round" />

            {/* Crossing Cable System */}
            <g style={{
              animation: `cableCrossover ${animDuration} ease-in-out infinite`,
              animationPlayState: playState
            }}>
              <line x1="33" y1="45" x2="200" y2="155" stroke="#cbd5e1" strokeWidth="3" strokeDasharray="4 2" />
              <line x1="407" y1="45" x2="225" y2="155" stroke="#cbd5e1" strokeWidth="3" strokeDasharray="4 2" />
              <path d="M 200 92 C 155 105, 145 130, 200 155" fill="none" stroke="url(#bodySkin)" strokeWidth="16" strokeLinecap="round" />
              <circle cx="200" cy="155" r="8" fill="#facc15" stroke="#000" strokeWidth="1.5" />
              <path d="M 218 92 C 265 105, 275 130, 225 155" fill="none" stroke="url(#bodySkin)" strokeWidth="16" strokeLinecap="round" />
              <circle cx="225" cy="155" r="8" fill="#facc15" stroke="#000" strokeWidth="1.5" />
            </g>
            <text x="150" y="270" fill="#eab308" fontSize="10" fontFamily="monospace" fontWeight="bold">ÁREA GRIS · CRUCE EN POLEAS</text>
          </svg>
        );

      case '1-4': // Abdominal Crunch (Área Rojo)
        return (
          <svg viewBox="0 0 440 280" className="w-full h-full">
            {renderCommonDefs()}
            {/* Dedicated Red Machine Crunch Seat & Frame */}
            <path d="M 60 190 L 330 190 L 355 240" fill="none" stroke="url(#machineChassis)" strokeWidth="14" strokeLinecap="round" />
            <rect x="80" y="175" width="220" height="20" rx="5" fill="url(#leatherUpholstery)" stroke="#ef4444" strokeWidth="2" />
            
            {/* Padded Foot Rollers */}
            <circle cx="295" cy="175" r="14" fill="#ef4444" stroke="#000" strokeWidth="2" />
            <circle cx="330" cy="195" r="14" fill="#ef4444" stroke="#000" strokeWidth="2" />

            {/* Stable Lower Body */}
            <ellipse cx="190" cy="175" rx="24" ry="18" fill="url(#athleticShorts)" />
            <path d="M 190 175 L 255 145 L 295 180" fill="none" stroke="url(#bodySkin)" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round" />

            {/* Curling Upper Torso with Red Contracting Abdominals */}
            <g style={{
              transformOrigin: '190px 175px',
              animation: `abCrunchTorso ${animDuration} ease-in-out infinite`,
              animationPlayState: playState
            }}>
              <path d="M 190 175 C 155 155, 130 130, 105 95" fill="none" stroke="url(#bodySkin)" strokeWidth="26" strokeLinecap="round" />
              
              {/* Glowing Red Rectus Abdominis 6-Pack */}
              <g filter="url(#glowEffect)">
                <rect x="165" y="150" width="14" height="11" rx="3" fill="url(#redMuscle)" />
                <rect x="148" y="135" width="14" height="11" rx="3" fill="url(#redMuscle)" />
                <rect x="132" y="120" width="14" height="11" rx="3" fill="url(#redMuscle)" />
              </g>

              <circle cx="95" cy="80" r="17" fill="url(#bodySkin)" />
              <path d="M 108 100 L 85 75 L 100 70" fill="none" stroke="url(#bodySkin)" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            <text x="140" y="50" fill="#ef4444" fontSize="11" fontFamily="monospace" fontWeight="bold">ÁREA ROJA · CRUNCH ESTRICTO</text>
          </svg>
        );

      // -------------------------------------------------------------
      // DÍA 2: ESPALDA
      // -------------------------------------------------------------
      case '2-1': // Lat Pulldown (Máquina 22)
        return (
          <svg viewBox="0 0 440 280" className="w-full h-full">
            {renderCommonDefs()}
            {/* Top Boom Frame & Overhead Pulley */}
            <rect x="60" y="15" width="310" height="16" rx="5" fill="url(#machineChassis)" stroke="#52525b" strokeWidth="2" />
            <circle cx="215" cy="23" r="14" fill="url(#steelBar)" stroke="#000" strokeWidth="2" />
            <circle cx="215" cy="23" r="5" fill="url(#sfYellowAccent)" />

            {/* Rear Weight Stack in Motion */}
            <g transform="translate(385, 45)">
              <rect x="0" y="0" width="30" height="195" rx="5" fill="url(#machineChassis)" stroke="#52525b" />
              <line x1="10" y1="10" x2="10" y2="185" stroke="url(#chromeSteel)" strokeWidth="2.5" />
              <line x1="20" y1="10" x2="20" y2="185" stroke="url(#chromeSteel)" strokeWidth="2.5" />
              <g style={{
                animation: `weightStackLift ${animDuration} ease-in-out infinite`,
                animationPlayState: playState
              }}>
                <rect x="4" y="100" width="22" height="12" rx="2" fill="url(#weightPlates)" />
                <rect x="4" y="114" width="22" height="12" rx="2" fill="url(#weightPlates)" />
                <circle cx="15" cy="106" r="3" fill="url(#sfYellowAccent)" />
              </g>
            </g>

            {/* Moving Cable & Wide Ergonomic Lat Bar */}
            <g style={{
              animation: `latPulldownBar ${animDuration} ease-in-out infinite`,
              animationPlayState: playState
            }}>
              <line x1="215" y1="23" x2="215" y2="68" stroke="#cbd5e1" strokeWidth="3" />
              <path d="M 95 68 Q 215 62 335 68" fill="none" stroke="url(#steelBar)" strokeWidth="12" strokeLinecap="round" />
              <rect x="90" y="62" width="20" height="12" rx="3" fill="url(#sfYellowAccent)" />
              <rect x="320" y="62" width="20" height="12" rx="3" fill="url(#sfYellowAccent)" />
            </g>

            {/* Seated Base & Yellow Adjustable Thigh Clamp Roller */}
            <rect x="190" y="170" width="50" height="16" rx="5" fill="url(#leatherUpholstery)" stroke="#52525b" />
            <rect x="180" y="148" width="70" height="16" rx="8" fill="url(#sfYellowAccent)" stroke="#000" strokeWidth="2" />
            <circle cx="215" cy="156" r="4" fill="#000" />

            {/* V-Taper Muscular Athlete Silhouette */}
            <circle cx="215" cy="95" r="17" fill="url(#bodySkin)" />
            <path d="M 215 110 L 215 175" stroke="url(#bodySkin)" strokeWidth="26" strokeLinecap="round" />
            
            {/* Glowing Lat Wings (Blue Muscle Flare) */}
            <path d="M 202 115 C 174 135, 178 160, 202 170 Z" fill="url(#blueMuscle)" filter="url(#glowEffect)" className="animate-pulse" />
            <path d="M 228 115 C 256 135, 252 160, 228 170 Z" fill="url(#blueMuscle)" filter="url(#glowEffect)" className="animate-pulse" />

            {/* Arms Pulling Bar Down */}
            <g style={{
              animation: `latPulldownArms ${animDuration} ease-in-out infinite`,
              animationPlayState: playState
            }}>
              <path d="M 202 112 C 145 95, 125 80, 105 68" fill="none" stroke="url(#bodySkin)" strokeWidth="16" strokeLinecap="round" />
              <circle cx="105" cy="68" r="8" fill="#facc15" />
              <path d="M 228 112 C 285 95, 305 80, 325 68" fill="none" stroke="url(#bodySkin)" strokeWidth="16" strokeLinecap="round" />
              <circle cx="325" cy="68" r="8" fill="#facc15" />
            </g>
            <text x="145" y="270" fill="#3b82f6" fontSize="10" fontFamily="monospace" fontWeight="bold">MÁQUINA 22 · JALÓN DORSAL</text>
          </svg>
        );

      case '2-2': // Seated Row (Máquina 23)
        return (
          <svg viewBox="0 0 440 280" className="w-full h-full">
            {renderCommonDefs()}
            {/* Machine Frame & Chest Support */}
            <rect x="210" y="80" width="22" height="100" rx="7" fill="url(#leatherUpholstery)" stroke="#52525b" strokeWidth="2" />
            <rect x="110" y="175" width="90" height="20" rx="6" fill="url(#leatherUpholstery)" stroke="#52525b" />
            <path d="M 230 195 L 245 230" stroke="url(#steelBar)" strokeWidth="10" strokeLinecap="round" />

            {/* Muscular Seated Torso */}
            <circle cx="155" cy="75" r="17" fill="url(#bodySkin)" />
            <path d="M 155 90 L 155 175" stroke="url(#bodySkin)" strokeWidth="28" strokeLinecap="round" />
            
            {/* Glowing Back Density (Rhomboids/Traps - Blue) */}
            <path d="M 144 100 C 124 125, 128 155, 146 165 Z" fill="url(#blueMuscle)" filter="url(#glowEffect)" className="animate-pulse" />

            {/* Legs on Footrest Pedals */}
            <path d="M 155 175 L 230 185 L 240 240" fill="none" stroke="url(#bodySkin)" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="235" y="235" width="28" height="10" rx="3" fill="#1e293b" />

            {/* Low Pulley & V-Grip Handle Pulling Horizontally */}
            <g style={{
              animation: `seatedRowPull ${animDuration} ease-in-out infinite`,
              animationPlayState: playState
            }}>
              <line x1="290" y1="125" x2="225" y2="125" stroke="#cbd5e1" strokeWidth="3.5" />
              {/* Chrome V-Grip Handle */}
              <path d="M 225 112 L 215 125 L 225 138" fill="none" stroke="url(#sfYellowAccent)" strokeWidth="4" strokeLinecap="round" />

              <ellipse cx="158" cy="105" rx="14" ry="11" fill="url(#bodySkin)" />
              <path d="M 155 105 L 185 125 L 218 125" fill="none" stroke="url(#bodySkin)" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
              <ellipse cx="218" cy="125" rx="8" ry="7" fill="#facc15" />
            </g>
            <text x="145" y="45" fill="#3b82f6" fontSize="10" fontFamily="monospace" fontWeight="bold">MÁQUINA 23 · REMO SENTADO</text>
          </svg>
        );

      case '2-3': // Remo Unilateral con Mancuerna (Peso Libre)
        return (
          <svg viewBox="0 0 440 280" className="w-full h-full">
            {renderCommonDefs()}
            {/* Heavy Commercial Gym Flat Bench */}
            <rect x="75" y="165" width="210" height="20" rx="6" fill="url(#leatherUpholstery)" stroke="#52525b" strokeWidth="2" />
            <line x1="100" y1="185" x2="100" y2="245" stroke="url(#machineChassis)" strokeWidth="10" strokeLinecap="round" />
            <line x1="260" y1="185" x2="260" y2="245" stroke="url(#machineChassis)" strokeWidth="10" strokeLinecap="round" />

            {/* Knee & Supporting Arm on Bench */}
            <circle cx="135" cy="165" r="11" fill="url(#bodySkinDark)" />
            <line x1="245" y1="125" x2="245" y2="165" stroke="url(#bodySkinDark)" strokeWidth="18" strokeLinecap="round" />

            {/* Standing Leg & Torso */}
            <path d="M 165 135 L 190 185 L 195 245" stroke="url(#bodySkin)" strokeWidth="20" strokeLinecap="round" />
            <path d="M 255 120 L 160 130" stroke="url(#bodySkin)" strokeWidth="26" strokeLinecap="round" />
            <circle cx="270" cy="108" r="16" fill="url(#bodySkin)" />
            
            {/* Unilateral Lat Muscle Flare */}
            <path d="M 240 125 C 200 130, 180 140, 165 132 Z" fill="url(#blueMuscle)" filter="url(#glowEffect)" className="animate-pulse" />

            {/* Hex Dumbbell & Pulling Arm */}
            <g style={{
              animation: `unilateralRow ${animDuration} ease-in-out infinite`,
              animationPlayState: playState
            }}>
              <path d="M 235 125 L 195 170 L 185 205" fill="none" stroke="url(#bodySkin)" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
              {/* Commercial Hex Dumbbell */}
              <rect x="168" y="200" width="34" height="15" rx="3" fill="url(#sfYellowAccent)" stroke="#000" strokeWidth="2" />
              <polygon points="168,195 156,202 156,212 168,220" fill="#18181b" stroke="#3f3f46" />
              <polygon points="202,195 214,202 214,212 202,220" fill="#18181b" stroke="#3f3f46" />
            </g>
            <text x="140" y="55" fill="#3b82f6" fontSize="10" fontFamily="monospace" fontWeight="bold">PESO LIBRE · REMO UNILATERAL</text>
          </svg>
        );

      case '2-4': // Dominadas Asistidas (Máquina 33/61)
        return (
          <svg viewBox="0 0 440 280" className="w-full h-full">
            {renderCommonDefs()}
            {/* Multi-Grip Chin-Up Bar Rig */}
            <line x1="100" y1="30" x2="330" y2="30" stroke="url(#steelBar)" strokeWidth="12" strokeLinecap="round" />
            <path d="M 130 30 L 130 55 L 145 55" fill="none" stroke="url(#sfYellowAccent)" strokeWidth="8" strokeLinecap="round" />
            <path d="M 300 30 L 300 55 L 285 55" fill="none" stroke="url(#sfYellowAccent)" strokeWidth="8" strokeLinecap="round" />

            {/* Vertical Guide Columns */}
            <line x1="165" y1="40" x2="165" y2="245" stroke="url(#chromeSteel)" strokeWidth="4" />
            <line x1="265" y1="40" x2="265" y2="245" stroke="url(#chromeSteel)" strokeWidth="4" />

            {/* Human Body + Moving Assist Platform */}
            <g style={{
              animation: `pullupVertical ${animDuration} ease-in-out infinite`,
              animationPlayState: playState
            }}>
              <circle cx="215" cy="105" r="17" fill="url(#bodySkin)" />
              <path d="M 215 120 L 215 180" stroke="url(#bodySkin)" strokeWidth="26" strokeLinecap="round" />
              
              <path d="M 202 125 C 178 145, 182 170, 204 178 Z" fill="url(#blueMuscle)" filter="url(#glowEffect)" className="animate-pulse" />
              <path d="M 228 125 C 252 145, 248 170, 226 178 Z" fill="url(#blueMuscle)" filter="url(#glowEffect)" className="animate-pulse" />

              <path d="M 215 180 L 200 220" stroke="url(#bodySkin)" strokeWidth="18" strokeLinecap="round" />
              {/* Assist Knee Pad */}
              <rect x="160" y="218" width="110" height="18" rx="6" fill="url(#leatherUpholstery)" stroke="#eab308" strokeWidth="2.5" />

              <path d="M 202 125 L 160 85 L 138 55" fill="none" stroke="url(#bodySkin)" strokeWidth="16" strokeLinecap="round" />
              <path d="M 228 125 L 270 85 L 292 55" fill="none" stroke="url(#bodySkin)" strokeWidth="16" strokeLinecap="round" />
            </g>
            <text x="140" y="265" fill="#3b82f6" fontSize="10" fontFamily="monospace" fontWeight="bold">MÁQUINA 33/61 · DOMINADA ASISTIDA</text>
          </svg>
        );

      // -------------------------------------------------------------
      // DÍA 3: HOMBROS
      // -------------------------------------------------------------
      case '3-1': // Shoulder Press (Máquina 50)
        return (
          <svg viewBox="0 0 440 280" className="w-full h-full">
            {renderCommonDefs()}
            {/* Machine Backrest angled at 75° & Seat */}
            <rect x="195" y="65" width="24" height="145" rx="7" fill="url(#leatherUpholstery)" stroke="#52525b" strokeWidth="2" />
            <rect x="180" y="180" width="85" height="18" rx="5" fill="url(#leatherUpholstery)" />
            <circle cx="225" cy="205" r="4.5" fill="url(#sfYellowAccent)" />

            {/* Muscular Seated Torso & Head */}
            <circle cx="215" cy="75" r="17" fill="url(#bodySkin)" />
            <path d="M 215 90 L 215 180" stroke="url(#bodySkin)" strokeWidth="28" strokeLinecap="round" />
            
            {/* Deltoid Caps (Glowing Emerald Green) */}
            <circle cx="195" cy="100" r="13" fill="url(#greenMuscle)" filter="url(#glowEffect)" className="animate-pulse" />
            <circle cx="235" cy="100" r="13" fill="url(#greenMuscle)" filter="url(#glowEffect)" className="animate-pulse" />

            {/* Overhead Pressing Levers */}
            <g style={{
              animation: `overheadPress ${animDuration} ease-in-out infinite`,
              animationPlayState: playState
            }}>
              <path d="M 195 100 L 155 90 L 155 45" fill="none" stroke="url(#bodySkin)" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="145" y="40" width="24" height="12" rx="3" fill="url(#sfYellowAccent)" stroke="#000" strokeWidth="1.5" />
              <ellipse cx="155" cy="45" rx="8" ry="7" fill="#facc15" />

              <path d="M 235 100 L 275 90 L 275 45" fill="none" stroke="url(#bodySkin)" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="263" y="40" width="24" height="12" rx="3" fill="url(#sfYellowAccent)" stroke="#000" strokeWidth="1.5" />
              <ellipse cx="275" cy="45" rx="8" ry="7" fill="#facc15" />
            </g>
            <text x="145" y="30" fill="#10b981" fontSize="10" fontFamily="monospace" fontWeight="bold">MÁQUINA 50 · PRESS HOMBROS</text>
          </svg>
        );

      case '3-2': // Cruce Poleas Bajas (Elevaciones Laterales en Polea)
      case '3-3': // Elevaciones Laterales con Mancuerna (Peso Libre)
        return (
          <svg viewBox="0 0 440 280" className="w-full h-full">
            {renderCommonDefs()}
            {/* Standing Athlete */}
            <circle cx="220" cy="60" r="17" fill="url(#bodySkin)" />
            <path d="M 220 75 L 220 165" stroke="url(#bodySkin)" strokeWidth="28" strokeLinecap="round" />
            
            <path d="M 220 165 L 195 245" stroke="url(#bodySkin)" strokeWidth="20" strokeLinecap="round" />
            <path d="M 220 165 L 245 245" stroke="url(#bodySkin)" strokeWidth="20" strokeLinecap="round" />

            {/* Lateral Deltoids Glowing */}
            <circle cx="202" cy="85" r="14" fill="url(#greenMuscle)" filter="url(#glowEffect)" className="animate-pulse" />
            <circle cx="238" cy="85" r="14" fill="url(#greenMuscle)" filter="url(#glowEffect)" className="animate-pulse" />

            {/* Lateral Arms Raising in Scapular Plane */}
            <g style={{
              transformOrigin: '202px 85px',
              animation: `lateralRaiseLeft ${animDuration} ease-in-out infinite`,
              animationPlayState: playState
            }}>
              <path d="M 202 85 L 145 105 L 98 130" fill="none" stroke="url(#bodySkin)" strokeWidth="16" strokeLinecap="round" />
              <circle cx="98" cy="130" r="12" fill="url(#sfYellowAccent)" stroke="#000" strokeWidth="2" />
            </g>

            <g style={{
              transformOrigin: '238px 85px',
              animation: `lateralRaiseRight ${animDuration} ease-in-out infinite`,
              animationPlayState: playState
            }}>
              <path d="M 238 85 L 295 105 L 342 130" fill="none" stroke="url(#bodySkin)" strokeWidth="16" strokeLinecap="round" />
              <circle cx="342" cy="130" r="12" fill="url(#sfYellowAccent)" stroke="#000" strokeWidth="2" />
            </g>
            <text x="145" y="265" fill="#10b981" fontSize="10" fontFamily="monospace" fontWeight="bold">DELTOIDES LATERAL (PLANO ESCAPULAR)</text>
          </svg>
        );

      case '3-4': // Rear Delt (Máquina 21 / Pájaros)
        return (
          <svg viewBox="0 0 440 280" className="w-full h-full">
            {renderCommonDefs()}
            {/* Top View Perspective */}
            <circle cx="220" cy="115" r="22" fill="url(#bodySkin)" />
            <ellipse cx="220" cy="145" rx="40" ry="26" fill="url(#leatherUpholstery)" stroke="#52525b" strokeWidth="2" />

            <circle cx="185" cy="148" r="13" fill="url(#greenMuscle)" filter="url(#glowEffect)" className="animate-pulse" />
            <circle cx="255" cy="148" r="13" fill="url(#greenMuscle)" filter="url(#glowEffect)" className="animate-pulse" />

            {/* Rear Flying Arms Moving Backwards */}
            <g style={{
              transformOrigin: '185px 148px',
              animation: `rearDeltLeft ${animDuration} ease-in-out infinite`,
              animationPlayState: playState
            }}>
              <path d="M 185 148 L 125 125 L 75 105" fill="none" stroke="url(#bodySkin)" strokeWidth="16" strokeLinecap="round" />
              <circle cx="75" cy="105" r="10" fill="url(#sfYellowAccent)" stroke="#000" />
            </g>

            <g style={{
              transformOrigin: '255px 148px',
              animation: `rearDeltRight ${animDuration} ease-in-out infinite`,
              animationPlayState: playState
            }}>
              <path d="M 255 148 L 315 125 L 365 105" fill="none" stroke="url(#bodySkin)" strokeWidth="16" strokeLinecap="round" />
              <circle cx="365" cy="105" r="10" fill="url(#sfYellowAccent)" stroke="#000" />
            </g>
            <text x="145" y="240" fill="#10b981" fontSize="10" fontFamily="monospace" fontWeight="bold">DELTOIDES POSTERIOR (ASIENTO ALTO)</text>
          </svg>
        );

      // -------------------------------------------------------------
      // DÍA 4: PIERNAS
      // -------------------------------------------------------------
      case '4-1': // Linear Hack Squat (Máquina 10)
        return (
          <svg viewBox="0 0 440 280" className="w-full h-full">
            {renderCommonDefs()}
            {/* 45° Linear Hack Rails & Massive Base */}
            <line x1="65" y1="40" x2="280" y2="245" stroke="url(#chromeSteel)" strokeWidth="14" strokeLinecap="round" />
            <rect x="250" y="165" width="70" height="70" rx="4" transform="rotate(-45 250 165)" fill="url(#diamondPlate)" stroke="#eab308" strokeWidth="2.5" />

            {/* Sled Carriage with Plate Horns & Shoulder Yoke */}
            <g style={{
              animation: `hackSquatMotion ${animDuration} ease-in-out infinite`,
              animationPlayState: playState
            }}>
              <rect x="105" y="70" width="90" height="28" rx="7" transform="rotate(45 105 70)" fill="url(#leatherUpholstery)" stroke="#52525b" strokeWidth="2" />
              {/* Olympic Plates on Horn */}
              <circle cx="160" cy="105" r="26" fill="url(#machineChassis)" stroke="#eab308" strokeWidth="3" />
              <circle cx="160" cy="105" r="8" fill="#71717a" />
              
              {/* Athlete Deep Squat */}
              <circle cx="112" cy="75" r="17" fill="url(#bodySkin)" />
              <path d="M 125 85 L 180 140" stroke="url(#bodySkin)" strokeWidth="28" strokeLinecap="round" />
              
              {/* Quads Teardrop (Glowing Purple) */}
              <path d="M 180 140 L 235 140" stroke="url(#purpleMuscle)" strokeWidth="20" strokeLinecap="round" filter="url(#glowEffect)" className="animate-pulse" />
              
              <circle cx="235" cy="140" r="10" fill="url(#bodySkin)" />
              <path d="M 235 140 L 290 195" stroke="url(#bodySkin)" strokeWidth="18" strokeLinecap="round" />
            </g>
            <text x="145" y="35" fill="#8b5cf6" fontSize="10" fontFamily="monospace" fontWeight="bold">MÁQUINA 10 · HACK SQUAT LINEAL</text>
          </svg>
        );

      case '4-2': // Seated Leg Curl (Máquina 04)
        return (
          <svg viewBox="0 0 440 280" className="w-full h-full">
            {renderCommonDefs()}
            {/* Seated Leg Curl Station with Thigh Hold-Down Bar */}
            <rect x="125" y="80" width="22" height="95" rx="6" fill="url(#leatherUpholstery)" stroke="#52525b" strokeWidth="2" />
            <rect x="125" y="165" width="95" height="18" rx="5" fill="url(#leatherUpholstery)" stroke="#52525b" />
            <rect x="180" y="150" width="45" height="14" rx="4" fill="url(#sfYellowAccent)" stroke="#000" strokeWidth="1.5" />

            {/* Seated Athlete */}
            <circle cx="155" cy="65" r="17" fill="url(#bodySkin)" />
            <path d="M 150 80 L 150 165" stroke="url(#bodySkin)" strokeWidth="28" strokeLinecap="round" />
            
            <path d="M 150 165 L 230 165" stroke="url(#bodySkin)" strokeWidth="22" strokeLinecap="round" />
            <path d="M 155 174 L 225 174" stroke="url(#purpleMuscle)" strokeWidth="10" strokeLinecap="round" filter="url(#glowEffect)" className="animate-pulse" />

            {/* Rotating Ankle Roller Cam */}
            <g style={{
              transformOrigin: '230px 165px',
              animation: `legCurlRot ${animDuration} ease-in-out infinite`,
              animationPlayState: playState
            }}>
              <circle cx="230" cy="165" r="10" fill="url(#bodySkin)" />
              <path d="M 230 165 L 230 240" stroke="url(#bodySkin)" strokeWidth="16" strokeLinecap="round" />
              {/* Padded Roller */}
              <circle cx="230" cy="235" r="14" fill="url(#sfYellowAccent)" stroke="#000" strokeWidth="2.5" />
            </g>
            <text x="145" y="45" fill="#8b5cf6" fontSize="10" fontFamily="monospace" fontWeight="bold">MÁQUINA 04 · CURL ISQUIOS SENTADO</text>
          </svg>
        );

      case '4-3': // Leg Press 45° (Máquina 09)
        return (
          <svg viewBox="0 0 440 280" className="w-full h-full">
            {renderCommonDefs()}
            {/* 45° Sled Track & Plate Loaded Carriage */}
            <line x1="310" y1="40" x2="370" y2="105" stroke="#eab308" strokeWidth="14" strokeLinecap="round" />
            <line x1="120" y1="225" x2="335" y2="80" stroke="url(#chromeSteel)" strokeWidth="12" strokeLinecap="round" />

            {/* Reclined Ergonomic Seat */}
            <rect x="90" y="175" width="85" height="26" rx="6" transform="rotate(-35 90 175)" fill="url(#leatherUpholstery)" stroke="#52525b" />
            <circle cx="110" cy="155" r="17" fill="url(#bodySkin)" />
            <path d="M 120 168 L 175 205" stroke="url(#bodySkin)" strokeWidth="28" strokeLinecap="round" />

            {/* Heavy Quad Drive Motion */}
            <g style={{
              animation: `legPressMotion ${animDuration} ease-in-out infinite`,
              animationPlayState: playState
            }}>
              <path d="M 175 205 L 235 150" stroke="url(#purpleMuscle)" strokeWidth="22" strokeLinecap="round" filter="url(#glowEffect)" className="animate-pulse" />
              <circle cx="235" cy="150" r="10" fill="url(#bodySkin)" />
              <path d="M 235 150 L 325 85" stroke="url(#bodySkin)" strokeWidth="18" strokeLinecap="round" />
            </g>
            <text x="145" y="255" fill="#8b5cf6" fontSize="10" fontFamily="monospace" fontWeight="bold">MÁQUINA 09 · PRENSA 45°</text>
          </svg>
        );

      case '4-4': // Hip Thrust (Máquina 07)
        return (
          <svg viewBox="0 0 440 280" className="w-full h-full">
            {renderCommonDefs()}
            {/* Dedicated Hip Thrust Machine Back Pivot Cushion */}
            <rect x="90" y="130" width="55" height="50" rx="8" fill="url(#leatherUpholstery)" stroke="#52525b" strokeWidth="2" />
            <line x1="50" y1="245" x2="380" y2="245" stroke="#3f3f46" strokeWidth="4" />

            {/* Pelvis & Weighted Lap Swivel Arm Driving Upward */}
            <g style={{
              transformOrigin: '125px 145px',
              animation: `hipThrustPelvis ${animDuration} ease-in-out infinite`,
              animationPlayState: playState
            }}>
              <circle cx="110" cy="115" r="17" fill="url(#bodySkin)" />
              <path d="M 120 130 L 200 160" stroke="url(#bodySkin)" strokeWidth="28" strokeLinecap="round" />
              
              {/* Gluteus Maximus Contraction Glow */}
              <ellipse cx="200" cy="165" rx="20" ry="16" fill="url(#purpleMuscle)" filter="url(#glowEffect)" className="animate-pulse" />
              {/* Machine Weighted Lap Bar / Bumper Plate */}
              <circle cx="200" cy="145" r="16" fill="url(#sfYellowAccent)" stroke="#000" strokeWidth="3" />
              
              <path d="M 200 160 L 280 160 L 280 245" fill="none" stroke="url(#bodySkin)" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            <text x="145" y="45" fill="#8b5cf6" fontSize="10" fontFamily="monospace" fontWeight="bold">MÁQUINA 07 · HIP THRUST GLÚTEO</text>
          </svg>
        );

      case '4-5': // Calf Raise (Máquina 08)
        return (
          <svg viewBox="0 0 440 280" className="w-full h-full">
            {renderCommonDefs()}
            {/* Calf Machine Step Block & Shoulder Yoke */}
            <rect x="180" y="210" width="140" height="35" rx="6" fill="url(#diamondPlate)" stroke="#eab308" strokeWidth="2" />
            
            <circle cx="220" cy="45" r="17" fill="url(#bodySkin)" />
            <path d="M 220 60 L 220 135" stroke="url(#bodySkin)" strokeWidth="28" strokeLinecap="round" />
            <path d="M 220 135 L 220 185" stroke="url(#bodySkin)" strokeWidth="22" strokeLinecap="round" />

            {/* Gastrocnemius / Soleus Diamond Contraction */}
            <g style={{
              animation: `calfRaiseMotion ${animDuration} ease-in-out infinite`,
              animationPlayState: playState
            }}>
              <path d="M 220 185 C 204 195, 204 210, 220 220 C 236 210, 236 195, 220 185 Z" fill="url(#purpleMuscle)" filter="url(#glowEffect)" className="animate-pulse" />
              <path d="M 220 220 L 248 210" stroke="url(#bodySkin)" strokeWidth="14" strokeLinecap="round" />
              <rect x="238" y="205" width="24" height="10" rx="3" fill="#1e293b" />
            </g>
            <text x="140" y="268" fill="#8b5cf6" fontSize="10" fontFamily="monospace" fontWeight="bold">MÁQUINA 08 · PANTORRILLAS</text>
          </svg>
        );

      // -------------------------------------------------------------
      // DÍA 5: BRAZOS (BÍCEPS + TRÍCEPS)
      // -------------------------------------------------------------
      case '5-1': // Copa con Mancuerna (Extensión Sobre Cabeza)
        return (
          <svg viewBox="0 0 440 280" className="w-full h-full">
            {renderCommonDefs()}
            {/* Seated Utility Bench with Lumbar Pad */}
            <rect x="165" y="90" width="22" height="110" rx="6" fill="url(#leatherUpholstery)" stroke="#52525b" strokeWidth="2" />

            {/* Seated Figure */}
            <circle cx="195" cy="85" r="17" fill="url(#bodySkin)" />
            <path d="M 195 100 L 195 185" stroke="url(#bodySkin)" strokeWidth="28" strokeLinecap="round" />

            {/* Vertical Upper Arm & Glowing Long Head Triceps */}
            <path d="M 195 105 L 195 55" stroke="url(#bodySkin)" strokeWidth="18" strokeLinecap="round" />
            <path d="M 188 100 L 188 60" stroke="url(#pinkMuscle)" strokeWidth="10" strokeLinecap="round" filter="url(#glowEffect)" className="animate-pulse" />

            {/* Two-Handed Hex Dumbbell Overhead */}
            <g style={{
              transformOrigin: '195px 55px',
              animation: `overheadTricepFlex ${animDuration} ease-in-out infinite`,
              animationPlayState: playState
            }}>
              <path d="M 195 55 L 160 95" stroke="url(#bodySkin)" strokeWidth="16" strokeLinecap="round" />
              <circle cx="160" cy="95" r="14" fill="url(#sfYellowAccent)" stroke="#000" strokeWidth="2.5" />
            </g>
            <text x="135" y="30" fill="#ec4899" fontSize="10" fontFamily="monospace" fontWeight="bold">PESO LIBRE · TRÍCEPS COPA</text>
          </svg>
        );

      case '5-2': // Bíceps Inclinado con Mancuerna (Banco 27 a 60°)
        return (
          <svg viewBox="0 0 440 280" className="w-full h-full">
            {renderCommonDefs()}
            {/* Incline 60° Bench 27 with Chrome Adjustment Pin */}
            <line x1="110" y1="70" x2="190" y2="195" stroke="url(#machineChassis)" strokeWidth="16" strokeLinecap="round" />
            <line x1="110" y1="70" x2="190" y2="195" stroke="url(#leatherUpholstery)" strokeWidth="12" strokeLinecap="round" />
            <rect x="175" y="195" width="70" height="18" rx="5" fill="url(#leatherUpholstery)" />
            <circle cx="190" cy="205" r="5" fill="url(#sfYellowAccent)" />

            {/* Reclined Athlete with Arms in Deep Stretch */}
            <circle cx="138" cy="65" r="17" fill="url(#bodySkin)" />
            <path d="M 146 80 L 195 180" stroke="url(#bodySkin)" strokeWidth="28" strokeLinecap="round" />

            <path d="M 158 95 L 145 155" stroke="url(#bodySkin)" strokeWidth="18" strokeLinecap="round" />
            <circle cx="152" cy="125" r="11" fill="url(#pinkMuscle)" filter="url(#glowEffect)" className="animate-pulse" />

            {/* Curling Forearm with Wrist Supination */}
            <g style={{
              transformOrigin: '145px 155px',
              animation: `inclineBicepCurl ${animDuration} ease-in-out infinite`,
              animationPlayState: playState
            }}>
              <path d="M 145 155 L 150 215" stroke="url(#bodySkin)" strokeWidth="16" strokeLinecap="round" />
              <circle cx="150" cy="215" r="13" fill="url(#sfYellowAccent)" stroke="#000" strokeWidth="2.5" />
            </g>
            <text x="135" y="35" fill="#ec4899" fontSize="10" fontFamily="monospace" fontWeight="bold">BANCO 27 · BÍCEPS INCLINADO</text>
          </svg>
        );

      case '5-3': // Tríceps Press en Polea (Área Gris)
        return (
          <svg viewBox="0 0 440 280" className="w-full h-full">
            {renderCommonDefs()}
            {/* Top Swivel Cable Pulley */}
            <circle cx="165" cy="25" r="14" fill="url(#steelBar)" stroke="#000" strokeWidth="2" />
            <circle cx="165" cy="25" r="5" fill="url(#sfYellowAccent)" />
            <line x1="165" y1="25" x2="208" y2="105" stroke="#cbd5e1" strokeWidth="3" strokeDasharray="3 3" />

            {/* Standing Posture */}
            <circle cx="245" cy="65" r="17" fill="url(#bodySkin)" />
            <path d="M 240 80 L 240 175" stroke="url(#bodySkin)" strokeWidth="28" strokeLinecap="round" />
            <path d="M 240 175 L 220 245" stroke="url(#bodySkin)" strokeWidth="20" strokeLinecap="round" />

            {/* Fixed Elbows & Glowing Lateral Triceps Horseshoe */}
            <path d="M 234 92 L 215 130" stroke="url(#bodySkin)" strokeWidth="18" strokeLinecap="round" />
            <path d="M 238 98 L 224 130" stroke="url(#pinkMuscle)" strokeWidth="9" strokeLinecap="round" filter="url(#glowEffect)" className="animate-pulse" />

            {/* Pushing Rope/Bar to Full Lockout */}
            <g style={{
              transformOrigin: '215px 130px',
              animation: `tricepPushdown ${animDuration} ease-in-out infinite`,
              animationPlayState: playState
            }}>
              <path d="M 215 130 L 180 160" stroke="url(#bodySkin)" strokeWidth="15" strokeLinecap="round" />
              {/* Rubber Rope Ends */}
              <circle cx="175" cy="165" r="8" fill="url(#sfYellowAccent)" stroke="#000" strokeWidth="2" />
            </g>
            <text x="145" y="265" fill="#ec4899" fontSize="10" fontFamily="monospace" fontWeight="bold">ÁREA GRIS · EXTENSIÓN TRÍCEPS</text>
          </svg>
        );

      case '5-4': // Bíceps Curl en Máquina (Máquina 52)
      default:
        return (
          <svg viewBox="0 0 440 280" className="w-full h-full">
            {renderCommonDefs()}
            {/* Ergonomic 45° Preacher Arm Support Pad */}
            <polygon points="175,115 245,155 220,195 150,155" fill="url(#leatherUpholstery)" stroke="#eab308" strokeWidth="2.5" />
            <rect x="105" y="160" width="50" height="16" rx="5" fill="url(#leatherUpholstery)" stroke="#52525b" />

            {/* Seated Figure with Arms on Pad */}
            <circle cx="125" cy="80" r="17" fill="url(#bodySkin)" />
            <path d="M 125 95 L 125 175" stroke="url(#bodySkin)" strokeWidth="28" strokeLinecap="round" />

            <path d="M 130 110 L 195 145" stroke="url(#bodySkin)" strokeWidth="20" strokeLinecap="round" />
            <circle cx="165" cy="128" r="12" fill="url(#pinkMuscle)" filter="url(#glowEffect)" className="animate-pulse" />

            {/* Rotating Lever Arm Handle */}
            <g style={{
              transformOrigin: '195px 145px',
              animation: `preacherCurl ${animDuration} ease-in-out infinite`,
              animationPlayState: playState
            }}>
              <path d="M 195 145 L 255 155" stroke="url(#bodySkin)" strokeWidth="16" strokeLinecap="round" />
              <circle cx="255" cy="155" r="12" fill="url(#sfYellowAccent)" stroke="#000" strokeWidth="2.5" />
            </g>
            <text x="145" y="45" fill="#ec4899" fontSize="10" fontFamily="monospace" fontWeight="bold">MÁQUINA 52 · PREDICADOR BÍCEPS</text>
          </svg>
        );
    }
  };

  return (
    <div className={`relative rounded-3xl bg-zinc-950 border border-zinc-800/90 overflow-hidden flex flex-col justify-between shadow-inner group ${compact ? 'p-2' : 'p-3'}`}>
      {/* Visual Phase & Tempo Header */}
      <div className="flex items-center justify-between gap-2 z-10">
        <div className="flex items-center gap-1.5">
          <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 border ${
            currentPhase === 'concentric' 
              ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40' 
              : currentPhase === 'peak'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
          }`}>
            {currentPhase === 'concentric' && <Zap size={11} />}
            {currentPhase === 'peak' && <Target size={11} />}
            {currentPhase === 'eccentric' && <ShieldCheck size={11} />}
            <span>
              {currentPhase === 'concentric' ? 'Fase Concéntrica (Empuje/Tracción)' : currentPhase === 'peak' ? 'Contracción Pico (1s)' : 'Fase Excéntrica (3s)'}
            </span>
          </span>

          <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded-md border border-zinc-800 hidden sm:inline-block">
            Tempo: {tempo}
          </span>
        </div>

        {/* Fullscreen Expand Action */}
        <div className="flex items-center gap-1">
          {onOpenFullModal && (
            <button
              onClick={onOpenFullModal}
              className="p-1.5 text-zinc-400 hover:text-white bg-zinc-900/80 rounded-xl border border-zinc-800 transition-colors"
              title="Expandir animación en pantalla completa"
            >
              <Maximize2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className={`w-full ${heightClass} flex items-center justify-center my-1 relative`}>
        {renderExerciseSVG()}

        {/* Machine & Muscle Badge Overlay */}
        <div className="absolute bottom-2 left-2 pointer-events-none">
          <span className="text-[10px] font-mono bg-black/85 backdrop-blur-md text-yellow-400 border border-yellow-500/30 px-2.5 py-0.5 rounded-md shadow-md">
            🎯 {muscleGroup} · {machine}
          </span>
        </div>
      </div>

      {/* Bottom Animation Controls & Timeline */}
      <div className="pt-2 border-t border-zinc-900 flex items-center justify-between gap-2 z-10">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-yellow-400 border border-zinc-800 transition-colors"
            title={isPlaying ? 'Pausar animación' : 'Reproducir animación'}
          >
            {isPlaying ? <Pause size={13} /> : <Play size={13} className="fill-current" />}
          </button>

          <button
            onClick={() => {
              const speeds = [0.5, 1, 1.5];
              const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
              setPlaybackSpeed(speeds[nextIdx]);
            }}
            className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-[10px] font-mono font-bold text-zinc-300 rounded-xl border border-zinc-800 flex items-center gap-1 transition-colors"
            title="Cambiar velocidad de reproducción"
          >
            <Gauge size={11} className="text-yellow-400" />
            <span>{playbackSpeed}x</span>
          </button>
        </div>

        {/* Phase Progress Bar */}
        <div className="flex-1 max-w-[120px] sm:max-w-[180px] bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-zinc-800">
          <div 
            className="bg-yellow-500 h-full rounded-full transition-all duration-75"
            style={{ width: `${phaseProgress}%` }}
          />
        </div>

        <span className="text-[10px] font-mono text-zinc-500">
          {isPlaying ? 'En bucle' : 'Pausado'}
        </span>
      </div>

      {/* Global CSS Keyframes for Synchronized Biomechanics */}
      <style>{`
        @keyframes weightStackLift {
          0%, 100% { transform: translateY(0); }
          35%, 50% { transform: translateY(-24px); }
        }
        @keyframes chestPressArm {
          0%, 100% { transform: rotate(0deg); }
          35%, 50% { transform: rotate(24deg); }
        }
        @keyframes chestPressHumanArm {
          0%, 100% { transform: translate(0, 0); }
          35%, 50% { transform: translate(38px, -5px); }
        }
        @keyframes flyLeftArm {
          0%, 100% { transform: rotate(0deg); }
          35%, 50% { transform: rotate(42deg); }
        }
        @keyframes flyRightArm {
          0%, 100% { transform: rotate(0deg); }
          35%, 50% { transform: rotate(-42deg); }
        }
        @keyframes cableCrossover {
          0%, 100% { transform: scale(1) translate(0, 0); }
          35%, 50% { transform: scale(0.95) translate(0, 18px); }
        }
        @keyframes abCrunchTorso {
          0%, 100% { transform: rotate(0deg); }
          35%, 50% { transform: rotate(26deg); }
        }
        @keyframes latPulldownBar {
          0%, 100% { transform: translateY(0); }
          35%, 50% { transform: translateY(48px); }
        }
        @keyframes latPulldownArms {
          0%, 100% { transform: translateY(0); }
          35%, 50% { transform: translateY(45px); }
        }
        @keyframes seatedRowPull {
          0%, 100% { transform: translateX(0); }
          35%, 50% { transform: translateX(-44px); }
        }
        @keyframes unilateralRow {
          0%, 100% { transform: translate(0, 0); }
          35%, 50% { transform: translate(16px, -48px); }
        }
        @keyframes pullupVertical {
          0%, 100% { transform: translateY(0); }
          35%, 50% { transform: translateY(-44px); }
        }
        @keyframes overheadPress {
          0%, 100% { transform: translateY(0); }
          35%, 50% { transform: translateY(-44px); }
        }
        @keyframes lateralRaiseLeft {
          0%, 100% { transform: rotate(0deg); }
          35%, 50% { transform: rotate(-38deg); }
        }
        @keyframes lateralRaiseRight {
          0%, 100% { transform: rotate(0deg); }
          35%, 50% { transform: rotate(38deg); }
        }
        @keyframes rearDeltLeft {
          0%, 100% { transform: rotate(0deg); }
          35%, 50% { transform: rotate(38deg); }
        }
        @keyframes rearDeltRight {
          0%, 100% { transform: rotate(0deg); }
          35%, 50% { transform: rotate(-38deg); }
        }
        @keyframes hackSquatMotion {
          0%, 100% { transform: translate(0, 0); }
          35%, 50% { transform: translate(48px, 48px); }
        }
        @keyframes legCurlRot {
          0%, 100% { transform: rotate(0deg); }
          35%, 50% { transform: rotate(-68deg); }
        }
        @keyframes legPressMotion {
          0%, 100% { transform: translate(0, 0); }
          35%, 50% { transform: translate(-38px, 28px); }
        }
        @keyframes hipThrustPelvis {
          0%, 100% { transform: rotate(-20deg); }
          35%, 50% { transform: rotate(0deg); }
        }
        @keyframes calfRaiseMotion {
          0%, 100% { transform: translateY(6px); }
          35%, 50% { transform: translateY(-14px); }
        }
        @keyframes overheadTricepFlex {
          0%, 100% { transform: rotate(0deg); }
          35%, 50% { transform: rotate(-60deg); }
        }
        @keyframes inclineBicepCurl {
          0%, 100% { transform: rotate(0deg); }
          35%, 50% { transform: rotate(-80deg); }
        }
        @keyframes tricepPushdown {
          0%, 100% { transform: rotate(0deg); }
          35%, 50% { transform: rotate(70deg); }
        }
        @keyframes preacherCurl {
          0%, 100% { transform: rotate(0deg); }
          35%, 50% { transform: rotate(-65deg); }
        }
      `}</style>
    </div>
  );
};
