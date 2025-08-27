import React, { useEffect } from "react";
import { useAuthStore } from "../../app/store/auth.store";
import { FaUser, FaSignOutAlt, FaShieldAlt } from "react-icons/fa";

const Dashboard: React.FC = () => {
  const { user, logout, checkAuth } = useAuthStore();

  useEffect(() => {
    // Vérifier l'authentification au chargement
    checkAuth();
  }, [checkAuth]);

  const handleLogout = async () => {
    await logout();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-300">Chargement...</div>
      </div>
    );
  }

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
                  {user.displayName}
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
            Bienvenue, {user.displayName.split(' ')[0]} !
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
              <div className="text-white">{user.displayName}</div>
            </div>

            <div>
              <div className="block text-sm text-slate-400 mb-1">Email</div>
              <div className="text-white">{user.email}</div>
            </div>

            <div>
              <div className="block text-sm text-slate-400 mb-1">2FA</div>
              <div className="flex items-center space-x-2">
                <FaShieldAlt
                  className={user.twoFAEnabled ? "text-green-400" : "text-red-400"}
                />
                <span className={user.twoFAEnabled ? "text-green-400" : "text-red-400"}>
                  {user.twoFAEnabled ? "Activé" : "Désactivé"}
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
