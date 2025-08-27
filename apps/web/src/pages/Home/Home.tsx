import React, { useEffect, useState } from "react";
import { useAuthStore } from "../../app/store/auth.store";
import {
  FaUser, FaSignOutAlt, FaShieldAlt, FaBell, FaCog, FaSearch,
  FaBookmark, FaLightbulb, FaCode, FaPlus, FaComment, FaHeart,
  FaShare, FaEllipsisH, FaHashtag
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
  const { user, logout, checkAuth } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'feed' | 'discover'>('feed');
  const [posts, setPosts] = useState<Post[]>([]);
  const [trends, setTrends] = useState<Trend[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  useEffect(() => {
    // Vérifier l'authentification au chargement
    checkAuth();

    // Déboguer l'objet utilisateur pour comprendre sa structure
    if (user) {
      console.log('🔍 Home - Structure de l\'objet utilisateur:', user);
    } else {
      console.warn('⚠️ Home - L\'objet utilisateur est null ou undefined');
    }
  }, [checkAuth, user]);

  // Forcer une vérification supplémentaire de l'authentification
  useEffect(() => {
    const checkUserState = async () => {
      try {
        await checkAuth();
      } catch (error) {
        console.error('❌ Home - Erreur lors de la vérification de l\'authentification:', error);
      }
    };

    checkUserState();
  }, [checkAuth]);

  // Charger les données simulées
  useEffect(() => {
    // Données de posts simulées
    const mockPosts: Post[] = [
      {
        id: '1',
        author: {
          id: '101',
          name: 'Sarah Dayan',
          avatar: 'https://i.pravatar.cc/150?img=1'
        },
        content: "Je viens de publier un nouvel article sur l'utilisation de Tailwind CSS avec React. Découvrez comment construire des interfaces élégantes en un temps record !",
        tags: ['React', 'TailwindCSS', 'Frontend'],
        createdAt: new Date(2025, 7, 26, 14, 30),
        likesCount: 42,
        commentsCount: 8,
        isLiked: false,
        isSaved: true
      },
      {
        id: '2',
        author: {
          id: '102',
          name: 'Jean Dupont',
          avatar: 'https://i.pravatar.cc/150?img=2'
        },
        content: "Retour d'expérience sur la mise en place de FastAPI avec PostgreSQL dans un environnement de production. Les performances sont impressionnantes !",
        tags: ['Python', 'FastAPI', 'PostgreSQL', 'Backend'],
        createdAt: new Date(2025, 7, 26, 10, 15),
        likesCount: 28,
        commentsCount: 12,
        isLiked: true,
        isSaved: false
      },
      {
        id: '3',
        author: {
          id: '103',
          name: 'Marie Lefevre',
          avatar: 'https://i.pravatar.cc/150?img=3'
        },
        content: "Question pour les devs qui utilisent Docker en production : comment gérez-vous la mise à l'échelle de vos conteneurs lors des pics de trafic ?",
        tags: ['Docker', 'DevOps', 'Scalability'],
        createdAt: new Date(2025, 7, 25, 16, 45),
        likesCount: 15,
        commentsCount: 23,
        isLiked: false,
        isSaved: false
      }
    ];

    // Tendances simulées
    const mockTrends: Trend[] = [
      { id: '1', name: 'React', count: 2453 },
      { id: '2', name: 'TypeScript', count: 1872 },
      { id: '3', name: 'DevOps', count: 1342 },
      { id: '4', name: 'Cybersécurité', count: 987 },
      { id: '5', name: 'MachineLearning', count: 876 }
    ];

    // Suggestions simulées
    const mockSuggestions: Suggestion[] = [
      { id: '1', name: 'David Martin', title: 'DevOps Engineer @ Google', avatar: 'https://i.pravatar.cc/150?img=4' },
      { id: '2', name: 'Julie Blanc', title: 'Frontend Developer @ Meta', avatar: 'https://i.pravatar.cc/150?img=5' },
      { id: '3', name: 'Thomas Richard', title: 'CTO @ StartupInc', avatar: 'https://i.pravatar.cc/150?img=6' },
    ];

    setPosts(mockPosts);
    setTrends(mockTrends);
    setSuggestions(mockSuggestions);
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  // Fonctions pour interagir avec les publications
  const handleLikePost = (postId: string) => {
    setPosts(prevPosts =>
      prevPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            isLiked: !post.isLiked,
            likesCount: post.isLiked ? post.likesCount - 1 : post.likesCount + 1
          };
        }
        return post;
      })
    );
  };

  const handleSavePost = (postId: string) => {
    setPosts(prevPosts =>
      prevPosts.map(post => {
        if (post.id === postId) {
          return { ...post, isSaved: !post.isSaved };
        }
        return post;
      })
    );
  };

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return "À l'instant";
    if (diffInMinutes < 60) return `${diffInMinutes} min`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} h`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} j`;

    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  if (!user) {
    console.warn('⚠️ Home - Rendu conditionnel: user est null/undefined');
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center">
        <div className="text-slate-300 mb-4">Chargement des informations utilisateur...</div>
        <button
          onClick={() => checkAuth()}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
        >
          Rafraîchir
        </button>
      </div>
    );
  }

  // Vérifier que user contient toutes les propriétés nécessaires
  console.log('📊 Home - Vérification des propriétés utilisateur:', {
    hasId: !!user.id,
    hasEmail: !!user.email,
    hasDisplayName: !!user.displayName,
    has2FA: user.twoFAEnabled !== undefined
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Header fixe avec navigation */}
      <header className="fixed top-0 left-0 right-0 bg-slate-800/80 backdrop-blur-md border-b border-slate-700/50 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo et nom */}
            <div className="flex items-center">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Nexus
              </h1>
            </div>

            {/* Barre de recherche (centre) - visible uniquement sur les écrans moyens et grands */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-full text-sm text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                  placeholder="Rechercher..."
                />
              </div>
            </div>

            {/* Menu utilisateur */}
            <div className="flex items-center space-x-1 sm:space-x-3">
              {/* Notifications */}
              <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-full transition-colors relative">
                <FaBell />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Paramètres */}
              <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-full transition-colors">
                <FaCog />
              </button>

              {/* Menu utilisateur */}
              <div className="relative ml-1">
                <div className="flex items-center space-x-2 p-1 rounded-full hover:bg-slate-700/50 transition cursor-pointer">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden bg-slate-700 border border-slate-600">
                  {/* Utilisateur sans avatar pour l'instant */}
                  <div className="w-full h-full flex items-center justify-center">
                    <FaUser className="text-slate-400" />
                  </div>
                </div>
                  <span className="hidden sm:block text-sm text-slate-300 pr-1">
                    {user.displayName?.split(' ')[0] || 'Utilisateur'}
                  </span>
                </div>

                {/* Menu déroulant (caché pour l'instant) */}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Corps principal */}
      <div className="pt-16">
        {/* Layout à trois colonnes */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 px-4 py-4">
          {/* Colonne de navigation (gauche) */}
          <nav className="lg:col-span-2 py-4 hidden lg:block">
            <div className="sticky top-20 space-y-1">
              <button
                onClick={() => setActiveTab('feed')}
                className={`flex items-center space-x-2 w-full px-3 py-2 rounded-md transition-colors ${activeTab === 'feed' ? 'bg-blue-900/30 text-blue-400' : 'text-slate-300 hover:bg-slate-800/70 hover:text-slate-200'}`}
              >
                <FaLightbulb className="h-5 w-5" />
                <span className="font-medium">Fil d'actualité</span>
              </button>

              <button
                onClick={() => setActiveTab('discover')}
                className={`flex items-center space-x-2 w-full px-3 py-2 rounded-md transition-colors ${activeTab === 'discover' ? 'bg-blue-900/30 text-blue-400' : 'text-slate-300 hover:bg-slate-800/70 hover:text-slate-200'}`}
              >
                <FaCode className="h-5 w-5" />
                <span className="font-medium">Découverte</span>
              </button>

              <hr className="border-slate-700 my-3" />

              {/* Groupes */}
              <div className="px-3 py-2">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Mes groupes
                </h3>
                <div className="space-y-1">
                  <a href="#" className="block px-2 py-1.5 text-sm text-slate-300 hover:text-slate-100 rounded hover:bg-slate-800/70 transition-colors">
                    Frontend Masters
                  </a>
                  <a href="#" className="block px-2 py-1.5 text-sm text-slate-300 hover:text-slate-100 rounded hover:bg-slate-800/70 transition-colors">
                    DevOps Experts
                  </a>
                  <a href="#" className="block px-2 py-1.5 text-sm text-slate-300 hover:text-slate-100 rounded hover:bg-slate-800/70 transition-colors">
                    Web Security
                  </a>
                </div>
                <button className="mt-2 flex items-center text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium">
                  <FaPlus className="h-3 w-3 mr-1" />
                  Créer un groupe
                </button>
              </div>
            </div>
          </nav>

          {/* Fil d'actualité (centre) */}
          <main className="lg:col-span-7 space-y-6">
            {/* Création de publication */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 shadow-lg">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-700 flex-shrink-0 border border-slate-600">
                  {/* Utilisateur sans avatar pour l'instant */}
                  <div className="w-full h-full flex items-center justify-center">
                    <FaUser className="text-slate-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <textarea
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl resize-none text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                    placeholder="Partagez une actualité, un article ou une question..."
                    rows={2}
                  />

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center space-x-2 text-slate-400">
                      <button className="p-2 hover:text-blue-400 rounded-full hover:bg-slate-700/50 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <button className="p-2 hover:text-blue-400 rounded-full hover:bg-slate-700/50 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                      </button>
                      <button className="p-2 hover:text-blue-400 rounded-full hover:bg-slate-700/50 transition-colors">
                        <FaHashtag className="w-4 h-4" />
                      </button>
                    </div>

                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                      Publier
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Filtres (visible uniquement sur mobile et tablette) */}
            <div className="flex overflow-x-auto space-x-2 py-2 lg:hidden">
              <button className="px-4 py-1.5 bg-blue-600 text-white rounded-full whitespace-nowrap">
                Récent
              </button>
              <button className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-full whitespace-nowrap">
                Populaire
              </button>
              <button className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-full whitespace-nowrap">
                Frontend
              </button>
              <button className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-full whitespace-nowrap">
                Backend
              </button>
              <button className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-full whitespace-nowrap">
                DevOps
              </button>
            </div>

            {/* Publications */}
            {posts.map(post => (
              <article key={post.id} className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 shadow-lg overflow-hidden">
                {/* En-tête de la publication */}
                <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-700 flex-shrink-0">
                        {post.author.avatar ? (
                          <img src={post.author.avatar} alt={post.author.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FaUser className="text-slate-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-slate-200">{post.author.name}</div>
                        <div className="text-xs text-slate-400">{formatDate(post.createdAt)}</div>
                      </div>
                    </div>

                    <button className="text-slate-400 hover:text-slate-300 p-1">
                      <FaEllipsisH className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Contenu */}
                  <div className="mt-3">
                    <p className="text-slate-200">{post.content}</p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {post.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-slate-700/70 text-blue-400 text-xs rounded-md hover:bg-slate-700 transition-colors cursor-pointer">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t border-slate-700/70 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleLikePost(post.id)}
                      className={`flex items-center space-x-1 ${post.isLiked ? 'text-red-500' : 'text-slate-400 hover:text-slate-300'}`}
                    >
                      <FaHeart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : 'stroke-current fill-none'}`} />
                      <span className="text-sm">{post.likesCount}</span>
                    </button>

                    <button className="flex items-center space-x-1 text-slate-400 hover:text-slate-300">
                      <FaComment className="w-4 h-4" />
                      <span className="text-sm">{post.commentsCount}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => handleSavePost(post.id)}
                    className={`p-1 ${post.isSaved ? 'text-blue-500' : 'text-slate-400 hover:text-slate-300'}`}
                  >
                    <FaBookmark className={`w-4 h-4 ${post.isSaved ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </article>
            ))}

            {/* Bouton "Charger plus" */}
            <div className="flex justify-center py-4">
              <button className="px-6 py-2 border border-slate-600 text-slate-300 hover:text-white hover:border-blue-500 rounded-lg transition-colors">
                Charger plus de publications
              </button>
            </div>
          </main>

          {/* Barre latérale droite */}
          <aside className="lg:col-span-3 space-y-6 hidden lg:block">
            {/* Tendances */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4">
              <h3 className="font-semibold text-slate-200 mb-4">Tendances</h3>
              <ul className="space-y-3">
                {trends.map(trend => (
                  <li key={trend.id}>
                    <a href="#" className="flex items-center justify-between group">
                      <span className="text-blue-400 group-hover:text-blue-300 transition-colors">#{trend.name}</span>
                      <span className="text-xs text-slate-400">{trend.count}</span>
                    </a>
                  </li>
                ))}
              </ul>
              <div className="mt-3 pt-3 border-t border-slate-700">
                <a href="#" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                  Voir toutes les tendances
                </a>
              </div>
            </div>

            {/* Suggestions de connexions */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4">
              <h3 className="font-semibold text-slate-200 mb-4">Suggestions pour vous</h3>
              <ul className="space-y-4">
                {suggestions.map(suggestion => (
                  <li key={suggestion.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-700 flex-shrink-0">
                        {suggestion.avatar ? (
                          <img src={suggestion.avatar} alt={suggestion.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FaUser className="text-slate-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-slate-200 text-sm">{suggestion.name}</div>
                        <div className="text-xs text-slate-400">{suggestion.title}</div>
                      </div>
                    </div>
                    <button className="px-3 py-1 text-xs text-blue-400 border border-blue-500 rounded-full hover:bg-blue-500/20 transition-colors">
                      Suivre
                    </button>
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-3 border-t border-slate-700">
                <a href="#" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                  Voir plus de suggestions
                </a>
              </div>
            </div>

            {/* Footer */}
            <div className="text-xs text-slate-500">
              <div className="space-x-2">
                <a href="#" className="hover:text-slate-400 transition-colors">À propos</a>
                <span>·</span>
                <a href="#" className="hover:text-slate-400 transition-colors">Conditions</a>
                <span>·</span>
                <a href="#" className="hover:text-slate-400 transition-colors">Confidentialité</a>
              </div>
              <div className="mt-2">
                &copy; 2025 Nexus - Un réseau social pour professionnels IT
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Navigation mobile (fixed bottom) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-800/80 backdrop-blur-md border-t border-slate-700/50 lg:hidden z-10">
        <div className="flex justify-around items-center h-16">
          <button className="flex flex-col items-center justify-center p-2 text-blue-400">
            <FaLightbulb className="h-5 w-5" />
            <span className="text-xs mt-1">Actualités</span>
          </button>

          <button className="flex flex-col items-center justify-center p-2 text-slate-400">
            <FaCode className="h-5 w-5" />
            <span className="text-xs mt-1">Découvrir</span>
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
