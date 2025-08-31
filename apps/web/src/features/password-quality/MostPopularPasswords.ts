// Conversion TypeScript de MostPopularPasswords.js

import PopularPasswords from './PopularPasswords';

// Fonction pour charger les mots de passe populaires depuis le fichier texte
export const loadMostPopularPasswords = async (): Promise<void> => {
  try {
    // En développement, on peut charger le fichier directement
    const response = await fetch('/password-quality/MostPopularPasswords.txt');
    const text = await response.text();

    const passwordList = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    PopularPasswords.load(passwordList);
  } catch (error) {
    console.warn('Could not load popular passwords file:', error);
    // Utiliser une liste minimale de mots de passe populaires
    const fallbackPasswords = [
      'password', '123456', '123456789', 'qwerty', 'abc123',
      'password1', 'admin', 'letmein', 'welcome', 'monkey',
      '1234567890', 'dragon', 'master', 'shadow', 'azerty'
    ];
    PopularPasswords.load(fallbackPasswords);
  }
};
