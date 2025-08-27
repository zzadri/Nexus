import React from 'react';
import { FaExclamationTriangle, FaRedo } from 'react-icons/fa';

interface CsrfErrorProps {
  onRetry: () => void;
  loading?: boolean;
}

export const CsrfError: React.FC<CsrfErrorProps> = ({ onRetry, loading = false }) => {
  return (
    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
      <div className="flex items-center justify-center gap-2 text-red-400 mb-2">
        <FaExclamationTriangle />
        <span className="font-medium">Erreur de sécurité</span>
      </div>
      <p className="text-sm text-slate-400 mb-3">
        Votre session de sécurité a expiré. Veuillez réessayer.
      </p>
      <button
        onClick={onRetry}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white rounded-lg transition-colors text-sm"
      >
        <FaRedo className={`text-xs ${loading ? 'animate-spin' : ''}`} />
        {loading ? 'Rechargement...' : 'Réessayer'}
      </button>
    </div>
  );
};
