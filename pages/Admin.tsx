import React, { useState, useEffect } from 'react';
import { Layout, Card, Input, Button, Badge } from '../components';
import { DataService } from '../services';
import * as Types from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Pencil, Trash2, X, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDashboard = () => {
    const [stats, setStats] = useState({ students: 0, courses: 0, instructors: 0 });
    const [courses, setCourses] = useState<Types.Course[]>([]);
    
    // Modals state
    const [editingCourse, setEditingCourse] = useState<Types.Course | null>(null);
    const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<Types.Course>>({});
    const [editImage, setEditImage] = useState<File | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        const users = JSON.parse(localStorage.getItem('lumina_users') || '[]');
        const allCourses = DataService.getCourses();
        setCourses(allCourses);
        setStats({
            students: users.filter((u: any) => u.role === 'Student').length,
            instructors: users.filter((u: any) => u.role === 'Instructor').length,
            courses: allCourses.length
        });
    };

    const handleDelete = () => {
        if (deletingCourseId) {
            DataService.deleteCourse(deletingCourseId);
            setDeletingCourseId(null);
            loadData();
        }
    };

    const handleEditClick = (course: Types.Course) => {
        setEditingCourse(course);
        setEditForm({ ...course });
        setEditImage(null);
    };

    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCourse) {
            let thumbnail = editingCourse.thumbnail;
            if (editImage) {
                const reader = new FileReader();
                reader.readAsDataURL(editImage);
                await new Promise(resolve => reader.onload = resolve);
                thumbnail = reader.result as string;
            }

            DataService.updateCourse({
                ...editingCourse,
                ...editForm,
                thumbnail
            } as Types.Course);
            
            setEditingCourse(null);
            loadData();
        }
    };

    const data = [
        { name: 'Students', count: stats.students },
        { name: 'Courses', count: stats.courses },
        { name: 'Instructors', count: stats.instructors },
    ];

    return (
        <Layout requireAuth allowedRoles={['Admin']}>
            <div className="space-y-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold dark:text-white">Admin Dashboard</h1>
                    <span className="text-sm text-zinc-500">{new Date().toLocaleDateString()}</span>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    <Card className="bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800">
                        <h3 className="text-zinc-500 dark:text-zinc-400 font-medium">Total Students</h3>
                        <p className="text-4xl font-bold text-indigo-600 mt-2">{stats.students}</p>
                    </Card>
                    <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800">
                        <h3 className="text-zinc-500 dark:text-zinc-400 font-medium">Active Courses</h3>
                        <p className="text-4xl font-bold text-purple-600 mt-2">{stats.courses}</p>
                    </Card>
                    <Card className="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800">
                        <h3 className="text-zinc-500 dark:text-zinc-400 font-medium">Instructors</h3>
                        <p className="text-4xl font-bold text-emerald-600 mt-2">{stats.instructors}</p>
                    </Card>
                </div>

                <Card className="h-96">
                    <h3 className="text-lg font-bold mb-6 dark:text-white">Platform Overview</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="name" stroke="#888888" />
                            <YAxis stroke="#888888" />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>

                {/* Manage Courses Section */}
                <Card>
                    <div className="flex justify-between items-center mb-6">
                         <h3 className="text-lg font-bold dark:text-white">Manage Courses</h3>
                         <Link to="/admin/add-course">
                             <Button size="sm" className="gap-2"><Plus className="w-4 h-4" /> Add Course</Button>
                         </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left dark:text-zinc-300">
                            <thead className="border-b border-zinc-100 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-500 text-sm uppercase tracking-wider">
                                <tr>
                                    <th className="py-3 px-4">Title</th>
                                    <th className="py-3 px-4">Instructor</th>
                                    <th className="py-3 px-4">Category</th>
                                    <th className="py-3 px-4">Price</th>
                                    <th className="py-3 px-4">Level</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700">
                                {courses.map(course => (
                                    <tr key={course.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                        <td className="py-3 px-4 font-medium">{course.title}</td>
                                        <td className="py-3 px-4">{course.instructorName}</td>
                                        <td className="py-3 px-4"><Badge color="blue">{course.category}</Badge></td>
                                        <td className="py-3 px-4">${course.price}</td>
                                        <td className="py-3 px-4">{course.level}</td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleEditClick(course)} className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors">
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => setDeletingCourseId(course.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {courses.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-zinc-500">No courses found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Delete Confirmation Modal */}
                {deletingCourseId && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-up">
                        <Card className="max-w-md w-full p-6 space-y-4">
                            <h3 className="text-xl font-bold dark:text-white">Delete Course</h3>
                            <p className="text-zinc-500">Are you sure you want to delete this course? This action cannot be undone.</p>
                            <div className="flex justify-end gap-3 pt-2">
                                <Button variant="secondary" onClick={() => setDeletingCourseId(null)}>Cancel</Button>
                                <Button variant="danger" onClick={handleDelete}>Delete Course</Button>
                            </div>
                        </Card>
                    </div>
                )}

                {/* Edit Modal */}
                {editingCourse && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
                        <Card className="max-w-2xl w-full p-6 space-y-6 relative m-auto animate-fade-up">
                             <button onClick={() => setEditingCourse(null)} className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                                <X className="w-6 h-6" />
                             </button>
                             <h3 className="text-xl font-bold dark:text-white">Edit Course</h3>
                             <form onSubmit={handleSaveEdit} className="space-y-4">
                                <Input label="Title" value={editForm.title || ''} onChange={e => setEditForm({...editForm, title: e.target.value})} required />
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Description</label>
                                    <textarea className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 outline-none w-full dark:text-white" value={editForm.description || ''} onChange={e => setEditForm({...editForm, description: e.target.value})} required rows={3} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input label="Category" value={editForm.category || ''} onChange={e => setEditForm({...editForm, category: e.target.value})} required />
                                    <Input label="Price ($)" type="number" min="0" value={editForm.price !== undefined ? editForm.price : ''} onChange={e => setEditForm({...editForm, price: Number(e.target.value)})} required />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input label="Hours" type="number" min="0" value={editForm.hours || ''} onChange={e => setEditForm({...editForm, hours: Number(e.target.value)})} required />
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Level</label>
                                        <select className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 outline-none dark:text-white" value={editForm.level} onChange={e => setEditForm({...editForm, level: e.target.value as any})}>
                                            <option>Beginner</option>
                                            <option>Intermediate</option>
                                            <option>Advanced</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                     <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Thumbnail Image</label>
                                     <div className="flex items-center gap-4">
                                        <img src={editingCourse.thumbnail} className="w-16 h-16 rounded object-cover border border-zinc-200" alt="Current" />
                                        <input type="file" onChange={e => setEditImage(e.target.files?.[0] || null)} className="dark:text-white text-sm" accept="image/*" />
                                     </div>
                                </div>
                                <div className="flex justify-end gap-3 pt-4">
                                    <Button type="button" variant="secondary" onClick={() => setEditingCourse(null)}>Cancel</Button>
                                    <Button type="submit">Save Changes</Button>
                                </div>
                            </form>
                        </Card>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export const AdminAddCourse = () => {
    const [form, setForm] = useState<Partial<Types.Course>>({ level: 'Beginner', price: 0 });
    const [imageFile, setImageFile] = useState<File | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Convert image to base64
        let thumbnail = 'https://picsum.photos/800/600'; // fallback
        if (imageFile) {
            const reader = new FileReader();
            reader.readAsDataURL(imageFile);
            await new Promise(resolve => reader.onload = resolve);
            thumbnail = reader.result as string;
        }

        const newCourse: Types.Course = {
            id: 'c' + Date.now(),
            title: form.title!,
            description: form.description!,
            category: form.category!,
            level: form.level as any,
            hours: Number(form.hours),
            price: Number(form.price),
            instructorName: 'Admin', // In real app, select instructor
            thumbnail
        };

        DataService.addCourse(newCourse);
        alert('Course Added!');
        setForm({ title: '', description: '', category: '', hours: 0, price: 0 });
        setImageFile(null);
    };

    return (
        <Layout requireAuth allowedRoles={['Admin']}>
             <div className="max-w-2xl mx-auto space-y-6">
                <h1 className="text-2xl font-bold dark:text-white">Add New Course</h1>
                <Card>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input label="Course Title" value={form.title || ''} onChange={e => setForm({...form, title: e.target.value})} required />
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Description</label>
                            <textarea className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 outline-none w-full dark:text-white" value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})} required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Category" value={form.category || ''} onChange={e => setForm({...form, category: e.target.value})} required />
                            <Input label="Price ($)" type="number" min="0" value={form.price !== undefined ? form.price : ''} onChange={e => setForm({...form, price: Number(e.target.value)})} required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <Input label="Hours" type="number" min="0" value={form.hours || ''} onChange={e => setForm({...form, hours: Number(e.target.value)})} required />
                             <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Level</label>
                                <select className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 outline-none dark:text-white" value={form.level} onChange={e => setForm({...form, level: e.target.value as any})}>
                                    <option>Beginner</option>
                                    <option>Intermediate</option>
                                    <option>Advanced</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                             <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Thumbnail Image</label>
                             <input type="file" onChange={e => setImageFile(e.target.files?.[0] || null)} className="dark:text-white" accept="image/*" />
                        </div>
                        <Button type="submit" className="w-full">Create Course</Button>
                    </form>
                </Card>
             </div>
        </Layout>
    );
};

export const QuizAnalytics = () => {
    const [submissions, setSubmissions] = useState<Types.QuizSubmission[]>([]);

    useEffect(() => {
        setSubmissions(DataService.getQuizSubmissions());
    }, []);

    const passedCount = submissions.filter(s => s.passed).length;
    const avgScore = submissions.length > 0 ? (submissions.reduce((a, b) => a + b.score, 0) / submissions.length).toFixed(1) : 0;

    return (
        <Layout requireAuth allowedRoles={['Admin']}>
            <div className="space-y-6">
                <h1 className="text-2xl font-bold dark:text-white">Quiz Analytics</h1>
                <div className="grid md:grid-cols-3 gap-6">
                     <Card>
                         <h4 className="text-sm text-zinc-500">Total Attempts</h4>
                         <p className="text-3xl font-bold text-indigo-600">{submissions.length}</p>
                     </Card>
                     <Card>
                         <h4 className="text-sm text-zinc-500">Pass Rate</h4>
                         <p className="text-3xl font-bold text-emerald-600">{submissions.length > 0 ? Math.round((passedCount / submissions.length) * 100) : 0}%</p>
                     </Card>
                     <Card>
                         <h4 className="text-sm text-zinc-500">Avg Score</h4>
                         <p className="text-3xl font-bold text-blue-600">{avgScore}</p>
                     </Card>
                </div>
                <Card>
                    <table className="w-full text-left dark:text-zinc-300">
                        <thead className="border-b border-zinc-100 dark:border-zinc-700">
                            <tr>
                                <th className="pb-3">User</th>
                                <th className="pb-3">Quiz ID</th>
                                <th className="pb-3">Score</th>
                                <th className="pb-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700">
                            {submissions.map(s => (
                                <tr key={s.id}>
                                    <td className="py-3">{s.userEmail}</td>
                                    <td className="py-3">{s.quizId}</td>
                                    <td className="py-3">{s.score}/{s.totalQuestions}</td>
                                    <td className="py-3">
                                        <Badge color={s.passed ? 'green' : 'red'}>{s.passed ? 'Passed' : 'Failed'}</Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            </div>
        </Layout>
    );
};