'use client';

import BookMarkManager from "@/components/BookMarkManager";
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex flex-col items-center justify-center p-4 md:p-6">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

      <div className="relative z-10 w-full max-w-2xl">
        {!session ? (
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 border border-slate-200 backdrop-blur-sm">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-2xl mb-4">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h6a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V5z" />
                </svg>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-2">SaveSpot</h1>
              <p className="text-lg text-slate-600">Your personal bookmark manager</p>
              <p className="text-sm text-slate-500 mt-2">Sign in to save and organize all your favorite links</p>
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
              className="w-full bg-indigo-600 text-white px-6 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:bg-indigo-700 transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-3 group"
            >
              <GoogleIcon />
              <span>Sign in with Google</span>
            </button>
            <p className="text-center text-xs text-slate-500 mt-4">
              Free • No credit card required • Bookmarks stored securely
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-slate-200">
              {/* User header */}
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-200">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-indigo-400 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                  {session.user?.user_metadata?.full_name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Welcome back</p>
                  <p className="text-lg md:text-xl font-bold text-slate-900">{session.user?.user_metadata?.full_name}</p>
                </div>
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                  }}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all duration-200"
                  title="Sign out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>

              {/* Bookmark manager */}
              <BookMarkManager session={session} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
