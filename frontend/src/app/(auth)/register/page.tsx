"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, User, Lock, Check, Users, ShieldCheck } from "lucide-react";

import { useAuthStore } from "@/features/auth/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["client", "host"]),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: signup, isLoading, error } = useAuthStore();
  const [selectedRole, setSelectedRole] = useState<"client" | "host">("client");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "client",
    },
  });

  const handleRoleSelect = (role: "client" | "host") => {
    setSelectedRole(role);
    setValue("role", role);
  };

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      await signup(data.name, data.email, data.role);
      router.push("/verify");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Create an account
        </h2>
        <p className="text-sm text-muted-foreground">
          Enter your details below to set up your profile
        </p>
      </div>

      {/* Role Picker */}
      <div className="grid grid-cols-2 gap-3">
        {(["client", "host"] as const).map((role) => (
          <button
            key={role}
            type="button"
            onClick={() => handleRoleSelect(role)}
            className={`flex flex-col items-center justify-center py-3 px-3 rounded-xl border text-center transition-all relative ${
              selectedRole === role
                ? "border-primary bg-primary/5 text-primary"
                : "border-border hover:bg-muted/50 text-muted-foreground"
            }`}
          >
            {role === "client" && <User className="h-5 w-5 mb-1.5" />}
            {role === "host" && <Users className="h-5 w-5 mb-1.5" />}
            <span className="text-xs font-semibold capitalize">
              {role === "client" ? "Learner (Client)" : "Instructor (Host)"}
            </span>
            {selectedRole === role && (
              <span className="absolute top-2 right-2 bg-primary text-white rounded-full p-0.5">
                <Check className="h-2 w-2" />
              </span>
            )}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="p-3 text-xs font-medium text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="name">Full Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="name"
              placeholder="John Doe"
              type="text"
              className="pl-10"
              {...register("name")}
              disabled={isLoading}
            />
          </div>
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>

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
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              placeholder="••••••••"
              type="password"
              className="pl-10"
              {...register("password")}
              disabled={isLoading}
            />
          </div>
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Creating Account..." : "Create Account"}
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}
