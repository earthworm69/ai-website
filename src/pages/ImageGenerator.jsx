import React, { useState } from 'react';
import { Sparkles, Download, Loader2 } from 'lucide-react';
import { authFetch } from '../utils/api';

export default function ImageGenerator() {
    const [prompt, setPrompt] = useState('');
    const [model, setModel] = useState('gemini-3-pro-image');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImage, setGeneratedImage] = useState(null);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setIsGenerating(true);
        setError('');
        setGeneratedImage(null);

        try {
            const response = await authFetch('/generate-image', {
                method: 'POST',
                body: JSON.stringify({ prompt, model }),
            });

            if (!response.ok) throw new Error('Generation failed: ' + response.statusText);

            const data = await response.json();
            const imageUrl = data?.imageUrl;
            
            if (imageUrl) {
                setGeneratedImage(imageUrl);
            } else {
                throw new Error('No image URL received from server');
            }
        } catch (err) {
            console.error("Image generation error:", err);
            setError(err.message || 'Generation failed. Please check your connection.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = () => {
        if (!generatedImage) return;
        const saved = JSON.parse(localStorage.getItem('savedImages') || '[]');
        const newImage = { id: Date.now(), url: generatedImage, prompt, date: new Date().toISOString() };
        localStorage.setItem('savedImages', JSON.stringify([newImage, ...saved]));
        alert('Image saved to library!');
    };

    return (
        <div className="max-w-5xl mx-auto flex flex-col gap-8">
            <header>
                <h1 className="text-4xl font-black mb-2 tracking-tighter premium-title">AI CreatorStudio</h1>
                <p className="text-gray-400">Transform your imagination into visual reality using state-of-the-art AI.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Input Controls */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-green to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Prompt</label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Describe what you want to see... e.g. 'A futuristic cyberpunk city with neon lights'"
                                className="w-full h-32 bg-black/50 border border-gray-800 rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-neon-green/50 focus:ring-1 focus:ring-neon-green/50 transition-all resize-none"
                            />
                        </div>

                        <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">AI Model</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-black/50 border border-gray-800 rounded-xl p-3 text-white focus:outline-none focus:border-neon-green/50 transition-all appearance-none cursor-pointer"
              >
                <option value="gemini-3-pro-image">Gemini 3 Pro (Nano Banana Pro)</option>
                <option value="gemini-3.1-flash-image">Gemini 3.1 Flash (Nano Banana 2)</option>
                <option value="qwen-image">Qwen Image</option>
              </select>
            </div>
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || !prompt.trim()}
                            className="mt-4 w-full bg-neon-green text-black font-bold py-4 rounded-xl shadow-neon hover:shadow-[0_0_25px_rgba(57,255,20,0.6)] hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2 drop-shadow-accent"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="animate-spin" /> Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={20} /> Generate Image
                                </>
                            )}
                        </button>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                    </div>
                </div>

                {/* Output Area */}
                <div className="lg:col-span-7">
                    <div className="glass-panel rounded-2xl h-full min-h-[500px] flex items-center justify-center p-2 relative group overflow-hidden border-gray-800 border drop-shadow-accent">
                        {isGenerating ? (
                            <div className="flex flex-col items-center gap-4 text-neon-green">
                                <Loader2 size={48} className="animate-spin opacity-80" />
                                <div className="text-sm font-medium tracking-widest uppercase animate-pulse">Synthesizing...</div>
                            </div>
                        ) : generatedImage ? (
                            <>
                                <img
                                    src={generatedImage}
                                    alt="Generated AI art"
                                    className="w-full h-full object-cover rounded-xl"
                                />
                                <div className="absolute bottom-6 flex justify-center w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <button
                                        onClick={handleSave}
                                        className="glass-panel text-white border border-white/10 px-6 py-2 rounded-full font-medium flex items-center gap-2 hover:bg-white/10 hover:border-white/30 transition-all backdrop-blur-md"
                                    >
                                        <Download size={18} /> Save to Library
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="text-gray-600 flex flex-col items-center gap-3">
                                <Sparkles size={32} className="opacity-20" />
                                <p>Your creation will appear here</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
