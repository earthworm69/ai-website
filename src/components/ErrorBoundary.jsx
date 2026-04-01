import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-center">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-neon-green/5 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="glass-panel p-10 rounded-2xl max-w-md w-full border border-red-500/20 relative z-10">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="text-red-500" size={32} />
            </div>
            
            <h1 className="text-2xl font-black text-white mb-3 tracking-tight">Something went wrong</h1>
            <p className="text-gray-400 mb-8 text-sm leading-relaxed">
              An unexpected error occurred and the application had to stop. Please try refreshing the page.
            </p>
            
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-neon-green text-black font-bold py-4 rounded-xl shadow-neon hover:shadow-[0_0_20px_rgba(57,255,20,0.4)] transition-all flex items-center justify-center gap-2"
            >
              <RefreshCcw size={18} /> Reload Application
            </button>
            
            {process.env.NODE_ENV === 'development' && (
              <pre className="mt-6 p-4 bg-black/40 rounded-lg text-left text-[10px] text-red-400/60 overflow-auto max-h-32 border border-white/5">
                {this.state.error?.toString()}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
