// Conversion TypeScript du calculateur d'entropie de mot de passe

import { QeCharType, QePatternInstance, PatternID, PatternIDType } from './types';
import PopularPasswords from './PopularPasswords';

export class QualityEstimator {
  private static readonly charTypes: QeCharType[] = [
    { typeID: PatternID.LowerAlpha, alphabet: 'abcdefghijklmnopqrstuvwxyz', isConsecutive: true },
    { typeID: PatternID.UpperAlpha, alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', isConsecutive: true },
    { typeID: PatternID.Digit, alphabet: '0123456789', isConsecutive: true },
    { typeID: PatternID.Special, alphabet: ' !"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~', isConsecutive: false },
    { typeID: PatternID.High, alphabet: '', isConsecutive: false },
    { typeID: PatternID.Other, alphabet: '', isConsecutive: false }
  ];

  private static getCharType(char: string): QeCharType {
    for (const charType of this.charTypes) {
      if (charType.alphabet.includes(char)) {
        return charType;
      }
    }

    const charCode = char.charCodeAt(0);
    if (charCode >= 127) {
      return this.charTypes.find(ct => ct.typeID === PatternID.High)!;
    }

    return this.charTypes.find(ct => ct.typeID === PatternID.Other)!;
  }

  private static getAlphabetSize(typeID: PatternIDType): number {
    const charType = this.charTypes.find(ct => ct.typeID === typeID);
    if (!charType) return 0;

    switch (typeID) {
      case PatternID.LowerAlpha:
        return 26;
      case PatternID.UpperAlpha:
        return 26;
      case PatternID.Digit:
        return 10;
      case PatternID.Special:
        return 33;
      case PatternID.High:
        return 65536 - 127;
      case PatternID.Other:
        return 127 - 33;
      default:
        return charType.alphabet.length;
    }
  }

  private static findCharTypePatterns(password: string): QePatternInstance[] {
    const patterns: QePatternInstance[] = [];
    let i = 0;

    while (i < password.length) {
      const char = password[i];
      const charType = this.getCharType(char);
      let length = 1;

      // Étendre le motif aussi loin que possible
      while (i + length < password.length) {
        const nextChar = password[i + length];
        const nextCharType = this.getCharType(nextChar);
        if (nextCharType.typeID !== charType.typeID) break;
        length++;
      }

      const alphabetSize = this.getAlphabetSize(charType.typeID);
      const cost = length * Math.log2(alphabetSize);

      patterns.push({
        position: i,
        length: length,
        patternID: charType.typeID,
        cost: cost
      });

      i += length;
    }

    return patterns;
  }

  private static findDictPatterns(password: string): QePatternInstance[] {
    const patterns: QePatternInstance[] = [];

    for (let i = 0; i < password.length; i++) {
      for (let j = i + 1; j <= password.length; j++) {
        const substring = password.substring(i, j);
        if (PopularPasswords.isPopularPassword(substring)) {
          const dictSize = PopularPasswords.getDictSize(substring.length);
          const cost = Math.log2(dictSize);

          patterns.push({
            position: i,
            length: j - i,
            patternID: PatternID.Dictionary,
            cost: cost
          });
        }
      }
    }

    return patterns;
  }

  private static findRepetitionPatterns(password: string): QePatternInstance[] {
    const patterns: QePatternInstance[] = [];

    for (let i = 0; i < password.length; i++) {
      for (let patternLength = 1; patternLength <= (password.length - i) / 2; patternLength++) {
        const pattern = password.substring(i, i + patternLength);
        let repetitions = 1;
        let pos = i + patternLength;

        while (pos + patternLength <= password.length &&
               password.substring(pos, pos + patternLength) === pattern) {
          repetitions++;
          pos += patternLength;
        }

        if (repetitions > 1) {
          const totalLength = repetitions * patternLength;
          // Coût = log2(longueur du motif) + log2(nombre de répétitions)
          const cost = Math.log2(patternLength) + Math.log2(repetitions);

          patterns.push({
            position: i,
            length: totalLength,
            patternID: PatternID.Repetition,
            cost: cost
          });
        }
      }
    }

    return patterns;
  }

  private static findSequencePatterns(password: string): QePatternInstance[] {
    const patterns: QePatternInstance[] = [];

    for (let i = 0; i < password.length - 1; i++) {
      let length = 1;
      let direction = 0; // 0 = non défini, 1 = croissant, -1 = décroissant

      for (let j = i + 1; j < password.length; j++) {
        const nextCharCode = password.charCodeAt(j);
        const diff = nextCharCode - password.charCodeAt(j - 1);

        if (Math.abs(diff) !== 1) break;

        if (direction === 0) {
          direction = diff > 0 ? 1 : -1;
        } else if ((direction > 0 && diff < 0) || (direction < 0 && diff > 0)) {
          break;
        }

        length++;
      }

      if (length >= 3) {
        const cost = this.calculateSequenceCost(password[i], length);
        patterns.push({
          position: i,
          length: length,
          patternID: PatternID.DiffSeq,
          cost: cost
        });
      }
    }

    return patterns;
  }

  private static calculateSequenceCost(firstChar: string, length: number): number {
    const charType = this.getCharType(firstChar);
    const alphabetSize = this.getAlphabetSize(charType.typeID);
    return Math.log2(alphabetSize) + Math.log2(length);
  }

  private static findOptimalPath(password: string, patterns: QePatternInstance[]): QePatternInstance[] {
    const sortedPatterns = this.sortPatterns(patterns);
    const dp: { [position: number]: { cost: number; path: QePatternInstance[] } } = {};
    dp[0] = { cost: 0, path: [] };

    for (let pos = 0; pos < password.length; pos++) {
      if (!(pos in dp)) continue;

      this.processPatternOptions(pos, sortedPatterns, dp);
      this.processSingleCharOption(pos, password, dp);
    }

    return dp[password.length]?.path || [];
  }

  private static sortPatterns(patterns: QePatternInstance[]): QePatternInstance[] {
    return patterns.sort((a, b) => {
      if (a.position !== b.position) return a.position - b.position;
      return b.length - a.length;
    });
  }

  private static processPatternOptions(
    pos: number,
    patterns: QePatternInstance[],
    dp: { [position: number]: { cost: number; path: QePatternInstance[] } }
  ): void {
    for (const pattern of patterns) {
      if (pattern.position === pos) {
        const nextPos = pos + pattern.length;
        const newCost = dp[pos].cost + pattern.cost;

        if (!(nextPos in dp) || newCost < dp[nextPos].cost) {
          dp[nextPos] = {
            cost: newCost,
            path: [...dp[pos].path, pattern]
          };
        }
      }
    }
  }

  private static processSingleCharOption(
    pos: number,
    password: string,
    dp: { [position: number]: { cost: number; path: QePatternInstance[] } }
  ): void {
    if (pos < password.length) {
      const char = password[pos];
      const charType = this.getCharType(char);
      const alphabetSize = this.getAlphabetSize(charType.typeID);
      const charCost = Math.log2(alphabetSize);
      const nextPos = pos + 1;
      const newCost = dp[pos].cost + charCost;

      if (!(nextPos in dp) || newCost < dp[nextPos].cost) {
        const charPattern: QePatternInstance = {
          position: pos,
          length: 1,
          patternID: charType.typeID,
          cost: charCost
        };

        dp[nextPos] = {
          cost: newCost,
          path: [...dp[pos].path, charPattern]
        };
      }
    }
  }

  public static calculateEntropy(password: string): number {
    if (!password || password.length === 0) return 0;

    // Collecter tous les motifs possibles
    const charTypePatterns = this.findCharTypePatterns(password);
    const dictPatterns = this.findDictPatterns(password);
    const repetitionPatterns = this.findRepetitionPatterns(password);
    const sequencePatterns = this.findSequencePatterns(password);

    const allPatterns = [
      ...dictPatterns,      // Priorité aux dictionnaires (coût le plus bas)
      ...repetitionPatterns, // Puis répétitions
      ...sequencePatterns,   // Puis séquences
      ...charTypePatterns    // Enfin types de caractères
    ];

    // Trouver le chemin optimal
    const optimalPath = this.findOptimalPath(password, allPatterns);

    // Calculer l'entropie totale
    const totalEntropy = optimalPath.reduce((sum, pattern) => sum + pattern.cost, 0);

    return Math.max(0, totalEntropy);
  }
}

export default QualityEstimator;
