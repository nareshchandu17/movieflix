import { cn } from "@/lib/utils";

export default function WatchPartyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={cn("min-h-screen bg-black text-white")}>
      {children}
    </div>
  );
}
