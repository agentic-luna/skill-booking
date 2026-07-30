"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft, Clock, AlertCircle, CheckCircle2, User, Mail, Phone,
  Ticket, Calendar, MapPin, Wifi, FileText, RefreshCw, ShieldAlert, Sparkles
} from "lucide-react";
import { API_BASE_URL } from "@/lib/config";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ComplaintDetail {
  id: string;
  category?: string | null;
  hostName: string | null;
  subject: string;
  description: string;
  status: "PENDING" | "REVIEWED" | "RESOLVED";
  createdAt: string;
  updatedAt: string;
  client?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  } | null;
  host?: {
    id: string;
    user?: {
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
    };
  } | null;
  booking?: {
    id: string;
    bookingRef: string;
    seatCount: number;
    totalAmount: number;
    status: string;
    event?: {
      id: string;
      title: string;
      posterUrl?: string;
      mode: string;
      startTime: string;
      venueDetails?: any;
    };
  } | null;
}

export default function AdminSingleComplaintDetailPage() {
  const router = useRouter();
  const routeParams = useParams();
  const complaintId = routeParams?.id as string;

  const [complaint, setComplaint] = useState<ComplaintDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (complaintId) {
      fetchComplaintDetail();
    }
  }, [complaintId]);

  const fetchComplaintDetail = async () => {
    if (!complaintId) return;
    setLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("bms_access_token") : null;
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      let res = await fetch(`${API_BASE_URL}/complaints/admin/${complaintId}`, { headers });
      if (!res.ok) {
        res = await fetch(`${API_BASE_URL}/complaints/${complaintId}`, { headers });
      }
      let data = await res.json();

      // If single item route failed or returned non-success, fallback to finding item in list
      if (!data || !data.success || !data.data) {
        const listRes = await fetch(`${API_BASE_URL}/complaints/admin`, { headers });
        const listData = await listRes.json();
        if (listData.success && Array.isArray(listData.data)) {
          const found = listData.data.find((item: any) => item.id === complaintId || item.bookingId === complaintId);
          if (found) {
            data = { success: true, data: found };
          }
        }
      }

      if (data && data.success && data.data) {
        setComplaint(data.data);
      } else {
        setComplaint(null);
      }
    } catch (err) {
      console.error("Error fetching complaint detail", err);
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("bms_access_token") : null;
        const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
        const listRes = await fetch(`${API_BASE_URL}/complaints/admin`, { headers });
        const listData = await listRes.json();
        if (listData.success && Array.isArray(listData.data)) {
          const found = listData.data.find((item: any) => item.id === complaintId || item.bookingId === complaintId);
          if (found) {
            setComplaint(found);
            return;
          }
        }
      } catch (_) {}
      setComplaint(null);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    setUpdating(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("bms_access_token") : null;
      const res = await fetch(`${API_BASE_URL}/complaints/admin/${complaintId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setComplaint(data.data);
      }
    } catch (err) {
      console.error("Failed to update status", err);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-extrabold rounded-full flex items-center gap-1.5"><Clock size={14}/> Pending</span>;
      case 'REVIEWED':
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-extrabold rounded-full flex items-center gap-1.5"><AlertCircle size={14}/> Reviewed</span>;
      case 'RESOLVED':
        return <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-extrabold rounded-full flex items-center gap-1.5"><CheckCircle2 size={14}/> Resolved</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-4">
        <RefreshCw className="h-8 w-8 animate-spin text-emerald-600 mb-2" />
        <p className="text-sm font-medium text-gray-500">Loading complaint details...</p>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-4">
        <ShieldAlert className="h-12 w-12 text-amber-500 mb-3" />
        <h2 className="text-xl font-bold text-gray-900">Complaint Not Found</h2>
        <p className="text-sm text-gray-500 mb-4">The complaint with ID #{complaintId.slice(0, 8)} could not be located.</p>
        <Link href="/admin/complaints">
          <Button variant="default">Return to Complaints List</Button>
        </Link>
      </div>
    );
  }

  const booking = complaint.booking;
  const event = booking?.event;

  const clientInfo = complaint.client || (booking as any)?.client;
  const hostUser = complaint.host?.user || (event as any)?.host?.user;
  const hostDisplayName = complaint.hostName || (hostUser ? `${hostUser.firstName} ${hostUser.lastName}` : "Platform Host");

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto w-full space-y-6">

      {/* Top Header & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link href="/admin/complaints" className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-gray-900 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Complaints Management
        </Link>

        {/* Status Actions */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-medium mr-1">Status:</span>
          <button
            onClick={() => updateStatus("PENDING")}
            disabled={updating}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              complaint.status === "PENDING"
                ? "bg-amber-500 text-white shadow-sm"
                : "bg-amber-100 text-amber-800 hover:bg-amber-200"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => updateStatus("REVIEWED")}
            disabled={updating}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              complaint.status === "REVIEWED"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-blue-100 text-blue-800 hover:bg-blue-200"
            }`}
          >
            Reviewed
          </button>
          <button
            onClick={() => updateStatus("RESOLVED")}
            disabled={updating}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              complaint.status === "RESOLVED"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
            }`}
          >
            Resolved
          </button>
        </div>
      </div>

      {/* Main Complaint Overview Header Card */}
      <Card className="p-6 rounded-2xl border-gray-200 shadow-sm bg-white space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              {complaint.category || "General Support Ticket"}
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight mt-1">
              {complaint.subject}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge(complaint.status)}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-gray-500">
          <div>
            <span className="font-semibold block text-gray-400">Created On</span>
            <span className="font-bold text-gray-800">{new Date(complaint.createdAt).toLocaleString()}</span>
          </div>
          <div>
            <span className="font-semibold block text-gray-400">Last Updated</span>
            <span className="font-bold text-gray-800">{new Date(complaint.updatedAt).toLocaleString()}</span>
          </div>
          <div>
            <span className="font-semibold block text-gray-400">Complaint ID</span>
            <span className="font-mono font-bold text-gray-800">#{complaint.id}</span>
          </div>
        </div>
      </Card>

      {/* Grid Layout: Description & User Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Full Complaint Description & Linked Booking (2 cols) */}
        <div className="lg:col-span-2 space-y-6">

          {/* Full Complaint Statement */}
          <Card className="p-6 rounded-2xl border-gray-200 shadow-sm bg-white space-y-3">
            <h3 className="font-bold text-base text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <FileText className="h-5 w-5 text-emerald-600" /> Complete Complaint Statement
            </h3>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-900 leading-relaxed whitespace-pre-wrap font-sans">
              {complaint.description}
            </div>
          </Card>

          {/* Linked Booking Card */}
          {booking && (
            <Card className="p-6 rounded-2xl border-gray-200 shadow-sm bg-white space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                  <Ticket className="h-5 w-5 text-blue-600" /> Linked Booking Details
                </h3>
                <span className="px-3 py-1 bg-blue-50 text-blue-700 font-mono text-xs font-bold rounded-lg border border-blue-200">
                  Ref: #{booking.bookingRef}
                </span>
              </div>

              {event && (
                <div className="flex flex-col sm:flex-row gap-4 pt-1">
                  <img
                    src={event.posterUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=300"}
                    alt={event.title}
                    className="w-full sm:w-36 h-28 object-cover rounded-xl border border-gray-200 shadow-xs"
                  />
                  <div className="flex-1 space-y-2">
                    <h4 className="font-bold text-base text-gray-900 leading-tight">
                      {event.title}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-500">
                      <span className="flex items-center"><Calendar className="h-3.5 w-3.5 mr-1.5 text-primary" /> {new Date(event.startTime).toLocaleString()}</span>
                      <span className="flex items-center">
                        {event.mode === "ONLINE" ? <Wifi className="h-3.5 w-3.5 mr-1.5 text-emerald-600" /> : <MapPin className="h-3.5 w-3.5 mr-1.5 text-rose-500" />}
                        {event.mode === "ONLINE" ? "Online Stream" : (event.venueDetails as any)?.address || "Venue"}
                      </span>
                      <span>Reserved Seats: <strong className="text-gray-900">{booking.seatCount}</strong></span>
                      <span>Total Amount: <strong className="text-emerald-700">₹{booking.totalAmount}</strong></span>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          )}

        </div>

        {/* Right Column: Client & Host Context Cards */}
        <div className="space-y-6">

          {/* Client Profile Card */}
          <Card className="p-6 rounded-2xl border-gray-200 shadow-sm bg-white space-y-3">
            <h3 className="font-bold text-base text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" /> Client Profile
            </h3>
            {clientInfo ? (
              <div className="space-y-2 text-xs text-gray-600">
                <div>
                  <span className="text-gray-400 block font-semibold">Full Name</span>
                  <span className="font-bold text-sm text-gray-900">{clientInfo.firstName} {clientInfo.lastName}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-semibold">Email Address</span>
                  <span className="font-medium text-gray-800 flex items-center gap-1.5 pt-0.5"><Mail className="h-3.5 w-3.5 text-gray-400" /> {clientInfo.email}</span>
                </div>
                {clientInfo.phone && (
                  <div>
                    <span className="text-gray-400 block font-semibold">Phone Number</span>
                    <span className="font-medium text-gray-800 flex items-center gap-1.5 pt-0.5"><Phone className="h-3.5 w-3.5 text-gray-400" /> {clientInfo.phone}</span>
                  </div>
                )}
                <div>
                  <span className="text-gray-400 block font-semibold">Client User ID</span>
                  <span className="font-mono text-gray-700 truncate block">#{clientInfo.id}</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-gray-400 italic">No client profile linked.</div>
            )}
          </Card>

          {/* Host Profile Card */}
          <Card className="p-6 rounded-2xl border-gray-200 shadow-sm bg-white space-y-3">
            <h3 className="font-bold text-base text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <User className="h-5 w-5 text-purple-600" /> Host Profile
            </h3>
            <div className="space-y-2 text-xs text-gray-600">
              <div>
                <span className="text-gray-400 block font-semibold">Host / Instructor Name</span>
                <span className="font-bold text-sm text-gray-900">
                  {hostDisplayName}
                </span>
              </div>
              {hostUser?.email ? (
                <div>
                  <span className="text-gray-400 block font-semibold">Email Address</span>
                  <span className="font-medium text-gray-800 flex items-center gap-1.5 pt-0.5"><Mail className="h-3.5 w-3.5 text-gray-400" /> {hostUser.email}</span>
                </div>
              ) : (
                <div>
                  <span className="text-gray-400 block font-semibold">Email Address</span>
                  <span className="text-gray-500 italic">Provided on workshop page</span>
                </div>
              )}
              {hostUser?.phone && (
                <div>
                  <span className="text-gray-400 block font-semibold">Phone Number</span>
                  <span className="font-medium text-gray-800 flex items-center gap-1.5 pt-0.5"><Phone className="h-3.5 w-3.5 text-gray-400" /> {hostUser.phone}</span>
                </div>
              )}
              <div>
                <span className="text-gray-400 block font-semibold">Host Profile ID</span>
                <span className="font-mono text-gray-700 truncate block">#{complaint.host?.id || (event as any)?.host?.id || "System Host"}</span>
              </div>
            </div>
          </Card>

        </div>

      </div>

    </div>
  );
}
