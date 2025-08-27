import React, { useState, useEffect } from "react";
import { FaCheck, FaTimes, FaInfoCircle } from "react-icons/fa";
import { validatePasswordWithEntropy, getPasswordStrengthColor, getPasswordStrengthText, type PasswordValidation } from "../../utils/validation-entropy";

interface PasswordStrengthIndicatorProps {
  password: string;
  show: boolean;
  onQualityChange?: (quality: PasswordValidation | null) => void;
}

export const PasswordStrengthIndicatorWithEntropy: React.FC<PasswordStrengthIndicatorProps> = ({ password, show, onQualityChange }) => {
  const [validation, setValidation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!show || !password) {
      setValidation(null);
      onQualityChange?.(null);
      return;
    }

    const validatePassword = async () => {
      setIsLoading(true);
      try {
        const result = await validatePasswordWithEntropy(password);
        setValidation(result);
        onQualityChange?.(result);
      } catch (error) {
        console.error('Error validating password:', error);
        // Fallback vers la validation simple
        const fallback = {
          isValid: false,
          score: 0,
          feedback: ['Erreur lors de la validation'],
          entropy: 0,
          strength: 'very-weak' as const
        };
        setValidation(fallback);
        onQualityChange?.(fallback);
      } finally {
        setIsLoading(false);
      }
    };

    validatePassword();
  }, [password, show, onQualityChange]);

  if (!show || !password) return null;

  if (isLoading) {
    return (
      <div className="mt-2 p-3 bg-slate-700/30 rounded-lg border border-slate-600/50">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-slate-300">Analyse en cours...</span>
        </div>
      </div>
    );
  }

  if (!validation) return null;

  return (
    <div className="mt-2 p-3 bg-slate-700/30 rounded-lg border border-slate-600/50">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-slate-300">Force du mot de passe :</span>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${getPasswordStrengthColor(validation.score)}`}>
            {getPasswordStrengthText(validation.score)}
          </span>
          {validation.entropy !== undefined && (
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <FaInfoCircle />
              <span>{validation.entropy.toFixed(1)} bits</span>
            </div>
          )}
        </div>
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

      {/* Feedback */}
      {validation.feedback && validation.feedback.length > 0 && (
        <div className="space-y-1">
          {validation.feedback.map((feedback: string, index: number) => (
            <div key={`feedback-${feedback.slice(0, 10)}-${index}`} className="flex items-center gap-2 text-xs">
              {validation.isValid && feedback === 'Excellent mot de passe !' ? (
                <FaCheck className="text-green-400 text-xs" />
              ) : (
                <FaTimes className="text-orange-400 text-xs" />
              )}
              <span className={
                validation.isValid && feedback === 'Excellent mot de passe !'
                  ? "text-green-300"
                  : "text-slate-400"
              }>
                {feedback}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
