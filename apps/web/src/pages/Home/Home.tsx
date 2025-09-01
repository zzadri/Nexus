import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../app/store/auth.store";
import {
    FaUser,
    FaBell,
    FaCog,
    FaSearch,
    FaBookmark,
    FaLightbulb,
    FaCode,
    FaComment,
    FaHeart,
    FaEllipsisH
} from "react-icons/fa";

// Types pour les données simulées
type Post = {
    id: string;
    author: {
        id: string;
        name: string;
        avatar?: string;
    };
    content: string;
    tags: string[];
    createdAt: Date;
    likesCount: number;
    commentsCount: number;
    isLiked: boolean;
    isSaved: boolean;
};

type Trend = {
    id: string;
    name: string;
    count: number;
};

type Suggestion = {
    id: string;
    name: string;
    title: string;
    avatar?: string;
};

const Home: React.FC = () => {
    const { user, logout, checkAuth, token } = useAuthStore();
    const navigate = useNavigate();

    // Si on arrive sur Home sans user ni token (cas edge où ProtectedRoute a rendu
    // l'enfant), rediriger immédiatement vers le login pour éviter l'affichage
    // d'un état de chargement infini.
    useEffect(() => {
        if (!user && !token) {
            navigate("/login", { replace: true });
        }
    }, [user, token, navigate]);
    const [activeTab, setActiveTab] = useState<"feed" | "discover">("feed");
    const [posts, setPosts] = useState<Post[]>([]);
    const [trends, setTrends] = useState<Trend[]>([]);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

    useEffect(() => {
        // Vérifier l'authentification au chargement
        checkAuth();

        // Déboguer l'objet utilisateur pour comprendre sa structure
        if (!user) {
            console.warn("⚠️ Home - L'objet utilisateur est null ou undefined");
        }
    }, [checkAuth, user]);

    // Forcer une vérification supplémentaire de l'authentification
    useEffect(() => {
        const checkUserState = async () => {
            try {
                await checkAuth();
            } catch (error) {
                console.error(
                    "❌ Home - Erreur lors de la vérification de l'authentification:",
                    error
                );
            }
        };

        checkUserState();
    }, [checkAuth]);

    // Charger les données simulées
    useEffect(() => {
        // Données de posts simulées
        const mockPosts: Post[] = [
            {
                id: "1",
                author: {
                    id: "101",
                    name: "Sarah Dayan",
                    avatar: "https://i.pravatar.cc/150?img=1"
                },
                content:
                    "Je viens de publier un nouvel article sur l'utilisation de Tailwind CSS avec React. Découvrez comment construire des interfaces élégantes en un temps record !",
                tags: ["React", "TailwindCSS", "Frontend"],
                createdAt: new Date(2025, 7, 26, 14, 30),
                likesCount: 42,
                commentsCount: 8,
                isLiked: false,
                isSaved: true
            },
            {
                id: "2",
                author: {
                    id: "102",
                    name: "Jean Dupont",
                    avatar: "https://i.pravatar.cc/150?img=2"
                },
                content:
                    "Retour d'expérience sur la mise en place de FastAPI avec PostgreSQL dans un environnement de production. Les performances sont impressionnantes !",
                tags: ["Python", "FastAPI", "PostgreSQL", "Backend"],
                createdAt: new Date(2025, 7, 26, 10, 15),
                likesCount: 28,
                commentsCount: 12,
                isLiked: true,
                isSaved: false
            },
            {
                id: "3",
                author: {
                    id: "103",
                    name: "Marie Lefevre",
                    avatar: "https://i.pravatar.cc/150?img=3"
                },
                content:
                    "Question pour les devs qui utilisent Docker en production : comment gérez-vous la mise à l'échelle de vos conteneurs lors des pics de trafic ?",
                tags: ["Docker", "DevOps", "Scalability"],
                createdAt: new Date(2025, 7, 25, 16, 45),
                likesCount: 15,
                commentsCount: 23,
                isLiked: false,
                isSaved: false
            }
        ];

        // Tendances simulées
        const mockTrends: Trend[] = [
            { id: "1", name: "React", count: 2453 },
            { id: "2", name: "TypeScript", count: 1872 },
            { id: "3", name: "DevOps", count: 1342 },
            { id: "4", name: "Cybersécurité", count: 987 },
            { id: "5", name: "MachineLearning", count: 876 }
        ];

        // Suggestions simulées
        const mockSuggestions: Suggestion[] = [
            {
                id: "1",
                name: "David Martin",
                title: "DevOps Engineer @ Google",
                avatar: "https://i.pravatar.cc/150?img=4"
            },
            {
                id: "2",
                name: "Julie Blanc",
                title: "Frontend Developer @ Meta",
                avatar: "https://i.pravatar.cc/150?img=5"
            },
            {
                id: "3",
                name: "Thomas Richard",
                title: "CTO @ StartupInc",
                avatar: "https://i.pravatar.cc/150?img=6"
            }
        ];

        setPosts(mockPosts);
        setTrends(mockTrends);
        setSuggestions(mockSuggestions);
    }, []);

    // Function to handle user logout
    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    // Fonctions pour interagir avec les publications
    const handleLikePost = (postId: string) => {
        setPosts((prevPosts) =>
            prevPosts.map((post) => {
                if (post.id === postId) {
                    return {
                        ...post,
                        isLiked: !post.isLiked,
                        likesCount: post.isLiked
                            ? post.likesCount - 1
                            : post.likesCount + 1
                    };
                }
                return post;
            })
        );
    };

    const handleSavePost = (postId: string) => {
        setPosts((prevPosts) =>
            prevPosts.map((post) => {
                if (post.id === postId) {
                    return { ...post, isSaved: !post.isSaved };
                }
                return post;
            })
        );
    };

    const formatDate = (date: Date): string => {
        const now = new Date();
        const diffInMinutes = Math.floor(
            (now.getTime() - date.getTime()) / (1000 * 60)
        );

        if (diffInMinutes < 1) return "À l'instant";
        if (diffInMinutes < 60) return `${diffInMinutes} min`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} h`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays} j`;

        return date.toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "short"
        });
    };

    if (!user) {
        console.warn("⚠️ Home - Rendu conditionnel: user est null/undefined");
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center">
                <div className="text-slate-300 mb-4">
                    Chargement des informations utilisateur...
                </div>
                <button
                    onClick={() => checkAuth()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                >
                    Rafraîchir
                </button>
            </div>
        );
    }
    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex">
            {/* Sidebar fixe avec navigation (côté gauche) */}
            <aside className="w-64 fixed inset-y-0 left-0 bg-slate-800 border-r border-slate-700/50 z-20 hidden lg:block">
                {/* Logo en haut de la sidebar */}
                <div className="h-16 flex items-center px-6 border-b border-slate-700/50">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Nexus
                    </h1>
                </div>

                {/* Navigation principale */}
                <nav className="px-3 py-4">
                    <div className="space-y-2">
                        {/* Dashboard/Home */}
                        <button
                            onClick={() => setActiveTab("feed")}
                            className={`flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg transition-colors ${
                                activeTab === "feed"
                                    ? "bg-blue-900/30 text-blue-400"
                                    : "text-slate-300 hover:bg-slate-700/50 hover:text-slate-100"
                            }`}
                        >
                            <FaLightbulb className="h-5 w-5" />
                            <span className="font-medium">Dashboard</span>
                        </button>

                        {/* Team/Équipe */}
                        <button className="flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-700/50 hover:text-slate-100 transition-colors">
                            <FaUser className="h-5 w-5" />
                            <span className="font-medium">Équipe</span>
                        </button>

                        {/* Projects/Projets */}
                        <button className="flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-700/50 hover:text-slate-100 transition-colors">
                            <FaCode className="h-5 w-5" />
                            <span className="font-medium">Projets</span>
                        </button>

                        {/* Calendar/Calendrier */}
                        <button className="flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-700/50 hover:text-slate-100 transition-colors">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                className="h-5 w-5"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>
                            <span className="font-medium">Calendrier</span>
                        </button>

                        {/* Documents */}
                        <button className="flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-700/50 hover:text-slate-100 transition-colors">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                className="h-5 w-5"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                            <span className="font-medium">Documents</span>
                        </button>

                        {/* Reports/Rapports */}
                        <button className="flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-700/50 hover:text-slate-100 transition-colors">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                className="h-5 w-5"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                />
                            </svg>
                            <span className="font-medium">Rapports</span>
                        </button>
                    </div>

                    {/* Teams section */}
                    <div className="mt-8">
                        <h3 className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Vos équipes
                        </h3>
                        <div className="mt-2 space-y-1">
                            <button className="w-full group flex items-center px-3 py-2 text-slate-300 hover:bg-slate-700/50 hover:text-slate-100 rounded-lg">
                                <span className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center text-white font-medium text-sm mr-3">
                                    H
                                </span>
                                <span className="font-medium">Heroicons</span>
                            </button>
                            <button className="w-full group flex items-center px-3 py-2 text-slate-300 hover:bg-slate-700/50 hover:text-slate-100 rounded-lg">
                                <span className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center text-white font-medium text-sm mr-3">
                                    T
                                </span>
                                <span className="font-medium">
                                    Tailwind Labs
                                </span>
                            </button>
                            <button className="w-full group flex items-center px-3 py-2 text-slate-300 hover:bg-slate-700/50 hover:text-slate-100 rounded-lg">
                                <span className="w-6 h-6 bg-green-600 rounded-md flex items-center justify-center text-white font-medium text-sm mr-3">
                                    W
                                </span>
                                <span className="font-medium">Workcation</span>
                            </button>
                        </div>
                    </div>
                </nav>

                {/* Footer Settings */}
                <div className="absolute bottom-0 w-full border-t border-slate-700/50 p-4">
                    <button className="w-full flex items-center space-x-3 px-3 py-2 text-slate-300 hover:bg-slate-700/50 hover:text-slate-100 rounded-lg transition-colors mb-2">
                        <FaCog className="h-5 w-5" />
                        <span className="font-medium">Paramètres</span>
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-3 py-2 text-red-400 hover:bg-slate-700/50 hover:text-red-300 rounded-lg transition-colors"
                    >
                        <FaUser className="h-5 w-5" />
                        <span className="font-medium">Déconnexion</span>
                    </button>
                </div>
            </aside>

            {/* Header pour mobile et content container */}
            <div className="flex-1 lg:ml-64">
                {/* Header mobile */}
                <header className="lg:hidden fixed top-0 left-0 right-0 bg-slate-800/80 backdrop-blur-md border-b border-slate-700/50 z-10">
                    <div className="px-4">
                        <div className="flex justify-between items-center h-16">
                            {/* Logo */}
                            <div className="flex items-center">
                                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                    Nexus
                                </h1>
                            </div>

                            {/* Mobile menu button */}
                            <button className="p-2 text-slate-400 hover:text-slate-200 rounded-md">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    className="h-6 w-6"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </header>

                {/* Header bar for desktop with user controls */}
                <header className="hidden lg:block sticky top-0 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/50 z-10">
                    <div className="flex justify-between items-center h-16 px-6">
                        <div className="flex items-center space-x-4 flex-grow">
                            {/* Barre de recherche dans le header (encore plus large) */}
                            <div className="relative w-full max-w-3xl">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaSearch className="h-4 w-4 text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-10 pr-3 py-2 bg-slate-800/70 border border-slate-700/50 rounded-lg text-sm text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                                    placeholder="Rechercher..."
                                />
                            </div>
                        </div>

                        {/* Contrôles utilisateur */}
                        <div className="flex items-center space-x-3">
                            {/* Notifications */}
                            <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/70 rounded-full transition-colors relative">
                                <FaBell />
                                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                            </button>

                            {/* User menu */}
                            <div className="relative">
                                <div className="flex items-center space-x-2 p-1 rounded-full hover:bg-slate-800/70 transition cursor-pointer">
                                    <div className="relative w-8 h-8 rounded-full overflow-hidden bg-slate-700 border border-slate-600">
                                        <div className="w-full h-full flex items-center justify-center">
                                            <FaUser className="text-slate-400" />
                                        </div>
                                    </div>
                                    <span className="text-sm text-slate-300 pr-1">
                                        {user.displayName?.split(" ")[0] ||
                                            "Utilisateur"}
                                    </span>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        className="h-4 w-4 text-slate-400"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 9l-7 7-7-7"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Layout à deux colonnes */}
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 px-4 py-4">
                    {/* Main content area (middle column) */}
                    <div className="lg:col-span-9">
                        <div className="space-y-6">
                            {posts.map((post) => (
                                <div 
                                    key={post.id} 
                                    className="bg-slate-800/80 rounded-xl border border-slate-700/50 shadow-lg shadow-blue-900/10 hover:shadow-blue-900/20 transition-all duration-300 overflow-hidden backdrop-blur-sm"
                                >
                                    <div className="p-6">
                                        <div className="flex items-start space-x-4">
                                            <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-slate-700 to-slate-800 ring-2 ring-slate-600/50 flex-shrink-0 shadow-inner">
                                                {post.author.avatar ? (
                                                    <img
                                                        src={post.author.avatar}
                                                        alt={post.author.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <FaUser className="text-slate-400" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="font-semibold text-slate-100 text-lg">
                                                            {post.author.name}
                                                        </div>
                                                        <div className="text-xs text-slate-400">
                                                            {formatDate(
                                                                post.createdAt
                                                            )}
                                                        </div>
                                                    </div>
                                                    <button className="text-slate-400 hover:text-slate-300 p-1 rounded-full hover:bg-slate-700/50 transition-colors">
                                                        <FaEllipsisH className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <div className="mt-4">
                                                    <p className="text-slate-100 leading-relaxed">
                                                        {post.content}
                                                    </p>

                                                    {/* Tags */}
                                                    <div className="flex flex-wrap gap-2 mt-4">
                                                        {post.tags.map((tag) => (
                                                            <span
                                                                key={tag}
                                                                className="px-3 py-1.5 bg-blue-900/30 text-blue-300 text-xs font-medium rounded-full hover:bg-blue-900/40 transition-colors cursor-pointer"
                                                            >
                                                                #{tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Actions */}
                                    <div className="flex items-center justify-between bg-slate-800/90 border-t border-slate-700/50 px-6 py-3">
                                        <div className="flex items-center space-x-6">
                                            <button
                                                onClick={() => handleLikePost(post.id)}
                                                className={`flex items-center space-x-2 group ${
                                                    post.isLiked
                                                        ? "text-red-500"
                                                        : "text-slate-400 hover:text-red-400"
                                                }`}
                                            >
                                                <div className="p-1.5 rounded-full group-hover:bg-slate-700/50 transition-colors">
                                                    <FaHeart
                                                        className={`w-4 h-4 ${
                                                            post.isLiked
                                                                ? "fill-current"
                                                                : ""
                                                        }`}
                                                    />
                                                </div>
                                                <span className="text-sm font-medium">
                                                    {post.likesCount}
                                                </span>
                                            </button>

                                            <button className="flex items-center space-x-2 text-slate-400 hover:text-blue-400 group">
                                                <div className="p-1.5 rounded-full group-hover:bg-slate-700/50 transition-colors">
                                                    <FaComment className="w-4 h-4" />
                                                </div>
                                                <span className="text-sm font-medium">
                                                    {post.commentsCount}
                                                </span>
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => handleSavePost(post.id)}
                                            className={`p-2 rounded-full hover:bg-slate-700/50 transition-colors ${
                                                post.isSaved
                                                    ? "text-blue-500"
                                                    : "text-slate-400 hover:text-blue-400"
                                            }`}
                                        >
                                            <FaBookmark
                                                className={`w-4 h-4 ${
                                                    post.isSaved
                                                        ? "fill-current"
                                                        : ""
                                                }`}
                                            />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-slate-800/70 rounded-lg border border-slate-700/50 hover:border-blue-800/30 transition-colors py-4 text-center shadow-md">
                            <button className="px-6 py-2 bg-blue-900/30 text-blue-300 hover:text-blue-200 rounded-full transition-colors font-medium hover:bg-blue-900/40">
                                Voir toutes les publications
                            </button>
                        </div>
                    </div>

                    {/* Right sidebar (1/4 column on desktop) */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Tendances */}
                        <div className="bg-slate-800/70 rounded-lg border border-slate-700/50 p-5">
                            <h3 className="font-semibold text-slate-200 mb-4">
                                Tendances
                            </h3>
                            <ul className="space-y-3">
                                {trends.map((trend) => (
                                    <li key={trend.id}>
                                        <button className="flex items-center justify-between group w-full">
                                            <span className="text-blue-400 group-hover:text-blue-300 transition-colors">
                                                #{trend.name}
                                            </span>
                                            <span className="text-xs text-slate-400">
                                                {trend.count}
                                            </span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-3 pt-3 border-t border-slate-700/50">
                                <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                                    Voir toutes les tendances
                                </button>
                            </div>
                        </div>

                        {/* Activité récente */}
                        <div className="bg-slate-800/70 rounded-lg border border-slate-700/50 p-5">
                            <h3 className="font-semibold text-slate-200 mb-4">
                                Activité récente
                            </h3>
                            <div className="space-y-4">
                                {suggestions.slice(0, 2).map((user) => (
                                    <div
                                        key={user.id}
                                        className="flex items-start space-x-3"
                                    >
                                        <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-700 flex-shrink-0">
                                            {user.avatar ? (
                                                <img
                                                    src={user.avatar}
                                                    alt={user.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <FaUser className="text-slate-400" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-200">
                                                <span className="font-medium">
                                                    {user.name}
                                                </span>{" "}
                                                a commenté votre projet
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                Il y a 25 minutes
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation mobile (fixed bottom) */}
            <nav className="fixed bottom-0 left-0 right-0 bg-slate-800/80 backdrop-blur-md border-t border-slate-700/50 lg:hidden z-10">
                <div className="flex justify-around items-center h-16">
                    <button className="flex flex-col items-center justify-center p-2 text-blue-400">
                        <FaLightbulb className="h-5 w-5" />
                        <span className="text-xs mt-1">Accueil</span>
                    </button>

                    <button className="flex flex-col items-center justify-center p-2 text-slate-400">
                        <FaCode className="h-5 w-5" />
                        <span className="text-xs mt-1">Projets</span>
                    </button>

                    <button className="flex flex-col items-center justify-center p-2 text-slate-400">
                        <FaSearch className="h-5 w-5" />
                        <span className="text-xs mt-1">Recherche</span>
                    </button>

                    <button className="flex flex-col items-center justify-center p-2 text-slate-400">
                        <FaUser className="h-5 w-5" />
                        <span className="text-xs mt-1">Profil</span>
                    </button>
                </div>
            </nav>
        </div>
    );
};

export default Home;
