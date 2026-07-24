"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  User, Settings, ShieldCheck, Mail, ShieldAlert, KeyRound,
  BellRing, Award, CheckCircle, ArrowLeft, Upload, Loader2
} from "lucide-react";

import { useAuthStore } from "@/features/auth/store/authStore";
import * as clientApi from "@/features/client/api/client.api";
import { useAlertStore } from "@/features/alerts/store/alertStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

// Zod schemas for forms
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, "Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirmation must match new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "New passwords do not match",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const showAlert = useAlertStore((s) => s.showAlert);
  const { user, isAuthenticated, updateProfile } = useAuthStore();
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Notification States
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);

  // Host Application States
  const [hostApplied, setHostApplied] = useState(false);
  const [submittingHost, setSubmittingHost] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="animate-pulse flex flex-col items-center space-y-4">
          <div className="w-12 h-12 bg-primary/20 rounded-full" />
          <div className="h-4 w-32 bg-muted rounded-md" />
        </div>
      </div>
    );
  }

  const onProfileSave = async (data: ProfileFormValues) => {
    setProfileSaving(true);
    try {
      const [firstName, ...lastNameParts] = data.name.trim().split(" ");
      const lastName = lastNameParts.join(" ");
      await clientApi.updateProfile({ firstName, lastName: lastName || "", email: data.email });
      updateProfile({ name: data.name, email: data.email });
      showAlert("Profile Updated", "Profile details successfully updated!", "success");
    } catch (err: any) {
      showAlert("Update Failed", err.message || "Could not update profile info.", "destructive");
    } finally {
      setProfileSaving(false);
    }
  };

  const onPasswordSave = async (data: PasswordFormValues) => {
    setPasswordSaving(true);
    try {
      await clientApi.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      resetPassword();
      showAlert("Password Changed", "Your password has been successfully updated!", "success");
    } catch (err: any) {
      showAlert("Error", err.message || "Failed to update password.", 'destructive');
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleApplyHost = async (e: React.FormEvent) => {
    e.preventDefault();
    const expertise = (document.getElementById("expertise") as HTMLInputElement)?.value || "";
    const bio = (document.getElementById("bio") as HTMLTextAreaElement)?.value || "";

    setSubmittingHost(true);
    try {
      await clientApi.applyHost({ expertise, bio });
      setHostApplied(true);
      showAlert("Application Submitted", "Your host credentials have been submitted for verification.", "success");
    } catch (err: any) {
      showAlert("Submission Failed", err.message || "Could not apply to become host.", "destructive");
    } finally {
      setSubmittingHost(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 bg-muted/10 dark:bg-card/5 py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">

          <div className="space-y-1">
            <Link
              href={user?.role === "host" ? "/host/dashboard" : "/"}
              className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground gap-1 pb-1 font-semibold"
            >
              <ArrowLeft className="h-3 w-3" /> {user?.role === "host" ? "Back to dashboard" : "Back to feed"}
            </Link>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
              <Settings className="h-6 w-6 text-primary" /> Profile & Settings
            </h1>
            <p className="text-sm text-muted-foreground">Manage your credentials, preferences, and workspace status.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

            {/* Left: Avatar Summary Card */}
            <Card className="col-span-1 border-border/40 rounded-2xl h-fit overflow-hidden bg-card">
              <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                <div className="relative group">
                  <div className="h-24 w-24 rounded-full bg-[#0b0c01] text-[#a0f212] flex items-center justify-center text-3xl font-extrabold ring-4 ring-primary/20 shadow-inner tracking-widest">
                    {user.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()}
                  </div>
                  <button className="absolute inset-0 bg-black/50 text-white text-[10px] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Upload className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-base text-foreground leading-tight">{user.name}</h3>
                  <p className="text-[10px] text-muted-foreground">{user.email}</p>
                </div>

                <div className="bg-primary/10 text-green-800 dark:text-green-600 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                  {user.role} Account
                </div>
              </CardContent>
            </Card>

            {/* Right: Detailed Settings Tabs */}
            <div className="md:col-span-3">
              <Tabs defaultValue="details" className="w-full">

                <TabsList className={`grid w-full max-w-sm mb-4 ${user?.role === "admin" ? "grid-cols-2" : "grid-cols-3"}`}>
                  <TabsTrigger value="details">My Profile</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                  {user?.role !== "admin" && <TabsTrigger value="host">Apply Host</TabsTrigger>}
                </TabsList>

                {/* TAB 1: PROFILE DETAILS */}
                <TabsContent value="details">
                  <Card className="border-border/40 rounded-2xl bg-card">
                    <form onSubmit={handleProfileSubmit(onProfileSave)}>
                      <CardHeader>
                        <CardTitle>Profile Details</CardTitle>
                        <CardDescription>Update your personal information and contact details.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            placeholder="John Doe"
                            {...registerProfile("name")}
                            disabled={profileSaving}
                          />
                          {profileErrors.name && (
                            <p className="text-xs text-destructive">{profileErrors.name.message}</p>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            placeholder="name@example.com"
                            type="email"
                            {...registerProfile("email")}
                            disabled={profileSaving}
                          />
                          {profileErrors.email && (
                            <p className="text-xs text-destructive">{profileErrors.email.message}</p>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="justify-end border-t border-border/10 pt-4">
                        <Button type="submit" disabled={profileSaving} className="rounded-lg h-9 text-xs">
                          {profileSaving ? (
                            <>
                              <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> Saving...
                            </>
                          ) : (
                            "Save Changes"
                          )}
                        </Button>
                      </CardFooter>
                    </form>
                  </Card>
                </TabsContent>

                {/* TAB 2: SECURITY & ALERTS */}
                <TabsContent value="security" className="space-y-6">
                  {/* Change Password Card */}
                  <Card className="border-border/40 rounded-2xl bg-card">
                    <form onSubmit={handlePasswordSubmit(onPasswordSave)}>
                      <CardHeader>
                        <CardTitle>Change Password</CardTitle>
                        <CardDescription>Update your password to keep your account secure.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="currentPassword">Current Password</Label>
                          <Input
                            id="currentPassword"
                            type="password"
                            {...registerPassword("currentPassword")}
                            disabled={passwordSaving}
                          />
                          {passwordErrors.currentPassword && (
                            <p className="text-xs text-destructive">{passwordErrors.currentPassword.message}</p>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="newPassword">New Password</Label>
                          <Input
                            id="newPassword"
                            type="password"
                            {...registerPassword("newPassword")}
                            disabled={passwordSaving}
                          />
                          {passwordErrors.newPassword && (
                            <p className="text-xs text-destructive">{passwordErrors.newPassword.message}</p>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="confirmPassword">Confirm New Password</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            {...registerPassword("confirmPassword")}
                            disabled={passwordSaving}
                          />
                          {passwordErrors.confirmPassword && (
                            <p className="text-xs text-destructive">{passwordErrors.confirmPassword.message}</p>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="justify-end border-t border-border/10 pt-4">
                        <Button type="submit" disabled={passwordSaving} className="rounded-lg h-9 text-xs">
                          {passwordSaving ? "Updating..." : "Update Password"}
                        </Button>
                      </CardFooter>
                    </form>
                  </Card>

                  {/* Notifications Card */}
                  <Card className="border-border/40 rounded-2xl bg-card">
                    <CardHeader>
                      <CardTitle>Notification Preferences</CardTitle>
                      <CardDescription>Configure how you receive updates and alerts.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="text-sm font-semibold">Email Notifications</span>
                          <p className="text-xs text-muted-foreground">Receive weekly digests and updates on saved courses.</p>
                        </div>
                        <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="text-sm font-semibold">SMS Reminders</span>
                          <p className="text-xs text-muted-foreground">Receive immediate text alerts for booked classes.</p>
                        </div>
                        <Switch checked={smsAlerts} onCheckedChange={setSmsAlerts} />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* TAB 3: APPLY FOR HOST VERIFICATION */}
                {user?.role !== "admin" && (
                  <TabsContent value="host">
                    <Card className="border-border/40 rounded-2xl bg-card">
                      {hostApplied ? (
                        <div className="p-8 text-center space-y-4">
                          <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mx-auto">
                            <CheckCircle className="h-6 w-6" />
                          </div>
                          <div className="space-y-1.5">
                            <h3 className="font-bold text-base text-foreground">Application Submitted</h3>
                            <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                              Your application to become a certified host is currently pending verification. Super Admins are reviewing your credentials. We will notify you via email shortly.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <form onSubmit={handleApplyHost}>
                          <CardHeader>
                            <CardTitle>Become a Certified Host</CardTitle>
                            <CardDescription>
                              Apply to host professional workshops and earn revenue teaching your skill.
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {user.role === "host" ? (
                              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-2.5 text-xs text-primary">
                                <ShieldCheck className="h-5 w-5" />
                                <span>You are already verified as an Instructor (Host). Head to the Host Dashboard to list new classes!</span>
                              </div>
                            ) : (
                              <>
                                <div className="space-y-1.5">
                                  <Label htmlFor="expertise">Primary Field of Expertise</Label>
                                  <Input id="expertise" placeholder="e.g., Advanced JavaScript, Culinary Baking" required />
                                </div>

                                <div className="space-y-1.5">
                                  <Label htmlFor="bio">Professional Bio & Credentials</Label>
                                  <textarea
                                    id="bio"
                                    rows={4}
                                    placeholder="Describe your qualifications, teaching experience, and certificates..."
                                    className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    required
                                  />
                                </div>

                                <div className="space-y-1.5">
                                  <Label>Upload Certificates / Proof (PDF/Image)</Label>
                                  <div className="border border-dashed border-border/80 rounded-xl p-6 text-center hover:bg-muted/30 cursor-pointer transition-colors space-y-1.5">
                                    <Upload className="h-6 w-6 text-muted-foreground mx-auto" />
                                    <div className="text-xs font-semibold">Click to select files</div>
                                    <p className="text-[10px] text-muted-foreground">PDF, JPEG, or PNG up to 5MB</p>
                                  </div>
                                </div>
                              </>
                            )}
                          </CardContent>
                          {user.role !== "host" && (
                            <CardFooter className="justify-end border-t border-border/10 pt-4">
                              <Button type="submit" className="rounded-lg h-9 text-xs" disabled={submittingHost}>
                                {submittingHost ? "Submitting..." : "Submit Host Application"}
                              </Button>
                            </CardFooter>
                          )}
                        </form>
                      )}
                    </Card>
                  </TabsContent>
                )}

              </Tabs>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
