import {
  BarChart3,
  Bell,
  CalendarDays,
  CreditCard,
  Settings,
  Users,
} from "lucide-react";

import { FeatureCard } from "./FeatureCard";
import { Section } from "./Section";
import { SectionHeader } from "./SectionHeader";

const features = [
  {
    icon: CalendarDays,
    title: "Smart Scheduling",
    description:
      "Allow customers to book appointments anytime with an intuitive scheduling experience.",
  },
  {
    icon: Users,
    title: "Team Management",
    description:
      "Manage staff members, working hours, vacations and availability from one place.",
  },
  {
    icon: CreditCard,
    title: "Online Payments",
    description:
      "Accept online payments securely and reduce no-shows with prepaid bookings.",
  },
  {
    icon: Bell,
    title: "Automatic Reminders",
    description:
      "Notify customers via email and SMS before every appointment.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "Track appointments, revenue and customer growth with real-time reports.",
  },
  {
    icon: Settings,
    title: "Easy Customization",
    description:
      "Adapt the platform for clinics, salons, consultants or any service business.",
  },
];

export function Features() {
  return (
    <Section className="bg-slate-50">
      <SectionHeader
        badge="Features"
        title="Everything You Need"
        description="Powerful tools to manage appointments and grow your business."
      />

      <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        {features.map((feature) => (
          <FeatureCard
            key={feature.title}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </div>
    </Section>
  );
}