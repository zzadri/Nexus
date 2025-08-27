// Conversion TypeScript de PopularPasswords.js

interface PasswordDictionary {
  [length: number]: string[];
}

class PopularPasswords {
  private static dicts: PasswordDictionary = {};

  static getMaxLength(): number {
    let maxLen = 0;
    for (const length of Object.keys(this.dicts)) {
      const len = parseInt(length, 10);
      if (len > maxLen) maxLen = len;
    }
    return maxLen;
  }

  static containsLength(length: number): boolean {
    return length in this.dicts;
  }

  static isPopularPassword(password: string): boolean {
    if (!password) {
      throw new Error('Password cannot be null or undefined');
    }

    if (password.length === 0) {
      return false;
    }

    if (!(password.length in this.dicts)) {
      return false;
    }

    return this.dicts[password.length].includes(password);
  }

  static getDictSize(length: number): number {
    if (!(length in this.dicts)) {
      return 0;
    }
    return this.dicts[length].length;
  }

  static load(passwordList: string[]): void {
    for (const pw of passwordList) {
      if (pw.length in this.dicts) {
        this.dicts[pw.length].push(pw);
      } else {
        this.dicts[pw.length] = [pw];
      }
    }
  }

  static reset(): void {
    this.dicts = {};
  }
}

export default PopularPasswords;
