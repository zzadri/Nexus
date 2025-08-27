import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaGithub, FaGoogle, FaChevronLeft } from "react-icons/fa";
import { useAuthStore } from "../../app/store/auth.store";
import { CsrfError } from "../../shared/ui/CsrfError";
import { ApiError } from "../../features/auth/api";
import { useCsrfToken } from "../../features/auth/useCsrfToken";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [csrfError, setCsrfError] = useState(false);

  const { login, loading, isAuthenticated } = useAuthStore();
  const { csrfToken, isLoading: isCsrfLoading, refreshToken } = useCsrfToken();
  const navigate = useNavigate();

  // Rediriger si déjà connecté
  // Rediriger si déjà connecté
  useEffect(() => {
    console.log('🔄 Login - État d\'authentification changé:', { isAuthenticated });
    if (isAuthenticated) {
      console.log('📲 Login - Redirection vers home');
      // Forcer la redirection vers la page d'accueil
      setTimeout(() => {
        console.log('⏱️ Login - Redirection forcée après délai');
        navigate("/home", { replace: true });
      }, 100);
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔄 Login - Tentative de soumission du formulaire');

    if (!email || !password || !csrfToken) {
      console.warn('❌ Login - Données de formulaire incomplètes:', {
        hasEmail: !!email,
        hasPassword: !!password,
        hasCsrfToken: !!csrfToken
      });
      return;
    }

    try {
      setCsrfError(false);
      console.log('🔄 Login - Appel à la fonction login du store');
      const success = await login({ email, password, csrfToken });
      console.log('📊 Login - Résultat de la tentative de connexion:', { success });

      // Vérifier l'état d'authentification après la connexion
      const currentState = useAuthStore.getState();
      console.log('🔍 Login - État actuel après tentative:', {
        isAuthenticated: currentState.isAuthenticated,
        hasUser: !!currentState.user,
        hasToken: !!currentState.token
      });

      if (success) {
        console.log('📲 Login - Tentative de redirection manuelle vers la page d\'accueil');
        setTimeout(() => {
          console.log('⏱️ Login - Forçage de la redirection après délai');
          window.location.href = '/'; // Redirection forcée en dernier recours
        }, 300);
      }
    } catch (err) {
      console.error('❌ Login - Erreur lors de la tentative de connexion:', err);

      if (err instanceof ApiError && err.status === 403) {
        setCsrfError(true);
        console.log('🔄 Login - Tentative de rafraîchissement du token CSRF après erreur 403');
        await refreshToken();
      }
    }
  };

  const handleRetryWithCsrf = async () => {
    setCsrfError(false);
    // Rafraîchir le token CSRF avant de réessayer
    await refreshToken();
    handleSubmit(new Event('submit') as any);
  };

  return (
    <main className="bg-slate-900 text-slate-100 min-h-screen flex items-center justify-center py-2 sm:py-4 lg:py-8" style={{scrollBehavior: 'smooth'}}>
      {/* Background similar to landing */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-indigo-900/70 to-slate-900"></div>
      <div className="hidden md:block absolute inset-0" style={{
        background: 'linear-gradient(180deg, rgb(15 23 42) 0%, rgba(30 58 138, 0.6) 25%, rgba(88 28 135, 0.2) 50%, rgba(15 23 42, 0.8) 75%, rgb(15 23 42) 100%)',
        height: '100vh'
      }}></div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(60rem 30rem at 20% 15%, rgba(59,130,246,.10) 0%, transparent 60%),
            radial-gradient(60rem 30rem at 80% 70%, rgba(147,51,234,.10) 0%, transparent 60%)
          `,
        }}
      />

      <div className="relative z-10 w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Header */}
        <div className="text-center mb-3 sm:mb-4 lg:mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-1">
            Connectez-vous
          </h1>
        </div>

        {/* Login Card with Two Columns Layout */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-3 sm:p-4 md:p-6 lg:p-8 shadow-2xl">
          {/* Back to home */}
          <div className="mb-3 sm:mb-4 lg:mb-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors text-sm"
            >
              <FaChevronLeft className="text-xs" />
              Retour à l'accueil
            </Link>
          </div>

          {/* Two Columns Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-12">
            {/* Left Column - Main Form */}
            <div className="space-y-3 sm:space-y-4 lg:space-y-6">
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 lg:space-y-6">
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors outline-none text-sm"
                    placeholder="votre@email.com"
                    required
                    disabled={loading}
                  />
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium mb-1">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 pr-10 bg-slate-700/50 border border-slate-600 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors outline-none text-sm"
                      placeholder="••••••••"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                      disabled={loading}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                {/* Forgot Password */}
                <div className="text-right">
                  <Link to="/forgot-password" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                    Mot de passe oublié ?
                  </Link>
                </div>

                {/* CSRF Token - Hidden Input */}
                <input
                  type="hidden"
                  name="csrfToken"
                  value={csrfToken || ""}
                />

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:from-blue-600/50 disabled:to-blue-500/50 font-semibold py-2.5 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-blue-500/25 text-sm"
                >
                  {loading ? "Connexion..." : "Se connecter"}
                </button>
              </form>

              {/* CSRF Error Display */}
              {csrfError && (
                <div className="mt-4">
                  <CsrfError onRetry={handleRetryWithCsrf} loading={loading} />
                </div>
              )}
            </div>

            {/* Right Column - Social Login with Separator */}
            <div className="flex flex-col justify-center">
              {/* Horizontal Divider for mobile */}
              <div className="lg:hidden my-3 sm:my-4 flex items-center">
                <div className="flex-1 border-t border-slate-600"></div>
                <span className="px-3 text-xs text-slate-400">ou</span>
                <div className="flex-1 border-t border-slate-600"></div>
              </div>

              {/* Content container for desktop */}
              <div className="hidden lg:flex items-center h-full">
                {/* Vertical Separator */}
                <div className="flex flex-col items-center justify-center h-full mr-8">
                  <div className="h-20 w-px bg-slate-600"></div>
                  <span className="text-slate-400 text-sm py-3">ou</span>
                  <div className="h-20 w-px bg-slate-600"></div>
                </div>

                {/* Social Login Options */}
                <div className="flex-1 space-y-2">
                  <button className="w-full flex items-center justify-center gap-3 px-3 py-2.5 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 hover:border-slate-500 rounded-xl transition-colors text-xs">
                    <FaGoogle className="text-red-400" />
                    Continuer avec Google
                  </button>
                  <button className="w-full flex items-center justify-center gap-3 px-3 py-2.5 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 hover:border-slate-500 rounded-xl transition-colors text-xs">
                    <FaGithub className="text-slate-300" />
                    Continuer avec GitHub
                  </button>
                </div>
              </div>

              {/* Social Login Options for mobile */}
              <div className="lg:hidden space-y-2">
                <button className="w-full flex items-center justify-center gap-3 px-3 py-2.5 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 hover:border-slate-500 rounded-xl transition-colors text-sm">
                  <FaGoogle className="text-red-400" />
                  Continuer avec Google
                </button>
                <button className="w-full flex items-center justify-center gap-3 px-3 py-2.5 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 hover:border-slate-500 rounded-xl transition-colors text-sm">
                  <FaGithub className="text-slate-300" />
                  Continuer avec GitHub
                </button>
              </div>
            </div>
          </div>

        {/* Register Link */}
        <div className="mt-3 sm:mt-4 lg:mt-6 text-center">
          <p className="text-slate-400 text-xs sm:text-sm">
            Pas encore de compte ?{" "}
            <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Créer un compte
            </Link>
          </p>
        </div>
        </div>
      </div>
    </main>
  );
};

export default Login;
