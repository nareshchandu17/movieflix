"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="text-white">Loading...</div>;
  }

  if (session) {
    return (
      <div className="flex items-center gap-3">
        <img
          src={session.user?.image || ""}
          className="w-9 h-9 rounded-full border-2 border-white/20"
        />
        <button
          onClick={() => signOut()}
          className="px-4 py-2 bg-red-600 rounded-xl hover:bg-red-700 transition-all hover:scale-105 text-white font-medium"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn("google")}
      className="px-6 py-3 rounded-xl font-semibold text-white 
      bg-gradient-to-r from-red-500 to-red-700
      hover:scale-105 hover:shadow-lg transition-all duration-300"
    >
      Continue with Google 🚀
    </button>
  );
}
