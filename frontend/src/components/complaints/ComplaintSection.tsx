"use client";

import React, { useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";

export default function ComplaintSection() {
  const [formData, setFormData] = useState({
    hostName: "",
    subject: "",
    description: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");

    try {
      const response = await fetch(`${API_BASE_URL}/complaints`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setStatus("success");
        setFormData({ hostName: "", subject: "", description: "" });
      } else {
        setStatus("error");
        setErrorMsg(data.error || "Failed to submit complaint. Please try again.");
      }
    } catch (err) {
      setStatus("error");
      setErrorMsg("An unexpected error occurred. Please check your connection.");
    }
  };

  return (
    <div className="w-full bg-transparent py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="glass-card p-8 md:p-10 rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
              <AlertCircle size={20} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Report an Issue</h2>
          </div>
          <p className="text-gray-500 mb-8 ml-13">
            Have a complaint about a host or an event? Let our moderation team know.
          </p>

          {status === "success" ? (
            <div className="bg-green-50 border border-green-200 text-green-700 p-6 rounded-xl flex flex-col items-center justify-center text-center">
              <CheckCircle2 size={40} className="mb-4 text-green-500" />
              <h3 className="text-lg font-bold mb-1">Complaint Submitted</h3>
              <p className="text-sm">Thank you for letting us know. Our team will review this shortly.</p>
              <button 
                onClick={() => setStatus("idle")}
                className="mt-6 text-sm font-medium text-green-700 hover:text-green-800 underline"
              >
                Submit another report
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Host Name (Optional)</label>
                <input
                  type="text"
                  name="hostName"
                  value={formData.hostName}
                  onChange={handleChange}
                  placeholder="E.g. John Doe"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#a0f212] focus:border-[#a0f212] outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  placeholder="Brief summary of the issue"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#a0f212] focus:border-[#a0f212] outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Please provide details about your complaint..."
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#a0f212] focus:border-[#a0f212] outline-none transition-all resize-none"
                />
              </div>

              {status === "error" && (
                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={status === "submitting"}
                className="w-full bg-[#a0f212] hover:bg-[#8ee00d] text-black font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
              >
                {status === "submitting" ? "Submitting..." : "Submit Complaint"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
