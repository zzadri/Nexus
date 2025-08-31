import React, { memo } from "react";
import type { FeatureCardProps } from "../../types";

const FeatureCardComponent: React.FC<FeatureCardProps> = ({
  icon,
  iconBgClass,
  hoverBorderClass = "",
  title,
  description,
  className = "",
}) => {
  return (
    <div
      className={[
        "group p-6 sm:p-8 rounded-2xl",
        "bg-gradient-to-br from-slate-800 to-slate-800/50",
        "border border-slate-700 transition-all duration-300",
        hoverBorderClass,
        className,
      ].join(" ")}
    >
      <div className={`mb-5 sm:mb-6 p-3 w-fit rounded-xl border ${iconBgClass}`}>
        {icon}
      </div>
      <h3 className="text-lg sm:text-xl font-bold mb-3">{title}</h3>
      <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
        {description}
      </p>
    </div>
  );
};

export const FeatureCard = memo(FeatureCardComponent);
export default FeatureCard;
