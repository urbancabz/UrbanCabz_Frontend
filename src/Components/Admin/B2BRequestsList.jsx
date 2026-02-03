import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useDragScroll from '../../hooks/useDragScroll';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5050/api/v1";

export default function B2BRequestsList() {
    const { ref, onMouseDown, onMouseLeave, onMouseUp, onMouseMove, onContextMenu, isDragging } = useDragScroll();

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL'); // ALL, PENDING, APPROVED, REJECTED
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [approveDetails, setApproveDetails] = useState({
        address: '',
        city: '',
        state: '',
        pincode: ''
    });

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

    const handleApprove = (request) => {
        setSelectedRequest(request);
        setShowApproveModal(true);
    };

    const confirmApproval = async () => {
        const { address, city, state, pincode } = approveDetails;

        if (!address || !city || !state || !pincode) {
            alert('Please fill in all company details');
            return;
        }

        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${API_BASE_URL}/b2b/requests/${selectedRequest.id}/approve`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    admin_notes: 'Approved via admin panel',
                    address,
                    city,
                    state,
                    pincode
                })
            });

            const data = await response.json();
            if (data.success) {
                alert('B2B request approved successfully!');
                setShowApproveModal(false);
                setSelectedRequest(null);
                setApproveDetails({ address: '', city: '', state: '', pincode: '' });
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
                <h2 className="text-2xl font-black text-slate-900 mb-2">B2B Registration Requests</h2>
                <p className="text-slate-500 font-medium">Manage company registration requests</p>
            </div>

            {/* Filters */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <div className="flex gap-2">
                    {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-lg font-bold transition-colors ${filter === status
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
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
                    className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-medium"
                />
            </div>

            {/* Requests Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div
                    ref={ref}
                    onMouseDown={onMouseDown}
                    onMouseLeave={onMouseLeave}
                    onMouseUp={onMouseUp}
                    onMouseMove={onMouseMove}
                    onContextMenu={onContextMenu}
                    className={`overflow-x-auto CustomScrollbar select-none ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
                >
                    <table className="min-w-[1200px] w-full">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    Company
                                </th>
                                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    Contact
                                </th>
                                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    Vehicle Preference
                                </th>
                                <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    Status
                                </th>
                                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredRequests.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-medium italic">
                                        No request records found
                                    </td>
                                </tr>
                            ) : (
                                filteredRequests.map((request) => (
                                    <tr key={request.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <div className="text-slate-900 font-bold">{request.company_name}</div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="text-slate-700 font-bold text-sm">{request.contact_name}</div>
                                            <div className="text-slate-500 text-xs">{request.contact_email}</div>
                                            <div className="text-slate-500 text-xs">{request.contact_phone}</div>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            {getStatusBadge(request.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-slate-500 text-xs font-semibold">
                                            {new Date(request.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <div className="flex gap-2">
                                                {request.status === 'PENDING' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(request)}
                                                            className="px-3 py-1.5 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-lg hover:bg-emerald-100 transition-colors"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(request.id)}
                                                            className="px-3 py-1.5 bg-rose-50 text-rose-600 text-xs font-bold rounded-lg hover:bg-rose-100 transition-colors"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    onClick={() => setSelectedRequest(request)}
                                                    className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors"
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

            {/* Approval Modal */}
            {showApproveModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => { setShowApproveModal(false); setSelectedRequest(null); }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-xl font-black text-slate-900">Approve Request</h3>
                                <p className="text-sm text-slate-500">Enter company details to finalize registration</p>
                            </div>
                            <button
                                onClick={() => { setShowApproveModal(false); setSelectedRequest(null); }}
                                className="p-2 text-slate-400 hover:text-slate-600 transition-colors bg-slate-100 rounded-lg"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Company Address</label>
                                <textarea
                                    value={approveDetails.address}
                                    onChange={(e) => setApproveDetails({ ...approveDetails, address: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
                                    placeholder="Full office address"
                                    rows="3"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">City</label>
                                    <input
                                        type="text"
                                        value={approveDetails.city}
                                        onChange={(e) => setApproveDetails({ ...approveDetails, city: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
                                        placeholder="City"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">State</label>
                                    <input
                                        type="text"
                                        value={approveDetails.state}
                                        onChange={(e) => setApproveDetails({ ...approveDetails, state: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
                                        placeholder="State"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Pincode</label>
                                <input
                                    type="text"
                                    value={approveDetails.pincode}
                                    onChange={(e) => setApproveDetails({ ...approveDetails, pincode: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
                                    placeholder="6-digit Pincode"
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    onClick={() => { setShowApproveModal(false); setSelectedRequest(null); }}
                                    className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmApproval}
                                    className="flex-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                                >
                                    Confirm Approval
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Detail Modal */}
            {selectedRequest && !showApproveModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedRequest(null)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-xl font-black text-slate-900">Request Details</h3>
                                <p className="text-sm text-slate-500">Review company information</p>
                            </div>
                            <button
                                onClick={() => setSelectedRequest(null)}
                                className="p-2 text-slate-400 hover:text-slate-600 transition-colors bg-slate-100 rounded-lg"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-slate-500">Company Name</label>
                                    <div className="text-slate-900 font-bold mt-1">{selectedRequest.company_name}</div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-slate-500">Contact Person</label>
                                    <div className="text-slate-900 font-bold mt-1">{selectedRequest.contact_name}</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-slate-500">Email</label>
                                    <div className="text-slate-900 font-medium text-sm mt-1">{selectedRequest.contact_email}</div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-slate-500">Phone</label>
                                    <div className="text-slate-900 font-medium text-sm mt-1">{selectedRequest.contact_phone}</div>
                                </div>
                            </div>

                            {selectedRequest.message && (
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <label className="text-[10px] font-bold uppercase text-slate-500 block mb-2">Message</label>
                                    <div className="text-slate-700 text-sm">{selectedRequest.message}</div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-5 items-center">
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Status</label>
                                    {getStatusBadge(selectedRequest.status)}
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Default Password</label>
                                    <div className="text-indigo-600 font-mono font-bold bg-indigo-50 px-2 py-1 rounded inline-block text-xs border border-indigo-100">
                                        UrbanCabz123
                                    </div>
                                </div>
                            </div>

                            {selectedRequest.admin_notes && (
                                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                                    <label className="text-[10px] font-bold uppercase text-yellow-700 block mb-1">Admin Notes</label>
                                    <div className="text-yellow-800 text-sm">{selectedRequest.admin_notes}</div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
