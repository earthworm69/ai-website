import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../utils/api';
import { Loader2, Lock, User } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-green/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-md z-10">
        <div className="mb-10 flex items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-neon-green shadow-neon flex items-center justify-center">
            <span className="text-black font-black text-2xl">CS</span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter premium-title">
            CreatorStudio
          </h1>
        </div>

        <div className="glass-panel p-8 rounded-2xl drop-shadow-accent">
          <h2 className="text-2xl font-bold mb-6 tracking-tight text-center">Login to your Studio</h2>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Username</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full bg-black/50 border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-neon-green/50 transition-all border-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-black/50 border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-neon-green/50 transition-all border-none"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm font-medium flex gap-2 animate-shake">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !username || !password}
              className="w-full bg-neon-green text-black font-bold py-4 rounded-xl shadow-neon hover:shadow-[0_0_25px_rgba(57,255,20,0.6)] hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2 drop-shadow-accent mt-4"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" /> Authenticating...
                </>
              ) : (
                'Log In'
              )}
            </button>
          </form>
          
          <p className="mt-8 text-center text-xs text-gray-600 font-medium">
            AI CreatorStudio • v1.0.0 Pro Dashboard
          </p>
        </div>
      </div>
    </div>
  );
}
