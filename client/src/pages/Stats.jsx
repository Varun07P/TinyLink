import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getLinkStats } from '../api';
import { ArrowLeft, Calendar, MousePointer, Link as LinkIcon, Loader2, Clock, ExternalLink } from 'lucide-react';

export default function Stats() {
    const { code } = useParams();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await getLinkStats(code);
                // Normalize data
                const normalizedStats = {
                    ...res.data,
                    short_code: res.data.short_code || res.data.shortCode,
                    original_url: res.data.original_url || res.data.originalUrl,
                    click_count: res.data.click_count || res.data.clickCount || 0,
                    last_clicked_at: res.data.last_clicked_at || res.data.lastClickedAt,
                    created_at: res.data.created_at || res.data.createdAt
                };
                setStats(normalizedStats);
            } catch (err) {
                // Only set error on initial load if we don't have stats yet
                if (!stats) setError('Link not found or error fetching stats');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 2000);
        return () => clearInterval(interval);
    }, [code]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin h-10 w-10 text-indigo-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-20">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Oops!</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8 text-lg">{error}</p>
                <Link to="/" className="inline-flex items-center px-6 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Back to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <Link to="/" className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-2 text-sm font-medium transition-colors group">
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Dashboard
                </Link>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-8 md:p-10 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                        <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-sm font-bold tracking-wide">
                            /{stats.short_code}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            Created {new Date(stats.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                    </div>
                    <div className="flex items-start justify-between gap-4">
                        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white break-all leading-tight" title={stats.original_url}>
                            {stats.original_url.length > 50 ? stats.original_url.substring(0, 50) + '...' : stats.original_url}
                        </h1>
                        <a
                            href={stats.original_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-indigo-600 hover:border-indigo-200 transition-all shrink-0"
                        >
                            <ExternalLink className="h-5 w-5" />
                        </a>
                    </div>
                </div>

                <div className="p-8 md:p-10 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-gray-800 dark:to-gray-700/50 rounded-2xl p-8 flex flex-col items-center text-center border border-indigo-100 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow">
                        <div className="h-16 w-16 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6 shadow-inner">
                            <MousePointer className="h-8 w-8" />
                        </div>
                        <div className="text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">{stats.click_count}</div>
                        <div className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Total Clicks</div>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-50 to-white dark:from-gray-800 dark:to-gray-700/50 rounded-2xl p-8 flex flex-col items-center text-center border border-emerald-100 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow">
                        <div className="h-16 w-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6 shadow-inner">
                            <Calendar className="h-8 w-8" />
                        </div>
                        <div className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            {new Date(stats.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Created Date</div>
                    </div>

                    <div className="bg-gradient-to-br from-amber-50 to-white dark:from-gray-800 dark:to-gray-700/50 rounded-2xl p-8 flex flex-col items-center text-center border border-amber-100 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow">
                        <div className="h-16 w-16 rounded-2xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-6 shadow-inner">
                            <Clock className="h-8 w-8" />
                        </div>
                        <div className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            {stats.last_clicked_at ? new Date(stats.last_clicked_at).toLocaleDateString() : 'Never'}
                        </div>
                        <div className="text-sm font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Last Clicked</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
