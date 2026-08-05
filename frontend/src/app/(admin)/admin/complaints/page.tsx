"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle, CheckCircle2, Clock, Eye, Search, Filter,
  ChevronRight, Calendar, User, Ticket, RefreshCw, ShieldAlert
} from "lucide-react";
import { API_BASE_URL } from "@/lib/config";

interface Complaint {
  id: string;
  category?: string | null;
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
  booking?: {
    id: string;
    bookingRef: string;
    seatCount?: number;
    totalAmount?: number;
    event?: {
      id: string;
      title: string;
      posterUrl?: string;
    };
  } | null;
}

import { PaginationControl } from "@/components/ui/pagination-control";
import { PaginationMeta } from "@/features/admin/api/types";

export default function AdminComplaintsPage() {
  const router = useRouter();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const fetchComplaints = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (selectedStatus !== "ALL") params.set("status", selectedStatus);
      if (selectedCategory !== "ALL") params.set("category", selectedCategory);

      const res = await fetch(`${API_BASE_URL}/complaints/admin?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        if (data.pagination) {
          setComplaints(data.data);
          setPagination(data.pagination);
        } else {
          setComplaints(Array.isArray(data.data) ? data.data : []);
          setPagination(null);
        }
      }
    } catch (err) {
      console.error("Error fetching complaints", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints(1, pagination?.limit || 10);
  }, [selectedStatus, selectedCategory]);

  const updateStatus = async (e: React.SyntheticEvent, id: string, newStatus: string) => {
    e.stopPropagation();
    try {
      const res = await fetch(`${API_BASE_URL}/complaints/admin/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchComplaints();
      }
    } catch (err) {
      console.error("Error updating status", err);
    }
  };

  // Categories list extracted dynamically
  const categories = useMemo(() => {
    const set = new Set<string>();
    complaints.forEach((c) => {
      if (c.category) set.add(c.category);
    });
    return Array.from(set);
  }, [complaints]);

  // Filtered complaints calculation
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      // Status filter
      if (selectedStatus !== "ALL" && c.status !== selectedStatus) return false;
      // Category filter
      if (selectedCategory !== "ALL" && c.category !== selectedCategory) return false;
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const clientName = c.client ? `${c.client.firstName} ${c.client.lastName}`.toLowerCase() : "";
        const clientEmail = c.client?.email?.toLowerCase() || "";
        const hostName = (c.hostName || c.host?.user?.firstName || "").toLowerCase();
        const bookingRef = c.booking?.bookingRef?.toLowerCase() || "";
        const eventTitle = c.booking?.event?.title?.toLowerCase() || "";
        const subject = c.subject.toLowerCase();
        const description = c.description.toLowerCase();

        return (
          clientName.includes(q) ||
          clientEmail.includes(q) ||
          hostName.includes(q) ||
          bookingRef.includes(q) ||
          eventTitle.includes(q) ||
          subject.includes(q) ||
          description.includes(q)
        );
      }
      return true;
    });
  }, [complaints, selectedStatus, selectedCategory, searchQuery]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full flex items-center gap-1 shrink-0"><Clock size={12}/> Pending</span>;
      case 'REVIEWED':
        return <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full flex items-center gap-1 shrink-0"><AlertCircle size={12}/> Reviewed</span>;
      case 'RESOLVED':
        return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full flex items-center gap-1 shrink-0"><CheckCircle2 size={12}/> Resolved</span>;
      default:
        return null;
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Complaints & Support Tickets</h1>
          <p className="text-gray-500 text-sm mt-1">Filter, search, and manage all client complaints and booking issues.</p>
        </div>
        <button
          onClick={() => fetchComplaints()}
          className="self-start sm:self-auto p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold flex items-center gap-2 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 space-y-4">
        
        {/* Top Search & Category Row */}
        <div className="flex flex-col md:flex-row items-center gap-4">
          
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by client name, email, host, subject, or booking ref..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 font-bold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="h-4 w-4 text-gray-400 shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full md:w-56 text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="ALL">All Categories ({complaints.length})</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 border-t border-gray-100 pt-3 flex-wrap">
          <span className="text-xs font-bold text-gray-400 uppercase mr-2">Status:</span>
          {[
            { label: "All Tickets", value: "ALL", count: complaints.length },
            { label: "Pending", value: "PENDING", count: complaints.filter(c => c.status === "PENDING").length, color: "amber" },
            { label: "Reviewed", value: "REVIEWED", count: complaints.filter(c => c.status === "REVIEWED").length, color: "blue" },
            { label: "Resolved", value: "RESOLVED", count: complaints.filter(c => c.status === "RESOLVED").length, color: "emerald" },
          ].map((tab) => {
            const isActive = selectedStatus === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setSelectedStatus(tab.value)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isActive
                    ? "bg-gray-900 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab.label}
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  isActive ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

      </div>

      {/* Complaints Filterable Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 font-medium flex items-center justify-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin text-emerald-600" /> Loading complaints...
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="p-12 text-center text-gray-500 space-y-2">
            <ShieldAlert className="h-8 w-8 text-amber-500 mx-auto" />
            <div className="font-bold text-gray-900">No matching complaints found</div>
            <p className="text-xs text-gray-400">Try adjusting your filter parameters or search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Booking Ref</th>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Category & Subject</th>
                  <th className="px-6 py-4 w-1/4">Description</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredComplaints.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => router.push(`/admin/complaints/${c.id}`)}
                    className="hover:bg-gray-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-medium">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(c.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {c.booking ? (
                        <div className="flex flex-col">
                          <span className="font-mono text-xs font-bold text-blue-600 group-hover:underline">#{c.booking.bookingRef}</span>
                          <span className="text-[11px] text-gray-500 truncate max-w-[140px]">{c.booking.event?.title}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs italic">General</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {c.client ? `${c.client.firstName} ${c.client.lastName}` : "Client User"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      <div className="text-[11px] text-emerald-700 font-extrabold uppercase tracking-wide">{c.category || "General Issue"}</div>
                      <div className="text-sm font-bold group-hover:text-emerald-700 transition-colors">{c.subject}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="max-w-xs truncate" title={c.description}>
                        {c.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <select
                          value={c.status}
                          onChange={(e) => updateStatus(e, c.id, e.target.value)}
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 inline-block font-medium"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="REVIEWED">Reviewed</option>
                          <option value="RESOLVED">Resolved</option>
                        </select>
                        <Link href={`/admin/complaints/${c.id}`}>
                          <button className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold">
                            View <ChevronRight className="h-4 w-4" />
                          </button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {pagination && (
          <PaginationControl
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            limit={pagination.limit}
            onPageChange={(page) => fetchComplaints(page, pagination.limit)}
            onLimitChange={(limit) => fetchComplaints(1, limit)}
          />
        )}
      </div>

    </div>
  );
}
