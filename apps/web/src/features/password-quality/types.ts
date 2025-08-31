// Types pour la bibliothèque de calcul de qualité de mot de passe

export interface PasswordQualityResult {
  entropy: number;
  score: number; // 0-4 pour compatibilité avec notre UI
  strength: 'very-weak' | 'weak' | 'fair' | 'good' | 'strong';
  feedback: string[];
}

export interface QualityConfig {
  minEntropy: number;
  weakThreshold: number;
  fairThreshold: number;
  goodThreshold: number;
  strongThreshold: number;
}

export const PatternID = {
  LowerAlpha: 'L',
  UpperAlpha: 'U',
  Digit: 'D',
  Special: 'S',
  High: 'H',
  Other: 'X',
  Dictionary: 'W',
  Repetition: 'R',
  Number: 'N',
  DiffSeq: 'C',
  All: "LUDSHXWRNC"
} as const;

export type PatternIDType = typeof PatternID[keyof typeof PatternID];

export interface QePatternInstance {
  position: number;
  length: number;
  patternID: PatternIDType;
  cost: number;
}

export interface QePathState {
  position: number;
  path: QePatternInstance[];
}

export interface QeCharType {
  typeID: PatternIDType;
  alphabet: string;
  isConsecutive: boolean;
}

export interface EntropyEncoderConfig {
  alphabet: string;
  baseWeight: number;
  charWeight: number;
  occExclThreshold: number;
}
