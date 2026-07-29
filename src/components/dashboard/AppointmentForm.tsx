"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AppointmentForm() {
  return (
    <form className="space-y-5">
      <div>
        <Label htmlFor="customer">
          Customer
        </Label>

        <Input
          id="customer"
          placeholder="John Doe"
        />
      </div>

      <div>
        <Label htmlFor="service">
          Service
        </Label>

        <Input
          id="service"
          placeholder="Haircut"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="date">
            Date
          </Label>

          <Input
            id="date"
            type="date"
          />
        </div>

        <div>
          <Label htmlFor="time">
            Time
          </Label>

          <Input
            id="time"
            type="time"
          />
        </div>
      </div>

      <Button className="w-full">
        Save Appointment
      </Button>
    </form>
  );
}