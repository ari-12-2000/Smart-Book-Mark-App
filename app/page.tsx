'use client';

import GoogleIcon from "@/components/GoogleIcon";
import { supabase } from "@/lib/supabaseClient";
import { Session } from "@supabase/supabase-js";
import { LogOut } from "lucide-react";
import { useEffect, useState } from "react";

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex flex-col items-center justify-center p-6">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTItMnYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6TTM0IDJ2MmgyVjJoLTJ6bS00IDB2MmgyVjJoLTJ6bS00IDB2MmgyVjJoLTJ6bS00IDB2MmgyVjJoLTJ6bS00IDB2MmgyVjJoLTJ6bS00IDB2MmgyVjJoLTJ6bS00IDB2MmgyVjJoLTJ6bS00IDB2MmgyVjJoLTJ6bS00IDB2MmgyVjJoLTJ6TTIgNnYyaDJWNkgyek0yIDEwdjJoMnYtMkgyek0yIDE0djJoMnYtMkgyek0yIDE4djJoMnYtMkgyek0yIDIydjJoMnYtMkgyek0yIDI2djJoMnYtMkgyek0yIDMwdjJoMnYtMkgyek0yIDM0djJoMnYtMkgyek0yIDM4djJoMnYtMkgyek0yIDQydjJoMnYtMkgyek0yIDQ2djJoMnYtMkgyek0yIDUwdjJoMnYtMkgyek0yIDU0djJoMnYtMkgyek02IDJoMnYySDZWMnptMCA1Mmgydi0ySDZ2MnptNDggMGgydi0ySDZ2MnptMCA0aDJ2LTJoLTJ2MnptLTQ4IDRoMnYtMkg2djJ6bTQ4LTRoMnYtMmgtMnYyek02IDJoMnYySDZWMnptNTQgNTB2Mmgydi0yaC0yem0wLTR2Mmgydi0yaC0yem0wLTR2Mmgydi0yaC0yem0wLTR2Mmgydi0yaC0yem0wLTR2Mmgydi0yaC0yem0wLTR2Mmgydi0yaC0yem0wLTR2Mmgydi0yaC0yem0wLTR2Mmgydi0yaC0yem0wLTR2Mmgydi0yaC0yem0wLTR2Mmgydi0yaC0yem0wLTR2Mmgydi0yaC0yem0wLTR2Mmgydi0yaC0yem0wLTR2Mmgydi0yaC0yem0wLTR2Nmgydi02aC0yeiIvPjwvZz48L2c+PC9zdmc+')] opacity-40"></div>
      <div className="relative z-10 w-full max-w-lg">
        {!session ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200 backdrop-blur-sm animate-slide-up">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-slate-800 mb-2">Welcome</h2>
              <p className="text-slate-600">Sign in to access your BookMarks</p>
            </div>
            <button
              onClick={async () => {
                await supabase.auth.signInWithOAuth({
                  provider: "google",
                  options: {
                    redirectTo: process.env.NEXT_PUBLIC_BASE_URL,
                  },
                });
              }}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-4 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-3 group"
            >

              <GoogleIcon />
              <span>Continue with Google</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4 animate-slide-up">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  {session.user?.user_metadata?.full_name?.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-500">Welcome back</p>
                  <p className="text-lg font-semibold text-slate-800">{session.user?.user_metadata?.full_name}</p>
                </div>
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                  }}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                  title="Sign out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
