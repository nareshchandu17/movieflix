import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerSession(authOptions) as any;

  // Allow guest access - no mandatory redirection to /login

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">
          🎬 Welcome to MovieFlix
        </h1>
        <p className="text-xl mb-8">
          Hello, {session?.user?.name || session?.user?.email || "User"}! 🎉
        </p>
        <div className="bg-gray-800 rounded-lg p-6 max-w-md">
          <h2 className="text-2xl font-semibold mb-4 text-red-500">
            🎥 Premium Features Unlocked
          </h2>
          <ul className="space-y-2 text-left">
            <li className="flex items-center gap-2">
              <span>✅</span>
              <span>Google Authentication</span>
            </li>
            <li className="flex items-center gap-2">
              <span>✅</span>
              <span>Protected Routes</span>
            </li>
            <li className="flex items-center gap-2">
              <span>✅</span>
              <span>Session Management</span>
            </li>
            <li className="flex items-center gap-2">
              <span>✅</span>
              <span>MongoDB Integration</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
