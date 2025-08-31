// Calculateur principal de qualité de mot de passe avec configuration

import { PasswordQualityResult, QualityConfig } from './types';
import QualityEstimator from './QualityEstimator';
import { loadMostPopularPasswords } from './MostPopularPasswords';

class PasswordQualityCalculator {
  private static isInitialized = false;
  private static config: QualityConfig;

  // Configuration par défaut, overridée par les variables d'environnement
  private static readonly defaultConfig: QualityConfig = {
    minEntropy: parseFloat(import.meta.env.VITE_PASSWORD_MIN_ENTROPY) || 40,
    weakThreshold: parseFloat(import.meta.env.VITE_PASSWORD_WEAK_THRESHOLD) || 25,
    fairThreshold: parseFloat(import.meta.env.VITE_PASSWORD_FAIR_THRESHOLD) || 35,
    goodThreshold: parseFloat(import.meta.env.VITE_PASSWORD_GOOD_THRESHOLD) || 50,
    strongThreshold: parseFloat(import.meta.env.VITE_PASSWORD_STRONG_THRESHOLD) || 70
  };

  public static async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Charger la configuration
    this.config = { ...this.defaultConfig };

    // Charger les mots de passe populaires
    await loadMostPopularPasswords();

    this.isInitialized = true;
  }

  public static calculateQuality(password: string): PasswordQualityResult {
    if (!this.isInitialized) {
      throw new Error('PasswordQualityCalculator must be initialized before use');
    }

    if (!password || password.length === 0) {
      return {
        entropy: 0,
        score: 0,
        strength: 'very-weak',
        feedback: ['Le mot de passe ne peut pas être vide']
      };
    }

    const entropy = QualityEstimator.calculateEntropy(password);
    const { score, strength } = this.getScoreAndStrength(entropy);
    const feedback = this.generateFeedback(password, entropy);

    return {
      entropy,
      score,
      strength,
      feedback
    };
  }

  private static getScoreAndStrength(entropy: number): { score: number; strength: PasswordQualityResult['strength'] } {
    if (entropy < this.config.weakThreshold) {
      return { score: 0, strength: 'very-weak' };
    } else if (entropy < this.config.fairThreshold) {
      return { score: 1, strength: 'weak' };
    } else if (entropy < this.config.goodThreshold) {
      return { score: 2, strength: 'fair' };
    } else if (entropy < this.config.strongThreshold) {
      return { score: 3, strength: 'good' };
    } else {
      return { score: 4, strength: 'strong' };
    }
  }

  private static generateFeedback(password: string, entropy: number): string[] {
    const feedback: string[] = [];

    // Vérifications de base
    if (password.length < 8) {
      feedback.push('Utilisez au moins 8 caractères');
    }

    if (entropy < this.config.minEntropy) {
      feedback.push(`Entropie insuffisante (${entropy.toFixed(1)} bits, minimum requis: ${this.config.minEntropy})`);
    }

    // Vérifications de motifs
    if (!/[a-z]/.test(password)) {
      feedback.push('Ajoutez des lettres minuscules');
    }

    if (!/[A-Z]/.test(password)) {
      feedback.push('Ajoutez des lettres majuscules');
    }

    if (!/\d/.test(password)) {
      feedback.push('Ajoutez des chiffres');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      feedback.push('Ajoutez des caractères spéciaux');
    }

    // Vérification de répétitions
    if (this.hasRepeatingChars(password)) {
      feedback.push('Évitez les caractères répétés');
    }

    // Vérification de séquences
    if (this.hasSequences(password)) {
      feedback.push('Évitez les séquences de caractères (123, abc, etc.)');
    }

    if (feedback.length === 0) {
      feedback.push('Excellent mot de passe !');
    }

    return feedback;
  }

  private static hasRepeatingChars(password: string): boolean {
    for (let i = 0; i < password.length - 2; i++) {
      if (password[i] === password[i + 1] && password[i + 1] === password[i + 2]) {
        return true;
      }
    }
    return false;
  }

  private static hasSequences(password: string): boolean {
    for (let i = 0; i < password.length - 2; i++) {
      const char1 = password.charCodeAt(i);
      const char2 = password.charCodeAt(i + 1);
      const char3 = password.charCodeAt(i + 2);

      if ((char2 === char1 + 1 && char3 === char2 + 1) ||
          (char2 === char1 - 1 && char3 === char2 - 1)) {
        return true;
      }
    }
    return false;
  }

  public static getConfig(): QualityConfig {
    return { ...this.config };
  }

  public static updateConfig(newConfig: Partial<QualityConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

export default PasswordQualityCalculator;
