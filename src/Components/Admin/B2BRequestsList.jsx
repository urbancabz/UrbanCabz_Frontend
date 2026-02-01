import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5050/api/v1";

export default function B2BRequestsList() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL'); // ALL, PENDING, APPROVED, REJECTED
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRequest, setSelectedRequest] = useState(null);

    useEffect(() => {
        fetchRequests();
    }, [filter]);

    const fetchRequests = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const url = filter === 'ALL'
                ? `${API_BASE_URL}/b2b/requests`
                : `${API_BASE_URL}/b2b/requests?status=${filter}`;

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (data.success) {
                setRequests(data.data);
            }
        } catch (error) {
            console.error('Error fetching B2B requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (requestId) => {
        if (!confirm('Are you sure you want to approve this B2B request?')) return;

        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${API_BASE_URL}/b2b/requests/${requestId}/approve`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    admin_notes: 'Approved via admin panel'
                })
            });

            const data = await response.json();
            if (data.success) {
                alert('B2B request approved successfully!');
                fetchRequests();
            } else {
                alert('Failed to approve request: ' + data.message);
            }
        } catch (error) {
            console.error('Error approving request:', error);
            alert('Error approving request');
        }
    };

    const handleReject = async (requestId) => {
        const reason = prompt('Please enter rejection reason:');
        if (!reason) return;

        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${API_BASE_URL}/b2b/requests/${requestId}/reject`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    admin_notes: reason
                })
            });

            const data = await response.json();
            if (data.success) {
                alert('B2B request rejected');
                fetchRequests();
            } else {
                alert('Failed to reject request: ' + data.message);
            }
        } catch (error) {
            console.error('Error rejecting request:', error);
            alert('Error rejecting request');
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            PENDING: 'bg-yellow-900/50 text-yellow-200 border-yellow-600',
            APPROVED: 'bg-green-900/50 text-green-200 border-green-600',
            REJECTED: 'bg-red-900/50 text-red-200 border-red-600'
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}>
                {status}
            </span>
        );
    };

    const filteredRequests = requests.filter(req => {
        const matchesFilter = filter === 'ALL' || req.status === filter;
        const matchesSearch = req.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.contact_email.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-neutral-400">Loading B2B requests...</div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">B2B Registration Requests</h2>
                <p className="text-neutral-400">Manage company registration requests</p>
            </div>

            {/* Filters */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <div className="flex gap-2">
                    {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === status
                                ? 'bg-yellow-400 text-black'
                                : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
                <input
                    type="text"
                    placeholder="Search by company or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-yellow-400"
                />
            </div>

            {/* Requests Table */}
            <div className="bg-neutral-800 rounded-xl border border-neutral-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-neutral-900">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                                    Company
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                                    Contact
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                                    Submitted
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-700">
                            {filteredRequests.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-neutral-400">
                                        No B2B requests found
                                    </td>
                                </tr>
                            ) : (
                                filteredRequests.map((request) => (
                                    <tr key={request.id} className="hover:bg-neutral-750 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-white font-medium">{request.company_name}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-neutral-300">{request.contact_name}</div>
                                            <div className="text-neutral-500 text-sm">{request.contact_email}</div>
                                            <div className="text-neutral-500 text-sm">{request.contact_phone}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(request.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-neutral-400 text-sm">
                                            {new Date(request.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex gap-2">
                                                {request.status === 'PENDING' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(request.id)}
                                                            className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(request.id)}
                                                            className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    onClick={() => setSelectedRequest(request)}
                                                    className="px-3 py-1 bg-neutral-700 text-white text-sm rounded-lg hover:bg-neutral-600 transition-colors"
                                                >
                                                    View
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setSelectedRequest(null)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-neutral-800 rounded-xl border border-neutral-700 p-6 max-w-2xl w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-white">Request Details</h3>
                            <button
                                onClick={() => setSelectedRequest(null)}
                                className="text-neutral-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-neutral-400 text-sm">Company Name</label>
                                <div className="text-white font-medium">{selectedRequest.company_name}</div>
                            </div>
                            <div>
                                <label className="text-neutral-400 text-sm">Contact Person</label>
                                <div className="text-white">{selectedRequest.contact_name}</div>
                            </div>
                            <div>
                                <label className="text-neutral-400 text-sm">Email</label>
                                <div className="text-white">{selectedRequest.contact_email}</div>
                            </div>
                            <div>
                                <label className="text-neutral-400 text-sm">Phone</label>
                                <div className="text-white">{selectedRequest.contact_phone}</div>
                            </div>
                            {selectedRequest.message && (
                                <div>
                                    <label className="text-neutral-400 text-sm">Message</label>
                                    <div className="text-white">{selectedRequest.message}</div>
                                </div>
                            )}
                            <div>
                                <label className="text-neutral-400 text-sm">Status</label>
                                <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                            </div>
                            {selectedRequest.admin_notes && (
                                <div>
                                    <label className="text-neutral-400 text-sm">Admin Notes</label>
                                    <div className="text-white">{selectedRequest.admin_notes}</div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
