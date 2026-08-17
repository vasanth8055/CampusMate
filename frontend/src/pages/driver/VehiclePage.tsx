import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Plus,
  ArrowLeft,
  Car,
  Trash2,
  Loader2,
  Check,
} from "lucide-react";

import {
  getMyVehicle,
  getAllVehicles,
  registerVehicle,
  activateVehicle,
  uploadRcImage,
  deleteVehicle,
} from "@/features/driver/vehicle/api/vehicle.api";
import type {
  CreateVehicleRequest,
  VehicleResponse,
} from "@/features/driver/vehicle/types/vehicle.types";
import { VehicleVisual, VehicleBadge, type VehicleType } from "@/components/vehicle/VehicleVisual";

export default function VehiclePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [vehicleType, setVehicleType] = useState<VehicleType>("CAR");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [color, setColor] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [maxPassengerCapacity, setMaxPassengerCapacity] = useState(4);
  const [rcFile, setRcFile] = useState<File | null>(null);

  // Queries
  const { data: activeVehicleRes, isLoading: activeLoading } = useQuery({
    queryKey: ["my-vehicle"],
    queryFn: getMyVehicle,
    staleTime: 1000 * 60 * 2,
    retry: false,
  });

  const { data: allVehiclesRes, isLoading: allLoading } = useQuery({
    queryKey: ["driver", "vehicles", "all"],
    queryFn: getAllVehicles,
    staleTime: 1000 * 60 * 2,
    retry: false,
  });

  const activeVehicle = activeVehicleRes?.data ?? null;
  const vehicles = allVehiclesRes?.data ?? (activeVehicle ? [activeVehicle] : []);

  const getMaxCapacity = (type: VehicleType) => {
    switch (type) {
      case "BIKE":
      case "SCOOTER":
        return 1;
      case "AUTO":
        return 3;
      case "CAR":
      default:
        return 6;
    }
  };

  const handleVehicleTypeChange = (type: VehicleType) => {
    setVehicleType(type);
    if (type === "BIKE" || type === "SCOOTER") {
      setMaxPassengerCapacity(1);
    } else if (type === "AUTO") {
      setMaxPassengerCapacity(3);
    } else {
      setMaxPassengerCapacity(4);
    }
  };

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (payload: CreateVehicleRequest) => {
      const res = await registerVehicle(payload);
      if (rcFile) {
        try {
          await uploadRcImage(rcFile);
        } catch (e) {
          console.warn("RC upload warning:", e);
        }
      }
      return res;
    },
    onSuccess: () => {
      toast.success("Vehicle registered successfully.");
      queryClient.invalidateQueries({ queryKey: ["my-vehicle"] });
      queryClient.invalidateQueries({ queryKey: ["driver", "vehicles", "all"] });
      queryClient.invalidateQueries({ queryKey: ["driver", "me"] });
      setIsAddOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message ?? "Could not register vehicle.";
      toast.error(message);
    },
  });

  // Activate mutation
  const activateMutation = useMutation({
    mutationFn: (id: string) => activateVehicle(id),
    onSuccess: () => {
      toast.success("Active vehicle updated.");
      queryClient.invalidateQueries({ queryKey: ["my-vehicle"] });
      queryClient.invalidateQueries({ queryKey: ["driver", "vehicles", "all"] });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message ?? "Could not activate vehicle.";
      toast.error(message);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteVehicle,
    onSuccess: () => {
      toast.success("Vehicle removed.");
      queryClient.invalidateQueries({ queryKey: ["my-vehicle"] });
      queryClient.invalidateQueries({ queryKey: ["driver", "vehicles", "all"] });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message ?? "Could not delete vehicle.";
      toast.error(message);
    },
  });

  const resetForm = () => {
    setBrand("");
    setModel("");
    setColor("");
    setRegistrationNumber("");
    setVehicleType("CAR");
    setMaxPassengerCapacity(4);
    setRcFile(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand.trim() || !model.trim() || !color.trim() || !registrationNumber.trim()) {
      toast.error("Please fill in all vehicle details.");
      return;
    }

    const payload: CreateVehicleRequest = {
      vehicleType,
      brand: brand.trim(),
      model: model.trim(),
      color: color.trim(),
      registrationNumber: registrationNumber.trim().toUpperCase(),
      maxPassengerCapacity,
    };

    registerMutation.mutate(payload);
  };

  const isLoading = activeLoading || allLoading;

  return (
    <div className="mx-auto max-w-md pb-24 lg:max-w-4xl space-y-5 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/driver/profile")}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-surface border border-border text-foreground hover:bg-surface-subtle transition shadow-soft"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-foreground">Vehicle Garage</h1>
            <p className="text-xs text-foreground-secondary">
              Manage your approved commute vehicles
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            resetForm();
            setIsAddOpen(true);
          }}
          className="flex h-9 items-center gap-1.5 rounded-full bg-primary px-3.5 text-xs font-bold text-white shadow-soft transition hover:bg-primary-hover active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          <span>Add Vehicle</span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : vehicles.length === 0 ? (
        /* Empty Garage */
        <div className="rounded-3xl border border-dashed border-border bg-surface p-8 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-primary/10 text-primary">
            <Car className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">No Vehicle Registered</h3>
            <p className="text-xs text-foreground-secondary mt-1 max-w-xs mx-auto">
              Add your car, bike, scooter, or auto-rickshaw to publish shared trips.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-xs font-bold text-white shadow-soft hover:bg-primary-hover transition"
          >
            <Plus className="h-4 w-4" />
            <span>Register Your First Vehicle</span>
          </button>
        </div>
      ) : (
        /* Vehicles List */
        <div className="space-y-4">
          <div className="rounded-3xl border border-border bg-surface p-5 shadow-soft space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-foreground">
                Your Registered Vehicles ({vehicles.length})
              </span>
              <span className="text-[11px] text-foreground-secondary font-medium">
                Tap vehicle to set as active for new trips
              </span>
            </div>

            <div className="space-y-3">
              {vehicles.map((v: VehicleResponse) => {
                const isActive =
                  v.status === "ACTIVE" ||
                  (!vehicles.some((x) => x.status === "ACTIVE") &&
                    v.vehicleId === activeVehicle?.vehicleId);

                return (
                  <div
                    key={v.vehicleId}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border transition gap-4 ${
                      isActive
                        ? "border-primary bg-primary-subtle/20 shadow-soft ring-1 ring-primary/20"
                        : "border-border bg-surface-subtle hover:border-border-secondary cursor-pointer"
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <VehicleVisual type={v.vehicleType} size="lg" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-sm text-foreground truncate">
                            {v.brand} {v.model}
                          </h3>
                          {isActive && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-extrabold text-white">
                              <Check className="h-3 w-3 stroke-[3]" />
                              <span>Active</span>
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-foreground-secondary font-mono mt-0.5">
                          {v.registrationNumber} • {v.color}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0">
                      <VehicleBadge type={v.vehicleType} capacity={v.maxPassengerCapacity} />

                      {!isActive ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={activateMutation.isPending}
                            onClick={() => activateMutation.mutate(v.vehicleId)}
                            className="rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-bold text-foreground hover:bg-surface-subtle transition"
                          >
                            Set Active
                          </button>
                          <button
                            type="button"
                            disabled={deleteMutation.isPending}
                            onClick={() => {
                              if (window.confirm(`Delete ${v.brand} ${v.model}?`)) {
                                deleteMutation.mutate();
                              }
                            }}
                            className="rounded-xl border border-border p-1.5 text-foreground-secondary hover:text-danger hover:border-danger/30 transition"
                            title="Delete vehicle"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => navigate("/driver/trips/create")}
                          className="rounded-xl bg-primary px-3.5 py-1.5 text-xs font-bold text-white shadow-soft hover:bg-primary-hover transition"
                        >
                          Create Trip
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─── Add / Register Vehicle Modal ─── */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-dialog bg-surface p-6 shadow-premium border border-border space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">Register Vehicle</h3>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="text-xs font-bold text-foreground-secondary hover:text-foreground"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Vehicle Type Selection */}
              <div>
                <label className="block text-xs font-bold text-foreground-secondary uppercase tracking-wider mb-2">
                  Select Vehicle Category
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(["CAR", "BIKE", "SCOOTER", "AUTO"] as VehicleType[]).map((t) => {
                    const isSelected = vehicleType === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => handleVehicleTypeChange(t)}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-center transition ${
                          isSelected
                            ? "border-primary bg-primary-subtle/30 shadow-soft ring-2 ring-primary"
                            : "border-border bg-surface-subtle hover:bg-surface"
                        }`}
                      >
                        <VehicleVisual type={t} size="sm" />
                        <span className="text-[11px] font-bold text-foreground capitalize">
                          {t.toLowerCase()}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Brand & Model */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground-secondary mb-1">
                    Brand / Manufacturer *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Honda / Maruti"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface-subtle p-2.5 text-xs text-foreground focus:border-primary focus:bg-surface focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground-secondary mb-1">
                    Model Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Swift / Activa 6G"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface-subtle p-2.5 text-xs text-foreground focus:border-primary focus:bg-surface focus:outline-none"
                  />
                </div>
              </div>

              {/* Color & Registration Number */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground-secondary mb-1">
                    Vehicle Color *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. White / Silver"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface-subtle p-2.5 text-xs text-foreground focus:border-primary focus:bg-surface focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground-secondary mb-1">
                    License Plate (Reg No.) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AP16AB1234"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface-subtle p-2.5 text-xs font-mono font-bold text-foreground focus:border-primary focus:bg-surface focus:outline-none uppercase"
                  />
                </div>
              </div>

              {/* Passenger Capacity */}
              <div>
                <label className="block text-xs font-semibold text-foreground-secondary mb-1">
                  Passenger Seat Capacity (Max Allowed for {vehicleType}: {getMaxCapacity(vehicleType)})
                </label>
                <input
                  type="number"
                  min={1}
                  max={getMaxCapacity(vehicleType)}
                  value={maxPassengerCapacity}
                  onChange={(e) => setMaxPassengerCapacity(Number(e.target.value))}
                  className="w-full rounded-xl border border-border bg-surface-subtle p-2.5 text-xs text-foreground focus:border-primary focus:bg-surface focus:outline-none"
                />
              </div>

              {/* RC Document Upload */}
              <div>
                <label className="block text-xs font-semibold text-foreground-secondary mb-1">
                  Registration Certificate (RC Photo - Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setRcFile(e.target.files?.[0] || null)}
                  className="w-full rounded-xl border border-border bg-surface-subtle p-2 text-xs text-foreground file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-hover"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="flex-1 rounded-xl border border-border py-2.5 text-xs font-bold text-foreground hover:bg-surface-subtle transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={registerMutation.isPending}
                  className="flex-1 rounded-xl bg-primary py-2.5 text-xs font-bold text-white shadow-soft hover:bg-primary-hover transition disabled:opacity-50"
                >
                  {registerMutation.isPending ? "Registering..." : "Save Vehicle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}