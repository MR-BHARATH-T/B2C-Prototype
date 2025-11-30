import { User, Course, Video, Quiz, Enrollment, Notification, ChatMessage, LiveClass, QuizSubmission, VideoProgress } from './types';

// Keys for LocalStorage
const KEYS = {
  USERS: 'lumina_users',
  CURRENT_USER: 'lumina_currentUser',
  COURSES: 'lumina_courses',
  VIDEOS: 'lumina_videos',
  QUIZZES: 'lumina_quizzes',
  NOTIFICATIONS: 'lumina_notifications',
  CHAT: 'lumina_chat',
  SCHEDULE: 'lumina_schedule',
  SUBMISSIONS: 'lumina_submissions',
  VIDEO_PROGRESS: 'lumina_video_progress',
  THEME: 'lumina_theme'
};

// --- Mock Data ---

const INITIAL_COURSES: Course[] = [
  {
    id: 'c1',
    title: 'Complete React Developer in 2024',
    description: 'Master React.js, Redux, Hooks, GraphQL, and build real-world apps.',
    category: 'Development',
    level: 'Intermediate',
    hours: 42,
    instructorName: 'Sarah Jenkins',
    price: 0,
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'c2',
    title: 'UI/UX Design Masterclass',
    description: 'Learn to design beautiful interfaces and user experiences from scratch.',
    category: 'Design',
    level: 'Beginner',
    hours: 28,
    instructorName: 'Mike Chen',
    price: 0,
    thumbnail: 'https://images.unsplash.com/photo-1586717791821-3f44a5638d48?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'c3',
    title: 'Python for Data Science',
    description: 'Analyze data, create visualizations, and build ML models.',
    category: 'Data Science',
    level: 'Advanced',
    hours: 55,
    instructorName: 'Dr. Ali',
    price: 0,
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'c4',
    title: 'Digital Marketing Strategy',
    description: 'Master SEO, Social Media, and Content Marketing strategies.',
    category: 'Marketing',
    level: 'Beginner',
    hours: 15,
    instructorName: 'Emily Rose',
    price: 49,
    thumbnail: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?q=80&w=800&auto=format&fit=crop',
  }
];

const INITIAL_VIDEOS: Video[] = [
  { id: 'v1', courseId: 'c1', title: 'Introduction to React', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', duration: '10:00', order: 1 },
  { id: 'v2', courseId: 'c1', title: 'Components & Props', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', duration: '15:30', order: 2 },
  { id: 'v3', courseId: 'c1', title: 'State & Lifecycle', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', duration: '12:45', order: 3 },
  { id: 'v4', courseId: 'c2', title: 'Design Thinking', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', duration: '08:20', order: 1 },
];

const INITIAL_QUIZZES: Quiz[] = [
  {
    id: 'q1',
    courseId: 'c1',
    title: 'React Basics Quiz',
    questions: [
      { id: 'q1_1', text: 'What is a Component?', options: ['A function or class', 'A database', 'A server'], correctIndex: 0 },
      { id: 'q1_2', text: 'What hook is used for side effects?', options: ['useState', 'useEffect', 'useReducer'], correctIndex: 1 },
    ]
  }
];

// --- Service Implementation ---

export const DataService = {
  init: () => {
    if (!localStorage.getItem(KEYS.COURSES)) {
      localStorage.setItem(KEYS.COURSES, JSON.stringify(INITIAL_COURSES));
    }
    if (!localStorage.getItem(KEYS.VIDEOS)) {
      localStorage.setItem(KEYS.VIDEOS, JSON.stringify(INITIAL_VIDEOS));
    }
    if (!localStorage.getItem(KEYS.QUIZZES)) {
      localStorage.setItem(KEYS.QUIZZES, JSON.stringify(INITIAL_QUIZZES));
    }
    if (!localStorage.getItem(KEYS.USERS)) {
        // Pre-seed users as per prompt with default passwords
        const users: User[] = [
            { name: 'Admin User', email: 'admin@gmail.com', role: 'Admin', password: 'Admin@123' },
            { name: 'Instructor User', email: 'instructor@gmail.com', role: 'Instructor', password: 'Instructor@123' },
            { name: 'Student User', email: 'student@gmail.com', role: 'Student', password: 'Student@123' }
        ];
        localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    }

    // --- SEED STUDENT DATA (So dashboard isn't empty) ---
    const demoStudent = 'student@gmail.com';
    const enrollmentKey = `enrollments_${demoStudent}`;
    
    if (!localStorage.getItem(enrollmentKey)) {
        // Create 2 initial enrollments for the demo student
        const initialEnrollments: Enrollment[] = [
            {
                courseId: 'c1',
                userEmail: demoStudent,
                progress: 65,
                enrollDate: new Date().toISOString(),
                completed: false
            },
            {
                courseId: 'c2',
                userEmail: demoStudent,
                progress: 100,
                enrollDate: new Date(Date.now() - 86400000 * 5).toISOString(),
                completed: true
            }
        ];
        localStorage.setItem(enrollmentKey, JSON.stringify(initialEnrollments));

        // Seed Course Progress Map (so progress bars show up correctly immediately)
        const progressKey = `courseProgress_${demoStudent}`;
        const initialProgress = {
            'c1': 65,
            'c2': 100
        };
        localStorage.setItem(progressKey, JSON.stringify(initialProgress));
    }
    
    // Seed Schedule for demo
    if (!localStorage.getItem(KEYS.SCHEDULE)) {
        const initialSchedule: LiveClass[] = [
            {
                id: 'lc1',
                courseId: 'c1',
                topic: 'React Hooks Deep Dive',
                startTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
                instructorEmail: 'instructor@gmail.com',
                link: '#'
            },
            {
                id: 'lc2',
                courseId: 'c2',
                topic: 'Figma Auto Layout Workshop',
                startTime: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
                instructorEmail: 'instructor@gmail.com',
                link: '#'
            }
        ];
        localStorage.setItem(KEYS.SCHEDULE, JSON.stringify(initialSchedule));
    }
  },

  // Generic Getters/Setters
  getData: <T>(key: string): T[] => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  },
  
  setData: <T>(key: string, data: T[]) => {
    localStorage.setItem(key, JSON.stringify(data));
  },

  // User Updates
  updateUser: (updatedUser: User, originalEmail?: string) => {
    // Update in USERS list
    const users = DataService.getData<User>(KEYS.USERS);
    const targetEmail = originalEmail || updatedUser.email;
    
    // Check duplication if email changed
    if (originalEmail && originalEmail !== updatedUser.email) {
        const exists = users.find(u => u.email === updatedUser.email);
        if (exists) throw new Error("Email is already taken by another user.");
    }

    const index = users.findIndex(u => u.email === targetEmail);
    if (index !== -1) {
        // Preserve password if not in updatedUser but exists in DB
        const existing = users[index];
        if (!updatedUser.password && existing.password) {
            updatedUser.password = existing.password;
        }
        users[index] = updatedUser;
        DataService.setData(KEYS.USERS, users);
    } else {
        // Fallback: Add if not found (shouldn't happen for logged in user)
        users.push(updatedUser);
        DataService.setData(KEYS.USERS, users);
    }
    
    // Update CURRENT_USER if matches (Use Direct LocalStorage to avoid circular dependency/hoisting issues)
    const currentStr = localStorage.getItem(KEYS.CURRENT_USER);
    if (currentStr) {
        const current = JSON.parse(currentStr);
        // If the logged-in user is the one being updated (match by OLD email)
        if (current.email === targetEmail) {
            localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(updatedUser));
            // Critical: Dispatch event to notify Navbar and other components immediately
            window.dispatchEvent(new Event('lumina_user_updated'));
        }
    }
  },

  // Courses
  getCourses: (): Course[] => DataService.getData(KEYS.COURSES),
  addCourse: (course: Course) => {
    const courses = DataService.getCourses();
    courses.push(course);
    DataService.setData(KEYS.COURSES, courses);
  },
  updateCourse: (course: Course) => {
    const courses = DataService.getCourses();
    const index = courses.findIndex(c => c.id === course.id);
    if (index !== -1) {
        courses[index] = course;
        DataService.setData(KEYS.COURSES, courses);
    }
  },
  deleteCourse: (id: string) => {
    let courses = DataService.getCourses();
    courses = courses.filter(c => c.id !== id);
    DataService.setData(KEYS.COURSES, courses);
  },

  // Videos
  getVideos: (courseId: string): Video[] => {
    const videos = DataService.getData<Video>(KEYS.VIDEOS);
    return videos.filter(v => v.courseId === courseId).sort((a, b) => a.order - b.order);
  },

  // Enrollments
  getEnrollments: (email: string): Enrollment[] => {
    // Storing enrollments per user as requested: enrollments_<email>
    const key = `enrollments_${email}`;
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
  },
  enroll: (email: string, courseId: string) => {
    const key = `enrollments_${email}`;
    const enrollments = DataService.getEnrollments(email);
    
    if (!enrollments.find(e => e.courseId === courseId)) {
      enrollments.push({
        courseId,
        userEmail: email,
        progress: 0,
        enrollDate: new Date().toISOString(),
        completed: false
      });
      localStorage.setItem(key, JSON.stringify(enrollments));
    }
  },

  // Notifications
  getNotifications: (email: string): Notification[] => {
    const all = DataService.getData<Notification>(KEYS.NOTIFICATIONS);
    return all.filter(n => n.userEmail === email).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },
  addNotification: (email: string, message: string) => {
    const notifs = DataService.getData<Notification>(KEYS.NOTIFICATIONS);
    notifs.push({
      id: crypto.randomUUID(),
      message,
      read: false,
      date: new Date().toISOString(),
      userEmail: email
    });
    DataService.setData(KEYS.NOTIFICATIONS, notifs);
  },
  markNotificationsRead: (email: string) => {
      const notifs = DataService.getData<Notification>(KEYS.NOTIFICATIONS);
      const updated = notifs.map(n => n.userEmail === email ? { ...n, read: true } : n);
      DataService.setData(KEYS.NOTIFICATIONS, updated);
  },

  // Chat
  getChat: (courseId: string): ChatMessage[] => {
      const all = DataService.getData<ChatMessage>(KEYS.CHAT);
      return all.filter(c => c.courseId === courseId).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  },
  sendChat: (msg: ChatMessage) => {
      const chats = DataService.getData<ChatMessage>(KEYS.CHAT);
      chats.push(msg);
      DataService.setData(KEYS.CHAT, chats);
  },

  // Schedule
  getSchedule: (courseId?: string): LiveClass[] => {
      const all = DataService.getData<LiveClass>(KEYS.SCHEDULE);
      if (courseId) return all.filter(c => c.courseId === courseId);
      return all;
  },
  addLiveClass: (cls: LiveClass) => {
      const all = DataService.getData<LiveClass>(KEYS.SCHEDULE);
      all.push(cls);
      DataService.setData(KEYS.SCHEDULE, all);
  },

  // Quiz
  getQuiz: (courseId: string): Quiz | undefined => {
      const quizzes = DataService.getData<Quiz>(KEYS.QUIZZES);
      return quizzes.find(q => q.courseId === courseId);
  },
  submitQuiz: (sub: QuizSubmission) => {
      const all = DataService.getData<QuizSubmission>(KEYS.SUBMISSIONS);
      all.push(sub);
      DataService.setData(KEYS.SUBMISSIONS, all);
  },
  getQuizSubmissions: (): QuizSubmission[] => {
      return DataService.getData<QuizSubmission>(KEYS.SUBMISSIONS);
  },

  // Video Progress & Course Progress Calculation
  getCourseProgress: (email: string): Record<string, number> => {
      const key = `courseProgress_${email}`;
      try {
          return JSON.parse(localStorage.getItem(key) || '{}');
      } catch {
          return {};
      }
  },
  
  saveVideoProgress: (email: string, progress: VideoProgress) => {
      // 1. Save specific video progress (Detailed Tracking)
      const key = `${KEYS.VIDEO_PROGRESS}_${email}`;
      const userProgress = DataService.getData<VideoProgress>(key);
      const idx = userProgress.findIndex(p => p.videoId === progress.videoId);
      if (idx >= 0) {
          userProgress[idx] = progress;
      } else {
          userProgress.push(progress);
      }
      DataService.setData(key, userProgress);

      // 2. Calculate Course Progress based on completed items
      const videos = DataService.getData<Video>(KEYS.VIDEOS);
      const currentVideo = videos.find(v => v.id === progress.videoId);
      
      if (currentVideo) {
          const courseId = currentVideo.courseId;
          const courseVideos = videos.filter(v => v.courseId === courseId);
          const totalVideos = courseVideos.length;
          
          if (totalVideos > 0) {
              // Count how many videos of this course are marked completed
              const completedCount = courseVideos.filter(v => {
                  const p = userProgress.find(up => up.videoId === v.id);
                  return p?.completed;
              }).length;

              const percent = Math.round((completedCount / totalVideos) * 100);

              // Update Enrollment (Legacy / Backup)
              const enrollments = DataService.getEnrollments(email);
              const enrollIdx = enrollments.findIndex(e => e.courseId === courseId);
              
              if (enrollIdx >= 0) {
                  enrollments[enrollIdx].progress = percent;
                  enrollments[enrollIdx].completed = percent === 100;
                  localStorage.setItem(`enrollments_${email}`, JSON.stringify(enrollments));
              }

              // Update courseProgress_<email> (Requirement compliance)
              // We store it as a map { [courseId]: percent }
              const progressKey = `courseProgress_${email}`;
              let courseProgressMap: Record<string, number> = {};
              try {
                  const stored = localStorage.getItem(progressKey);
                  courseProgressMap = stored ? JSON.parse(stored) : {};
              } catch (e) {
                  courseProgressMap = {};
              }
              courseProgressMap[courseId] = percent;
              localStorage.setItem(progressKey, JSON.stringify(courseProgressMap));
          }
      }
  },
  getVideoProgress: (email: string, videoId: string): VideoProgress | undefined => {
      const key = `${KEYS.VIDEO_PROGRESS}_${email}`;
      const userProgress = DataService.getData<VideoProgress>(key);
      return userProgress.find(p => p.videoId === videoId);
  },
  getAllVideoProgress: (email: string): VideoProgress[] => {
      const key = `${KEYS.VIDEO_PROGRESS}_${email}`;
      return DataService.getData<VideoProgress>(key);
  }
};

export const AuthService = {
  login: (email: string, password: string): User | null => {
    const users = DataService.getData<User>(KEYS.USERS);
    const user = users.find(u => u.email === email);

    if (user) {
        if (user.password && user.password !== password) {
            return null;
        }
        if (!user.password) {
             if (email === 'admin@gmail.com' && password !== 'Admin@123') return null;
             if (email === 'instructor@gmail.com' && password !== 'Instructor@123') return null;
             if (email === 'student@gmail.com' && password !== 'Student@123') return null;
        }

        localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
        // Critical: Dispatch event to notify Navbar on login
        window.dispatchEvent(new Event('lumina_user_updated'));
        return user;
    }
    
    return null;
  },
  register: (name: string, email: string, role: 'Instructor' | 'Student', password?: string) => {
      const users = DataService.getData<User>(KEYS.USERS);
      if (users.find(u => u.email === email)) throw new Error("User exists");
      users.push({ 
          name, 
          email, 
          role, 
          avatar: `https://ui-avatars.com/api/?name=${name}&background=random`,
          password 
      });
      DataService.setData(KEYS.USERS, users);
  },
  changePassword: (email: string, currentPass: string, newPass: string) => {
      const users = DataService.getData<User>(KEYS.USERS);
      const index = users.findIndex(u => u.email === email);
      
      if (index === -1) throw new Error("User not found");
      
      const user = users[index];
      
      if (user.password && user.password !== currentPass) {
          throw new Error("Current password is incorrect");
      }
      
      users[index].password = newPass;
      DataService.setData(KEYS.USERS, users);
      
      const currentUser = AuthService.getCurrentUser();
      if(currentUser && currentUser.email === email) {
          currentUser.password = newPass;
          localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(currentUser));
      }
  },
  logout: () => {
    localStorage.removeItem(KEYS.CURRENT_USER);
    // Critical: Dispatch event to notify Navbar on logout
    window.dispatchEvent(new Event('lumina_user_updated'));
  },
  getCurrentUser: (): User | null => {
    const u = localStorage.getItem(KEYS.CURRENT_USER);
    return u ? JSON.parse(u) : null;
  }
};

DataService.init();