import React, { useState, useEffect, useRef } from 'react';
import { Layout, Card, Input, Button } from '../components';
import { AuthService, DataService } from '../services';
import * as Types from '../types';
import { Camera, User as UserIcon, Mail, Shield, AlertCircle, CheckCircle2, Lock, Trash2, Upload } from 'lucide-react';

export const Profile = () => {
    const [user, setUser] = useState<Types.User | null>(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<Types.Role>('Student');
    const [avatar, setAvatar] = useState('');
    
    // Password State
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    
    const [message, setMessage] = useState({ type: '', text: '' });
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const u = AuthService.getCurrentUser();
        if (u) {
            setUser(u);
            setName(u.name);
            setEmail(u.email);
            setRole(u.role);
            setAvatar(u.avatar || '');
        }
    }, []);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validation: Limit to 500KB
            if (file.size > 500 * 1024) {
                 setMessage({ type: 'error', text: "Image is too large. Max size is 500KB." });
                 setTimeout(() => setMessage({ type: '', text: '' }), 4000);
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const newAvatar = reader.result as string;
                setAvatar(newAvatar);
                
                // IMMEDIATE SAVE: Update local storage instantly for avatar
                if (user) {
                    const updatedUser = { ...user, avatar: newAvatar };
                    
                    try {
                        DataService.updateUser(updatedUser);
                        setUser(updatedUser); 
                        setMessage({ type: 'success', text: "Profile picture updated!" });
                        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
                    } catch (err: any) {
                        setMessage({ type: 'error', text: "Failed to save profile picture." });
                    }
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        // Generate default based on current name input
        const displayName = name.trim() || 'User';
        const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random&size=256`;
        
        setAvatar(defaultAvatar); 
        
        if (user) {
            const updatedUser = { ...user, avatar: defaultAvatar };
            
            try {
                DataService.updateUser(updatedUser);
                setUser(updatedUser);
                setMessage({ type: 'success', text: "Profile picture reset to default." });
                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            } catch (err: any) {
                setMessage({ type: 'error', text: "Failed to reset profile picture." });
            }
        }
    }

    const handleSaveProfile = () => {
        if (user) {
            if (!name.trim()) {
                setMessage({ type: 'error', text: "Full Name cannot be empty." });
                return;
            }
            if (!email.trim()) {
                setMessage({ type: 'error', text: "Email cannot be empty." });
                return;
            }

            const originalEmail = user.email;
            
            // If the current avatar is NOT a custom upload (data URI), regenerate it based on the NEW name
            // This ensures the stored URL matches the user's updated name.
            let finalAvatar = avatar;
            if (!avatar || !avatar.startsWith('data:')) {
                 finalAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=256`;
            }

            const updatedUser: Types.User = { 
                ...user, 
                name, 
                email, 
                role,
                avatar: finalAvatar 
            };

            const roleChanged = user.role !== role;

            try {
                // Update LocalStorage and Dispatch Event to update Navbar
                DataService.updateUser(updatedUser, originalEmail);
                
                // Update Local State
                setUser(updatedUser);
                
                // If we auto-generated an avatar, update local state so UI reflects it immediately if it wasn't already
                if (finalAvatar !== avatar) {
                    setAvatar(finalAvatar);
                }
                
                setMessage({ type: 'success', text: roleChanged ? 'Profile updated. Role changed - dashboard access updated.' : 'Profile details updated successfully!' });
                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            } catch (err: any) {
                setMessage({ type: 'error', text: err.message || "Failed to update profile." });
            }
        }
    };

    const handleChangePassword = () => {
        if (!passwords.current || !passwords.new || !passwords.confirm) {
            setMessage({ type: 'error', text: "All password fields are required." });
            return;
        }
        if (passwords.new !== passwords.confirm) {
             setMessage({ type: 'error', text: "New passwords do not match." });
             return;
        }
        if (passwords.new.length < 6) {
             setMessage({ type: 'error', text: "Password must be at least 6 characters." });
             return;
        }
        try {
            if (user) {
                AuthService.changePassword(user.email, passwords.current, passwords.new);
                setMessage({ type: 'success', text: "Password changed successfully." });
                setPasswords({ current: '', new: '', confirm: '' });
                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            }
        } catch(e: any) {
            setMessage({ type: 'error', text: e.message });
        }
    };

    const getAvatarSrc = () => {
        if (avatar && avatar.startsWith('data:image')) {
            return avatar;
        }
        // Live preview: generate based on input name if not a custom upload
        const displayName = name.trim() || 'User';
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random&size=256`;
    };

    if (!user) return null;

    const roleColors = {
        Admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        Instructor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        Student: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
    };

    return (
        <Layout requireAuth>
            <div className="max-w-3xl mx-auto py-8 px-4">
                 <h1 className="text-3xl font-bold dark:text-white mb-8">Profile Settings</h1>
                 
                 <div className="grid gap-8">
                    {/* Header Card */}
                    <Card className="flex flex-col md:flex-row items-center gap-8 p-8 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-900/20 dark:to-purple-900/20 -z-0"></div>
                        
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />

                        <div className="relative group shrink-0 z-10">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-zinc-800 shadow-xl bg-white dark:bg-zinc-800">
                                <img 
                                    src={getAvatarSrc()} 
                                    alt="Profile" 
                                    className="w-full h-full object-cover" 
                                    onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=User&background=random&size=256`; }}
                                />
                            </div>
                            <button onClick={handleUploadClick} className="absolute bottom-1 right-1 p-2 bg-indigo-600 text-white rounded-full cursor-pointer hover:bg-indigo-700 transition-all hover:scale-110 shadow-lg border-2 border-white dark:border-zinc-800">
                                <Camera className="w-4 h-4" />
                            </button>
                        </div>
                        
                        <div className="flex-1 text-center md:text-left space-y-3 z-10 flex flex-col items-center md:items-start">
                            <div>
                                <h2 className="text-2xl font-bold dark:text-white">{name || user.name}</h2>
                                <p className="text-zinc-500 dark:text-zinc-400 flex items-center justify-center md:justify-start gap-2 text-sm mt-1">
                                    <Mail className="w-4 h-4" /> {email || user.email}
                                </p>
                            </div>
                            
                            <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${roleColors[role]}`}>
                                    <Shield className="w-3 h-3" /> {role} Account
                                </span>
                                <Button onClick={handleUploadClick} size="sm" variant="outline" className="px-3 py-1 text-xs h-auto rounded-full gap-1.5">
                                    <Upload className="w-3 h-3" /> Upload Photo
                                </Button>
                                {avatar && avatar.startsWith('data:') && (
                                    <button onClick={handleRemoveImage} className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex items-center gap-1.5 border border-red-200 dark:border-red-900">
                                        <Trash2 className="w-3 h-3" /> Remove
                                    </button>
                                )}
                            </div>
                        </div>
                    </Card>

                    {(message.text && (message.type === 'error' || message.type === 'success')) && (
                        <div className={`p-4 rounded-xl flex items-center gap-2 animate-fade-up ${message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800' : 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'}`}>
                            {message.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                            <span className="font-medium">{message.text}</span>
                        </div>
                    )}

                    <Card className="space-y-6">
                        <div className="flex items-center gap-2 mb-2 pb-4 border-b border-zinc-100 dark:border-zinc-700">
                            <UserIcon className="w-5 h-5 text-indigo-600" />
                            <h3 className="text-lg font-semibold dark:text-white">Personal Information</h3>
                        </div>
                        
                        <div className="space-y-5">
                            <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Alex Johnson" />
                             <div className="grid md:grid-cols-2 gap-5">
                                <Input label="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" />
                                <div className="flex flex-col gap-1.5 w-full">
                                    <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Account Role</label>
                                    <select className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 outline-none transition-all dark:text-white focus:ring-2 focus:ring-indigo-500" value={role} onChange={(e) => setRole(e.target.value as Types.Role)}>
                                        <option value="Student">Student</option>
                                        <option value="Instructor">Instructor</option>
                                        <option value="Admin">Admin</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <Button onClick={handleSaveProfile} className="w-full sm:w-auto px-8">Save Changes</Button>
                        </div>
                    </Card>

                    <Card className="space-y-6">
                        <div className="flex items-center gap-2 mb-2 pb-4 border-b border-zinc-100 dark:border-zinc-700">
                            <Lock className="w-5 h-5 text-indigo-600" />
                            <h3 className="text-lg font-semibold dark:text-white">Security</h3>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <Input 
                                label="Current Password" 
                                type="password" 
                                value={passwords.current} 
                                onChange={e => setPasswords({...passwords, current: e.target.value})} 
                                placeholder="••••••••" 
                                autoComplete="current-password"
                            />
                            <div className="hidden md:block"></div> 
                            <Input 
                                label="New Password" 
                                type="password" 
                                value={passwords.new} 
                                onChange={e => setPasswords({...passwords, new: e.target.value})} 
                                placeholder="Min. 6 characters" 
                                autoComplete="new-password"
                            />
                            <Input 
                                label="Confirm New Password" 
                                type="password" 
                                value={passwords.confirm} 
                                onChange={e => setPasswords({...passwords, confirm: e.target.value})} 
                                placeholder="Min. 6 characters" 
                                autoComplete="new-password"
                            />
                        </div>
                        <div className="pt-4 flex justify-end">
                            <Button onClick={handleChangePassword} variant="secondary" className="w-full sm:w-auto px-8">Update Password</Button>
                        </div>
                    </Card>
                 </div>
            </div>
        </Layout>
    );
};