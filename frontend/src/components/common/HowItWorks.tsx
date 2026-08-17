import { Link } from "react-router-dom";
import { UserCheck, Send, Car } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      number: "1",
      icon: <UserCheck className="h-7 w-7 text-primary" />,
      title: "Find",
      description:
        "Enter your college and home area to see available drivers on your route.",
    },
    {
      number: "2",
      icon: <Send className="h-7 w-7 text-primary" />,
      title: "Request",
      description:
        "Send a ride request. The app calculates a fair split cost upfront.",
    },
    {
      number: "3",
      icon: <Car className="h-7 w-7 text-primary" />,
      title: "Ride",
      description:
        "Meet at the designated spot and enjoy a seamless, shared commute.",
    },
  ];

  return (
    <section id="how-it-works" className="py-16 bg-background">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="rounded-3xl border border-slate-200/80 dark:border-border bg-slate-50/70 dark:bg-surface-elevated/40 p-8 sm:p-16 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-16">
            How It Works
          </h2>

          <div className="grid gap-12 md:grid-cols-3 relative">
            {steps.map((step) => (
              <div key={step.number} className="flex flex-col items-center">
                {/* Step Circle with numbered badge */}
                <div className="relative mb-6">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface shadow-soft border border-slate-100 dark:border-border">
                    {step.icon}
                  </div>
                  <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-xs">
                    {step.number}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-3 max-w-xs text-sm leading-relaxed text-foreground-secondary">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-14">
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-8 py-3.5 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-primary dark:hover:bg-primary-hover shadow-md hover:shadow-lg transition-all"
            >
              Start your loop today
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}