"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Calendar, Star, Plus, Eye, Edit3, Trash2, X, 
  MapPin, Clock, Ticket, Check, Loader2 
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle 
} from "@/components/ui/dialog";
import { MOCK_PROGRAMS, Program } from "@/constants/mockData";

// Zod schema for program creations
const programSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  category: z.enum(["technology", "design", "fitness", "culinary", "business", "photography"]),
  price: z.preprocess((val) => Number(val), z.number().min(0, "Price must be non-negative")),
  duration: z.string().min(2, "Duration is required (e.g. 4 hours)"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date format must be YYYY-MM-DD"),
  time: z.string().min(3, "Schedule times are required (e.g. 10:00 AM - 1:00 PM EST)"),
  maxSpots: z.preprocess((val) => Number(val), z.number().min(1, "Must allow at least 1 spot")),
  location: z.string().min(3, "Location or online webinar links are required"),
  description: z.string().min(20, "Provide a description of at least 20 characters"),
});

type ProgramFormValues = z.infer<typeof programSchema>;

export default function HostProgramsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [programsList, setProgramsList] = useState<Program[]>(MOCK_PROGRAMS);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ProgramFormValues>({
    resolver: zodResolver(programSchema),
    defaultValues: {
      title: "",
      category: "technology",
      price: 49,
      duration: "3 hours",
      date: new Date().toISOString().split("T")[0],
      time: "10:00 AM - 1:00 PM EST",
      maxSpots: 15,
      location: "Online Zoom link",
      description: "",
    },
  });

  // Open creation form if url query has `create=true`
  useEffect(() => {
    if (searchParams.get("create") === "true") {
      setFormOpen(true);
    }
  }, [searchParams]);

  const onSubmit = async (data: ProgramFormValues) => {
    setFormLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setFormLoading(false);

    if (editingProgram) {
      // EDIT PROGRAM MODE
      setProgramsList((prev) =>
        prev.map((prog) =>
          prog.id === editingProgram.id
            ? {
                ...prog,
                ...data,
                spotsLeft: Math.min(data.maxSpots, prog.spotsLeft + (data.maxSpots - prog.maxSpots)),
              }
            : prog
        )
      );
      // Synchronize in the global mock array
      const idx = MOCK_PROGRAMS.findIndex(p => p.id === editingProgram.id);
      if (idx !== -1) {
        MOCK_PROGRAMS[idx] = { ...MOCK_PROGRAMS[idx], ...data };
      }
      alert("Workshop details successfully updated!");
    } else {
      // CREATE PROGRAM MODE
      const newProg: Program = {
        id: `prog_${Math.random().toString(36).substr(2, 9)}`,
        ...data,
        spotsLeft: data.maxSpots,
        instructorName: "Sarah Jenkins",
        instructorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100",
        imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=600",
        status: "pending", // Newly created programs require Super Admin verification!
        featured: false,
      };

      setProgramsList((prev) => [newProg, ...prev]);
      MOCK_PROGRAMS.unshift(newProg); // Push to master database
      alert("Workshop successfully submitted! Super Admin validation is required before explore listings display.");
    }

    setFormOpen(false);
    setEditingProgram(null);
    reset();
    router.replace("/host/programs"); // clear create parameter
  };

  const handleEditClick = (prog: Program) => {
    setEditingProgram(prog);
    reset({
      title: prog.title,
      category: prog.category,
      price: prog.price,
      duration: prog.duration,
      date: prog.date,
      time: prog.time,
      maxSpots: prog.maxSpots,
      location: prog.location,
      description: prog.description,
    });
    setFormOpen(true);
  };

  const handleCancelClick = () => {
    setFormOpen(false);
    setEditingProgram(null);
    reset();
    router.replace("/host/programs");
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex justify-between items-center pb-4 border-b">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Program Management</h1>
          <p className="text-sm text-muted-foreground">List, check validation status, and edit details of your skill classes.</p>
        </div>
        <Button className="rounded-xl h-10 text-xs font-semibold" onClick={() => setFormOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" /> Create Workshop
        </Button>
      </div>

      {/* Program grid list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {programsList.map((prog) => (
          <Card key={prog.id} className="overflow-hidden border-border/40 bg-card rounded-2xl flex flex-col group shadow-xs">
            <div className="aspect-video w-full relative bg-muted">
              <img src={prog.imageUrl} alt={prog.title} className="object-cover w-full h-full" />
              
              {/* Approval status banner */}
              <div className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase backdrop-blur-xs text-white ${
                prog.status === "approved" 
                  ? "bg-emerald-500/80" 
                  : prog.status === "pending"
                  ? "bg-amber-500/80"
                  : "bg-destructive/80"
              }`}>
                {prog.status}
              </div>
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-md font-semibold capitalize">
                {prog.category}
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <h3 className="font-bold text-sm text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                  {prog.title}
                </h3>
                
                <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[10px] text-muted-foreground">
                  <span className="flex items-center"><Clock className="h-3 w-3 mr-1" /> {prog.duration}</span>
                  <span className="flex items-center"><Ticket className="h-3 w-3 mr-1" /> {prog.spotsLeft}/{prog.maxSpots} spots</span>
                  <span className="flex items-center col-span-2"><MapPin className="h-3 w-3 mr-1 truncate" /> {prog.location.split(",")[0]}</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border/30 pt-4 mt-auto">
                <div className="text-base font-extrabold text-foreground">${prog.price}</div>
                <div className="flex space-x-1.5">
                  <Link href={`/programs/${prog.id}`}>
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" title="View details as client">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" onClick={() => handleEditClick(prog)}>
                    <Edit3 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* CREATE / EDIT PROGRAM DIALOG FORM */}
      <Dialog open={formOpen} onOpenChange={handleCancelClick}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProgram ? "Modify Workshop Details" : "Publish a New Workshop"}</DialogTitle>
            <DialogDescription>
              Complete the catalog metadata to update or register this skill program.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="title" className="text-xs">Class Title</Label>
                <Input id="title" placeholder="Next.js Mastery Bootcamp" className="h-9 text-xs" {...register("title")} />
                {errors.title && <p className="text-[10px] text-destructive">{errors.title.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="category" className="text-xs">Category Domain</Label>
                <Select 
                  defaultValue={editingProgram?.category || "technology"} 
                  onValueChange={(val: any) => setValue("category", val)}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select Domain" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology & Code</SelectItem>
                    <SelectItem value="culinary">Culinary Arts</SelectItem>
                    <SelectItem value="fitness">Fitness & Health</SelectItem>
                    <SelectItem value="design">UI/UX & Design</SelectItem>
                    <SelectItem value="photography">Photography</SelectItem>
                    <SelectItem value="business">Business Skills</SelectItem>
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-[10px] text-destructive">{errors.category.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="price" className="text-xs">Fee (USD)</Label>
                <Input id="price" type="number" className="h-9 text-xs" {...register("price")} />
                {errors.price && <p className="text-[10px] text-destructive">{errors.price.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="duration" className="text-xs">Duration</Label>
                <Input id="duration" placeholder="e.g., 6 hours (2 days)" className="h-9 text-xs" {...register("duration")} />
                {errors.duration && <p className="text-[10px] text-destructive">{errors.duration.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="maxSpots" className="text-xs">Max Slots Count</Label>
                <Input id="maxSpots" type="number" className="h-9 text-xs" {...register("maxSpots")} />
                {errors.maxSpots && <p className="text-[10px] text-destructive">{errors.maxSpots.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="date" className="text-xs">Calendar Date</Label>
                <Input id="date" type="text" placeholder="YYYY-MM-DD" className="h-9 text-xs" {...register("date")} />
                {errors.date && <p className="text-[10px] text-destructive">{errors.date.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="time" className="text-xs">Schedule Times</Label>
                <Input id="time" placeholder="e.g., 10:00 AM - 1:00 PM EST" className="h-9 text-xs" {...register("time")} />
                {errors.time && <p className="text-[10px] text-destructive">{errors.time.message}</p>}
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="location" className="text-xs">Webinar Links / Offline Address</Label>
                <Input id="location" placeholder="Online Webinar link / Studio location details" className="h-9 text-xs" {...register("location")} />
                {errors.location && <p className="text-[10px] text-destructive">{errors.location.message}</p>}
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="description" className="text-xs">Syllabus & Descriptions</Label>
                <textarea
                  id="description"
                  rows={4}
                  placeholder="Outline the course details, learning objectives, and prerequisite materials..."
                  className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  {...register("description")}
                />
                {errors.description && <p className="text-[10px] text-destructive">{errors.description.message}</p>}
              </div>

            </div>

            <DialogFooter className="pt-2">
              <Button variant="outline" type="button" className="text-xs h-9 rounded-lg" onClick={handleCancelClick}>
                Cancel
              </Button>
              <Button type="submit" className="text-xs h-9 rounded-lg px-6" disabled={formLoading}>
                {formLoading ? (
                  <>
                    <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> Submitting...
                  </>
                ) : (
                  editingProgram ? "Update Workshop" : "Publish Workshop"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
