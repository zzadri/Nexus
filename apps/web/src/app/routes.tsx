import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/auth.store";

// Pages
import Landing from "../pages/Landing/Landing";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import Home from "../pages/Home/Home";

// Protection des routes
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, user, token, checkAuth } = useAuthStore();
  const [authChecked, setAuthChecked] = React.useState(false);
  const [authStatus, setAuthStatus] = React.useState<'checking'|'authenticated'|'unauthenticated'>('checking');

  console.log('🛡️ ProtectedRoute - Vérification accès route protégée:', {
    isAuthenticated,
    hasUser: !!user,
    hasToken: !!token,
    authChecked,
    authStatus
  });

  // Si on a un token et un user, considérer comme authentifié
  React.useEffect(() => {
    if (user && token) {
      // Ça devrait être suffisant pour considérer l'utilisateur comme authentifié
      if (!isAuthenticated) {
        console.log('🔄 ProtectedRoute - Correction de l\'état d\'authentification');
        useAuthStore.setState({ isAuthenticated: true });
      }

      if (authStatus !== 'authenticated') {
        setAuthStatus('authenticated');
      }
    }
  }, [isAuthenticated, user, token, authStatus]);

  // Vérification au chargement de la route
  React.useEffect(() => {
    const verifyAuth = async () => {
      if (!authChecked) {
        console.log('🔍 ProtectedRoute - Vérification initiale');

        // Si on a déjà les signes d'une authentification, accepter immédiatement
        if (user && token) {
          console.log('✅ ProtectedRoute - User et token présents, acceptation immédiate');
          setAuthStatus('authenticated');
          setAuthChecked(true);
          return;
        }

        try {
          // Sinon tenter une vérification API
          await checkAuth();
          const currentState = useAuthStore.getState();
          console.log('✅ ProtectedRoute - État après vérification API:', {
            isAuthenticated: currentState.isAuthenticated,
            hasUser: !!currentState.user,
            hasToken: !!currentState.token
          });

          if (currentState.user && currentState.token) {
            setAuthStatus('authenticated');
          } else {
            setAuthStatus('unauthenticated');
          }
        } catch (err) {
          console.error('❌ ProtectedRoute - Erreur lors de la vérification:', err);

          // Même en cas d'erreur, si on a user et token, continuer
          const currentState = useAuthStore.getState();
          if (currentState.user && currentState.token) {
            console.log('⚠️ ProtectedRoute - Erreur API mais user et token présents, acceptation');
            setAuthStatus('authenticated');
          } else {
            setAuthStatus('unauthenticated');
          }
        } finally {
          setAuthChecked(true);
        }
      }
    };

    verifyAuth();
  }, [checkAuth, authChecked, user, token]);

  // Si la vérification est en cours, afficher un état de chargement
  if (authStatus === 'checking' || !authChecked) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center">
        <div className="text-slate-300 mb-4">Vérification de l'authentification...</div>
        <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  // Une fois la vérification terminée
  if (authStatus === 'authenticated') {
    console.log('✅ ProtectedRoute - Accès autorisé à la route protégée');
    return <>{children}</>;
  } else {
    console.log('❌ ProtectedRoute - Redirection vers login (non authentifié)');
    return <Navigate to="/login" replace />;
  }
};

const PublicRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, user, token } = useAuthStore();
  const [redirectionChecked, setRedirectionChecked] = React.useState(false);

  console.log('🔓 PublicRoute - Vérification accès route publique:', {
    isAuthenticated,
    hasUser: !!user,
    hasToken: !!token
  });

  // On donne un petit délai pour que l'état d'authentification se stabilise
  React.useEffect(() => {
    if (!redirectionChecked) {
      const timer = setTimeout(() => {
        console.log('⏱️ PublicRoute - Vérification différée de l\'authentification:', {
          isAuthenticated: useAuthStore.getState().isAuthenticated,
          hasUser: !!useAuthStore.getState().user,
          hasToken: !!useAuthStore.getState().token
        });
        setRedirectionChecked(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [redirectionChecked]);

  // Si on attend la vérification, montrer le contenu public par défaut
  if (!redirectionChecked) {
    return <>{children}</>;
  }

  // Vérification cohérente : considérer comme authentifié si on a user et token
  const currentState = useAuthStore.getState();
  const shouldRedirect = currentState.isAuthenticated ||
    (!!currentState.user && !!currentState.token);

  return !shouldRedirect ? (
    <>
      {console.log('✅ PublicRoute - Accès autorisé à la route publique')}
      {children}
    </>
  ) : (
    <>
      {console.log('🔄 PublicRoute - Redirection vers la page d\'accueil (déjà authentifié)')}
      <Navigate to="/" replace />
    </>
  );
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Route d'accueil */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />

      {/* Routes publiques */}
      <Route
        path="/welcome"
        element={
          <PublicRoute>
            <Landing />
          </PublicRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Redirection par défaut */}
      <Route path="*" element={<Navigate to="/welcome" replace />} />
    </Routes>
  );
};
