import React, { useState, useEffect } from 'react';
import { X, Video, Play, ExternalLink } from 'lucide-react';

export default function SavedVideos() {
    const [videos, setVideos] = useState([]);

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('savedVideos') || '[]');
        setVideos(saved);
    }, []);

    const handleDelete = (id) => {
        const updated = videos.filter(vid => vid.id !== id);
        setVideos(updated);
        localStorage.setItem('savedVideos', JSON.stringify(updated));
    };

    return (
        <div className="max-w-6xl mx-auto flex flex-col gap-8 pb-10">
            <header className="flex justify-between items-end border-b border-gray-800 pb-6">
                <div>
                    <h1 className="text-4xl font-black mb-2 tracking-tighter premium-title flex items-center gap-3">
                        <Video className="text-neon-green/80" size={36} /> Studio Cinema
                    </h1>
                    <p className="text-gray-400">Your collection of AI generated cinematic motions.</p>
                </div>
                <div className="text-sm font-medium text-neon-green bg-neon-green/10 px-4 py-1.5 rounded-full border border-neon-green/20">
                    {videos.length} Items
                </div>
            </header>

            {videos.length === 0 ? (
                <div className="glass-panel rounded-2xl p-16 flex flex-col items-center justify-center text-center gap-4 border-dashed border-gray-700">
                    <Video size={48} className="text-gray-600" />
                    <h3 className="text-xl font-bold text-gray-300">No videos yet</h3>
                    <p className="text-gray-500">Create smooth animations and save them to your library.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {videos.map(vid => (
                        <div key={vid.id} className="glass-panel group rounded-xl overflow-hidden border border-gray-800 hover:border-neon-green/50 transition-all duration-300 drop-shadow-accent">

                            <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                                <video
                                    src={vid.url}
                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                    muted
                                    loop
                                    onMouseEnter={(e) => e.target.play()}
                                    onMouseLeave={(e) => { e.target.pause(); e.target.currentTime = 0; }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="bg-black/50 p-4 rounded-full backdrop-blur-md">
                                        <Play className="text-neon-green" fill="currentColor" size={24} />
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 flex flex-col gap-3">
                                <p className="text-sm text-gray-300 line-clamp-2 font-medium" title={vid.prompt}>
                                    {vid.prompt}
                                </p>
                                <div className="flex items-center justify-between mt-2 pt-4 border-t border-gray-800/50">
                                    <span className="text-xs text-gray-500">
                                        {new Date(vid.date).toLocaleDateString()}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <a
                                            href={vid.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-gray-400 hover:text-neon-green p-1 transition-colors"
                                            title="Open full video"
                                        >
                                            <ExternalLink size={16} />
                                        </a>
                                        <button
                                            onClick={() => handleDelete(vid.id)}
                                            className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                                            title="Delete"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
