import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  Car,
  Settings,
  Plus,
  Phone,
  Mail,
  User as UserIcon,
} from "lucide-react";
import { toast } from "sonner";

import { useAuthStore } from "@/features/auth/store/auth.store";
import { getMyDriver } from "@/features/driver/api/driver.api";
import { getAllVehicles, getMyVehicle } from "@/features/driver/vehicle/api/vehicle.api";
import { VehicleVisual, VehicleBadge } from "@/components/vehicle/VehicleVisual";

export default function DriverProfilePage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const { data: driverRes, isLoading: driverLoading } = useQuery({
    queryKey: ["driver", "me"],
    queryFn: getMyDriver,
    staleTime: 1000 * 60 * 2,
  });

  const { data: vehicleRes } = useQuery({
    queryKey: ["driver", "vehicle", "me"],
    queryFn: getMyVehicle,
    staleTime: 1000 * 60 * 2,
  });

  const { data: allVehiclesRes } = useQuery({
    queryKey: ["driver", "vehicles", "all"],
    queryFn: getAllVehicles,
    staleTime: 1000 * 60 * 2,
  });

  const driver = driverRes?.data;
  const vehicle = vehicleRes?.data;
  const vehicles = allVehiclesRes?.data || (vehicle ? [vehicle] : []);

  if (driverLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="mx-auto max-w-md p-6 text-center space-y-4 pt-12">
        <div className="h-16 w-16 mx-auto rounded-3xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="text-lg font-bold text-foreground">
          Driver Profile Not Found
        </h2>
        <p className="text-xs text-foreground-secondary leading-relaxed max-w-xs mx-auto">
          You haven't submitted a driver application yet, or your application is being set up.
        </p>
        <div className="pt-2">
          <Link
            to="/become-driver"
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-xs font-bold text-white shadow-soft transition hover:bg-primary-hover active:scale-[0.98]"
          >
            <Car className="h-4 w-4" />
            <span>Apply to Become a Driver</span>
          </Link>
        </div>
      </div>
    );
  }

  const isApproved = driver.status === "APPROVED";

  return (
    <div className="mx-auto max-w-md pb-24 lg:max-w-3xl space-y-5 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/driver/dashboard")}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-surface border border-border text-foreground hover:bg-surface-subtle transition shadow-soft"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-foreground">Driver Profile</h1>
            <p className="text-xs text-foreground-secondary">
              Verified campus driving credentials
            </p>
          </div>
        </div>

        <Link
          to="/driver/vehicle"
          className="flex h-9 items-center gap-1.5 rounded-full border border-border bg-surface px-3 text-xs font-bold text-foreground hover:bg-surface-subtle transition shadow-soft"
        >
          <Settings className="h-3.5 w-3.5 text-foreground-secondary" />
          <span>Manage Vehicles</span>
        </Link>
      </div>

      {/* Driver Identity Card */}
      <div className="rounded-3xl border border-border bg-surface p-5 shadow-soft space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white font-black text-base shadow-soft">
              {driver.firstName?.[0] || user?.firstName?.[0] || "D"}
            </div>
            <div>
              <div className="font-extrabold text-sm text-foreground flex items-center gap-1.5">
                <span>{driver.firstName} {driver.lastName}</span>
                {isApproved && (
                  <ShieldCheck className="h-4 w-4 text-emerald-500 fill-emerald-500/20 shrink-0" />
                )}
              </div>
              <div className="text-xs text-foreground-secondary mt-0.5 flex items-center gap-1">
                <Mail className="h-3 w-3" />
                <span>{driver.email || user?.email}</span>
              </div>
            </div>
          </div>

          <span
            className={`rounded-full px-3 py-1 text-xs font-extrabold flex items-center gap-1.5 border shadow-soft ${
              isApproved
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
            }`}
          >
            {isApproved ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : (
              <Clock className="h-3.5 w-3.5" />
            )}
            <span>{driver.status}</span>
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-2xl bg-surface-subtle p-3 space-y-0.5">
            <span className="text-[11px] font-bold text-foreground-secondary flex items-center gap-1">
              <Phone className="h-3 w-3" />
              <span>Contact Number</span>
            </span>
            <span className="font-mono font-bold text-foreground block">
              {driver.phoneNumber || (user as any)?.phoneNumber || "Not provided"}
            </span>
          </div>

          <div className="rounded-2xl bg-surface-subtle p-3 space-y-0.5">
            <span className="text-[11px] font-bold text-foreground-secondary flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" />
              <span>Campus Status</span>
            </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 block">
              {driver.collegeVerified ? "Verified Student / Staff" : "Under Review"}
            </span>
          </div>
        </div>
      </div>

      {/* Driver License Section */}
      <div className="rounded-3xl border border-border bg-surface p-5 shadow-soft space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-extrabold text-xs text-foreground uppercase tracking-wider">
            Driving License Credentials
          </span>
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
            Government Verified
          </span>
        </div>

        <div className="rounded-2xl bg-surface-subtle p-3.5 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-foreground-secondary font-medium">License Number:</span>
            <span className="font-mono font-black text-foreground text-sm tracking-wider">
              {driver.drivingLicenseNumber}
            </span>
          </div>
        </div>

        {driver.licenseImageUrl && (
          <div className="rounded-2xl border border-border bg-surface-subtle p-3 overflow-hidden">
            <img
              src={driver.licenseImageUrl}
              alt="Driving License"
              className="max-h-48 w-full object-contain rounded-xl"
            />
          </div>
        )}
      </div>

      {/* Active Vehicle & Multi-Vehicle List */}
      <div className="rounded-3xl border border-border bg-surface p-5 shadow-soft space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-extrabold text-xs text-foreground uppercase tracking-wider block">
              Registered Vehicles ({vehicles.length})
            </span>
            <p className="text-[11px] text-foreground-secondary">
              Active vehicle is selected for your published rides
            </p>
          </div>
          <Link
            to="/driver/vehicle"
            className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary hover:bg-primary/20 transition"
          >
            <Plus className="h-3 w-3" />
            <span>Manage</span>
          </Link>
        </div>

        {vehicles.length > 0 ? (
          <div className="space-y-3">
            {vehicles.map((v) => {
              const isActive = v.status === "ACTIVE" || (!vehicles.some(x => x.status === "ACTIVE") && v.vehicleId === vehicle?.vehicleId);
              return (
                <div
                  key={v.vehicleId}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition ${
                    isActive
                      ? "border-primary bg-primary-subtle/20 shadow-soft"
                      : "border-border bg-surface-subtle"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <VehicleVisual type={v.vehicleType} size="md" />
                    <div>
                      <div className="font-bold text-sm text-foreground flex items-center gap-2">
                        <span>{v.brand} {v.model}</span>
                        {isActive && (
                          <span className="rounded-full bg-primary text-white px-2 py-0.5 text-[10px] font-extrabold">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-foreground-secondary font-mono mt-0.5">
                        {v.registrationNumber} • {v.color}
                      </div>
                    </div>
                  </div>

                  <VehicleBadge type={v.vehicleType} capacity={v.maxPassengerCapacity} />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-5 text-center text-xs text-foreground-secondary space-y-2">
            <p>No vehicle registered under this driver profile.</p>
            <Link
              to="/driver/vehicle"
              className="inline-flex items-center gap-1 text-primary font-bold hover:underline"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Register vehicle now</span>
            </Link>
          </div>
        )}
      </div>

      {/* Switch Experience Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => {
            toast.success("Switched to Rider Mode");
            navigate("/dashboard");
          }}
          className="w-full rounded-button border border-border bg-surface py-3.5 px-4 text-xs font-bold text-foreground hover:bg-surface-subtle transition flex items-center justify-center gap-2 shadow-soft"
        >
          <UserIcon className="h-4 w-4 text-primary" />
          <span>Switch to Rider Mode</span>
        </button>
      </div>
    </div>
  );
}
