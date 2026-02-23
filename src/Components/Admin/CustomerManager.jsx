import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchUsers, updateUser } from '../../services/adminService';
import { toast } from 'react-hot-toast';

import CustomerHistory from './CustomerHistory';

let cachedUsers = null;
let cachedPagination = null;

export default function CustomerManager() {
    const [users, setUsers] = useState(cachedUsers ?? []);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);

    const [selectedUser, setSelectedUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({});

    // History View State
    const [historyUser, setHistoryUser] = useState(null);

    useEffect(() => {
        if (page === 1 && searchTerm === '' && cachedUsers) {
            setUsers(cachedUsers);
            setPagination(cachedPagination);
            setLoading(false);
        } else {
            loadUsers();
        }
    }, [page, searchTerm]);

    const loadUsers = async (force = false) => {
        setLoading(true);
        // Debounce search could be added here, but for now direct call
        const res = await fetchUsers(searchTerm, page);
        if (res.success) {
            const fetchedUsers = res.data?.users ?? [];
            setUsers(fetchedUsers);
            setPagination(res.data?.pagination || null);

            // Cache the default view (page 1, no search) to prevent refetching on tab switch
            if (page === 1 && searchTerm === '') {
                cachedUsers = fetchedUsers;
                cachedPagination = res.data?.pagination || null;
            }
        }
        setLoading(false);
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setPage(1); // Reset to page 1 on search
    };

    const openEditModal = (user) => {
        setSelectedUser(user);
        setEditForm({
            name: user.name,
            email: user.email,
            phone: user.phone,
            role_id: user.role_id
        });
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        setIsEditing(true);
        const res = await updateUser(selectedUser.id, editForm);
        setIsEditing(false);

        if (res.success) {
            toast.success("User updated successfully");
            setSelectedUser(null);
            loadUsers();
        } else {
            toast.error(res.message || "Failed to update user");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div className="flex items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900">Customer Management</h2>
                        <p className="text-slate-500 text-sm font-medium">View and manage B2C registered users</p>
                    </div>
                    <button
                        onClick={() => {
                            if (page === 1 && searchTerm === '') {
                                cachedUsers = null;
                                cachedPagination = null;
                                loadUsers(true);
                            } else {
                                setPage(1);
                                setSearchTerm('');
                            }
                        }}
                        disabled={loading}
                        className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 font-bold rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50"
                    >
                        <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </button>
                </div>
                <input
                    type="text"
                    placeholder="Search by name, email, phone..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="w-full md:w-80 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto CustomScrollbar">
                    <table className="w-full min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <th className="px-6 py-4">User Details</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Joined</th>
                                <th className="px-6 py-4 text-center">Bookings</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {users.map(user => (
                                <tr key={user.id} className="group hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-sm">
                                                {user.name?.[0]?.toUpperCase() || '?'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">{user.name}</p>
                                                <p className="text-xs text-slate-400">ID: {user.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-xs font-semibold text-slate-600">{user.email}</p>
                                        <p className="text-xs text-slate-400">{user.phone}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${user.role?.name === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                                            {user.role?.name || 'Customer'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-medium text-slate-500">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="px-2 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-700">
                                            {user._count?.bookings || 0}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => setHistoryUser(user)}
                                                className="text-slate-400 hover:text-indigo-600 p-1 rounded-md hover:bg-indigo-50 transition-all"
                                                title="View History"
                                            >
                                                📜
                                            </button>
                                            <button
                                                onClick={() => openEditModal(user)}
                                                className="text-indigo-600 hover:text-indigo-800 text-xs font-bold px-2 py-1 rounded hover:bg-indigo-50 transition-all"
                                            >
                                                Edit
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!loading && users.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="py-12 text-center text-slate-400 font-bold">No users found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                    <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                        <p className="text-xs text-slate-500 font-medium">
                            Showing {((page - 1) * pagination.limit) + 1} to {Math.min(page * pagination.limit, pagination.total)} of {pagination.total} users
                        </p>
                        <div className="flex gap-2">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                                className="px-3 py-1 text-xs font-bold rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                disabled={page === pagination.pages}
                                onClick={() => setPage(p => p + 1)}
                                className="px-3 py-1 text-xs font-bold rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Edit User Modal */}
            <AnimatePresence>
                {selectedUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedUser(null)}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                <h3 className="text-xl font-black text-slate-900">Edit User Details</h3>
                                <p className="text-xs text-slate-500">Update profile information for {selectedUser.name}</p>
                            </div>
                            <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-slate-500">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={editForm.name}
                                        onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-indigo-500"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-slate-500">Email Address</label>
                                        <input
                                            type="email"
                                            required
                                            value={editForm.email}
                                            onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-indigo-500"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-slate-500">Phone Number</label>
                                        <input
                                            type="text"
                                            required
                                            value={editForm.phone}
                                            onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-indigo-500"
                                        />
                                    </div>
                                </div>

                                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                                    <p className="text-xs text-amber-800 font-medium">
                                        ⚠️ Changing user details directly can affect their login credentials (if email is changed) and booking communications.
                                    </p>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedUser(null)}
                                        className="flex-1 py-2 text-slate-500 font-bold hover:bg-slate-50 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isEditing}
                                        className="flex-[2] py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50"
                                    >
                                        {isEditing ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Customer History Modal */}
            <AnimatePresence>
                {historyUser && (
                    <CustomerHistory
                        user={historyUser}
                        onClose={() => setHistoryUser(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
