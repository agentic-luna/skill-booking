"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Lock, Mail, Eye, EyeOff, Check, User, Users, Shield } from "lucide-react";

import { useAuthStore, type UserRole } from "@/features/auth/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["client", "host", "admin"]),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>("client");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "client",
    },
  });

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setValue("role", role);
    clearError();
  };

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const user = await login(data.email, data.role);
      if (user.role === "client") {
        router.push("/home");
      } else if (user.role === "host") {
        router.push("/host/dashboard");
      } else if (user.role === "admin") {
        router.push("/admin/dashboard");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Welcome back
        </h2>
        <p className="text-sm text-muted-foreground">
          Choose your role and enter your details to sign in
        </p>
      </div>

      {/* Role Picker Buttons */}
      <div className="grid grid-cols-3 gap-2">
        {(["client", "host", "admin"] as UserRole[]).map((role) => (
          <button
            key={role}
            type="button"
            onClick={() => handleRoleSelect(role)}
            className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl border text-center transition-all relative ${
              selectedRole === role
                ? "border-primary bg-primary/5 text-primary"
                : "border-border hover:bg-muted/50 text-muted-foreground"
            }`}
          >
            {role === "client" && <User className="h-4 w-4 mb-1" />}
            {role === "host" && <Users className="h-4 w-4 mb-1" />}
            {role === "admin" && <Shield className="h-4 w-4 mb-1" />}
            <span className="text-xs font-semibold capitalize">{role}</span>
            {selectedRole === role && (
              <span className="absolute top-1.5 right-1.5 bg-primary text-white rounded-full p-0.5">
                <Check className="h-2 w-2" />
              </span>
            )}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="p-3 text-xs font-medium text-destructive bg-destructive/10 rounded-lg border border-destructive/20 animate-pulse">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="email">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              className="pl-10"
              {...register("email")}
              disabled={isLoading}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-xs text-primary hover:underline font-medium"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              placeholder="••••••••"
              type={showPassword ? "text" : "password"}
              className="pl-10 pr-10"
              {...register("password")}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Signing in..." : `Sign In as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`}
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-primary hover:underline">
          Register now
        </Link>
      </div>
    </div>
  );
}
