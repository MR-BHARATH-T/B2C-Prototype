
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Layout, Button, Card, Badge, Input } from '../components';
import { DataService, AuthService } from '../services';
import * as Types from '../types';
import { Search, PlayCircle, Lock, BookOpen, Target, Users, Globe, Award, Sparkles, Linkedin, Twitter, Github } from 'lucide-react';

export const Home = () => {
    const [courses, setCourses] = useState<Types.Course[]>([]);
    
    useEffect(() => {
        setCourses(DataService.getCourses().slice(0, 3));
    }, []);

    return (
        <Layout>
            {/* Hero */}
            <section className="relative py-20 lg:py-32 px-6 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-200/50 via-zinc-50/0 to-white/0 dark:from-indigo-900/30 dark:via-zinc-900/0 -z-10"></div>
                <div className="max-w-7xl mx-auto text-center space-y-8">
                    <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-zinc-900 dark:text-white">
                        Unlock Your <span className="text-indigo-600">Potential</span>.
                    </h1>
                    <p className="text-xl text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto">
                        Master the skills of tomorrow, today. Join thousands of learners on B2C, the platform designed for the modern age.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link to="/courses"><Button className="text-lg px-8 py-3">Explore Courses</Button></Link>
                        <Link to="/about"><Button variant="outline" className="text-lg px-8 py-3">Learn More</Button></Link>
                    </div>
                </div>
            </section>

            {/* Trending */}
            <section className="max-w-7xl mx-auto px-6 py-20">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h2 className="text-3xl font-bold dark:text-white">Trending Courses</h2>
                        <p className="text-zinc-500 mt-2">The most popular classes this week</p>
                    </div>
                    <Link to="/courses" className="text-indigo-600 font-medium hover:underline">View All</Link>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {courses.map(course => (
                        <Link to={`/course/${course.id}`} key={course.id} className="group">
                            <Card className="h-full p-0 overflow-hidden hover:shadow-xl transition-all duration-300 border-0">
                                <div className="h-48 overflow-hidden relative">
                                    <img src={course.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={course.title} />
                                    <div className="absolute top-4 left-4">
                                        <Badge>{course.category}</Badge>
                                    </div>
                                </div>
                                <div className="p-6 space-y-4">
                                    <h3 className="text-xl font-bold dark:text-white group-hover:text-indigo-600 transition-colors">{course.title}</h3>
                                    <div className="flex justify-between text-sm text-zinc-500 dark:text-zinc-400">
                                        <span>{course.instructorName}</span>
                                        <span>{course.hours} Hours</span>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            </section>
        </Layout>
    );
};

export const Courses = () => {
    const [courses, setCourses] = useState<Types.Course[]>([]);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        setCourses(DataService.getCourses());
    }, []);

    const filtered = courses.filter(c => 
        c.title.toLowerCase().includes(search.toLowerCase()) && 
        (filter === 'All' || c.category === filter)
    );

    const categories = ['All', ...Array.from(new Set(courses.map(c => c.category)))];

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
                <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
                    <h1 className="text-3xl font-bold dark:text-white">Browse Courses</h1>
                    <div className="flex gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                            <input 
                                placeholder="Search courses..." 
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <select 
                            className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 outline-none dark:text-white"
                            value={filter}
                            onChange={e => setFilter(e.target.value)}
                        >
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map(course => (
                        <Link to={`/course/${course.id}`} key={course.id}>
                            <Card className="hover:shadow-lg transition-all p-0 overflow-hidden h-full flex flex-col">
                                <img src={course.thumbnail} className="h-48 w-full object-cover" alt={course.title} />
                                <div className="p-6 flex flex-col flex-1 gap-4">
                                    <div className="flex justify-between items-start">
                                        <Badge color="blue">{course.level}</Badge>
                                        <span className="text-sm font-semibold text-indigo-600">{course.hours}h</span>
                                    </div>
                                    <h3 className="text-xl font-bold dark:text-white flex-1">{course.title}</h3>
                                    <p className="text-sm text-zinc-500 line-clamp-2">{course.description}</p>
                                    <div className="pt-4 border-t border-zinc-100 dark:border-zinc-700 mt-auto">
                                        <span className="text-sm text-zinc-600 dark:text-zinc-400">By {course.instructorName}</span>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </Layout>
    );
};

export const CourseDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const course = DataService.getCourses().find(c => c.id === id);
    const user = AuthService.getCurrentUser();
    const [isEnrolled, setIsEnrolled] = useState(false);

    useEffect(() => {
        if (user && course) {
            const enrollments = DataService.getEnrollments(user.email);
            setIsEnrolled(!!enrollments.find(e => e.courseId === course.id));
        }
    }, [user, course]);

    const handleEnroll = () => {
        if (!user) return navigate('/auth');
        if (course) {
            DataService.enroll(user.email, course.id);
            DataService.addNotification(user.email, `Welcome to ${course.title}! Start learning now.`);
            navigate('/student/dashboard');
        }
    };

    if (!course) return <Layout><div className="p-20 text-center text-xl text-zinc-500">Course not found</div></Layout>;

    return (
        <Layout>
            <div className="bg-zinc-900 text-white py-20 px-6">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <Badge color="yellow">{course.category}</Badge>
                        <h1 className="text-4xl md:text-5xl font-bold">{course.title}</h1>
                        <p className="text-lg text-zinc-300">{course.description}</p>
                        <div className="flex gap-6 text-sm">
                            <span>Level: {course.level}</span>
                            <span>Duration: {course.hours} Hours</span>
                            <span>Instructor: {course.instructorName}</span>
                        </div>
                        <div className="flex gap-4 pt-4">
                            {isEnrolled ? (
                                <Link to={`/student/course/${course.id}`}><Button className="px-8 py-3 text-lg">Continue Learning</Button></Link>
                            ) : (
                                <Button onClick={handleEnroll} className="px-8 py-3 text-lg">Enroll Now</Button>
                            )}
                        </div>
                    </div>
                    <div className="rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/20">
                        <img src={course.thumbnail} className="w-full object-cover" alt="Course" />
                    </div>
                </div>
            </div>
            {/* Additional Tabs or Details could go here */}
        </Layout>
    );
};

export const Auth = () => {
    const [searchParams] = useSearchParams();
    const isRegisterMode = searchParams.get('mode') === 'register';
    const [isRegister, setIsRegister] = useState(isRegisterMode);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Student' as Types.Role });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            if (isRegister) {
                if(formData.role === 'Admin') throw new Error("Cannot register as Admin");
                // Pass password to register function
                AuthService.register(formData.name, formData.email, formData.role as 'Instructor' | 'Student', formData.password);
                // Auto login after register
                const user = AuthService.login(formData.email, formData.password); 
                navigate(user?.role === 'Instructor' ? '/instructor/dashboard' : '/student/dashboard');
            } else {
                const user = AuthService.login(formData.email, formData.password);
                if (!user) throw new Error("Invalid credentials");
                navigate(user.role === 'Admin' ? '/admin/dashboard' : user.role === 'Instructor' ? '/instructor/dashboard' : '/student/dashboard');
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <Layout>
            <div className="min-h-[80vh] flex items-center justify-center px-4">
                <Card className="w-full max-w-md p-8 space-y-6">
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-bold dark:text-white">{isRegister ? 'Create Account' : 'Welcome Back'}</h1>
                        <p className="text-zinc-500">Enter your details to access your account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {isRegister && <Input label="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />}
                        <Input label="Email Address" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                        <Input label="Password" type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
                        
                        {isRegister && (
                             <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">I am a...</label>
                                <select 
                                    className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 outline-none dark:text-white"
                                    value={formData.role}
                                    onChange={e => setFormData({...formData, role: e.target.value as any})}
                                >
                                    <option value="Student">Student</option>
                                    <option value="Instructor">Instructor</option>
                                </select>
                             </div>
                        )}

                        {error && <p className="text-red-500 text-sm">{error}</p>}

                        <Button type="submit" className="w-full py-3">{isRegister ? 'Sign Up' : 'Log In'}</Button>
                    </form>

                    <div className="text-center">
                        <button onClick={() => setIsRegister(!isRegister)} className="text-indigo-600 hover:underline text-sm">
                            {isRegister ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
                        </button>
                    </div>
                </Card>
            </div>
        </Layout>
    );
};

export const About = () => {
    const founders = [
        {
            name: "Alex Rivera",
            role: "CEO & Co-Founder",
            bio: "Former educator turned tech visionary. Alex believes in democratizing access to world-class education for everyone, everywhere.",
            image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&auto=format&fit=crop"
        },
        {
            name: "Sarah Chen",
            role: "CTO & Lead Architect",
            bio: "A pioneer in AI-driven learning systems. Sarah builds the robust infrastructure that powers B2C's seamless experience.",
            image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop"
        },
        {
            name: "Michael Ross",
            role: "Head of Content",
            bio: "Award-winning curriculum designer ensuring every course on B2C meets the highest pedagogical standards.",
            image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&auto=format&fit=crop"
        }
    ];

    const stats = [
        { label: "Active Learners", value: "50k+", icon: Users },
        { label: "Countries", value: "120+", icon: Globe },
        { label: "Instructors", value: "200+", icon: Award },
        { label: "Courses", value: "1.5k+", icon: BookOpen },
    ];

    return (
        <Layout>
            {/* Hero Section */}
            <div className="relative py-24 bg-zinc-900 text-white overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/40 via-zinc-900/0 to-zinc-900/0"></div>
                <div className="max-w-4xl mx-auto px-6 text-center relative z-10 space-y-6">
                    <Badge color="blue" className="px-4 py-1.5 text-sm bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Our Mission</Badge>
                    <h1 className="text-5xl md:text-6xl font-bold tracking-tight">Reimagining Education for the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Digital Age</span></h1>
                    <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                        B2C is more than just a platform; it's a movement. We are bridging the gap between traditional learning and the future of work through accessible, high-quality, and community-driven education.
                    </p>
                </div>
            </div>

            {/* Purpose & Stats */}
            <div className="py-20 px-6 max-w-7xl mx-auto">
                <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
                    <div className="space-y-6">
                        <div className="inline-flex items-center justify-center p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                            <Target className="w-8 h-8" />
                        </div>
                        <h2 className="text-3xl font-bold dark:text-white">Why We Built B2C</h2>
                        <p className="text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed">
                            Education has remained stagnant for too long. We saw a need for a platform that respects the learner's time and the instructor's expertise. 
                            <br/><br/>
                            Our purpose is simple: <strong>To empower anyone, anywhere, to teach and learn.</strong> Whether you're mastering a new coding language, exploring creative arts, or diving into data science, B2C provides the tools, community, and support you need to succeed.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {stats.map((stat, idx) => (
                            <Card key={idx} className="text-center p-6 border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
                                <stat.icon className="w-8 h-8 mx-auto mb-3 text-indigo-600 dark:text-indigo-400" />
                                <div className="text-3xl font-bold dark:text-white">{stat.value}</div>
                                <div className="text-sm text-zinc-500">{stat.label}</div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Founders */}
                <div className="space-y-12">
                    <div className="text-center space-y-4">
                        <h2 className="text-3xl font-bold dark:text-white">Meet The Founders</h2>
                        <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">The visionary team dedicated to building the future of learning.</p>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-8">
                        {founders.map((founder, idx) => (
                            <Card key={idx} className="p-0 overflow-hidden group hover:-translate-y-2 transition-transform duration-300 border-0 shadow-lg">
                                <div className="h-64 overflow-hidden relative">
                                    <img src={founder.image} alt={founder.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-6">
                                        <div className="flex gap-4">
                                            <a href="#" className="text-white hover:text-indigo-400"><Linkedin className="w-5 h-5" /></a>
                                            <a href="#" className="text-white hover:text-cyan-400"><Twitter className="w-5 h-5" /></a>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 text-center space-y-3 bg-white dark:bg-zinc-800 relative z-10">
                                    <h3 className="text-xl font-bold dark:text-white">{founder.name}</h3>
                                    <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">{founder.role}</p>
                                    <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">{founder.bio}</p>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="bg-indigo-600 py-20 px-6 text-center text-white">
                <div className="max-w-3xl mx-auto space-y-8">
                    <Sparkles className="w-12 h-12 mx-auto text-indigo-200" />
                    <h2 className="text-4xl font-bold">Ready to start your journey?</h2>
                    <p className="text-indigo-100 text-lg">Join the B2C community today and take the first step towards your goals.</p>
                    <Link to="/auth?mode=register">
                        <Button variant="secondary" size="lg" className="bg-white text-indigo-600 hover:bg-zinc-100">Get Started Now</Button>
                    </Link>
                </div>
            </div>
        </Layout>
    );
};

export const Contact = () => <Layout><div className="max-w-4xl mx-auto py-20 px-6 text-center dark:text-white"><h1 className="text-4xl font-bold mb-4">Contact Us</h1><p>support@b2c.com</p></div></Layout>;
