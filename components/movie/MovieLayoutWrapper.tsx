"use client";
import { ReactNode } from "react";

interface MovieLayoutWrapperProps {
  children: ReactNode;
}

export default function MovieLayoutWrapper({ children }: MovieLayoutWrapperProps) {
  return <>{children}</>;
}
