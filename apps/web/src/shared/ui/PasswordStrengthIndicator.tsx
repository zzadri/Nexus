import React from "react";
import { FaCheck, FaTimes } from "react-icons/fa";
import { validatePassword, getPasswordStrengthColor, getPasswordStrengthText } from "../../utils/validation";

interface PasswordStrengthIndicatorProps {
  password: string;
  show: boolean;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password, show }) => {
  if (!show || !password) return null;

  const validation = validatePassword(password);

  return (
    <div className="mt-2 p-3 bg-slate-700/30 rounded-lg border border-slate-600/50">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-slate-300">Force du mot de passe :</span>
        <span className={`text-sm font-medium ${getPasswordStrengthColor(validation.score)}`}>
          {getPasswordStrengthText(validation.score)}
        </span>
      </div>

      {/* Barre de progression */}
      <div className="w-full bg-slate-600 rounded-full h-1.5 mb-3">
        {(() => {
          let bgColor = "bg-red-400";
          if (validation.score >= 4) {
            bgColor = "bg-green-400";
          } else if (validation.score >= 3) {
            bgColor = "bg-yellow-400";
          } else if (validation.score >= 2) {
            bgColor = "bg-orange-400";
          }

          return (
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${bgColor}`}
              style={{ width: `${(validation.score / 4) * 100}%` }}
            />
          );
        })()}
      </div>

      {/* Critères de validation */}
      <div className="space-y-1">
        <ValidationItem
          isValid={password.length >= 8}
          text="Au moins 8 caractères"
        />
        <ValidationItem
          isValid={/[a-z]/.test(password)}
          text="Une lettre minuscule"
        />
        <ValidationItem
          isValid={/[A-Z]/.test(password)}
          text="Une lettre majuscule"
        />
        <ValidationItem
          isValid={/\d/.test(password)}
          text="Un chiffre"
        />
        <ValidationItem
          isValid={/[!@#$%^&*(),.?":{}|<>]/.test(password)}
          text="Un caractère spécial"
        />
      </div>
    </div>
  );
};

interface ValidationItemProps {
  isValid: boolean;
  text: string;
}

const ValidationItem: React.FC<ValidationItemProps> = ({ isValid, text }) => (
  <div className="flex items-center gap-2 text-xs">
    {isValid ? (
      <FaCheck className="text-green-400 text-xs" />
    ) : (
      <FaTimes className="text-red-400 text-xs" />
    )}
    <span className={isValid ? "text-green-300" : "text-slate-400"}>
      {text}
    </span>
  </div>
);
