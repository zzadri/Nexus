import { ReactNode } from "react";

export type UseCaseCardProps = {
  tone: "blue" | "purple";
  icon: ReactNode;
  title: string;
  description: string;
  bullets: string[];
  className?: string;
};
