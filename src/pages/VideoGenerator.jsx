import { useState, useEffect } from 'react';
import { PlaySquare, Upload, Loader2, Sparkles, CheckCircle2, X, Plus, Image } from 'lucide-react';
import { authFetch } from '../utils/api';

export default function VideoGenerator() {
    const [prompt, setPrompt] = useState('');
    const [startFrame, setStartFrame] = useState(null);
    const [endFrame, setEndFrame] = useState(null);
    const [style, setStyle] = useState('default');
    const [customModifiers, setCustomModifiers] = useState('');
    const [status, setStatus] = useState('idle'); // idle, generating, polling, completed, error
    const [jobId, setJobId] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [model, setModel] = useState('veo');
    const [isModelOpen, setIsModelOpen] = useState(false);
    const [isStyleOpen, setIsStyleOpen] = useState(false);

    console.log("Start Frame:", startFrame);
    console.log("End Frame:", endFrame);
    console.log("Selected Model:", model);

    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    const enhancePrompt = (p, s, c) => {
        let base = p;
        switch (s) {
            case 'cinematic':
                base = `cinematic lighting, high quality, dramatic, ${p}`;
                break;
            case 'ultra':
                base = `ultra realistic, 8k, highly detailed, ${p}`;
                break;
            case 'anime':
                base = `anime style, vibrant colors, ${p}`;
                break;
            case 'custom':
                base = `${c}, ${p}`;
                break;
            default:
                break;
        }
        return base;
    };

    const handleFileUpload = (e, target) => {
        const file = e.target.files?.[0];
        if (!file) return;
        console.log(`Uploaded ${target} frame:`, file);
        if (target === 'start') setStartFrame(file);
        if (target === 'end') setEndFrame(file);
    };

    // Polling effect
    useEffect(() => {
        let interval;
        if (status === 'polling' && jobId) {
            console.log(`Starting polling for job: ${jobId}`);
            interval = setInterval(async () => {
                try {
                    const res = await authFetch(`/video-status/${jobId}`);
                    const data = await res.json();
                    
                    console.log(`Polling status for ${jobId}:`, data?.status);

                    if (data?.status === 'completed' && data?.videoUrl) {
                        setStatus('completed');
                        setVideoUrl(data.videoUrl);
                        clearInterval(interval);
                    } else if (data?.status === 'error' || data?.status === 'failed') {
                        setStatus('error');
                        clearInterval(interval);
                    }
                } catch (error) {
                    console.error("Polling error:", error);
                }
            }, 5000);
        }
        return () => clearInterval(interval);
    }, [status, jobId]);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setStatus('generating');
        setVideoUrl('');

        try {
            const finalPrompt = enhancePrompt(prompt, style, customModifiers);
            console.log("Generating video with prompt:", finalPrompt);
            console.log("Model:", model);
            console.log("Start Frame:", startFrame);
            console.log("End Frame:", endFrame);
            
            let startB64 = null;
            let endB64 = null;

            if (startFrame instanceof File) {
                startB64 = await fileToBase64(startFrame);
            }
            if (endFrame instanceof File) {
                endB64 = await fileToBase64(endFrame);
            }

            const response = await authFetch('/generate-video', {
                method: 'POST',
                body: JSON.stringify({ 
                    prompt: finalPrompt, 
                    model, 
                    startFrame: startB64, 
                    endFrame: endB64 
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("ERROR:", data);
                alert(data.error || JSON.stringify(data) || "Generation failed");
                throw new Error(data.error || 'Video generation failed to start');
            }

            const id = data?.job_id;
            
            if (id) {
                setJobId(id);
                setStatus('polling');
            } else {
                throw new Error('No job ID received from server');
            }
        } catch (err) {
            console.error("Video generation start error:", err);
            setStatus('error');
        }
    };

    const handleSave = () => {
        if (!videoUrl) return;
        const saved = JSON.parse(localStorage.getItem('savedVideos') || '[]');
        const newVideo = { id: Date.now(), url: videoUrl, prompt, date: new Date().toISOString() };
        localStorage.setItem('savedVideos', JSON.stringify([newVideo, ...saved]));
        alert('Video saved to library!');
    };

    return (
        <div className="max-w-5xl mx-auto flex flex-col gap-8">
            <header>
                <h1 className="text-4xl font-black mb-2 tracking-tighter premium-title text-transparent bg-clip-text bg-gradient-to-r from-neon-green to-emerald-400">AI CreatorStudio</h1>
                <p className="text-gray-400">Bring your ideas to life with cinematic AI motion.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-5 space-y-6">
                    <div className="glass-panel p-0 rounded-2xl flex flex-col relative overflow-visible group border border-white/5">
                        <div className="p-6 pb-0 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                {/* Start Frame Uploader */}
                                <label className="relative group/upload h-32 border-2 border-dashed border-gray-700 hover:border-neon-green/50 rounded-xl overflow-hidden cursor-pointer transition-all bg-black/20 block">
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        accept="image/*" 
                                        onChange={(e) => handleFileUpload(e, 'start')} 
                                    />
                                    {startFrame ? (
                                        <div className="relative w-full h-full">
                                            <img 
                                                src={URL.createObjectURL(startFrame)} 
                                                alt="Start preview" 
                                                className="w-full h-full object-cover" 
                                            />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/upload:opacity-100 transition-opacity">
                                                <Plus size={24} className="text-white" />
                                            </div>
                                            <button 
                                                onClick={(e) => { e.preventDefault(); setStartFrame(null); }}
                                                className="absolute top-2 right-2 p-1 bg-black/60 rounded-full text-white hover:bg-red-500 transition-colors z-10"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center w-full h-full gap-2 px-2">
                                            <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center group-hover/upload:bg-neon-green/10 transition-colors">
                                                <Plus size={18} className="text-gray-400 group-hover/upload:text-neon-green" />
                                            </div>
                                            <span className="text-[10px] font-medium text-center text-gray-500 uppercase tracking-wider group-hover/upload:text-gray-300">Start Frame</span>
                                        </div>
                                    )}
                                </label>

                                {/* End Frame Uploader */}
                                <label className="relative group/upload h-32 border-2 border-dashed border-gray-700 hover:border-neon-green/50 rounded-xl overflow-hidden cursor-pointer transition-all bg-black/20 block">
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        accept="image/*" 
                                        onChange={(e) => handleFileUpload(e, 'end')} 
                                    />
                                    {endFrame ? (
                                        <div className="relative w-full h-full">
                                            <img 
                                                src={URL.createObjectURL(endFrame)} 
                                                alt="End preview" 
                                                className="w-full h-full object-cover" 
                                            />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/upload:opacity-100 transition-opacity">
                                                <Plus size={24} className="text-white" />
                                            </div>
                                            <button 
                                                onClick={(e) => { e.preventDefault(); setEndFrame(null); }}
                                                className="absolute top-2 right-2 p-1 bg-black/60 rounded-full text-white hover:bg-red-500 transition-colors z-10"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center w-full h-full gap-2 px-2">
                                            <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center group-hover/upload:bg-neon-green/10 transition-colors">
                                                <Plus size={18} className="text-gray-400 group-hover/upload:text-neon-green" />
                                            </div>
                                            <span className="text-[10px] font-medium text-center text-gray-500 uppercase tracking-wider group-hover/upload:text-gray-300">End Frame</span>
                                        </div>
                                    )}
                                </label>
                            </div>

                            {/* Custom Dropdowns */}
                            <div className="space-y-4">
                                <div className="space-y-2 relative">
                                    <label className="text-sm font-medium text-gray-300">Video Model</label>
                                    <div 
                                        onClick={() => setIsModelOpen(!isModelOpen)}
                                        className="w-full bg-black/50 border border-gray-800 rounded-xl p-3 text-white flex justify-between items-center cursor-pointer hover:border-neon-green/30 transition-all"
                                    >
                                        <span className="capitalize">{model.replace(/-/g, ' ')}</span>
                                        <Plus size={16} className={`transition-transform duration-300 ${isModelOpen ? 'rotate-45' : ''}`} />
                                    </div>
                                    {isModelOpen && (
                                        <div className="absolute top-full left-0 w-full mt-2 bg-[#111]/95 backdrop-blur-xl border border-gray-800 rounded-xl overflow-y-auto z-[9999] shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[250px] pb-2">
                                            {[
                                                { id: 'veo', name: 'Veo 3.1' },
                                                { id: 'wan', name: 'Wan 2.6 Video' },
                                                { id: 'kling-standard', name: 'Kling Video v3 Standard' },
                                                { id: 'kling-pro', name: 'Kling Video v3 Pro' }
                                            ].map((m) => (
                                                <div 
                                                    key={m.id}
                                                    onClick={() => { setModel(m.id); setIsModelOpen(false); }}
                                                    className={`p-3 hover:bg-neon-green/10 cursor-pointer transition-colors text-sm ${model === m.id ? 'text-neon-green bg-neon-green/5' : 'text-gray-400'}`}
                                                >
                                                    {m.name}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2 relative">
                                    <label className="text-sm font-medium text-gray-300">Visual Style</label>
                                    <div 
                                        onClick={() => setIsStyleOpen(!isStyleOpen)}
                                        className="w-full bg-black/50 border border-gray-800 rounded-xl p-3 text-white flex justify-between items-center cursor-pointer hover:border-neon-green/30 transition-all"
                                    >
                                        <span className="capitalize">{style}</span>
                                        <Plus size={16} className={`transition-transform duration-300 ${isStyleOpen ? 'rotate-45' : ''}`} />
                                    </div>
                                    {isStyleOpen && (
                                        <div className="absolute top-full left-0 w-full mt-2 bg-[#111]/95 backdrop-blur-xl border border-gray-800 rounded-xl overflow-y-auto z-[9999] shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[250px] pb-2">
                                            {['default', 'cinematic', 'ultra', 'anime', 'custom'].map((s) => (
                                                <div 
                                                    key={s}
                                                    onClick={() => { setStyle(s); setIsStyleOpen(false); }}
                                                    className={`p-3 hover:bg-neon-green/10 cursor-pointer transition-colors text-sm capitalize ${style === s ? 'text-neon-green bg-neon-green/5' : 'text-gray-400'}`}
                                                >
                                                    {s}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {style === 'custom' && (
                                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <label className="text-sm font-medium text-gray-300">Custom Modifiers</label>
                                        <input
                                            type="text"
                                            value={customModifiers}
                                            onChange={(e) => setCustomModifiers(e.target.value)}
                                            placeholder="e.g. 'noir style, foggy atmosphere'"
                                            className="w-full bg-black/50 border border-gray-800 rounded-xl p-3 text-white placeholder-gray-600 focus:outline-none focus:border-neon-green/50 transition-all"
                                        />
                                    </div>
                                )}

                                <div className="space-y-2 pb-6">
                                    <label className="text-sm font-medium text-gray-300">Motion Prompt</label>
                                    <textarea
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        placeholder="Describe the motion and scene..."
                                        className="w-full h-32 bg-black/50 border border-gray-800 rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-neon-green/50 focus:ring-1 focus:ring-neon-green/50 transition-all resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-black/40 border-t border-white/5">
                            <button
                                onClick={handleGenerate}
                                disabled={(status === 'generating' || status === 'polling') || !prompt.trim()}
                                className="w-full bg-neon-green text-black font-bold py-4 rounded-xl shadow-neon hover:shadow-[0_0_25px_rgba(57,255,20,0.6)] hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {status === 'generating' || status === 'polling' ? (
                                    <>
                                        <Loader2 className="animate-spin" /> {status === 'polling' ? 'Rendering Video...' : 'Initializing...'}
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={20} /> Generate Video
                                    </>
                                )}
                            </button>
                            {status === 'error' && <p className="text-red-500 text-sm mt-3">Action failed. Re-try.</p>}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-7">
                    <div className="glass-panel rounded-2xl h-full min-h-[500px] flex items-center justify-center p-2 relative group overflow-hidden border-gray-800 border drop-shadow-accent">
                        {status === 'generating' || status === 'polling' ? (
                            <div className="flex flex-col items-center gap-6 w-full max-w-sm px-8">
                                <div className="relative w-24 h-24 flex items-center justify-center aspect-square">
                                    <div className="absolute inset-0 border-4 border-gray-800 rounded-full"></div>
                                    <div className="absolute inset-0 border-4 border-neon-green rounded-full border-t-transparent animate-spin"></div>
                                    <PlaySquare className="text-neon-green animate-pulse" size={32} />
                                </div>
                                <div className="w-full space-y-2">
                                    <div className="flex justify-between text-xs text-gray-400 font-medium">
                                        <span>{status === 'polling' ? 'Rendering pass 3/4' : 'Preparing assets'}</span>
                                        <span className="text-neon-green animate-pulse">Processing...</span>
                                    </div>
                                    <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-neon-green shadow-neon w-2/3 animate-[pulse-slow_3s_ease-in-out_infinite]"></div>
                                    </div>
                                </div>
                            </div>
                        ) : status === 'completed' && videoUrl ? (
                            <>
                                <video
                                    src={videoUrl}
                                    controls
                                    autoPlay
                                    loop
                                    className="w-full h-full object-cover rounded-xl bg-black"
                                />
                                <div className="absolute bottom-6 flex justify-center w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <button
                                        onClick={handleSave}
                                        className="glass-panel text-white border border-white/10 px-6 py-2 rounded-full font-medium flex items-center gap-2 hover:bg-white/10 hover:border-white/30 transition-all backdrop-blur-md"
                                    >
                                        <CheckCircle2 size={18} className="text-neon-green" /> Save Video
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="text-gray-600 flex flex-col items-center gap-3">
                                <PlaySquare size={32} className="opacity-20" />
                                <p>Your generated motion will appear here</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
