import { toast, type ToastOptions } from 'react-toastify';

// Configuration par défaut des toasts
const defaultOptions: ToastOptions = {
  position: "top-right",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "dark",
};

export const showToast = {
  success: (message: string, options?: ToastOptions) => {
    toast.success(message, { ...defaultOptions, ...options });
  },

  error: (message: string, options?: ToastOptions) => {
    toast.error(message, { ...defaultOptions, ...options });
  },

  warning: (message: string, options?: ToastOptions) => {
    toast.warning(message, { ...defaultOptions, ...options });
  },

  info: (message: string, options?: ToastOptions) => {
    toast.info(message, { ...defaultOptions, ...options });
  },
};

// Messages d'erreur génériques pour éviter d'exposer les détails techniques
export const errorMessages = {
  // Erreurs d'authentification
  auth: {
    loginFailed: "Échec de la connexion. Vérifiez vos identifiants.",
    registerFailed: "Erreur lors de la création du compte. Veuillez réessayer.",
    invalidCredentials: "Email ou mot de passe incorrect.",
    accountExists: "Un compte existe déjà avec cet email.",
    networkError: "Erreur de connexion au serveur. Vérifiez votre connexion internet.",
    serverError: "Erreur temporaire du serveur. Veuillez réessayer dans quelques instants.",
    validationError: "Les données saisies ne sont pas valides.",
    sessionExpired: "Votre session a expiré. Veuillez vous reconnecter.",
  },

  // Erreurs générales
  general: {
    unknownError: "Une erreur inattendue s'est produite. Veuillez réessayer.",
    networkTimeout: "La requête a pris trop de temps. Vérifiez votre connexion.",
    forbidden: "Vous n'avez pas l'autorisation d'effectuer cette action.",
    notFound: "La ressource demandée n'a pas été trouvée.",
  }
};

// Fonction pour mapper les erreurs API vers des messages utilisateur
export const getErrorMessage = (error: any): string => {
  // Si c'est une erreur réseau
  if (error.name === 'NetworkError' || error.code === 'NETWORK_ERROR') {
    return errorMessages.auth.networkError;
  }

  // Si c'est une erreur de base de données (comme dans votre log)
  if (error.message?.includes('database server') || error.message?.includes('localhost:5432')) {
    return errorMessages.auth.serverError;
  }

  // Selon le status code HTTP
  if (error.status) {
    switch (error.status) {
      case 400:
        if (error.data?.message?.includes('required property')) {
          return errorMessages.auth.validationError;
        }
        return errorMessages.auth.validationError;
      case 401:
        return errorMessages.auth.invalidCredentials;
      case 403:
        return errorMessages.general.forbidden;
      case 404:
        return errorMessages.general.notFound;
      case 409:
        return errorMessages.auth.accountExists;
      case 500:
        return errorMessages.auth.serverError;
      case 503:
        return errorMessages.auth.serverError;
      default:
        return errorMessages.general.unknownError;
    }
  }

  // Messages spécifiques selon le contenu de l'erreur
  if (error.data?.message) {
    const message = error.data.message.toLowerCase();

    if (message.includes('email') && message.includes('already')) {
      return errorMessages.auth.accountExists;
    }

    if (message.includes('password') || message.includes('credential')) {
      return errorMessages.auth.invalidCredentials;
    }

    if (message.includes('validation') || message.includes('required')) {
      return errorMessages.auth.validationError;
    }
  }

  // Par défaut, retourner un message générique
  return errorMessages.general.unknownError;
};
