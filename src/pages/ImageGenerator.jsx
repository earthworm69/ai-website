import React, { useState } from 'react';
import { Sparkles, Download, Loader2, Plus } from 'lucide-react';
import { authFetch } from '../utils/api';

export default function ImageGenerator() {
    const [prompt, setPrompt] = useState('');
    const [model, setModel] = useState('gemini-pro');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImage, setGeneratedImage] = useState(null);
    const [error, setError] = useState('');
    const [isModelOpen, setIsModelOpen] = useState(false);

    console.log("Selected Model:", model);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setIsGenerating(true);
        setError('');
        setGeneratedImage(null);

        try {
            console.log("Generating image with prompt:", prompt);
            console.log("Model:", model);

            const response = await authFetch('/generate-image', {
                method: 'POST',
                body: JSON.stringify({ prompt, model }),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("ERROR:", data);
                alert(data.error || JSON.stringify(data) || "Generation failed");
                throw new Error(data.error || 'Generation failed');
            }

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

    const models = [
        { id: 'gemini-pro', name: 'Gemini 3 Pro (Nano Banana Pro)' },
        { id: 'gemini-flash', name: 'Gemini 3.1 Flash (Nano Banana 2)' },
        { id: 'qwen', name: 'Qwen Image' }
    ];

    return (
        <div className="max-w-5xl mx-auto flex flex-col gap-8">
            <header>
                <h1 className="text-4xl font-black mb-2 tracking-tighter premium-title text-transparent bg-clip-text bg-gradient-to-r from-neon-green to-emerald-400">AI CreatorStudio</h1>
                <p className="text-gray-400">Transform your imagination into visual reality using state-of-the-art AI.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Input Controls */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4 relative overflow-visible group border border-white/5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Prompt</label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Describe what you want to see... e.g. 'A futuristic cyberpunk city with neon lights'"
                                className="w-full h-32 bg-black/50 border border-gray-800 rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-neon-green/50 focus:ring-1 focus:ring-neon-green/50 transition-all resize-none"
                            />
                        </div>

                        <div className="space-y-2 relative">
                            <label className="text-sm font-medium text-gray-300">AI Model</label>
                            <div 
                                onClick={() => setIsModelOpen(!isModelOpen)}
                                className="w-full bg-black/50 border border-gray-800 rounded-xl p-3 text-white flex justify-between items-center cursor-pointer hover:border-neon-green/30 transition-all"
                            >
                                <span>{models.find(m => m.id === model)?.name || 'Select Model'}</span>
                                <Plus size={16} className={`transition-transform duration-300 ${isModelOpen ? 'rotate-45' : ''}`} />
                            </div>
                            
                            {isModelOpen && (
                                <div className="absolute top-full left-0 w-full mt-2 bg-[#111]/95 backdrop-blur-xl border border-gray-800 rounded-xl overflow-y-auto z-[9999] shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[250px] pb-2">
                                    {models.map((m) => (
                                        <div 
                                            key={m.id}
                                            onClick={() => {
                                                setModel(m.id);
                                                setIsModelOpen(false);
                                            }}
                                            className={`p-3 hover:bg-neon-green/10 cursor-pointer transition-colors text-sm ${model === m.id ? 'text-neon-green bg-neon-green/5' : 'text-gray-400'}`}
                                        >
                                            {m.name}
                                        </div>
                                    ))}
                                </div>
                            )}
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
