import MovieLayoutWrapper from "@/components/movie/MovieLayoutWrapper";
import { ReactNode } from "react";

interface MovieLayoutProps {
  children: ReactNode;
}

export default function MovieLayout({ children }: MovieLayoutProps) {
  return <MovieLayoutWrapper>{children}</MovieLayoutWrapper>;
}
