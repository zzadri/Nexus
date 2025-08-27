import React, { useEffect } from "react";
import { ToastContainer } from 'react-toastify';
import { useCsrfStore } from "./store/csrf.store";
import { useAuthStore } from "./store/auth.store";
import { AppRoutes } from "./routes";
import 'react-toastify/dist/ReactToastify.css';

export default function App() {
  const fetchToken = useCsrfStore((s) => s.fetchToken);
  const { checkAuth, isAuthenticated, user, token } = useAuthStore();
  const [initialCheckDone, setInitialCheckDone] = React.useState(false);

  // Initialisation avec effet distinct pour contrôler l'ordre et éviter les race conditions
  useEffect(() => {

    const initialize = async () => {
      try {
        // D'abord récupérer le CSRF token
        await fetchToken();

        // Puis vérifier l'authentification
        await checkAuth();

        // Vérifier la cohérence de l'état après initialisation
        const currentState = useAuthStore.getState();
        if (currentState.token && currentState.user && !currentState.isAuthenticated) {
          useAuthStore.setState({ isAuthenticated: true });
        }
      } catch (error) {
        console.error('❌ App - Erreur lors de l\'initialisation:', error);
      } finally {
        setInitialCheckDone(true);
      }
    };

    initialize();
  }, []);

  // Log l'état d'authentification à chaque changement
  useEffect(() => {

    // Si on a les données mais que isAuthenticated est faux, corrigeons
    if (!isAuthenticated && user && token) {
      useAuthStore.setState({ isAuthenticated: true });
    }
  }, [isAuthenticated, user, token, initialCheckDone]);

  return (
    <>
      <AppRoutes />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </>
  );
}
