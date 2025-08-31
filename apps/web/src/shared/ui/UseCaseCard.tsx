import React, { memo } from "react";
import type { UseCaseCardProps } from "../../types";

const UseCaseCardComponent: React.FC<UseCaseCardProps> = ({
  tone,
  icon,
  title,
  description,
  bullets,
  className = "",
}) => {
  const toneClasses =
    tone === "blue"
      ? "from-blue-900/20 border-blue-500/20"
      : "from-purple-900/20 border-purple-500/20";

  const chipClasses =
    tone === "blue"
      ? "bg-blue-500/10 border border-blue-500/20"
      : "bg-purple-500/10 border border-purple-500/20";

  const dotClasses = tone === "blue" ? "bg-blue-400" : "bg-purple-400";

  return (
    <div
      className={[
        "p-7 sm:p-10 rounded-3xl bg-gradient-to-br to-slate-800/50 border",
        toneClasses,
        className,
      ].join(" ")}
    >
      <div className="flex items-center gap-4 mb-5 sm:mb-6">
        <div className={`p-3 rounded-xl ${chipClasses}`}>{icon}</div>
        <h3 className="text-xl sm:text-2xl font-bold">{title}</h3>
      </div>
      <p className="text-slate-300 mb-5 sm:mb-6 leading-relaxed text-sm sm:text-base">
        {description}
      </p>
      <ul className="space-y-3 text-slate-400 text-sm sm:text-base">
        {bullets.map((bullet, index) => (
          <li key={`${bullet.slice(0, 10)}-${index}`} className="flex items-center gap-3">
            <span className={`w-1.5 h-1.5 rounded-full ${dotClasses}`} />
            {bullet}
          </li>
        ))}
      </ul>
    </div>
  );
};

export const UseCaseCard = memo(UseCaseCardComponent);
export default UseCaseCard;
