// Nouveau système de validation utilisant le calcul d'entropie

import PasswordQualityCalculator from '../features/password-quality/PasswordQualityCalculator';

// Initialiser le calculateur de qualité au démarrage
let isInitialized = false;

const initializePasswordQuality = async (): Promise<void> => {
  if (!isInitialized) {
    await PasswordQualityCalculator.initialize();
    isInitialized = true;
  }
};

export interface PasswordValidation {
  isValid: boolean;
  score: number; // 0-4
  feedback: string[];
  entropy?: number;
  strength?: string;
}

export const validatePasswordWithEntropy = async (password: string): Promise<PasswordValidation> => {
  await initializePasswordQuality();

  if (!password) {
    return {
      isValid: false,
      score: 0,
      feedback: ['Le mot de passe ne peut pas être vide']
    };
  }

  const qualityResult = PasswordQualityCalculator.calculateQuality(password);
  const config = PasswordQualityCalculator.getConfig();

  return {
    isValid: qualityResult.entropy >= config.minEntropy && password.length >= 8,
    score: qualityResult.score,
    feedback: qualityResult.feedback,
    entropy: qualityResult.entropy,
    strength: qualityResult.strength
  };
};

// Fonction de compatibilité avec l'ancien système (simplifié pour comparaison)
export const validatePassword = (password: string): PasswordValidation => {
  const feedback: string[] = [];
  let score = 0;

  // Longueur minimale
  if (password.length < 8) {
    feedback.push("Le mot de passe doit contenir au moins 8 caractères");
  } else {
    score += 1;
  }

  // Lettres minuscules
  if (!/[a-z]/.test(password)) {
    feedback.push("Le mot de passe doit contenir au moins une lettre minuscule");
  } else {
    score += 1;
  }

  // Lettres majuscules
  if (!/[A-Z]/.test(password)) {
    feedback.push("Le mot de passe doit contenir au moins une lettre majuscule");
  } else {
    score += 1;
  }

  // Chiffres
  if (!/\d/.test(password)) {
    feedback.push("Le mot de passe doit contenir au moins un chiffre");
  } else {
    score += 1;
  }

  // Caractères spéciaux
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    feedback.push("Le mot de passe doit contenir au moins un caractère spécial");
  } else {
    score += 1;
  }

  // Longueur recommandée
  if (password.length >= 12) {
    score += 1;
  }

  return {
    isValid: feedback.length === 0 && password.length >= 8,
    score: Math.min(score, 4),
    feedback
  };
};

export const getPasswordStrengthColor = (score: number): string => {
  switch (score) {
    case 0:
    case 1:
      return "text-red-400";
    case 2:
      return "text-orange-400";
    case 3:
      return "text-yellow-400";
    case 4:
      return "text-green-400";
    default:
      return "text-slate-400";
  }
};

export const getPasswordStrengthText = (score: number): string => {
  switch (score) {
    case 0:
    case 1:
      return "Très faible";
    case 2:
      return "Faible";
    case 3:
      return "Moyen";
    case 4:
      return "Fort";
    default:
      return "";
  }
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateName = (name: string): boolean => {
  return name.trim().length >= 2 && /^[a-zA-ZÀ-ÿ\s-']+$/.test(name);
};
