import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Home, Courses, CourseDetails, Auth, About, Contact } from './pages/Public';
import { Profile } from './pages/Profile';
import { AdminDashboard, AdminAddCourse, QuizAnalytics } from './pages/Admin';
import { InstructorDashboard, InstructorCreateCourse, InstructorSchedule } from './pages/Instructor';
import { StudentDashboard, CoursePlayer, Quiz, LiveClasses } from './pages/Student';

const App = () => {
  return (
    <HashRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/course/:id" element={<CourseDetails />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        
        {/* Shared Protected Route */}
        <Route path="/profile" element={<Profile />} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/add-course" element={<AdminAddCourse />} />
        <Route path="/admin/quiz-analytics" element={<QuizAnalytics />} />

        {/* Instructor Routes */}
        <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
        <Route path="/instructor/create-course" element={<InstructorCreateCourse />} />
        <Route path="/instructor/schedule" element={<InstructorSchedule />} />

        {/* Student Routes */}
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/course/:id" element={<CoursePlayer />} />
        <Route path="/student/quiz/:id" element={<Quiz />} />
        <Route path="/student/live-classes" element={<LiveClasses />} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;