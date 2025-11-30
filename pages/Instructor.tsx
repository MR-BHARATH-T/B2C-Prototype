import React, { useState, useEffect } from 'react';
import { Layout, Card, Input, Button } from '../components';
import { DataService, AuthService } from '../services';
import * as Types from '../types';

export const InstructorDashboard = () => {
    const user = AuthService.getCurrentUser();
    const [courses, setCourses] = useState<Types.Course[]>([]);
    
    useEffect(() => {
        // Filter courses by instructor name (assuming simple string match for this demo)
        const all = DataService.getCourses();
        // For demo, just show all or random subset to simulate "My Courses"
        setCourses(all.slice(0, 2)); 
    }, []);

    return (
        <Layout requireAuth allowedRoles={['Instructor']}>
            <div className="space-y-8">
                 <h1 className="text-2xl font-bold dark:text-white">Welcome back, {user?.name}</h1>
                 
                 <div className="grid md:grid-cols-3 gap-6">
                    <Card>
                        <h4 className="text-zinc-500 text-sm">Active Students</h4>
                        <p className="text-3xl font-bold mt-2">128</p>
                    </Card>
                    <Card>
                        <h4 className="text-zinc-500 text-sm">Total Earnings</h4>
                        <p className="text-3xl font-bold mt-2 text-green-600">$12,450</p>
                    </Card>
                    <Card>
                        <h4 className="text-zinc-500 text-sm">Rating</h4>
                        <p className="text-3xl font-bold mt-2 text-yellow-500">4.8</p>
                    </Card>
                 </div>

                 <Card>
                    <h3 className="text-lg font-bold mb-4 dark:text-white">My Courses</h3>
                    <div className="space-y-4">
                        {courses.map(c => (
                            <div key={c.id} className="flex items-center gap-4 p-4 border rounded-xl border-zinc-100 dark:border-zinc-700">
                                <img src={c.thumbnail} className="w-16 h-16 rounded-lg object-cover" />
                                <div>
                                    <h4 className="font-bold dark:text-white">{c.title}</h4>
                                    <p className="text-sm text-zinc-500">{c.category}</p>
                                </div>
                                <div className="ml-auto">
                                    <Button variant="outline" className="text-xs">Edit</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                 </Card>
            </div>
        </Layout>
    );
};

export const InstructorCreateCourse = () => {
    // Reuse Admin Add Course Logic mostly, just hardcode instructor name
    const [form, setForm] = useState<Partial<Types.Course>>({ level: 'Beginner' });
    const user = AuthService.getCurrentUser();
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        DataService.addCourse({
            ...form as Types.Course,
            id: 'c' + Date.now(),
            hours: Number(form.hours),
            price: 0,
            thumbnail: 'https://picsum.photos/800/600', // Mock
            instructorName: user?.name || 'Instructor'
        });
        alert('Course Created!');
    };

    return (
        <Layout requireAuth allowedRoles={['Instructor']}>
             <div className="max-w-2xl mx-auto">
                 <h1 className="text-2xl font-bold mb-6 dark:text-white">Create New Course</h1>
                 <Card>
                     <form onSubmit={handleSubmit} className="space-y-4">
                         <Input label="Title" value={form.title || ''} onChange={e => setForm({...form, title: e.target.value})} required />
                         <Input label="Description" value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})} required />
                         <Input label="Hours" type="number" value={form.hours || ''} onChange={e => setForm({...form, hours: Number(e.target.value)})} required />
                         <Button type="submit" className="w-full">Publish Course</Button>
                     </form>
                 </Card>
             </div>
        </Layout>
    );
};

export const InstructorSchedule = () => {
    const [schedule, setSchedule] = useState<Types.LiveClass[]>([]);
    const [form, setForm] = useState({ topic: '', date: '', link: '' });
    const user = AuthService.getCurrentUser();

    useEffect(() => {
        setSchedule(DataService.getSchedule());
    }, []);

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        DataService.addLiveClass({
            id: crypto.randomUUID(),
            courseId: 'all', // Generic for demo
            topic: form.topic,
            startTime: form.date,
            link: form.link,
            instructorEmail: user?.email || ''
        });
        setSchedule(DataService.getSchedule());
        setForm({ topic: '', date: '', link: '' });
    };

    return (
        <Layout requireAuth allowedRoles={['Instructor']}>
            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h1 className="text-2xl font-bold dark:text-white">Schedule Class</h1>
                    <Card>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <Input label="Topic" value={form.topic} onChange={e => setForm({...form, topic: e.target.value})} required />
                            <Input label="Date & Time" type="datetime-local" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
                            <Input label="Meeting Link" value={form.link} onChange={e => setForm({...form, link: e.target.value})} placeholder="https://zoom.us/..." required />
                            <Button type="submit" className="w-full">Schedule</Button>
                        </form>
                    </Card>
                </div>
                <div className="space-y-6">
                    <h2 className="text-xl font-bold dark:text-white">Upcoming Classes</h2>
                    <div className="space-y-4">
                        {schedule.map(s => (
                            <Card key={s.id} className="p-4">
                                <h3 className="font-bold dark:text-white">{s.topic}</h3>
                                <p className="text-sm text-zinc-500">{new Date(s.startTime).toLocaleString()}</p>
                                <a href={s.link} target="_blank" className="text-indigo-600 text-sm hover:underline">Join Link</a>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </Layout>
    );
};
