"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, AlertCircle, HelpCircle, Loader2 } from "lucide-react";
import Footer from "@/components/common/Footer";

const issueSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  category: z.string().min(1, "Please select an issue category"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  description: z.string().min(20, "Please provide more details (at least 20 characters)"),
});

type IssueFormValues = z.infer<typeof issueSchema>;

export default function ReportIssuePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IssueFormValues>({
    resolver: zodResolver(issueSchema),
  });

  const onSubmit = async (data: IssueFormValues) => {
    setIsSubmitting(true);
    // Simulate API call to submit the issue
    setTimeout(() => {
      console.log("Issue reported:", data);
      setIsSubmitting(false);
      setIsSuccess(true);
      reset();
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#fcfcfc] dark:bg-background pt-20">
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Header Section */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-[#a0f212]/10 rounded-2xl mb-4 shadow-sm border border-[#a0f212]/20">
            <HelpCircle className="w-8 h-8 text-[#8ac90c]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
            Report an Issue
          </h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto font-medium">
            Encountered a problem or have a question? Let us know, and our support team will get back to you as soon as possible.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-card rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border/50 overflow-hidden">
          
          {isSuccess ? (
            <div className="p-12 text-center flex flex-col items-center justify-center animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-[#a0f212]/10 rounded-full flex items-center justify-center mb-6 shadow-inner border border-[#a0f212]/20">
                <CheckCircle2 className="w-10 h-10 text-[#a0f212]" />
              </div>
              <h2 className="text-2xl font-extrabold text-foreground mb-2">Issue Reported Successfully</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto font-medium">
                Thank you for bringing this to our attention. Our team has received your report and will follow up with you shortly via email.
              </p>
              <button
                onClick={() => setIsSuccess(false)}
                className="px-6 py-3 bg-muted text-foreground font-bold rounded-xl hover:bg-muted/80 transition-colors"
              >
                Report Another Issue
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="p-8 sm:p-10 space-y-8">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Name */}
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-bold text-foreground">Your Name</label>
                  <input
                    id="name"
                    {...register("name")}
                    placeholder="John Doe"
                    className={`w-full h-12 px-4 rounded-xl border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#a0f212]/40 transition-colors ${
                      errors.name ? "border-red-500 focus:ring-red-500/20" : "border-border"
                    }`}
                  />
                  {errors.name && (
                    <p className="flex items-center text-xs font-medium text-red-500 mt-1">
                      <AlertCircle className="w-3 h-3 mr-1" /> {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-bold text-foreground">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="john@example.com"
                    className={`w-full h-12 px-4 rounded-xl border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#a0f212]/40 transition-colors ${
                      errors.email ? "border-red-500 focus:ring-red-500/20" : "border-border"
                    }`}
                  />
                  {errors.email && (
                    <p className="flex items-center text-xs font-medium text-red-500 mt-1">
                      <AlertCircle className="w-3 h-3 mr-1" /> {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-bold text-foreground">Issue Category</label>
                <select
                  id="category"
                  {...register("category")}
                  className={`w-full h-12 px-4 rounded-xl border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#a0f212]/40 transition-colors appearance-none ${
                    errors.category ? "border-red-500 focus:ring-red-500/20" : "border-border"
                  }`}
                >
                  <option value="">Select a category</option>
                  <option value="payment">Payment & Refunds</option>
                  <option value="booking">Booking & Classes</option>
                  <option value="account">Account & Profile</option>
                  <option value="technical">Technical Issue</option>
                  <option value="other">Other</option>
                </select>
                {errors.category && (
                  <p className="flex items-center text-xs font-medium text-red-500 mt-1">
                    <AlertCircle className="w-3 h-3 mr-1" /> {errors.category.message}
                  </p>
                )}
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-bold text-foreground">Subject</label>
                <input
                  id="subject"
                  {...register("subject")}
                  placeholder="Briefly describe the issue"
                  className={`w-full h-12 px-4 rounded-xl border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#a0f212]/40 transition-colors ${
                    errors.subject ? "border-red-500 focus:ring-red-500/20" : "border-border"
                  }`}
                />
                {errors.subject && (
                  <p className="flex items-center text-xs font-medium text-red-500 mt-1">
                    <AlertCircle className="w-3 h-3 mr-1" /> {errors.subject.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-bold text-foreground">Detailed Description</label>
                <textarea
                  id="description"
                  rows={5}
                  {...register("description")}
                  placeholder="Please provide as much detail as possible so we can assist you better..."
                  className={`w-full p-4 rounded-xl border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#a0f212]/40 transition-colors resize-none ${
                    errors.description ? "border-red-500 focus:ring-red-500/20" : "border-border"
                  }`}
                />
                {errors.description && (
                  <p className="flex items-center text-xs font-medium text-red-500 mt-1">
                    <AlertCircle className="w-3 h-3 mr-1" /> {errors.description.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 bg-gradient-to-r from-[#a0f212] to-[#8ee00d] hover:from-[#8ee00d] hover:to-[#a0f212] text-[#0b0c01] font-extrabold text-lg rounded-xl shadow-[0_4px_20px_rgba(160,242,18,0.2)] hover:shadow-[0_6px_25px_rgba(160,242,18,0.3)] transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <Loader2 className="w-6 h-6 animate-spin text-[#0b0c01]" />
                ) : (
                  "Submit Report"
                )}
              </button>

            </form>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
