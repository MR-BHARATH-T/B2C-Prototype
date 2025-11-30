import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Bell, User, Sun, Moon, LogOut, LayoutDashboard, BookOpen, Video, Calendar, MessageCircle, Settings } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AuthService, DataService } from './services';
import * as Types from './types';

// --- Utils ---
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Primitive Components ---
export const Button = ({ children, variant = 'primary', size = 'md', className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'danger', size?: 'sm' | 'md' | 'lg' }) => {
  const base = "rounded-xl font-medium transition-all duration-200 active:scale-95 flex items-center justify-center gap-2";
  const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2",
      lg: "px-6 py-3 text-lg"
  };
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 hover:-translate-y-0.5",
    secondary: "bg-zinc-800 text-white hover:bg-zinc-900",
    outline: "border-2 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800",
    danger: "bg-red-500 text-white hover:bg-red-600"
  };
  return <button className={cn(base, sizes[size], variants[variant], className)} {...props}>{children}</button>;
};

export const Input = ({ label, error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string, error?: string }) => (
  <div className="flex flex-col gap-1.5 w-full">
    {label && <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{label}</label>}
    <input className={cn("px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white", error && "border-red-500", props.className)} {...props} />
    {error && <span className="text-xs text-red-500">{error}</span>}
  </div>
);

export const Card = ({ children, className }: { children?: React.ReactNode, className?: string }) => (
  <div className={cn("bg-white dark:bg-zinc-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-zinc-100 dark:border-zinc-700/50", className)}>
    {children}
  </div>
);

export const Badge = ({ children, color = 'blue', className }: { children?: React.ReactNode, color?: 'blue' | 'green' | 'yellow' | 'red', className?: string }) => {
    const colors = {
        blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
        green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
        red: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    }
    return <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold", colors[color], className)}>{children}</span>
}

// --- Complex Components ---

export const Navbar = ({ toggleSidebar }: { toggleSidebar?: () => void }) => {
  const [user, setUser] = useState<Types.User | null>(null);
  const [isDark, setIsDark] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = () => {
        const u = AuthService.getCurrentUser();
        setUser(u);
    };

    loadUser();
    // Listen for custom app event (single page interaction)
    window.addEventListener('lumina_user_updated', loadUser);
    // Listen for storage events (cross-tab interaction)
    window.addEventListener('storage', loadUser);
    
    const theme = localStorage.getItem('lumina_theme');
    if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        setIsDark(true);
        document.documentElement.classList.add('dark');
    }

    return () => {
        window.removeEventListener('lumina_user_updated', loadUser);
        window.removeEventListener('storage', loadUser);
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('lumina_theme', 'light');
        setIsDark(false);
    } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('lumina_theme', 'dark');
        setIsDark(true);
    }
  };

  const handleLogout = () => {
      AuthService.logout();
      navigate('/auth');
      // No reload needed as event will trigger user update
  };

  const getAvatarSrc = (u: Types.User) => {
    if (u.avatar && (u.avatar.startsWith('data:image') || u.avatar.startsWith('http'))) return u.avatar;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random`;
  };

  return (
    <nav className="fixed top-0 left-0 w-full h-16 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 z-50 flex items-center justify-between px-4 lg:px-8">
      <div className="flex items-center gap-4">
        {user && <button onClick={toggleSidebar} className="lg:hidden p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"><Menu className="w-5 h-5 dark:text-white" /></button>}
        <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">B2C.</Link>
      </div>

      <div className="flex items-center gap-4">
        <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            {isDark ? <Sun className="w-5 h-5 text-zinc-600 dark:text-zinc-300" /> : <Moon className="w-5 h-5 text-zinc-600" />}
        </button>

        {user ? (
          <div className="flex items-center gap-4">
            <Link to={user.role === 'Admin' ? '/admin/dashboard' : user.role === 'Instructor' ? '/instructor/dashboard' : '/student/dashboard'} className="hidden md:block font-medium dark:text-white hover:text-indigo-600">
                Dashboard
            </Link>
            
            <Link to="/profile" className="flex items-center gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 p-1.5 rounded-lg transition-colors group">
                <div className="w-8 h-8 rounded-full bg-indigo-100 overflow-hidden border border-indigo-200">
                    <img src={getAvatarSrc(user)} alt="User" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                </div>
                <span className="hidden md:block text-sm font-medium dark:text-zinc-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 max-w-[100px] truncate">{user.name}</span>
            </Link>

            <button onClick={handleLogout} className="text-zinc-500 hover:text-red-500 p-2"><LogOut className="w-5 h-5" /></button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Link to="/auth"><Button variant="outline" className="hidden sm:flex">Log In</Button></Link>
            <Link to="/auth?mode=register"><Button>Sign Up</Button></Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export const Sidebar = ({ isOpen, user, close }: { isOpen: boolean, user: Types.User, close: () => void }) => {
    const location = useLocation();
    const commonLinks = [
        { label: 'Dashboard', href: `/${user.role.toLowerCase()}/dashboard`, icon: LayoutDashboard },
        { label: 'Profile', href: '/profile', icon: User },
    ];
    
    const roleLinks = {
        Admin: [
            { label: 'Add Course', href: '/admin/add-course', icon: BookOpen },
            { label: 'Quiz Analytics', href: '/admin/quiz-analytics', icon: MessageCircle },
        ],
        Instructor: [
            { label: 'Create Course', href: '/instructor/create-course', icon: BookOpen },
            { label: 'Schedule Class', href: '/instructor/schedule', icon: Calendar },
        ],
        Student: [
            { label: 'My Learning', href: '/student/dashboard', icon: BookOpen },
            { label: 'Live Classes', href: '/student/live-classes', icon: Video },
        ]
    };

    const links = [...commonLinks, ...(roleLinks[user.role] || [])];

    return (
        <>
            {/* Backdrop with fade */}
            <div 
                className={cn(
                    "fixed inset-0 bg-black/40 z-40 lg:hidden transition-all duration-300 ease-in-out backdrop-blur-sm",
                    isOpen ? "opacity-100 visible" : "opacity-0 invisible"
                )} 
                onClick={close} 
            />
            
            {/* Sidebar with slide & fade */}
            <aside className={cn(
                "fixed top-16 left-0 w-64 h-[calc(100vh-64px)] bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 z-40 overflow-y-auto py-6 px-4",
                "transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1)", // Smooth cubic bezier
                isOpen 
                    ? "translate-x-0 opacity-100 shadow-xl" 
                    : "-translate-x-full opacity-0 lg:translate-x-0 lg:opacity-100 lg:shadow-none"
            )}>
                <div className="flex flex-col gap-2">
                    {links.map((link) => (
                        <Link 
                            key={link.href} 
                            to={link.href} 
                            onClick={() => window.innerWidth < 1024 && close()}
                            className={cn("flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-zinc-600 dark:text-zinc-400 hover:bg-indigo-50 dark:hover:bg-zinc-800 hover:text-indigo-600 dark:hover:text-indigo-400", 
                            location.pathname === link.href && "bg-indigo-50 dark:bg-zinc-800/50 text-indigo-600 dark:text-indigo-400")}
                        >
                            <link.icon className="w-5 h-5" />
                            {link.label}
                        </Link>
                    ))}
                </div>
            </aside>
        </>
    );
};

export const Layout = ({ children, requireAuth = false, allowedRoles }: { children?: React.ReactNode, requireAuth?: boolean, allowedRoles?: Types.Role[] }) => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const user = AuthService.getCurrentUser();
    const navigate = useNavigate();

    useEffect(() => {
        if (requireAuth) {
            if (!user) {
                navigate('/auth');
                return;
            }
            if (allowedRoles && !allowedRoles.includes(user.role)) {
                navigate('/'); // Or access denied page
            }
        }
    }, [user, requireAuth, allowedRoles, navigate]);

    // If it's a dashboard page or user is logged in for protected routes, show sidebar
    const showSidebar = requireAuth && user;

    return (
        <div className="min-h-screen pt-16">
            <Navbar toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
            {showSidebar ? (
                <div className="flex">
                    <Sidebar isOpen={isSidebarOpen} user={user} close={() => setSidebarOpen(false)} />
                    <main className="flex-1 lg:ml-64 p-4 lg:p-8 animate-fade-up">
                        {children}
                    </main>
                </div>
            ) : (
                <main className="animate-fade-up">
                    {children}
                </main>
            )}
        </div>
    );
};