import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Image as ImageIcon, Video, FolderHeart, LayoutGrid, LogOut } from 'lucide-react';

const NavItem = ({ to, icon, label }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive
                ? 'bg-neon-green/10 text-neon-green border border-neon-green/30 shadow-[0_0_15px_rgba(57,255,20,0.15)]'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`
        }
    >
        {icon}
        <span className="font-medium">{label}</span>
    </NavLink>
);

const Layout = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="flex h-screen w-full bg-[#050505] overflow-hidden text-gray-100">
            {/* Sidebar navigation */}
            <nav className="w-64 glass-panel border-r border-t-0 border-b-0 border-l-0 p-6 flex flex-col z-10 shrink-0">
                <div className="mb-10 flex items-center gap-3 px-1">
                    <div className="w-10 h-10 rounded-xl bg-neon-green shadow-neon flex items-center justify-center shrink-0">
                        <span className="text-black font-black text-2xl">CS</span>
                    </div>
                    <div className="flex flex-col leading-none">
                        <span className="text-[10px] font-bold text-neon-green uppercase tracking-[0.2em] mb-1">Premium AI</span>
                        <h1 className="text-xl font-black tracking-tighter premium-title">
                            CreatorStudio
                        </h1>
                    </div>
                </div>

                <div className="flex flex-col gap-2 flex-grow">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Studio</p>
                    <NavItem to="/image-generator" icon={<ImageIcon size={20} />} label="Image Gen" />
                    <NavItem to="/video-generator" icon={<Video size={20} />} label="Video Gen" />

                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-6 px-2">Library</p>
                    <NavItem to="/saved-images" icon={<LayoutGrid size={20} />} label="Saved Images" />
                    <NavItem to="/saved-videos" icon={<FolderHeart size={20} />} label="Saved Videos" />
                </div>

                <div className="mt-auto px-2 space-y-4">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-gray-400 hover:text-red-500 hover:bg-red-500/10 w-full group"
                    >
                        <LogOut size={18} className="group-hover:rotate-12 transition-transform" />
                        <span className="font-medium">Sign Out</span>
                    </button>
                    <div className="text-xs text-gray-600 font-medium px-2 italic">v1.0.0 Pro Dashboard</div>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="flex-1 relative overflow-hidden flex flex-col">
                {/* Top ambient glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-neon-green/5 blur-[120px] rounded-full pointer-events-none" />

                <div className="flex-1 overflow-y-auto p-8 z-10 custom-scrollbar">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
