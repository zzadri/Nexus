import { ReactNode } from "react";

export type FeatureCardProps = {
  icon: ReactNode;
  iconBgClass: string;
  hoverBorderClass?: string;
  title: string;
  description: string;
  className?: string;
};
