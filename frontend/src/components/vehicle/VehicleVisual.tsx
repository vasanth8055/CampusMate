import { Car, Bike, Navigation } from "lucide-react";

export type VehicleType = "CAR" | "BIKE" | "SCOOTER" | "AUTO";

interface VehicleVisualProps {
  type: VehicleType | string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showLabel?: boolean;
}

export function getVehicleConfig(rawType?: string) {
  const type = (rawType || "CAR").toUpperCase();
  switch (type) {
    case "BIKE":
    case "MOTORCYCLE":
      return {
        type: "BIKE" as VehicleType,
        label: "Motorcycle / Bike",
        shortLabel: "Bike",
        defaultCapacity: 1,
        bgClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        iconBgClass: "bg-amber-500 text-white",
        badgeBg: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/40",
        Icon: Bike,
      };
    case "SCOOTER":
      return {
        type: "SCOOTER" as VehicleType,
        label: "Scooter",
        shortLabel: "Scooter",
        defaultCapacity: 1,
        bgClass: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
        iconBgClass: "bg-teal-500 text-white",
        badgeBg: "bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-800/40",
        Icon: Bike,
      };
    case "AUTO":
      return {
        type: "AUTO" as VehicleType,
        label: "Auto-Rickshaw",
        shortLabel: "Auto",
        defaultCapacity: 3,
        bgClass: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
        iconBgClass: "bg-orange-500 text-white",
        badgeBg: "bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800/40",
        Icon: Navigation,
      };
    case "CAR":
    default:
      return {
        type: "CAR" as VehicleType,
        label: "Car",
        shortLabel: "Car",
        defaultCapacity: 4,
        bgClass: "bg-primary/10 text-primary border-primary/20",
        iconBgClass: "bg-primary text-white",
        badgeBg: "bg-primary-subtle text-primary border-primary/20",
        Icon: Car,
      };
  }
}

export function VehicleVisual({
  type,
  className = "",
  size = "md",
  showLabel = false,
}: VehicleVisualProps) {
  const config = getVehicleConfig(type);
  const IconComponent = config.Icon;

  const sizeMap = {
    sm: { box: "h-7 w-7 rounded-lg", icon: "h-3.5 w-3.5", text: "text-xs" },
    md: { box: "h-10 w-10 rounded-xl", icon: "h-5 w-5", text: "text-xs" },
    lg: { box: "h-12 w-12 rounded-2xl", icon: "h-6 w-6", text: "text-sm" },
    xl: { box: "h-16 w-16 rounded-3xl", icon: "h-8 w-8", text: "text-base" },
  };

  const { box, icon, text } = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div
        className={`flex items-center justify-center font-bold shadow-soft transition ${box} ${config.bgClass} border`}
      >
        <IconComponent className={icon} />
      </div>
      {showLabel && (
        <span className={`font-extrabold ${config.bgClass.split(" ")[1]} ${text}`}>
          {config.label}
        </span>
      )}
    </div>
  );
}

export function VehicleBadge({
  type,
  capacity,
  className = "",
}: {
  type: string;
  capacity?: number;
  className?: string;
}) {
  const config = getVehicleConfig(type);
  const IconComponent = config.Icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold border shadow-soft ${config.badgeBg} ${className}`}
    >
      <IconComponent className="h-3 w-3 shrink-0" />
      <span>{config.shortLabel}</span>
      {capacity !== undefined && (
        <span className="opacity-75 font-normal">({capacity} seat{capacity > 1 ? "s" : ""})</span>
      )}
    </span>
  );
}
