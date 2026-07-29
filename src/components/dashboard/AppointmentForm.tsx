"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AppointmentForm() {
  const [customer, setCustomer] = useState("");
  const [service, setService] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    console.log({
      customer,
      service,
      date,
      time,
    });

    alert("Appointment created successfully!");

    setCustomer("");
    setService("");
    setDate("");
    setTime("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div>
        <Label htmlFor="customer">
          Customer
        </Label>

        <Input
          id="customer"
          placeholder="John Doe"
          value={customer}
          onChange={(event) => setCustomer(event.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="service">
          Service
        </Label>

        <Input
          id="service"
          placeholder="Haircut"
          value={service}
          onChange={(event) => setService(event.target.value)}
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
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="time">
            Time
          </Label>

          <Input
            id="time"
            type="time"
            value={time}
            onChange={(event) => setTime(event.target.value)}
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
      >
        Save Appointment
      </Button>
    </form>
  );
}