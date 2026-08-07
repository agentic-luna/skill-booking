"use client";

import React from "react";
import { UseFormRegister, FieldErrors, Control, useFieldArray } from "react-hook-form";
import { IndianRupee, Ticket, Plus, Trash2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ProgramFormValues } from "./program-schema";

interface PricingSectionProps {
  register: UseFormRegister<ProgramFormValues>;
  errors: FieldErrors<ProgramFormValues>;
  control: Control<ProgramFormValues>;
}

export default function PricingSection({ register, errors, control }: PricingSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "ticketTypes",
  });

  return (
    <Card className="rounded-[24px] border-none shadow-sm hover:shadow-md transition-all duration-300 bg-white overflow-hidden">
      <CardHeader className="bg-transparent border-b border-gray-100/50 pb-5 pt-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-[17px] font-extrabold text-gray-900">Pricing & Capacity</CardTitle>
            <CardDescription className="text-[13px] text-gray-500 font-medium">Set the ticket types, fees, and max slots.</CardDescription>
          </div>
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={() => append({ name: "", price: 0, totalSeats: 1 })}
            className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 rounded-xl"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add Ticket
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-7 space-y-6">
        {fields.map((field, index) => (
          <div key={field.id} className="relative bg-emerald-50/10 rounded-xl p-5 border border-emerald-100/60 shadow-sm transition-all hover:shadow-md">
            {fields.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(index)}
                className="absolute top-2 right-2 h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Ticket Name */}
              <div className="space-y-2.5">
                <Label className="text-[13px] font-bold text-gray-700">Ticket Name</Label>
                <Input
                  placeholder="e.g. Basic, VIP, Early Bird"
                  className="h-11 text-[14px] bg-white border-gray-200 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-600 rounded-xl"
                  {...register(`ticketTypes.${index}.name`)}
                />
                {errors.ticketTypes?.[index]?.name && <p className="text-[12px] text-red-500 font-semibold">{errors.ticketTypes[index]?.name?.message}</p>}
              </div>

              {/* Price */}
              <div className="space-y-2.5">
                <Label className="text-[13px] font-bold text-gray-700 flex items-center space-x-1.5">
                  <IndianRupee className="h-4 w-4 text-gray-400" />
                  <span>Fee (INR)</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] text-gray-400 font-bold">₹</span>
                  <Input
                    type="number"
                    className="h-11 text-[14px] pl-8 bg-white border-gray-200 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-600 rounded-xl"
                    {...register(`ticketTypes.${index}.price`)}
                  />
                </div>
                {errors.ticketTypes?.[index]?.price && <p className="text-[12px] text-red-500 font-semibold">{errors.ticketTypes[index]?.price?.message}</p>}
              </div>

              {/* Max Spots */}
              <div className="space-y-2.5">
                <Label className="text-[13px] font-bold text-gray-700 flex items-center space-x-1.5">
                  <Ticket className="h-4 w-4 text-gray-400" />
                  <span>Seats Available</span>
                </Label>
                <Input
                  type="number"
                  className="h-11 text-[14px] bg-white border-gray-200 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-600 rounded-xl"
                  {...register(`ticketTypes.${index}.totalSeats`)}
                />
                {errors.ticketTypes?.[index]?.totalSeats && <p className="text-[12px] text-red-500 font-semibold">{errors.ticketTypes[index]?.totalSeats?.message}</p>}
              </div>
            </div>
          </div>
        ))}
        {errors.ticketTypes?.root && (
          <p className="text-[13px] text-red-500 font-semibold mt-2">{errors.ticketTypes.root.message}</p>
        )}
      </CardContent>
    </Card>
  );
}
