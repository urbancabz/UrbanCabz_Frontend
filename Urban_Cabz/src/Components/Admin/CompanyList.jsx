import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CompanyDetails from './CompanyDetails';
import { createCompany } from '../../services/adminService';
import { toast } from 'react-hot-toast';

export default function CompanyList({ companies = [], onUpdate }) {
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [addForm, setAddForm] = useState({
        company_name: '',
        company_email: '',
        company_phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        gst_number: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddCompany = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const res = await createCompany(addForm);
        setIsSubmitting(false);

        if (res.success) {
            toast.success('Company created successfully');
            setShowAddModal(false);
            setAddForm({
                company_name: '', company_email: '', company_phone: '',
                address: '', city: '', state: '', pincode: '', gst_number: ''
            });
            if (onUpdate) onUpdate();
        } else {
            toast.error(res.message || 'Failed to create company');
        }
    };

    const filteredCompanies = companies.filter(company =>
        company.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.company_email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div className="flex items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900">Partner Companies</h2>
                        <p className="text-slate-500 text-sm font-medium">Manage B2B accounts, bookings, and billing</p>
                    </div>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="Search companies..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 md:w-64 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 whitespace-nowrap"
                    >
                        + Add Company
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCompanies.map(company => (
                    <motion.div
                        key={company.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -4 }}
                        className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-indigo-500/30 transition-all cursor-pointer overflow-hidden"
                        onClick={() => setSelectedCompany(company)}
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-black text-slate-900">{company.company_name}</h3>
                                    <p className="text-slate-500 text-xs font-medium">{company.company_email}</p>
                                </div>
                                <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                                    <span className="text-indigo-600 font-black text-sm">{company._count?.company_fleet || 0}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium mb-4">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                {company.company_phone}
                            </div>
                        </div>

                        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">View Account</span>
                            <span className="text-indigo-600">→</span>
                        </div>
                    </motion.div>
                ))}

                {filteredCompanies.length === 0 && (
                    <div className="col-span-full text-center py-20">
                        <span className="text-4xl">🏢</span>
                        <p className="text-slate-400 mt-4 font-bold">No companies found</p>
                    </div>
                )}
            </div>

            {/* Add Company Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                                <h3 className="text-xl font-black text-slate-900">Add New Company</h3>
                                <p className="text-xs text-slate-500 mt-1">Create a B2B partner account. A user login will be auto-generated.</p>
                            </div>
                            <form onSubmit={handleAddCompany} className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-slate-500">Company Name *</label>
                                        <input required type="text" value={addForm.company_name} onChange={e => setAddForm({ ...addForm, company_name: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-indigo-500" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-slate-500">GST Number</label>
                                        <input type="text" value={addForm.gst_number} onChange={e => setAddForm({ ...addForm, gst_number: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-slate-500">Email *</label>
                                        <input required type="email" value={addForm.company_email} onChange={e => setAddForm({ ...addForm, company_email: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-indigo-500" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-slate-500">Phone *</label>
                                        <input required type="text" value={addForm.company_phone} onChange={e => setAddForm({ ...addForm, company_phone: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-indigo-500" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-slate-500">Address</label>
                                    <input type="text" value={addForm.address} onChange={e => setAddForm({ ...addForm, address: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" />
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-slate-500">City</label>
                                        <input type="text" value={addForm.city} onChange={e => setAddForm({ ...addForm, city: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-slate-500">State</label>
                                        <input type="text" value={addForm.state} onChange={e => setAddForm({ ...addForm, state: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-slate-500">Pincode</label>
                                        <input type="text" value={addForm.pincode} onChange={e => setAddForm({ ...addForm, pincode: e.target.value })} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500" />
                                    </div>
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2 text-slate-500 font-bold hover:bg-slate-50 rounded-lg transition-colors">Cancel</button>
                                    <button type="submit" disabled={isSubmitting} className="flex-[2] py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50">
                                        {isSubmitting ? 'Creating...' : 'Create Account'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {selectedCompany && (
                    <CompanyDetails
                        company={selectedCompany}
                        onClose={() => {
                            setSelectedCompany(null);
                            fetchCompanies();
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
