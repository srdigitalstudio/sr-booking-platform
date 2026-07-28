import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Section, SectionHeader } from "@/components/ui/section";

const plans = [
  {
    name: "Starter",
    price: "$19",
    description: "Perfect for freelancers and small businesses.",
    features: [
      "Online Booking",
      "Email Reminders",
      "1 Staff Member",
      "Basic Reports",
    ],
  },
  {
    name: "Professional",
    price: "$49",
    popular: true,
    description: "Best choice for growing businesses.",
    features: [
      "Everything in Starter",
      "Unlimited Staff",
      "SMS Reminders",
      "Online Payments",
      "Advanced Reports",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large organizations with custom needs.",
    features: [
      "Everything in Professional",
      "API Access",
      "White Label",
      "Priority Support",
    ],
  },
];

export function Pricing() {
  return (
    <Section id="pricing">
      <SectionHeader
        badge="Pricing"
        title="Simple Pricing"
        subtitle="Choose a plan that grows with your business."
      />

      <div className="grid gap-8 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`relative rounded-3xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${
              plan.popular ? "border-2 border-blue-600 shadow-xl" : ""
            }`}
          >
            {plan.popular && (
              <span className="absolute right-6 top-6 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                Most Popular
              </span>
            )}

            <CardContent className="p-8">
              <h3 className="text-2xl font-bold">{plan.name}</h3>

              <p className="mt-2 text-muted-foreground">
                {plan.description}
              </p>

              <div className="my-8">
                <span className="text-5xl font-bold">
                  {plan.price}
                </span>

                {plan.price !== "Custom" && (
                  <span className="text-muted-foreground">
                    /month
                  </span>
                )}
              </div>

              <ul className="space-y-4">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-3"
                  >
                    <Check className="h-5 w-5 text-green-600" />

                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button className="mt-8 w-full">
                Get Started
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
}