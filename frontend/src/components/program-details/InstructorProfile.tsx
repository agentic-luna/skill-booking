import React from "react";
import { Instagram, Linkedin, Facebook } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface InstructorProfileProps {
  instructorName: string;
  instructorAvatar: string;
  instructorBio: string|undefined;
  companyName: string|undefined;
  instagram?: string;
  linkedin?: string;
  facebook?: string;
}

export default function InstructorProfile({
  instructorName,
  instructorAvatar,
  instructorBio,
  companyName,
  instagram,
  linkedin,
  facebook,
}: InstructorProfileProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-foreground">Meet Your Instructor</h2>
      <Card className="rounded-xl border-border/40 overflow-hidden bg-card/50">
        <CardContent className="p-6 flex items-start space-x-4">
          <img
            src={instructorAvatar}
            alt={instructorName}
            className="h-14 w-14 rounded-full object-cover ring-2 ring-primary/20 shrink-0"
          />
          <div className="space-y-2">
            <div>
              <h3 className="font-bold text-sm text-foreground">{instructorName}</h3>
              {companyName && (
                <span className="text-[10px] text-muted-foreground">{companyName}</span>
              )}
            </div>
            {instructorBio && (
              <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                {instructorBio}
              </p>
            )}
            {(instagram || linkedin || facebook) && (
              <div className="flex items-center gap-3.5 pt-2 mt-1 border-t border-border/30">
                {instagram && (
                  <a
                    href={instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-pink-500 transition-colors p-0.5"
                    title="Instagram"
                  >
                    <Instagram className="h-4 w-4" />
                  </a>
                )}
                {linkedin && (
                  <a
                    href={linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-blue-500 transition-colors p-0.5"
                    title="LinkedIn"
                  >
                    <Linkedin className="h-4 w-4" />
                  </a>
                )}
                {facebook && (
                  <a
                    href={facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-blue-600 transition-colors p-0.5"
                    title="Facebook"
                  >
                    <Facebook className="h-4 w-4" />
                  </a>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}