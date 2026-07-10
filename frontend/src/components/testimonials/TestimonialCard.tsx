import React from "react";
import { Star } from "lucide-react";
import { TestimonialItem } from "./testimonialsData";

export const TestimonialCard = ({ testimonial }: { testimonial: TestimonialItem }) => {
  return (
    <div className="bg-bone-white p-6 rounded-2xl border border-clay-shadow flex flex-col justify-between shadow-sm h-full transition-all duration-300 hover:-translate-y-2 hover:shadow-md cursor-pointer">
      <p className="text-stone-grey text-xs leading-relaxed italic mb-6">
        &ldquo;{testimonial.text}&rdquo;
      </p>
      <div className="flex items-center space-x-3">
        <img src={testimonial.avatar} alt={testimonial.name} className="h-10 w-10 rounded-full object-cover" />
        <div>
          <h4 className="font-bold text-sm text-foreground">{testimonial.name}</h4>
          <span className="text-[10px] text-muted-foreground">{testimonial.role}</span>
        </div>
        <div className="flex items-center ml-auto">
          {Array.from({ length: testimonial.rating }).map((_, i) => (
            <Star key={i} className="h-3.5 w-3.5 fill-iron-grey text-iron-grey" />
          ))}
        </div>
      </div>
    </div>
  );
};
