import { Card, CardContent } from "@/components/ui/card";
import { Section, SectionHeader } from "@/components/ui/section";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Beauty Salon Owner",
    review:
      "The best booking platform we've ever used. Easy for our staff and customers.",
  },
  {
    name: "David Smith",
    role: "Dental Clinic",
    review:
      "Appointment reminders reduced our no-shows dramatically. Highly recommended.",
  },
  {
    name: "Emily Brown",
    role: "Fitness Studio",
    review:
      "Simple, modern and incredibly fast. Our members love booking online.",
  },
];

export function Testimonials() {
  return (
    <Section id="testimonials">
      <SectionHeader
        badge="Testimonials"
        title="Loved by Businesses"
        subtitle="Thousands of businesses trust SR Booking Platform every day."
      />

      <div className="mt-16 grid gap-8 md:grid-cols-3">
        {testimonials.map((item) => (
          <Card
            key={item.name}
            className="rounded-3xl border-0 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
          >
            <CardContent className="p-8">
              <div className="mb-6 flex gap-1 text-yellow-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current" />
                ))}
              </div>

              <p className="mb-8 leading-7 text-muted-foreground">
  &ldquo;{item.review}&rdquo;
</p>

              <div>
                <h4 className="font-semibold">{item.name}</h4>
                <p className="text-sm text-muted-foreground">{item.role}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
}