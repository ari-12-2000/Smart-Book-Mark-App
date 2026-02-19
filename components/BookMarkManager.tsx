'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Pencil, Trash2, Copy, Check, Search, Plus, Link2, ArrowUpRight, X } from "lucide-react";
import { Session } from "@supabase/supabase-js";
import { Bookmark } from "@/types/bookmark";

export default function BookmarkManager({ session }: { session: Session }) {

    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const [title, setTitle] = useState("");
    const [url, setUrl] = useState("");
    const [search, setSearch] = useState("");

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editUrl, setEditUrl] = useState("");

    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // 🔥 FETCH
    const fetchBookmarks = async () => {
        setLoading(true);

        const { data } = await supabase
            .from("bookmarks")
            .select("*")
            .eq("user_id", session.user.id)
            .order("created_at", { ascending: false });

        setBookmarks(data || []);
        setLoading(false);
    };

    useEffect(() => {
        if (session) fetchBookmarks();
    }, [session]);

    // REALTIME
    useEffect(() => {
        const channel = supabase
            .channel("bookmarks-changes")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "bookmarks",
                    filter: `user_id=eq.${session.user.id}`,
                },
                () => {
                    fetchBookmarks();
                }
            )
            .subscribe();


        return () => {
            channel.unsubscribe();
        };
    }, []);

    // ➕ ADD
    const addBookmark = async (e: React.SubmitEvent) => {
        e.preventDefault();

        await supabase.from("bookmarks").insert({
            title,
            url,
            user_id: session.user.id,
        });

        setTitle("");
        setUrl("");
    };

    // 🗑️ DELETE
    const deleteBookmark = async (id: string) => {
        await supabase.from("bookmarks").delete().eq("id", id);
    };

    // ✏️ EDIT START
    const startEdit = (bm: Bookmark) => {
        setEditingId(bm.id);
        setEditTitle(bm.title);
        setEditUrl(bm.url);
    };

    // 💾 SAVE EDIT
    const saveEdit = async () => {
        if (!editingId) return;

        await supabase
            .from("bookmarks")
            .update({ title: editTitle, url: editUrl })
            .eq("id", editingId);

        setEditingId(null);
    };

    // 📋 COPY URL
    const copyUrl = (url: string, id: string) => {
        navigator.clipboard.writeText(url);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 1500);
    };

    const filtered = bookmarks.filter(
        (b) =>
            b.title.toLowerCase().includes(search.toLowerCase()) ||
            b.url.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div>
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-1">
                    <Link2 className="w-6 h-6 text-indigo-600" />
                    Your Bookmarks
                </h2>
                <p className="text-sm text-slate-500">Save and organize your favorite links</p>
            </div>

            {/* 🔍 SEARCH */}
            <div className="relative">
                <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                    placeholder="Search bookmarks..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full border border-slate-200 pl-11 pr-4 py-3 rounded-lg bg-white
                        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                        transition-all duration-200 text-slate-900 placeholder-slate-400"
                />
            </div>

            {/* ➕ ADD FORM */}
            <form onSubmit={addBookmark} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Bookmark title"
                        className="border border-slate-200 px-4 py-3 rounded-lg bg-white
                            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                            transition-all duration-200 text-slate-900 placeholder-slate-400"
                        required
                    />
                    <input
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://example.com"
                        className="border border-slate-200 px-4 py-3 rounded-lg bg-white
                            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                            transition-all duration-200 text-slate-900 placeholder-slate-400"
                        required
                    />
                </div>
                <button className="w-full md:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md">
                    <Plus size={18} />
                    Add Bookmark
                </button>
            </form>

            {/* 🧾 BOOKMARKS LIST */}
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="inline-flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-full mb-3">
                            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <p className="text-slate-500 font-medium">Loading bookmarks...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-100 rounded-full mb-4">
                            <Link2 className="w-6 h-6 text-slate-400" />
                        </div>
                        <p className="text-slate-600 font-medium">No bookmarks yet</p>
                        <p className="text-slate-500 text-sm mt-1">Start by adding your first bookmark above</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-200">
                        {filtered.map((bm) => (
                            <div key={bm.id} className="p-4 hover:bg-slate-50 transition-colors duration-150 group">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        {editingId === bm.id ? (
                                            <div className="space-y-2">
                                                <input
                                                    value={editTitle}
                                                    onChange={(e) => setEditTitle(e.target.value)}
                                                    className="w-full border border-slate-200 px-3 py-2 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                />
                                                <input
                                                    value={editUrl}
                                                    onChange={(e) => setEditUrl(e.target.value)}
                                                    className="w-full border border-slate-200 px-3 py-2 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                />
                                            </div>
                                        ) : (
                                            <>
                                                <h3 className="text-slate-900 font-semibold text-base leading-tight mb-1">
                                                    {bm.title}
                                                </h3>
                                                <a
                                                    href={bm.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1 group/link"
                                                >
                                                    <span className="truncate">{bm.url}</span>
                                                    <ArrowUpRight size={14} className="shrink-0 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                                                </a>
                                            </>
                                        )}
                                    </div>

                                    {/* ACTIONS */}
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                                        {editingId === bm.id ? (
                                            <button
                                                onClick={saveEdit}
                                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                title="Save"
                                            >
                                                <Check size={18} />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => startEdit(bm)}
                                                className="p-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Pencil size={18} />
                                            </button>
                                        )}

                                        <button
                                            onClick={() => copyUrl(bm.url, bm.id)}
                                            className="p-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                                            title="Copy URL"
                                        >
                                            {copiedId === bm.id ? (
                                                <Check size={18} className="text-green-600" />
                                            ) : (
                                                <Copy size={18} />
                                            )}
                                        </button>

                                        <button
                                            onClick={() => deleteBookmark(bm.id)}
                                            className="p-2 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>

                                        {editingId === bm.id && <button
                                            onClick={() => setEditingId(null)}
                                            className="p-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                                            title="Cancel"
                                        >
                                            <X size={18} />
                                        </button>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
