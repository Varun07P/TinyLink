import React, { useState, useEffect } from 'react';
import { createLink, getLinks, deleteLink } from '../api';
import { Copy, Trash2, ExternalLink, BarChart2, ArrowRight, Loader2, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import toast from 'react-hot-toast';

export default function Dashboard() {
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ url: '', shortCode: '' });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredLinks = links.filter(link => {
        const fullShortUrl = `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'}/${link.short_code}`;
        const query = searchQuery.toLowerCase();
        return (
            link.short_code?.toLowerCase().includes(query) ||
            link.original_url?.toLowerCase().includes(query) ||
            fullShortUrl?.toLowerCase().includes(query)
        );
    });

    const fetchLinks = async () => {
        try {
            const res = await getLinks();
            setLinks(res.data);
        } catch (err) {
            console.error("Failed to fetch links", err);
            toast.error("Failed to load links");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLinks();
        // Poll for updates every 2 seconds
        const interval = setInterval(fetchLinks, 2000);
        return () => clearInterval(interval);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            await createLink(form);
            setForm({ url: '', shortCode: '' });
            fetchLinks();
            toast.success("Link created successfully!");
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to create link';
            setError(msg);
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (code) => {
        if (!confirm('Are you sure you want to delete this link?')) return;
        try {
            await deleteLink(code);
            setLinks(links.filter(l => l.short_code !== code));
            toast.success("Link deleted");
        } catch (err) {
            toast.error('Failed to delete link');
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard!');
    };

    return (
        <div className="space-y-8">
            {/* Create Link Section */}
            <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 md:p-8 transition-all duration-200">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create a new link</h2>
                    <p className="text-gray-500 dark:text-gray-400">Shorten your long URLs into something memorable.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        <div className="md:col-span-8">
                            <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Destination URL</label>
                            <div className="relative group">
                                <input
                                    type="url"
                                    id="url"
                                    required
                                    placeholder="https://example.com/long-url"
                                    className="w-full px-5 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ease-in-out group-hover:border-gray-300 dark:group-hover:border-gray-600"
                                    value={form.url}
                                    onChange={e => setForm({ ...form, url: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="md:col-span-4">
                            <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Custom Code (Optional)</label>
                            <div className="relative group">
                                <input
                                    type="text"
                                    id="code"
                                    placeholder="alias"
                                    title="Any characters allowed (except /)"
                                    className="w-full px-5 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ease-in-out group-hover:border-gray-300 dark:group-hover:border-gray-600"
                                    value={form.shortCode}
                                    onChange={e => setForm({ ...form, shortCode: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm font-medium border border-red-100 dark:border-red-800 flex items-center animate-fadeIn">
                            <span className="mr-2">⚠️</span> {error}
                        </div>
                    )}

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={submitting}
                            className={clsx(
                                "inline-flex items-center px-8 py-3.5 border border-transparent text-sm font-bold rounded-xl shadow-lg text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform transition-all duration-200 hover:-translate-y-0.5",
                                submitting && "opacity-75 cursor-not-allowed hover:transform-none"
                            )}
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    Shorten URL
                                    <ArrowRight className="ml-2 -mr-1 h-5 w-5" />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </section>

            {/* Links List Section */}
            <section>
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Your Links</h3>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search links..."
                                className="pl-4 pr-10 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                            {filteredLinks.length} total
                        </span>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20">
                        <Loader2 className="animate-spin h-10 w-10 text-indigo-600 mx-auto" />
                        <p className="mt-4 text-gray-500 dark:text-gray-400">Loading links...</p>
                    </div>
                ) : links.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-16 text-center">
                        <div className="mx-auto h-16 w-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-500 dark:text-indigo-400 mb-6">
                            <LinkIcon className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No links yet</h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">Create your first short link above to get started and track your clicks.</p>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-900/50">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Short Link</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Original URL</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Clicks</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Clicked</th>
                                        <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {filteredLinks.map((link) => (
                                        <tr key={link.short_code} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <a
                                                        href={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'}/${link.short_code}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-indigo-600 dark:text-indigo-400 font-bold hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1.5"
                                                    >
                                                        /{link.short_code}
                                                        <ExternalLink className="h-3.5 w-3.5 opacity-50" />
                                                    </a>
                                                    <button
                                                        onClick={() => copyToClipboard(`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'}/${link.short_code}`)}
                                                        className="ml-3 p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400 transition-all"
                                                        title="Copy Link"
                                                    >
                                                        <Copy className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-xs font-mono bg-gray-50 dark:bg-gray-900/50 px-2 py-1 rounded" title={link.original_url}>
                                                    {link.original_url}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300">
                                                    {link.click_count} clicks
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {link.last_clicked_at ? new Date(link.last_clicked_at).toLocaleDateString() : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        to={`/code/${link.short_code}`}
                                                        className="p-2 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:text-gray-400 dark:hover:text-indigo-400 dark:hover:bg-indigo-900/30 transition-all"
                                                        title="View Stats"
                                                    >
                                                        <BarChart2 className="h-5 w-5" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(link.short_code)}
                                                        className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/30 transition-all"
                                                        title="Delete Link"
                                                    >
                                                        <Trash2 className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}
