import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    FaEye,
    FaEyeSlash,
    FaGithub,
    FaGoogle,
    FaChevronLeft,
    FaCheck
} from "react-icons/fa";
import { useAuthStore } from "../../app/store/auth.store";
import { PasswordStrengthIndicatorWithEntropy } from "../../shared/ui/PasswordStrengthIndicatorWithEntropy";
import { validateEmail, validateName } from "../../utils/validation";
import { CsrfError } from "../../shared/ui/CsrfError";
import { ApiError } from "../../features/auth/api";
import type { PasswordValidation } from "../../utils/validation-entropy";
import { useCsrfToken } from "../../features/auth/useCsrfToken";

const Register: React.FC = () => {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [showPasswordStrength, setShowPasswordStrength] = useState(false);
    const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
    const [passwordQuality, setPasswordQuality] = useState<PasswordValidation | null>(null);
    const [csrfError, setCsrfError] = useState(false);

    const { register, loading, isAuthenticated } = useAuthStore();
    const { csrfToken, isLoading: isCsrfLoading, refreshToken } = useCsrfToken();
    const navigate = useNavigate();

    // Rediriger si déjà connecté
    useEffect(() => {
        if (isAuthenticated) {
            // Forcer la redirection vers le feed
            setTimeout(() => {
                navigate("/feed", { replace: true });
            }, 100);
        }
    }, [isAuthenticated, navigate]);

    const validateField = (name: string, value: string) => {
        const newErrors = { ...validationErrors };

        switch (name) {
            case 'username':
                if (value && !validateName(value)) {
                    newErrors.username = "Le nom d'utilisateur doit contenir au moins 2 caractères et seulement des lettres";
                } else {
                    delete newErrors.username;
                }
                break;
            case 'email':
                if (value && !validateEmail(value)) {
                    newErrors.email = "Veuillez entrer une adresse email valide";
                } else {
                    delete newErrors.email;
                }
                break;
            case 'password':
                // La validation de mot de passe se fait via le composant PasswordStrengthIndicatorWithEntropy
                if (value && passwordQuality && passwordQuality.score < 2) {
                    newErrors.password = "Le mot de passe ne respecte pas les critères de sécurité";
                } else {
                    delete newErrors.password;
                }
                setShowPasswordStrength(value.length > 0);
                break;
            case 'confirmPassword':
                if (value && value !== formData.password) {
                    newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
                } else {
                    delete newErrors.confirmPassword;
                }
                break;
        }

        setValidationErrors(newErrors);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

        // Validation en temps réel
        validateField(name, value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation complète avant soumission
        const errors: {[key: string]: string} = {};

        if (!validateName(formData.username)) {
            errors.username = "Le nom d'utilisateur doit contenir au moins 2 caractères et seulement des lettres";
        }

        if (!validateEmail(formData.email)) {
            errors.email = "Veuillez entrer une adresse email valide";
        }

        // Validation du mot de passe basée sur l'entropie
        if (!passwordQuality || passwordQuality.score < 2) {
            errors.password = "Le mot de passe ne respecte pas les critères de sécurité";
        }

        if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = "Les mots de passe ne correspondent pas";
        }

        if (!acceptTerms) {
            errors.terms = "Vous devez accepter les conditions d'utilisation";
        }

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        try {
            setCsrfError(false);
            if (!csrfToken) {
                setCsrfError(true);
                await refreshToken();
                return;
            }

            const success = await register({
                displayName: formData.username,
                email: formData.email,
                password: formData.password,
                confirmPassword: formData.confirmPassword,
                csrfToken: csrfToken,
            });

            if (success) {
                navigate("/feed");
            }
        } catch (err) {
            if (err instanceof ApiError && err.status === 403) {
                setCsrfError(true);
                // Essayer de rafraîchir le token CSRF
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

    const passwordsMatch =
        formData.password &&
        formData.confirmPassword &&
        formData.password === formData.confirmPassword;

    return (
        <main
            className="bg-slate-900 text-slate-100 min-h-screen flex items-center justify-center py-2 sm:py-4 lg:py-8"
            style={{ scrollBehavior: "smooth" }}
        >
            {/* Background similar to landing */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-indigo-900/70 to-slate-900"></div>
            <div
                className="hidden md:block absolute inset-0"
                style={{
                    background:
                        "linear-gradient(180deg, rgb(15 23 42) 0%, rgba(30 58 138, 0.6) 25%, rgba(88 28 135, 0.2) 50%, rgba(15 23 42, 0.8) 75%, rgb(15 23 42) 100%)",
                    height: "100vh"
                }}
            ></div>

            <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                    backgroundImage: `
            radial-gradient(60rem 30rem at 20% 15%, rgba(59,130,246,.10) 0%, transparent 60%),
            radial-gradient(60rem 30rem at 80% 70%, rgba(147,51,234,.10) 0%, transparent 60%)
          `
                }}
            />

            <div className="relative z-10 w-full max-w-5xl px-4 sm:px-6">
                {/* Header */}
                <div className="text-center mb-3 sm:mb-4 lg:mb-5">
                    <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-1">
                        Créez votre compte
                    </h1>
                </div>

                {/* Register Card with Two Columns Layout */}
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-3 sm:p-4 md:p-6 lg:p-8 shadow-2xl">
                    {/* Back to home */}
                    <div className="mb-4">
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors text-sm"
                        >
                            <FaChevronLeft className="text-xs" />
                            Retour à l'accueil
                        </Link>
                    </div>

                    {/* Two Columns Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
                        {/* Left Column - Main Form (takes 2/3 of space) */}
                        <div className="lg:col-span-2">
                            <form
                                onSubmit={handleSubmit}
                                className="space-y-3 sm:space-y-4 lg:space-y-5"
                            >
                                {/* Username and Email Fields */}
                                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                    <div>
                                        <label
                                            htmlFor="username"
                                            className="block text-sm font-medium mb-1 sm:mb-2"
                                        >
                                            Nom d'utilisateur
                                        </label>
                                        <input
                                            id="username"
                                            name="username"
                                            type="text"
                                            value={formData.username}
                                            onChange={handleChange}
                                            className={`w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700/50 border rounded-xl focus:ring-2 transition-colors outline-none text-sm sm:text-base ${
                                                validationErrors.username
                                                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                                                    : "border-slate-600 focus:border-blue-500 focus:ring-blue-500/20"
                                            }`}
                                            placeholder="johndoe"
                                            required
                                            disabled={loading}
                                        />
                                        {validationErrors.username && (
                                            <p className="mt-1 text-red-400 text-xs">{validationErrors.username}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="email"
                                            className="block text-sm font-medium mb-1 sm:mb-2"
                                        >
                                            Email
                                        </label>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className={`w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700/50 border rounded-xl focus:ring-2 transition-colors outline-none text-sm sm:text-base ${
                                                validationErrors.email
                                                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                                                    : "border-slate-600 focus:border-blue-500 focus:ring-blue-500/20"
                                            }`}
                                            placeholder="votre@email.com"
                                            required
                                            disabled={loading}
                                        />
                                        {validationErrors.email && (
                                            <p className="mt-1 text-red-400 text-xs">{validationErrors.email}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Password Field */}
                                <div>
                                    <label
                                        htmlFor="password"
                                        className="block text-sm font-medium mb-1 sm:mb-2"
                                    >
                                        Mot de passe
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            value={formData.password}
                                            onChange={handleChange}
                                            className={`w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 sm:pr-12 bg-slate-700/50 border rounded-xl focus:ring-2 transition-colors outline-none text-sm sm:text-base ${
                                                validationErrors.password
                                                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                                                    : "border-slate-600 focus:border-blue-500 focus:ring-blue-500/20"
                                            }`}
                                            placeholder="••••••••"
                                            required
                                            disabled={loading}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                                            disabled={loading}
                                        >
                                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                    {validationErrors.password && (
                                        <p className="mt-1 text-red-400 text-xs">{validationErrors.password}</p>
                                    )}
                                    <PasswordStrengthIndicatorWithEntropy
                                        password={formData.password}
                                        show={showPasswordStrength}
                                        onQualityChange={setPasswordQuality}
                                    />
                                </div>

                                {/* Confirm Password Field */}
                                <div>
                                    <label
                                        htmlFor="confirmPassword"
                                        className="block text-sm font-medium mb-2"
                                    >
                                        Confirmer le mot de passe
                                    </label>
                                    <div className="relative">
                                        {(() => {
                                            let borderClass = "border-slate-600 focus:border-blue-500 focus:ring-blue-500/20";

                                            if (formData.confirmPassword && passwordsMatch) {
                                                borderClass = "border-green-500 focus:border-green-500 focus:ring-green-500/20";
                                            } else if (formData.confirmPassword && !passwordsMatch) {
                                                borderClass = "border-red-500 focus:border-red-500 focus:ring-red-500/20";
                                            }

                                            return (
                                                <input
                                                    id="confirmPassword"
                                                    name="confirmPassword"
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    value={formData.confirmPassword}
                                                    onChange={handleChange}
                                                    className={`w-full px-4 py-3 pr-12 bg-slate-700/50 border rounded-xl focus:ring-2 transition-colors outline-none ${borderClass}`}
                                                    placeholder="••••••••"
                                                    required
                                                    disabled={loading}
                                                />
                                            );
                                        })()}
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                            {formData.confirmPassword && passwordsMatch && (
                                                <FaCheck className="text-green-400 text-sm" />
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="text-slate-400 hover:text-slate-300 transition-colors"
                                                disabled={loading}
                                            >
                                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Terms and Conditions */}
                                <div className="flex items-start gap-3">
                                    <input
                                        id="acceptTerms"
                                        type="checkbox"
                                        checked={acceptTerms}
                                        onChange={(e) => setAcceptTerms(e.target.checked)}
                                        className="mt-1 w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500/20 focus:ring-2"
                                        required
                                        disabled={loading}
                                    />
                                    <label
                                        htmlFor="acceptTerms"
                                        className="text-sm text-slate-400"
                                    >
                                        J'accepte les{" "}
                                        <Link
                                            to="/terms"
                                            className="text-blue-400 hover:text-blue-300 transition-colors"
                                        >
                                            conditions d'utilisation
                                        </Link>{" "}
                                        et la{" "}
                                        <Link
                                            to="/privacy"
                                            className="text-blue-400 hover:text-blue-300 transition-colors"
                                        >
                                            politique de confidentialité
                                        </Link>
                                    </label>
                                </div>
                                {validationErrors.terms && (
                                    <p className="text-red-400 text-xs">{validationErrors.terms}</p>
                                )}

                                {/* CSRF Token - Hidden Input */}
                                <input
                                    type="hidden"
                                    name="csrfToken"
                                    value={csrfToken || ""}
                                />

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading || !acceptTerms}
                                    className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:from-blue-600/50 disabled:to-blue-500/50 font-semibold py-2 sm:py-2.5 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-blue-500/25 text-sm sm:text-base"
                                >
                                    {loading ? "Création du compte..." : "Créer mon compte"}
                                </button>
                            </form>

                            {/* CSRF Error Display */}
                            {csrfError && (
                                <div className="mt-4">
                                    <CsrfError onRetry={handleRetryWithCsrf} loading={loading} />
                                </div>
                            )}
                        </div>

                        {/* Right Column - Social Login & Separator (1/3 of space) */}
                        <div className="flex flex-col justify-center">
                            {/* Horizontal Divider for mobile */}
                            <div className="lg:hidden my-4 sm:my-6 flex items-center">
                                <div className="flex-1 border-t border-slate-600"></div>
                                <span className="px-3 sm:px-4 text-xs sm:text-sm text-slate-400">
                                    ou
                                </span>
                                <div className="flex-1 border-t border-slate-600"></div>
                            </div>

                            {/* Content container for desktop */}
                            <div className="hidden lg:flex items-center h-full">
                                {/* Vertical Separator */}
                                <div className="flex flex-col items-center justify-center h-full mr-6">
                                    <div className="h-32 w-px bg-slate-600"></div>
                                    <span className="text-slate-400 text-sm py-3">
                                        ou
                                    </span>
                                    <div className="h-32 w-px bg-slate-600"></div>
                                </div>

                                {/* Social Login Options */}
                                <div className="flex-1 space-y-3">
                                    <button
                                        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 hover:border-slate-500 rounded-xl transition-colors text-sm"
                                        disabled={loading}
                                    >
                                        <FaGoogle className="text-red-400" />
                                        Continuer avec Google
                                    </button>
                                    <button
                                        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 hover:border-slate-500 rounded-xl transition-colors text-sm"
                                        disabled={loading}
                                    >
                                        <FaGithub className="text-slate-300" />
                                        Continuer avec GitHub
                                    </button>
                                </div>
                            </div>

                            {/* Social Login Options for mobile */}
                            <div className="lg:hidden space-y-3">
                                <button
                                    className="w-full flex items-center justify-center gap-3 px-3 sm:px-4 py-3 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 hover:border-slate-500 rounded-xl transition-colors text-sm sm:text-base"
                                    disabled={loading}
                                >
                                    <FaGoogle className="text-red-400" />
                                    Continuer avec Google
                                </button>
                                <button
                                    className="w-full flex items-center justify-center gap-3 px-3 sm:px-4 py-3 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 hover:border-slate-500 rounded-xl transition-colors text-sm sm:text-base"
                                    disabled={loading}
                                >
                                    <FaGithub className="text-slate-300" />
                                    Continuer avec GitHub
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Login Link */}
                    <div className="mt-4 text-center">
                        <p className="text-slate-400 text-sm">
                            Déjà un compte ?{" "}
                            <Link
                                to="/login"
                                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                            >
                                Se connecter
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Register;
