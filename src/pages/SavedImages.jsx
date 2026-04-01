import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';

export default function SavedImages() {
    const [images, setImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('savedImages') || '[]');
        setImages(saved);
    }, []);

    const handleDelete = (id, e) => {
        e.stopPropagation();
        const updated = images.filter(img => img.id !== id);
        setImages(updated);
        localStorage.setItem('savedImages', JSON.stringify(updated));
    };

    return (
        <div className="max-w-6xl mx-auto flex flex-col gap-8 pb-10">
            <header className="flex justify-between items-end border-b border-gray-800 pb-6">
                <div>
                    <h1 className="text-4xl font-black mb-2 tracking-tighter premium-title flex items-center gap-3">
                        <ImageIcon className="text-neon-green/80" size={36} /> My AI Studio
                    </h1>
                    <p className="text-gray-400">Your collection of AI generated visual concepts.</p>
                </div>
                <div className="text-sm font-medium text-neon-green bg-neon-green/10 px-4 py-1.5 rounded-full border border-neon-green/20">
                    {images.length} Items
                </div>
            </header>

            {images.length === 0 ? (
                <div className="glass-panel rounded-2xl p-16 flex flex-col items-center justify-center text-center gap-4 border-dashed border-gray-700">
                    <ImageIcon size={48} className="text-gray-600" />
                    <h3 className="text-xl font-bold text-gray-300">No images yet</h3>
                    <p className="text-gray-500">Generate and save some images to see them here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {images.map(img => (
                        <div
                            key={img.id}
                            className="glass-panel group rounded-xl overflow-hidden cursor-pointer hover:shadow-neon hover:border-neon-green transition-all duration-300 relative aspect-square drop-shadow-accent"
                            onClick={() => setSelectedImage(img)}
                        >
                            <img src={img.url} alt={img.prompt} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                <p className="text-sm text-white line-clamp-2 font-medium">{img.prompt}</p>
                                <p className="text-xs text-neon-green mt-1">
                                    {new Date(img.date).toLocaleDateString()}
                                </p>
                                <button
                                    onClick={(e) => handleDelete(img.id, e)}
                                    className="absolute top-3 right-3 bg-black/50 hover:bg-red-500/80 p-2 rounded-full text-white backdrop-blur-md transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Fullscreen Modal */}
            {selectedImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 sm:p-8" onClick={() => setSelectedImage(null)}>
                    <button className="absolute top-6 right-6 text-white hover:text-neon-green p-2 transition-colors">
                        <X size={32} />
                    </button>

                    <div className="max-w-5xl w-full flex flex-col md:flex-row gap-6 items-center" onClick={e => e.stopPropagation()}>
                        <div className="flex-1 w-full bg-black rounded-lg overflow-hidden border border-gray-800 shadow-[0_0_50px_rgba(57,255,20,0.1)]">
                            <img src={selectedImage.url} alt={selectedImage.prompt} className="w-full h-auto max-h-[80vh] object-contain" />
                        </div>

                        <div className="w-full md:w-80 glass-panel p-6 rounded-xl flex flex-col gap-4 self-stretch">
                            <h3 className="text-neon-green font-bold tracking-wider uppercase text-xs">Prompt Details</h3>
                            <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">{selectedImage.prompt}</p>
                            <div className="mt-auto pt-4 border-t border-gray-800 flex justify-between text-xs text-gray-500">
                                <span>Model: SD-XL</span>
                                <span>{new Date(selectedImage.date).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
