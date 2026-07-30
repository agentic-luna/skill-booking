"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Lock, Mail, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuthStore, type UserRole } from "@/features/auth/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const loginSchema = z.object({
  identifier: z.string().min(3, "Enter your email or phone number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type LoginFormValues = z.infer<typeof loginSchema>;

const REDIRECT: Record<UserRole, string> = {
  client: "/",
  host: "/host/dashboard",
  admin: "/admin/dashboard",
};

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "" },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const cleanIdentifier = data.identifier.includes("@")
        ? data.identifier.trim().toLowerCase()
        : data.identifier.trim();
      const user = await login(cleanIdentifier, data.password);
      router.push(REDIRECT[user.role] ?? "/");
    } catch { /* error set in store */ }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Welcome back</h2>
        <p className="text-sm text-muted-foreground">Enter your details to sign in</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && <div className="p-3 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-500/10 rounded-xl border border-red-500/30 animate-pulse">{error}</div>}

        <div className="space-y-1.5">
          <Label htmlFor="identifier">Email or Phone Number</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input id="identifier" placeholder="name@example.com or +1 555 0201" type="text" className="pl-10" {...register("identifier")} disabled={isLoading} />
          </div>
          {errors.identifier && <p className="text-xs text-destructive">{errors.identifier.message}</p>}
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="text-xs text-primary hover:underline font-medium">Forgot password?</Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input id="password" placeholder="••••••••" type={showPassword ? "text" : "password"} className="pl-10 pr-10" {...register("password")} disabled={isLoading} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground" tabIndex={-1}>
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <div className="space-y-3 pt-2 border-t border-border/40">
        <div className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-primary hover:underline">Register here</Link>
        </div>
        <div className="text-center text-xs text-muted-foreground">
          Are you an administrator?{" "}
          <Link href="/admin/login" className="font-medium text-primary hover:underline">Admin Portal</Link>
        </div>
      </div>
    </div>
  );
}
