"use client";

import React, { useState, useEffect } from "react";
import { Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { POPULAR_COUNTRY_CODES, CountryOption, buildE164Phone } from "@/lib/validation/authValidation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PhoneInputWithCountryProps {
  id?: string;
  value: string; // Full E.164 string (+91948825254) or raw
  onChange: (fullE164Phone: string) => void;
  disabled?: boolean;
  placeholder?: string;
  label?: string;
  isWhatsApp?: boolean;
}

export default function PhoneInputWithCountry({
  id = "phone-input",
  value,
  onChange,
  disabled = false,
  placeholder = "98765 43210",
  label = "WhatsApp / Mobile Number",
  isWhatsApp = true,
}: PhoneInputWithCountryProps) {
  // Parse initial dialcode and local digits
  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(POPULAR_COUNTRY_CODES[0]); // Default India +91
  const [localDigits, setLocalDigits] = useState("");

  // Sync state if initial value has dialcode
  useEffect(() => {
    if (value) {
      const foundCountry = POPULAR_COUNTRY_CODES.find((c) => value.startsWith(c.dialCode));
      if (foundCountry) {
        setSelectedCountry(foundCountry);
        setLocalDigits(value.slice(foundCountry.dialCode.length).replace(/\D/g, ""));
      } else if (!localDigits && value.replace(/\D/g, "").length > 0) {
        setLocalDigits(value.replace(/\D/g, ""));
      }
    }
  }, []);

  const handleCountryChange = (codeStr: string) => {
    const country = POPULAR_COUNTRY_CODES.find((c) => c.code === codeStr) || POPULAR_COUNTRY_CODES[0];
    setSelectedCountry(country);
    const fullPhone = buildE164Phone(country.dialCode, localDigits);
    onChange(fullPhone);
  };

  const handleLocalDigitsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // PREVENT ALPHABETS & NON-DIGITS: Only allow numbers
    const cleanDigits = e.target.value.replace(/\D/g, "");
    setLocalDigits(cleanDigits);
    const fullPhone = buildE164Phone(selectedCountry.dialCode, cleanDigits);
    onChange(fullPhone);
  };

  return (
    <div className="space-y-1.5">
      {label && <label htmlFor={id} className="text-xs font-bold block">{label}</label>}
      <div className="flex gap-2">
        {/* Country Code Dropdown */}
        <Select
          value={selectedCountry.code}
          onValueChange={handleCountryChange}
          disabled={disabled}
        >
          <SelectTrigger className="w-[110px] h-10 text-xs rounded-xl bg-muted/30 border-border/60 shrink-0 font-bold">
            <SelectValue>
              <span className="flex items-center gap-1">
                <span>{selectedCountry.flag}</span>
                <span>{selectedCountry.dialCode}</span>
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-60 rounded-xl">
            {POPULAR_COUNTRY_CODES.map((country) => (
              <SelectItem key={country.code} value={country.code} className="text-xs py-2">
                <span className="flex items-center gap-2">
                  <span>{country.flag}</span>
                  <span className="font-semibold">{country.name}</span>
                  <span className="text-muted-foreground font-mono">({country.dialCode})</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Local Number Input (Only Numbers Allowed) */}
        <div className="relative flex-1">
          <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id={id}
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder={placeholder}
            className="pl-10 h-10 text-xs font-mono font-semibold rounded-xl"
            value={localDigits}
            onChange={handleLocalDigitsChange}
            disabled={disabled}
            required
          />
        </div>
      </div>
      {isWhatsApp && (
        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Enter your active WhatsApp number to receive your OTP code.
        </p>
      )}
    </div>
  );
}
