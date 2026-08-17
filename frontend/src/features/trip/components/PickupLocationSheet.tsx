import { useState } from "react";
import { Search, Crosshair, Home, MapPin, Check, X, Loader2, Plus } from "lucide-react";
import { useLocationStore } from "@/store/location.store";
import { toast } from "sonner";

interface PickupLocationSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (location: {
    address: string;
    coords?: [number, number] | null;
    type: "CURRENT" | "HOME" | "MAP" | "CUSTOM";
  }) => void;
  onEnterMapPickMode?: () => void;
}

export function PickupLocationSheet({
  isOpen,
  onClose,
  onSelectLocation,
  onEnterMapPickMode,
}: PickupLocationSheetProps) {
  const [typedAddress, setTypedAddress] = useState("");
  const [selectedType, setSelectedType] = useState<"CURRENT" | "HOME" | "MAP" | "CUSTOM">("CURRENT");

  const {
    currentCoords,
    currentAddress,
    isLocating,
    homeLocation,
    fetchCurrentLocation,
    setHomeFromCurrentLocation,
  } = useLocationStore();

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (selectedType === "CUSTOM" && typedAddress.trim()) {
      onSelectLocation({
        address: typedAddress.trim(),
        coords: null,
        type: "CUSTOM",
      });
    } else if (selectedType === "CURRENT") {
      onSelectLocation({
        address: currentAddress || "Current GPS Location",
        coords: currentCoords,
        type: "CURRENT",
      });
    } else if (selectedType === "HOME" && homeLocation) {
      onSelectLocation({
        address: homeLocation.address,
        coords: [homeLocation.latitude, homeLocation.longitude],
        type: "HOME",
      });
    } else if (selectedType === "MAP") {
      if (onEnterMapPickMode) {
        onEnterMapPickMode();
      }
    }
    onClose();
  };

  const handleSelectCurrent = async () => {
    setSelectedType("CURRENT");
    await fetchCurrentLocation(true);
  };

  const handleSelectHome = async () => {
    if (!homeLocation) {
      toast.info("Saving your current GPS location as Home...");
      const saved = await setHomeFromCurrentLocation();
      if (saved) {
        toast.success(`Home saved: ${saved.address}`);
        setSelectedType("HOME");
      } else {
        toast.error("Could not determine current location. Please grant location access.");
      }
    } else {
      setSelectedType("HOME");
    }
  };

  const handleSelectMap = () => {
    setSelectedType("MAP");
    if (onEnterMapPickMode) {
      onEnterMapPickMode();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex max-h-[90vh] w-full max-w-md flex-col rounded-t-sheet sm:rounded-dialog bg-surface shadow-premium border border-border overflow-hidden animate-in slide-in-from-bottom duration-300">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="h-1.5 w-12 rounded-full bg-border-secondary/60"></div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-3">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Pickup Location
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-subtle text-foreground-secondary hover:text-foreground transition"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search input */}
        <div className="p-4 pt-1">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 h-4 w-4 text-foreground-secondary" />
            <input
              type="text"
              placeholder="Enter pickup location"
              value={typedAddress}
              onChange={(e) => {
                setTypedAddress(e.target.value);
                if (e.target.value) setSelectedType("CUSTOM");
              }}
              className="w-full rounded-2xl border border-border bg-surface-subtle pl-10 pr-4 py-3 text-sm font-medium text-foreground placeholder:text-foreground-muted focus:border-primary focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Location options */}
        <div className="flex-1 overflow-y-auto p-4 pt-0 space-y-2.5">
          {/* 1. Current Location */}
          <div
            onClick={handleSelectCurrent}
            className={`flex items-center justify-between p-3.5 rounded-2xl border transition cursor-pointer ${
              selectedType === "CURRENT"
                ? "border-primary bg-primary-subtle/30 shadow-soft"
                : "border-border hover:border-border-secondary hover:bg-surface-subtle"
            }`}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-soft">
                {isLocating ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Crosshair className="h-5 w-5" />
                )}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-sm text-foreground">
                  Current Location
                </div>
                <div className="text-xs text-foreground-secondary truncate mt-0.5">
                  {isLocating
                    ? "Acquiring real GPS coordinates..."
                    : currentAddress || "Tap to detect real GPS location"}
                </div>
              </div>
            </div>
            {selectedType === "CURRENT" && (
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-white ml-2">
                <Check className="h-3 w-3 stroke-[3]" />
              </div>
            )}
          </div>

          {/* 2. Home Location (Persisted) */}
          <div
            onClick={handleSelectHome}
            className={`flex items-center justify-between p-3.5 rounded-2xl border transition cursor-pointer ${
              selectedType === "HOME"
                ? "border-primary bg-primary-subtle/30 shadow-soft"
                : "border-border hover:border-border-secondary hover:bg-surface-subtle"
            }`}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-secondary-subtle text-secondary">
                <Home className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-sm text-foreground">
                  {homeLocation ? "Home" : "Set your Home location"}
                </div>
                <div className="text-xs text-foreground-secondary truncate mt-0.5">
                  {homeLocation
                    ? homeLocation.address
                    : "Use Current Location as Home"}
                </div>
              </div>
            </div>
            {selectedType === "HOME" && homeLocation ? (
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-white ml-2">
                <Check className="h-3 w-3 stroke-[3]" />
              </div>
            ) : !homeLocation ? (
              <div className="flex h-6 px-2 items-center justify-center rounded-lg bg-primary-subtle text-[11px] font-bold text-primary ml-2">
                <Plus className="h-3 w-3 mr-1" />
                Set
              </div>
            ) : null}
          </div>

          {/* 3. Choose on Map */}
          <div
            onClick={handleSelectMap}
            className={`flex items-center justify-between p-3.5 rounded-2xl border transition cursor-pointer ${
              selectedType === "MAP"
                ? "border-primary bg-primary-subtle/30 shadow-soft"
                : "border-border hover:border-border-secondary hover:bg-surface-subtle"
            }`}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-secondary-subtle text-secondary">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-sm text-foreground">
                  Choose on Map
                </div>
                <div className="text-xs text-foreground-secondary mt-0.5">
                  Tap anywhere on the live map
                </div>
              </div>
            </div>
            {selectedType === "MAP" && (
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-white ml-2">
                <Check className="h-3 w-3 stroke-[3]" />
              </div>
            )}
          </div>
        </div>

        {/* Footer CTA */}
        <div className="border-t border-border p-4 bg-surface">
          <button
            type="button"
            onClick={handleConfirm}
            className="w-full rounded-button bg-primary py-3.5 px-4 text-sm font-bold text-white shadow-medium transition hover:bg-primary-hover active:scale-[0.99]"
          >
            Use this location
          </button>
        </div>
      </div>
    </div>
  );
}
