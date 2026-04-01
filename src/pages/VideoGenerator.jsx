import { useState, useEffect } from 'react';
import { PlaySquare, Upload, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { authFetch } from '../utils/api';

export default function VideoGenerator() {
    const [prompt, setPrompt] = useState('');
    const [startFrame, setStartFrame] = useState(null);
    const [endFrame, setEndFrame] = useState(null);
    const [status, setStatus] = useState('idle'); // idle, generating, polling, completed, error
    const [jobId, setJobId] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [model, setModel] = useState('veo-3.1');

    // Polling effect
    useEffect(() => {
        let interval;
        if (status === 'polling' && jobId) {
            interval = setInterval(async () => {
                try {
                    const res = await authFetch(`/video-status/${jobId}`);
                    const data = await res.json();

                    if (data.status === 'completed') {
                        setStatus('completed');
                        setVideoUrl(data.videoUrl);
                        clearInterval(interval);
                    } else if (data.status === 'error') {
                        setStatus('error');
                        clearInterval(interval);
                    }
                } catch (error) {
                    console.error(error);
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
            const response = await authFetch('/generate-video', {
                method: 'POST',
                body: JSON.stringify({ prompt, model }),
            });

            if (!response.ok) throw new Error('Failed to start video generation');

            const data = await response.json();
            setJobId(data.job_id);
            setStatus('polling');
        } catch (err) {
            console.error(err);
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
                <h1 className="text-4xl font-black mb-2 tracking-tighter premium-title">AI CreatorStudio</h1>
                <p className="text-gray-400">Bring your ideas to life with cinematic AI motion.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-5 space-y-6">
                    <div className="glass-panel p-6 rounded-2xl flex flex-col gap-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-transparent via-neon-green to-transparent opacity-30 group-hover:opacity-80 transition-opacity"></div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="border border-dashed border-gray-700 hover:border-neon-green/50 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-black/20">
                                <Upload size={20} className="text-gray-400" />
                                <span className="text-xs text-center text-gray-400">Start Frame<br />(Optional)</span>
                            </div>
                            <div className="border border-dashed border-gray-700 hover:border-neon-green/50 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-black/20">
                                <Upload size={20} className="text-gray-400" />
                                <span className="text-xs text-center text-gray-400">End Frame<br />(Optional)</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Video Model</label>
                            <select
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                                className="w-full bg-black/50 border border-gray-800 rounded-xl p-3 text-white focus:outline-none focus:border-neon-green/50 transition-all appearance-none cursor-pointer drop-shadow-accent"
                            >
                                <option value="veo-3.1">Veo 3.1</option>
                                <option value="wan-2.6">Wan 2.6 Video</option>
                                <option value="kling-v3-standard">Kling Video v3 Standard</option>
                                <option value="kling-v3-pro">Kling Video v3 Pro</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Motion Prompt</label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Describe the motion and scene... e.g. 'Camera pans slowly across a misty glowing forest...'"
                                className="w-full h-32 bg-black/50 border border-gray-800 rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-neon-green/50 focus:ring-1 focus:ring-neon-green/50 transition-all resize-none"
                            />
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={(status === 'generating' || status === 'polling') || !prompt.trim()}
                            className="w-full bg-neon-green text-black font-bold py-4 rounded-xl shadow-neon hover:shadow-[0_0_25px_rgba(57,255,20,0.6)] hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2 drop-shadow-accent"
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
                        {status === 'error' && <p className="text-red-500 text-sm">Action failed. Re-try.</p>}
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
