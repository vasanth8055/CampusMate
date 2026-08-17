import { ShieldCheck, PiggyBank, Calendar } from "lucide-react";

export default function Features() {
  return (
    <section id="why-campusmate" className="py-20 bg-slate-50/50 dark:bg-background/50">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Why CampusMate?
          </h2>
          <p className="mt-4 text-base sm:text-lg text-foreground-secondary">
            Built specifically for the student lifestyle, prioritizing safety, cost, and convenience.
          </p>
        </div>

        {/* 3 Bento Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-stretch">
          {/* Card 1: Student Budget Friendly */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-border bg-surface p-8 shadow-xs hover:shadow-medium transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mb-6">
                <PiggyBank className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground">
                Student Budget Friendly
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-foreground-secondary">
                Split costs fairly. It's cheaper than daily ride-shares and more convenient than public transit.
              </p>
            </div>
          </div>

          {/* Card 2: Verified Community (Featured Solid Indigo Card) */}
          <div className="rounded-3xl bg-primary text-primary-foreground p-8 shadow-lg hover:shadow-xl transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-white mb-6">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Verified Community
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-indigo-100">
                Every user must verify with an active .edu email. Know exactly who you are riding with.
              </p>
            </div>
          </div>

          {/* Card 3: Set & Forget Schedules */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-border bg-surface p-8 shadow-xs hover:shadow-medium transition-shadow flex flex-col justify-between md:col-span-2 lg:col-span-1">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                  <Calendar className="h-6 w-6" />
                </div>
                <span className="rounded-full bg-primary-subtle px-3 py-1 text-xs font-semibold text-primary">
                  Popular
                </span>
              </div>

              <h3 className="text-xl font-bold text-foreground">
                Set & Forget Schedules
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-foreground-secondary">
                Have an 8 AM class every MWF? Lock in recurring rides for the entire semester and never worry about your morning commute again.
              </p>
            </div>

            {/* Days badges */}
            <div className="mt-6 flex items-center gap-2 pt-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-surface-elevated text-xs font-semibold text-foreground-muted">
                M
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-surface-elevated text-xs font-semibold text-foreground-muted">
                T
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-xs">
                W
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-surface-elevated text-xs font-semibold text-foreground-muted">
                T
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-xs">
                F
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}