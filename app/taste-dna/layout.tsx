import "./index.css";
import "./app.css";

export default function TasteDNALayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#07070A] text-[#F4F6FA] antialiased">
      {children}
    </div>
  );
}
