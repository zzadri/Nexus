import React, { useEffect } from "react";
import { useAuthStore } from "../../app/store/auth.store";
import { FaUser, FaSignOutAlt, FaShieldAlt } from "react-icons/fa";

const Dashboard: React.FC = () => {
  const { user, logout, checkAuth } = useAuthStore();

  useEffect(() => {
    // Vérifier l'authentification au chargement
    checkAuth();
    
    // Déboguer l'objet utilisateur pour comprendre sa structure
    if (user) {
      console.log('🔍 Dashboard - Structure de l\'objet utilisateur:', user);
    } else {
      console.warn('⚠️ Dashboard - L\'objet utilisateur est null ou undefined');
    }
  }, [checkAuth, user]);
  
  // Forcer une vérification supplémentaire de l'authentification
  useEffect(() => {
    const checkUserState = async () => {
      try {
        await checkAuth();
      } catch (error) {
        console.error('❌ Dashboard - Erreur lors de la vérification de l\'authentification:', error);
      }
    };
    
    checkUserState();
  }, [checkAuth]);

  const handleLogout = async () => {
    await logout();
  };

  if (!user) {
    console.warn('⚠️ Dashboard - Rendu conditionnel: user est null/undefined');
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
  console.log('📊 Dashboard - Vérification des propriétés utilisateur:', {
    hasId: !!user.id,
    hasEmail: !!user.email,
    hasDisplayName: !!user.displayName,
    has2FA: user.twoFAEnabled !== undefined
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Nexus
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FaUser className="text-slate-400" />
                <span className="text-sm text-slate-300">
                  {user.displayName || user.email || 'Utilisateur'}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-md transition-colors"
              >
                <FaSignOutAlt />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Bienvenue, {user.displayName ? user.displayName.split(' ')[0] : 'utilisateur'} !
          </h2>
          <p className="text-slate-400">
            Vous êtes maintenant connecté à votre tableau de bord Nexus.
          </p>
        </div>

        {/* User Info Card */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">
            Informations du compte
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="block text-sm text-slate-400 mb-1">Nom complet</div>
              <div className="text-white">{user.displayName || 'Non défini'}</div>
            </div>

            <div>
              <div className="block text-sm text-slate-400 mb-1">Email</div>
              <div className="text-white">{user.email || 'Non défini'}</div>
            </div>

            <div>
              <div className="block text-sm text-slate-400 mb-1">2FA</div>
              <div className="flex items-center space-x-2">
                <FaShieldAlt
                  className={user.twoFAEnabled === true ? "text-green-400" : "text-red-400"}
                />
                <span className={user.twoFAEnabled === true ? "text-green-400" : "text-red-400"}>
                  {user.twoFAEnabled === true ? "Activé" : "Désactivé"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <h3 className="text-xl font-semibold text-white mb-4">
            Fonctionnalités à venir
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-slate-700/50 rounded-lg p-4">
              <h4 className="font-medium text-white mb-2">Publications</h4>
              <p className="text-sm text-slate-400">
                Partagez vos connaissances avec la communauté
              </p>
            </div>

            <div className="bg-slate-700/50 rounded-lg p-4">
              <h4 className="font-medium text-white mb-2">Groupes</h4>
              <p className="text-sm text-slate-400">
                Rejoignez ou créez des groupes thématiques
              </p>
            </div>

            <div className="bg-slate-700/50 rounded-lg p-4">
              <h4 className="font-medium text-white mb-2">Documentation</h4>
              <p className="text-sm text-slate-400">
                Collaborez sur de la documentation technique
              </p>
            </div>

            <div className="bg-slate-700/50 rounded-lg p-4">
              <h4 className="font-medium text-white mb-2">Recherche</h4>
              <p className="text-sm text-slate-400">
                Trouvez rapidement les informations que vous cherchez
              </p>
            </div>

            <div className="bg-slate-700/50 rounded-lg p-4">
              <h4 className="font-medium text-white mb-2">Profil</h4>
              <p className="text-sm text-slate-400">
                Gérez votre profil et vos préférences
              </p>
            </div>

            <div className="bg-slate-700/50 rounded-lg p-4">
              <h4 className="font-medium text-white mb-2">Notifications</h4>
              <p className="text-sm text-slate-400">
                Restez informé des dernières activités
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
