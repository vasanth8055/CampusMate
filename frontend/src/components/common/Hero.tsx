import { Link } from "react-router-dom";
import { ShieldCheck, Search, Car, Home, GraduationCap, ArrowRightLeft } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-background py-12 lg:py-20">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Left Column */}
          <div className="flex flex-col items-start lg:col-span-7">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-subtle/80 px-4 py-1.5 text-xs font-semibold text-primary shadow-xs border border-primary/20">
              <ShieldCheck className="h-4 w-4" />
              <span>College Verified Community</span>
            </div>

            {/* Headline */}
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl leading-[1.1]">
              Your daily <br />
              college <br />
              commute, <br />
              <span className="text-primary">shared.</span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-foreground-secondary">
              Connect with fellow students heading the same way. Save money, reduce
              your carbon footprint, and make the Home ↔ College trip effortless.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary-hover transition-all"
              >
                <Search className="h-4 w-4" />
                <span>Find a Ride</span>
              </Link>

              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-primary bg-surface px-7 py-3.5 text-sm font-semibold text-primary hover:bg-primary-subtle/40 transition-all"
              >
                <Car className="h-4 w-4" />
                <span>Offer a Ride</span>
              </Link>
            </div>

            {/* Home <-> College Indicator Card */}
            <div className="mt-10 inline-flex items-center gap-4 rounded-2xl border border-slate-200/80 dark:border-border bg-surface px-6 py-3 shadow-xs">
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-foreground-secondary">Home</span>
              </div>

              <div className="flex items-center">
                <div className="h-0.5 w-12 bg-slate-200 dark:bg-border" />
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground mx-1">
                  <ArrowRightLeft className="h-3 w-3" />
                </div>
                <div className="h-0.5 w-12 bg-slate-200 dark:bg-border" />
              </div>

              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium text-foreground-secondary">College</span>
              </div>
            </div>
          </div>

          {/* Right Column / Hero Card */}
          <div className="relative flex justify-center lg:col-span-5">
            <div className="relative h-[440px] sm:h-[500px] w-full max-w-[420px] rounded-3xl bg-[#DDE3FD] dark:bg-slate-800/80 p-6 flex flex-col justify-between overflow-hidden shadow-md">
              {/* Graphic background illustration */}
              <div className="relative flex-1 flex items-center justify-center">
                {/* Visual Map / Loop Illustration */}
                <div className="relative w-full h-full flex items-center justify-center">
                  <div className="w-56 h-56 rounded-full border-4 border-dashed border-indigo-300/60 dark:border-indigo-400/30 flex items-center justify-center animate-pulse">
                    <div className="w-40 h-40 rounded-full bg-white/40 dark:bg-white/5 backdrop-blur-xs flex items-center justify-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
                        <Car className="h-8 w-8" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Bottom Card */}
              <div className="relative z-10 flex items-center gap-3 rounded-2xl bg-surface p-4 shadow-medium border border-slate-100 dark:border-border">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-400 text-sm font-bold text-white shadow-xs">
                  JD
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Ride matched</p>
                  <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Arriving in 5m</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}