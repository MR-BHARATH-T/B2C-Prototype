
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout, Card, Button, Badge } from '../components';
import { DataService, AuthService } from '../services';
import * as Types from '../types';
import html2canvas from 'html2canvas';
import { CheckCircle, Download, Send, PlayCircle, Video, FileText, Clock, BookOpen, Award, TrendingUp } from 'lucide-react';

// Helper to parse duration string "MM:SS" or "HH:MM:SS" to seconds
const parseDuration = (duration: string): number => {
    const parts = duration.split(':').map(Number);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return 0;
};

export const StudentDashboard = () => {
    const user = AuthService.getCurrentUser();
    const [enrollments, setEnrollments] = useState<Types.Enrollment[]>([]);
    const [courses, setCourses] = useState<Types.Course[]>([]);
    const [progressMap, setProgressMap] = useState<Record<string, number>>({});

    useEffect(() => {
        if (user) {
            // 1. Get fundamental data
            setEnrollments(DataService.getEnrollments(user.email));
            setCourses(DataService.getCourses());
            
            // 2. Fetch the specific progress map from courseProgress_<email>
            // This ensures we display the exact percentage calculated from watched videos
            const progress = DataService.getCourseProgress(user.email);
            setProgressMap(progress);
        }
    }, [user]);

    const getCourse = (id: string) => courses.find(c => c.id === id);

    const handleDownloadCert = async (courseName: string, date: string) => {
        const cert = document.getElementById('cert-template');
        if (cert) {
            const titleEl = document.getElementById('cert-course');
            if(titleEl) titleEl.innerText = courseName;
            
            cert.style.display = 'block';
            const canvas = await html2canvas(cert);
            cert.style.display = 'none';
            const link = document.createElement('a');
            link.download = `Certificate-${courseName}.png`;
            link.href = canvas.toDataURL();
            link.click();
        }
    };

    // Calculate Stats
    const totalEnrolled = enrollments.length;
    const completedCourses = enrollments.filter(e => (progressMap[e.courseId] ?? e.progress ?? 0) >= 100).length;
    const inProgressCourses = totalEnrolled - completedCourses;
    const totalHours = enrollments.reduce((acc, e) => {
        const c = getCourse(e.courseId);
        return acc + (c ? c.hours : 0);
    }, 0);

    // Recommended (Not enrolled)
    const recommendedCourses = courses.filter(c => !enrollments.find(e => e.courseId === c.id));

    return (
        <Layout requireAuth allowedRoles={['Student']}>
             <div className="space-y-10 relative">
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold dark:text-white">Welcome back, {user?.name.split(' ')[0]}!</h1>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-1">You're making great progress. Keep it up!</p>
                    </div>
                    <Link to="/courses"><Button variant="outline">Browse All Courses</Button></Link>
                 </div>

                 {/* Stats Row */}
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/20 dark:to-zinc-800 border-indigo-100 dark:border-indigo-800/50">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3">
                            <BookOpen className="w-5 h-5" />
                        </div>
                        <span className="text-3xl font-bold dark:text-white">{totalEnrolled}</span>
                        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mt-1">Enrolled</span>
                    </Card>
                    <Card className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-zinc-800 border-purple-100 dark:border-purple-800/50">
                        <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-3">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <span className="text-3xl font-bold dark:text-white">{inProgressCourses}</span>
                        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mt-1">In Progress</span>
                    </Card>
                    <Card className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-900/20 dark:to-zinc-800 border-emerald-100 dark:border-emerald-800/50">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3">
                            <Award className="w-5 h-5" />
                        </div>
                        <span className="text-3xl font-bold dark:text-white">{completedCourses}</span>
                        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mt-1">Completed</span>
                    </Card>
                    <Card className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-zinc-800 border-blue-100 dark:border-blue-800/50">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3">
                            <Clock className="w-5 h-5" />
                        </div>
                        <span className="text-3xl font-bold dark:text-white">{totalHours}h</span>
                        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mt-1">Hours Learned</span>
                    </Card>
                 </div>

                 {/* Enrollments Section */}
                 <div className="space-y-4">
                     <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                        <PlayCircle className="w-5 h-5 text-indigo-600" /> My Active Courses
                     </h2>
                     
                     {enrollments.length === 0 ? (
                         <div className="text-center py-16 bg-white dark:bg-zinc-800 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700">
                             <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                <BookOpen className="w-8 h-8 text-zinc-400" />
                             </div>
                             <h3 className="text-lg font-semibold dark:text-white">Start Your Journey</h3>
                             <p className="text-zinc-500 mt-1 mb-6 max-w-sm mx-auto">You haven't enrolled in any courses yet. Browse our catalog to find your next skill.</p>
                             <Link to="/courses" className="inline-block"><Button>Explore Catalog</Button></Link>
                         </div>
                     ) : (
                         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                             {enrollments.map(e => {
                                 const c = getCourse(e.courseId);
                                 if (!c) return null;
                                 
                                 // STRICT: Use progress from the map (courseProgress_<email>), fallback to enrollment record
                                 const currentProgress = progressMap[e.courseId] ?? e.progress ?? 0;
                                 const isCompleted = currentProgress >= 100;
                                 
                                 return (
                                     <Card key={e.courseId} className="flex flex-col gap-4 group hover:shadow-lg transition-all duration-300 border border-zinc-100 dark:border-zinc-700">
                                         <div className="relative h-48 -mx-6 -mt-6 mb-2 overflow-hidden rounded-t-2xl">
                                             <img src={c.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={c.title} />
                                             <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                                             {isCompleted && (
                                                 <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px] animate-fade-up">
                                                     <Badge color="green" className="text-lg px-4 py-2 shadow-xl flex items-center gap-2 border border-green-400/30">
                                                         <CheckCircle className="w-5 h-5" /> Completed
                                                     </Badge>
                                                 </div>
                                             )}
                                         </div>
                                         
                                         <div className="flex-1 space-y-4">
                                             <div className="flex justify-between items-start">
                                                <Badge color="blue" className="text-[10px]">{c.category}</Badge>
                                                <span className="text-xs font-medium text-zinc-500">{c.level}</span>
                                             </div>
                                             <h3 className="font-bold text-lg dark:text-white leading-tight line-clamp-2 min-h-[3rem]">{c.title}</h3>
                                             
                                             <div className="space-y-2">
                                                 <div className="flex justify-between text-xs font-semibold tracking-wide uppercase text-zinc-500 dark:text-zinc-400">
                                                     <span>Progress</span>
                                                     <span className={isCompleted ? 'text-emerald-600' : 'text-indigo-600'}>{currentProgress}%</span>
                                                 </div>
                                                 <div className="w-full bg-zinc-100 dark:bg-zinc-700 h-2 rounded-full overflow-hidden">
                                                     <div 
                                                        className={`h-full transition-all duration-1000 ease-out ${isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`} 
                                                        style={{ width: `${currentProgress}%` }}
                                                     />
                                                 </div>
                                             </div>
                                         </div>
                                         
                                         <div className="pt-4 border-t border-zinc-100 dark:border-zinc-700/50 mt-auto flex flex-col gap-3">
                                             <Link to={`/student/course/${c.id}`} className="w-full">
                                                <Button size="sm" className="w-full shadow-none" variant={isCompleted ? "outline" : "primary"}>
                                                    {currentProgress > 0 ? (isCompleted ? 'Review Course' : 'Continue Learning') : 'Start Course'}
                                                </Button>
                                             </Link>
                                             
                                             {isCompleted && (
                                                 <button onClick={() => handleDownloadCert(c.title, e.enrollDate)} className="flex items-center justify-center gap-2 text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:underline transition-all py-1">
                                                     <Download className="w-4 h-4" /> Download Certificate
                                                 </button>
                                             )}
                                         </div>
                                     </Card>
                                 );
                             })}
                         </div>
                     )}
                 </div>

                 {/* Recommended Section */}
                 {recommendedCourses.length > 0 && (
                     <div className="space-y-4 pt-8 border-t border-zinc-100 dark:border-zinc-800">
                         <h2 className="text-xl font-bold dark:text-white">Recommended For You</h2>
                         <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                             {recommendedCourses.map(c => (
                                 <Link to={`/course/${c.id}`} key={c.id} className="group">
                                    <Card className="h-full p-0 overflow-hidden hover:shadow-lg transition-all border-0">
                                        <div className="h-32 overflow-hidden relative">
                                            <img src={c.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={c.title} />
                                            <div className="absolute top-2 left-2">
                                                <Badge className="bg-white/90 text-black shadow-sm">{c.category}</Badge>
                                            </div>
                                        </div>
                                        <div className="p-4 space-y-2">
                                            <h3 className="font-bold text-sm dark:text-white line-clamp-1 group-hover:text-indigo-600 transition-colors">{c.title}</h3>
                                            <p className="text-xs text-zinc-500 dark:text-zinc-400">By {c.instructorName}</p>
                                            <div className="flex items-center gap-1 text-xs font-semibold text-indigo-600 pt-2">
                                                View Details →
                                            </div>
                                        </div>
                                    </Card>
                                 </Link>
                             ))}
                         </div>
                     </div>
                 )}

                 {/* Hidden Certificate Template */}
                 <div id="cert-template" className="hidden fixed top-0 left-0 bg-white p-20 text-center border-8 border-double border-indigo-900 w-[800px] h-[600px] z-[9999]">
                     <div className="border-4 border-indigo-500 h-full flex flex-col items-center justify-center space-y-8 p-10 bg-gradient-to-br from-indigo-50 to-white">
                         <div className="w-20 h-20 bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-white font-serif text-4xl">B</span>
                         </div>
                         <h1 className="text-5xl font-serif text-indigo-900 tracking-wider uppercase">Certificate of Completion</h1>
                         <div className="w-full h-1 bg-gradient-to-r from-transparent via-indigo-300 to-transparent"></div>
                         <p className="text-xl text-zinc-600 italic">This is to certify that</p>
                         <h2 className="text-4xl font-bold text-black border-b-2 border-black pb-2 px-10 inline-block">{user?.name}</h2>
                         <p className="text-xl text-zinc-600 italic">has successfully completed the course</p>
                         <h3 id="cert-course" className="text-3xl font-bold text-indigo-700">Course Name</h3>
                         <div className="mt-12 flex justify-between w-full px-20 pt-10">
                             <div className="text-center">
                                 <div className="w-32 border-t border-zinc-400 mb-2"></div>
                                 <p className="text-sm text-zinc-500">Instructor</p>
                             </div>
                             <div className="text-center">
                                 <div className="w-32 border-t border-zinc-400 mb-2"></div>
                                 <p className="text-sm text-zinc-500">B2C EdTech</p>
                             </div>
                         </div>
                     </div>
                 </div>
             </div>
        </Layout>
    );
};

export const CoursePlayer = () => {
    const { id } = useParams();
    const user = AuthService.getCurrentUser();
    const [videos, setVideos] = useState<Types.Video[]>([]);
    const [currentVideo, setCurrentVideo] = useState<Types.Video | null>(null);
    const [messages, setMessages] = useState<Types.ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState('');
    
    // Video Progress Tracking
    const [progressMap, setProgressMap] = useState<Record<string, Types.VideoProgress>>({});
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const throttledUpdate = useRef<{ lastRun: number }>({ lastRun: 0 });

    useEffect(() => {
        if (id && user) {
            const vids = DataService.getVideos(id);
            setVideos(vids);
            
            // Load progress first to find where to start
            const allProgress = DataService.getAllVideoProgress(user.email);
            const map: Record<string, Types.VideoProgress> = {};
            allProgress.forEach(p => map[p.videoId] = p);
            setProgressMap(map);

            // Auto-resume: Find first uncompleted video, or first video if all new/completed
            if (vids.length > 0) {
                const firstUnfinished = vids.find(v => !map[v.id]?.completed) || vids[0];
                setCurrentVideo(firstUnfinished);
            }
            
            setMessages(DataService.getChat(id));
        }
        
        const interval = setInterval(() => {
             if (id) setMessages(DataService.getChat(id));
        }, 3000); 
        return () => clearInterval(interval);

    }, [id, user]);

    useEffect(() => {
        if (chatContainerRef.current) chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }, [messages]);

    // Enhanced Progress Tracking
    const handleTimeUpdate = () => {
        if (videoRef.current && user && currentVideo) {
             const currentTime = videoRef.current.currentTime;
             const duration = videoRef.current.duration;
             
             if (!duration) return;

             // Mark complete if 90% watched OR within last 2 seconds (for short videos)
             const isCompleted = currentTime / duration > 0.9 || (duration - currentTime) < 2;
             
             const progressData: Types.VideoProgress = {
                 videoId: currentVideo.id,
                 watchedSeconds: currentTime,
                 completed: isCompleted
             };

             const now = Date.now();
             // Save every 2 seconds OR if status changed to completed
             if (now - throttledUpdate.current.lastRun > 2000 || (isCompleted && !progressMap[currentVideo.id]?.completed)) {
                 DataService.saveVideoProgress(user.email, progressData);
                 throttledUpdate.current.lastRun = now;
                 
                 // Update local state immediately for UI response
                 setProgressMap(prev => ({...prev, [currentVideo.id]: progressData}));
             }
        }
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim() || !user || !id) return;
        DataService.sendChat({
            id: crypto.randomUUID(),
            courseId: id,
            userEmail: user.email,
            userName: user.name,
            text: chatInput,
            timestamp: new Date().toISOString()
        });
        setChatInput('');
        setMessages(DataService.getChat(id));
    };

    return (
        <Layout requireAuth allowedRoles={['Student', 'Instructor']}>
            <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
                <div className="lg:col-span-2 flex flex-col gap-4 h-full">
                     {/* Player */}
                     <div className="bg-black rounded-xl overflow-hidden shadow-2xl flex-1 relative group ring-1 ring-zinc-800">
                         {currentVideo ? (
                             <video 
                                ref={videoRef}
                                controls 
                                className="w-full h-full" 
                                src={currentVideo.url}
                                onTimeUpdate={handleTimeUpdate}
                                onLoadedMetadata={(e) => {
                                    // Resume from last saved time if exists and not completed
                                    const saved = progressMap[currentVideo.id];
                                    if(saved && !saved.completed && saved.watchedSeconds < e.currentTarget.duration) {
                                        e.currentTarget.currentTime = saved.watchedSeconds;
                                    }
                                }}
                                onEnded={() => {
                                    // Auto-next
                                    const idx = videos.findIndex(v => v.id === currentVideo.id);
                                    if(idx < videos.length - 1) setCurrentVideo(videos[idx + 1]);
                                }}
                             />
                         ) : <div className="text-zinc-500 flex items-center justify-center h-full">Select a video to start</div>}
                     </div>
                     <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
                        <div>
                            <h2 className="text-xl font-bold dark:text-white line-clamp-1">{currentVideo?.title}</h2>
                            <p className="text-zinc-500 text-sm">Now Playing • {currentVideo?.duration}</p>
                        </div>
                        {id && (
                            <div className="flex gap-3">
                                <Link to={`/student/quiz/${id}`}><Button variant="primary" className="bg-emerald-600 hover:bg-emerald-700">Take Final Quiz</Button></Link>
                            </div>
                        )}
                     </div>
                </div>

                <div className="flex flex-col gap-6 h-full overflow-hidden">
                    {/* Playlist */}
                    <Card className="flex-1 overflow-y-auto max-h-[50%] flex flex-col p-0">
                        <div className="p-4 border-b border-zinc-100 dark:border-zinc-700 sticky top-0 bg-white/95 dark:bg-zinc-800/95 backdrop-blur z-10 flex justify-between items-center">
                            <h3 className="font-bold dark:text-white">Course Content</h3>
                            <span className="text-xs font-semibold px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-md">
                                {Object.values(progressMap).filter(p => videos.find(v => v.id === p.videoId)?.courseId === id && p.completed).length} / {videos.length} Done
                            </span>
                        </div>
                        <div className="p-2 space-y-1">
                            {videos.map((v, idx) => {
                                const prog = progressMap[v.id];
                                const isCompleted = prog?.completed;
                                const isActive = currentVideo?.id === v.id;
                                
                                // Calculate exact percentage
                                const durationSecs = parseDuration(v.duration);
                                const watched = prog?.watchedSeconds || 0;
                                const percent = durationSecs > 0 ? Math.min(100, (watched / durationSecs) * 100) : 0;
                                
                                // Display percentage: 100 if completed, otherwise calculated
                                const displayPercent = isCompleted ? 100 : percent;

                                return (
                                    <div 
                                        key={v.id} 
                                        onClick={() => setCurrentVideo(v)}
                                        className={`p-3 rounded-lg cursor-pointer flex flex-col gap-2 text-sm transition-all duration-200 group ${isActive ? 'bg-indigo-50 dark:bg-indigo-900/30 ring-1 ring-indigo-200 dark:ring-indigo-700' : 'hover:bg-zinc-50 dark:hover:bg-zinc-700/50'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="text-zinc-400 shrink-0">
                                                {isCompleted ? (
                                                    <CheckCircle className="w-5 h-5 text-emerald-500 fill-emerald-100 dark:fill-emerald-900/50" />
                                                ) : (
                                                    isActive ? <PlayCircle className="w-5 h-5 text-indigo-600 animate-pulse" /> : <div className="w-5 h-5 flex items-center justify-center font-mono text-xs text-zinc-400 bg-zinc-100 dark:bg-zinc-800 rounded-full">{idx + 1}</div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between">
                                                    <span className={`block font-medium truncate ${isActive ? 'text-indigo-700 dark:text-indigo-300' : 'dark:text-zinc-300'}`}>{v.title}</span>
                                                </div>
                                                <span className="text-xs text-zinc-400">{v.duration}</span>
                                            </div>
                                        </div>
                                        
                                        {/* Micro Progress Bar per video */}
                                        <div className="flex items-center gap-2 pl-8">
                                            <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-1 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full rounded-full transition-all duration-300 ${isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
                                                    style={{ width: `${displayPercent}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>

                    {/* Chat */}
                    <Card className="flex-1 flex flex-col overflow-hidden max-h-[50%] p-0">
                        <div className="p-4 border-b border-zinc-100 dark:border-zinc-700 bg-white dark:bg-zinc-800">
                            <h3 className="font-bold dark:text-white">Discussion</h3>
                        </div>
                        <div ref={chatContainerRef} className="flex-1 overflow-y-auto space-y-3 p-4 bg-zinc-50/50 dark:bg-black/20">
                            {messages.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full text-zinc-400 gap-2">
                                    <FileText className="w-8 h-8 opacity-20" />
                                    <p className="text-sm">No discussions yet.</p>
                                </div>
                            )}
                            {messages.map(m => (
                                <div key={m.id} className={`flex flex-col ${m.userEmail === user?.email ? 'items-end' : 'items-start'}`}>
                                    <div className="flex items-baseline gap-2 mb-1">
                                        <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">{m.userName}</span>
                                        <span className="text-[10px] text-zinc-400">{new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                    </div>
                                    <div className={`px-4 py-2 rounded-2xl text-sm max-w-[85%] shadow-sm ${m.userEmail === user?.email ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white dark:bg-zinc-700 dark:text-white rounded-tl-none border border-zinc-200 dark:border-zinc-600'}`}>
                                        {m.text}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-3 bg-white dark:bg-zinc-800 border-t border-zinc-100 dark:border-zinc-700">
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <input 
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-sm dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20" 
                                    placeholder="Ask a question..."
                                    value={chatInput}
                                    onChange={e => setChatInput(e.target.value)}
                                />
                                <Button size="sm" type="submit" className="px-3 rounded-xl aspect-square flex items-center justify-center"><Send className="w-5 h-5" /></Button>
                            </form>
                        </div>
                    </Card>
                </div>
            </div>
        </Layout>
    );
};

export const Quiz = () => {
    const { id } = useParams(); // Course ID
    const user = AuthService.getCurrentUser();
    const [quiz, setQuiz] = useState<Types.Quiz | undefined>(undefined);
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);

    useEffect(() => {
        if (id) setQuiz(DataService.getQuiz(id));
    }, [id]);

    const handleSubmit = () => {
        if (!quiz || !user || !id) return;
        let correct = 0;
        quiz.questions.forEach(q => {
            if (answers[q.id] === q.correctIndex) correct++;
        });
        setScore(correct);
        setSubmitted(true);
        DataService.submitQuiz({
            id: crypto.randomUUID(),
            quizId: quiz.id,
            userEmail: user.email,
            score: correct,
            totalQuestions: quiz.questions.length,
            passed: (correct / quiz.questions.length) >= 0.7,
            date: new Date().toISOString()
        });
    };

    if (!quiz) return <Layout><div className="p-10 text-center dark:text-white">No quiz found for this course.</div></Layout>;

    return (
        <Layout requireAuth allowedRoles={['Student']}>
            <div className="max-w-3xl mx-auto space-y-8">
                <h1 className="text-2xl font-bold dark:text-white">{quiz.title}</h1>
                
                {!submitted ? (
                    <Card className="space-y-8">
                        {quiz.questions.map((q, idx) => (
                            <div key={q.id} className="space-y-4">
                                <h3 className="font-semibold text-lg dark:text-white flex gap-2">
                                    <span className="text-indigo-600 font-bold">{idx + 1}.</span> {q.text}
                                </h3>
                                <div className="space-y-2 pl-6">
                                    {q.options.map((opt, oIdx) => (
                                        <label key={oIdx} className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${answers[q.id] === oIdx ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-500' : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700/50'}`}>
                                            <input 
                                                type="radio" 
                                                name={q.id} 
                                                checked={answers[q.id] === oIdx} 
                                                onChange={() => setAnswers({...answers, [q.id]: oIdx})}
                                                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <span className="dark:text-zinc-300">{opt}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                        <Button onClick={handleSubmit} className="w-full py-3 text-lg">Submit Quiz</Button>
                    </Card>
                ) : (
                    <Card className="text-center py-12 space-y-6">
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto text-4xl font-bold ${score/quiz.questions.length >= 0.7 ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 'bg-red-100 text-red-600 dark:bg-red-900/30'}`}>
                            {Math.round((score / quiz.questions.length) * 100)}%
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold dark:text-white mb-2">{score/quiz.questions.length >= 0.7 ? 'Congratulations!' : 'Keep Practicing!'}</h2>
                            <p className="text-zinc-500">You scored {score} out of {quiz.questions.length}</p>
                        </div>
                        <div className="flex justify-center gap-4">
                            <Link to={`/student/course/${quiz.courseId}`}><Button variant="secondary">Back to Course</Button></Link>
                            <Link to={`/student/dashboard`}><Button>Go to Dashboard</Button></Link>
                        </div>
                    </Card>
                )}
            </div>
        </Layout>
    );
};

export const LiveClasses = () => {
    const [classes, setClasses] = useState<Types.LiveClass[]>([]);

    useEffect(() => {
        setClasses(DataService.getSchedule());
    }, []);

    return (
        <Layout requireAuth allowedRoles={['Student']}>
            <div className="max-w-4xl mx-auto space-y-6">
                <h1 className="text-2xl font-bold dark:text-white">Live Classes</h1>
                <div className="grid gap-4">
                    {classes.length === 0 ? <p className="text-zinc-500">No live classes scheduled.</p> : classes.map(c => {
                         const isLive = new Date() >= new Date(c.startTime) && new Date() <= new Date(new Date(c.startTime).getTime() + 60*60*1000);
                         return (
                            <Card key={c.id} className="flex flex-col md:flex-row justify-between items-center gap-4 group hover:border-indigo-200 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                                        <Video className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg dark:text-white">{c.topic}</h3>
                                        <p className="text-sm text-zinc-500">Starts: {new Date(c.startTime).toLocaleString()}</p>
                                    </div>
                                </div>
                                {isLive ? (
                                    <a href={c.link} target="_blank"><Button className="animate-pulse bg-red-600 hover:bg-red-700 shadow-red-500/30">Join Live Now</Button></a>
                                ) : (
                                    <Button variant="secondary" disabled className="opacity-50">Upcoming</Button>
                                )}
                            </Card>
                         )
                    })}
                </div>
            </div>
        </Layout>
    );
};
