import React, { useEffect } from "react";
import { ToastContainer } from 'react-toastify';
import { useCsrfStore } from "./store/csrf.store";
import { useAuthStore } from "./store/auth.store";
import { AppRoutes } from "./routes";
import 'react-toastify/dist/ReactToastify.css';

export default function App() {
  const fetchToken = useCsrfStore((s) => s.fetchToken);
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    fetchToken(); // récup CSRF au démarrage
    checkAuth(); // vérifier l'authentification au démarrage
  }, [fetchToken, checkAuth]);

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
