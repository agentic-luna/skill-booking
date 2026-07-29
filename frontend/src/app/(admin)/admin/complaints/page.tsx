"use client";

import React, { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";

interface Complaint {
  id: string;
  hostName: string | null;
  subject: string;
  description: string;
  status: "PENDING" | "REVIEWED" | "RESOLVED";
  createdAt: string;
  client?: {
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  host?: {
    user: {
      firstName: string;
      lastName: string;
      email: string;
    }
  } | null;
}

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      // In a real app, you would pass the admin token here
      const res = await fetch(`${API_BASE_URL}/complaints/admin`);
      const data = await res.json();
      if (data.success) {
        setComplaints(data.data);
      }
    } catch (err) {
      console.error("Error fetching complaints", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/complaints/admin/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchComplaints(); // refresh
      }
    } catch (err) {
      console.error("Error updating status", err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full flex items-center gap-1"><Clock size={12}/> Pending</span>;
      case 'REVIEWED':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full flex items-center gap-1"><AlertCircle size={12}/> Reviewed</span>;
      case 'RESOLVED':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full flex items-center gap-1"><CheckCircle2 size={12}/> Resolved</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading complaints...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Complaints Management</h1>
        <p className="text-gray-500 mt-1">Review and resolve user complaints about hosts or events.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {complaints.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No complaints found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Host Name</th>
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4 w-1/3">Description</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {complaints.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(c.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {c.hostName || c.host?.user?.firstName || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {c.subject}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="max-w-md truncate" title={c.description}>
                        {c.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <select 
                        value={c.status}
                        onChange={(e) => updateStatus(c.id, e.target.value)}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 inline-block ml-auto"
                      >
                        <option value="PENDING">Mark Pending</option>
                        <option value="REVIEWED">Mark Reviewed</option>
                        <option value="RESOLVED">Mark Resolved</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
