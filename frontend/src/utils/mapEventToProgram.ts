import { Program } from "@/constants/mockData";

export function mapEventToProgram(event: any): Program {
  const hostUser = event.host?.user;
  const isObj = typeof event.venueDetails === "object" && event.venueDetails !== null;
  
  const instructorName = (isObj && event.venueDetails.instructorName)
    ? event.venueDetails.instructorName
    : event.trainerName || (hostUser ? `${hostUser.firstName} ${hostUser.lastName}` : "Instructor");
    
  const instructorAvatar = (isObj && event.venueDetails.instructorPhoto)
    ? event.venueDetails.instructorPhoto
    : hostUser?.avatarUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face";
    
  const instructorBio = (isObj && event.venueDetails.instructorBio)
    ? event.venueDetails.instructorBio
    : "Sarah is a seasoned educational director with over 10 years of experience launching immersive programs. She focuses on hands-on practical teaching setups.";

  const instagram = (isObj && event.venueDetails.instagram) ? event.venueDetails.instagram : "";
  const linkedin = (isObj && event.venueDetails.linkedin) ? event.venueDetails.linkedin : "";
  const facebook = (isObj && event.venueDetails.facebook) ? event.venueDetails.facebook : "";
  const companyName = (isObj && event.venueDetails.companyName) ? event.venueDetails.companyName : "Training Masterclass Ltd.";

  const locationStr = event.mode === "ONLINE"
    ? "Online"
    : typeof event.venueDetails === "string"
      ? event.venueDetails
      : event.venueDetails?.address || "In Person";
      
  const imageUrlStr = event.posterUrl || event.images?.[0] || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600";

  return {
    id: event.id,
    hostId: event.hostId,
    title: event.title,
    description: event.description || "",
    instructorName,
    instructorAvatar,
    instructorBio,
    instagram,
    linkedin,
    facebook,
    companyName,
    category: event.category || "life-coaching",
    videoUrls: event.videoUrls || [],
    rating: typeof event.rating === "number" ? event.rating : 0,
    reviewsCount: typeof event.reviewsCount === "number" ? event.reviewsCount : 0,
    price: event.price || 0,
    duration: event.duration || "2 hours",
    date: (() => {
      if (!event.startTime) return "2026-07-12";
      const startStr = event.startTime.split("T")[0];
      const endDateVal = (event.venueDetails as any)?.endDate;
      if (endDateVal && endDateVal !== startStr) {
        return `${startStr} to ${endDateVal}`;
      }
      return startStr;
    })(),
    time: event.startTime 
      ? new Date(event.startTime).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: '2-digit', minute: '2-digit' }) + " IST"
      : "10:00 AM IST",
    spotsLeft: event.availableSeats ?? 0,
    maxSpots: event.totalSeats ?? 20,
    location: locationStr,
    imageUrl: imageUrlStr,
    status: event.status ? event.status.toLowerCase() : "approved",
    featured: true,
    mode: event.mode,
    commission: event.commission,
    startTime: event.startTime,
  };
}