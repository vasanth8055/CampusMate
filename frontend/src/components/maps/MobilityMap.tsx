import { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Locate } from "lucide-react";

// Fix default leaflet icons
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export interface MapCoordinates {
  lat: number;
  lng: number;
}

export interface MobilityMapProps {
  center?: [number, number];
  zoom?: number;
  riderLocation?: [number, number] | null;
  pickupLocation?: [number, number] | null;
  destinationLocation?: [number, number] | null;
  destinationLabel?: string;
  driverLocation?: [number, number] | null;
  driverHeading?: number;
  driverLabel?: string;
  routePolyline?: [number, number][] | null;
  interactive?: boolean;
  onMapClick?: (coords: [number, number]) => void;
  className?: string;
  showLocateButton?: boolean;
  onLocateUser?: () => void;
  padding?: [number, number];
}

// Custom DivIcons matching CampusMate Design
const createRiderDotIcon = () =>
  L.divIcon({
    className: "custom-rider-dot",
    html: `
      <div style="position: relative; width: 22px; height: 22px;">
        <div style="position: absolute; inset: 0; background: rgba(67, 56, 202, 0.25); border-radius: 9999px; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="position: absolute; inset: 3px; background: #4338ca; border: 2.5px solid #ffffff; border-radius: 9999px; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>
      </div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });

const createPickupPinIcon = () =>
  L.divIcon({
    className: "custom-pickup-pin",
    html: `
      <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer;">
        <div style="background: #4338ca; color: white; padding: 5px 8px; border-radius: 8px; font-size: 11px; font-weight: 700; box-shadow: 0 4px 10px rgba(67,56,202,0.4); display: flex; align-items: center; gap: 4px; border: 1.5px solid #ffffff;">
          <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #ffffff;"></span>
          <span>PICKUP</span>
        </div>
        <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 6px solid #4338ca; margin-top: -1px;"></div>
      </div>
    `,
    iconSize: [64, 34],
    iconAnchor: [32, 34],
  });

const createDestinationPinIcon = (label?: string) =>
  L.divIcon({
    className: "custom-destination-pin",
    html: `
      <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer;">
        <div style="background: #1e1b4b; color: white; padding: 5px 8px; border-radius: 8px; font-size: 11px; font-weight: 700; box-shadow: 0 4px 10px rgba(30,27,75,0.4); display: flex; align-items: center; gap: 4px; border: 1.5px solid #a5b4fc;">
          <span>📍</span>
          <span>${(label || "DROPOFF").toUpperCase()}</span>
        </div>
        <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 6px solid #1e1b4b; margin-top: -1px;"></div>
      </div>
    `,
    iconSize: [80, 34],
    iconAnchor: [40, 34],
  });

const createDriverCarIcon = (heading?: number, label?: string) =>
  L.divIcon({
    className: "custom-driver-car",
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
        ${
          label
            ? `<div style="background: #ffffff; color: #1e1b4b; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 6px; box-shadow: 0 2px 6px rgba(0,0,0,0.15); margin-bottom: 2px; white-space: nowrap; border: 1px solid #e0e7ff;">${label}</div>`
            : ""
        }
        <div style="width: 38px; height: 38px; background: #4338ca; border: 2.5px solid #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(67,56,202,0.45); transform: rotate(${
          heading ?? 0
        }deg); transition: transform 0.3s ease;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
            <circle cx="7" cy="17" r="2"/>
            <path d="M9 17h6"/>
            <circle cx="17" cy="17" r="2"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [44, 52],
    iconAnchor: [22, label ? 46 : 22],
  });

function MapController({
  routePolyline,
  markers,
  center,
  padding = [50, 50],
}: {
  routePolyline?: [number, number][] | null;
  markers: ([number, number] | null | undefined)[];
  center?: [number, number];
  padding?: [number, number];
}) {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        map.invalidateSize();
      } catch {}
    }, 200);
    return () => clearTimeout(timer);
  }, [map]);

  const markerKey = markers
    .map((m) => (m && Array.isArray(m) ? `${m[0].toFixed(4)},${m[1].toFixed(4)}` : "null"))
    .join(";");

  const polylineKey = routePolyline
    ? `${routePolyline.length}_${routePolyline[0]?.join(",")}_${routePolyline[routePolyline.length - 1]?.join(",")}`
    : "none";

  useEffect(() => {
    const validMarkers = markers.filter(
      (m): m is [number, number] => Array.isArray(m) && m.length === 2 && !isNaN(m[0]) && !isNaN(m[1])
    );

    try {
      if (routePolyline && routePolyline.length > 1) {
        const bounds = L.latLngBounds(routePolyline);
        validMarkers.forEach((m) => bounds.extend(m));
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding, maxZoom: 16 });
        }
      } else if (validMarkers.length > 1) {
        const bounds = L.latLngBounds(validMarkers);
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding, maxZoom: 16 });
        }
      } else if (validMarkers.length === 1) {
        map.setView(validMarkers[0], 14, { animate: true });
      } else if (center && !isNaN(center[0]) && !isNaN(center[1])) {
        map.setView(center, map.getZoom() || 13, { animate: true });
      }
    } catch (err) {
      console.warn("MapController positioning fallback:", err);
    }
  }, [map, markerKey, polylineKey, padding]);

  return null;
}

function MapEventsHandler({ onMapClick }: { onMapClick?: (coords: [number, number]) => void }) {
  useMapEvents({
    click(e: any) {
      if (onMapClick && e?.latlng) {
        onMapClick([e.latlng.lat, e.latlng.lng]);
      }
    },
  });
  return null;
}

const DEFAULT_MAP_CENTER: [number, number] = [16.5062, 80.648];

export function MobilityMap({
  center,
  zoom = 13,
  riderLocation,
  pickupLocation,
  destinationLocation,
  destinationLabel,
  driverLocation,
  driverHeading,
  driverLabel,
  routePolyline,
  interactive = true,
  onMapClick,
  className = "h-full w-full",
  showLocateButton = true,
  onLocateUser,
  padding = [50, 50],
}: MobilityMapProps) {
  const riderIcon = useMemo(() => createRiderDotIcon(), []);
  const pickupIcon = useMemo(() => createPickupPinIcon(), []);
  const destIcon = useMemo(
    () => createDestinationPinIcon(destinationLabel),
    [destinationLabel]
  );
  const driverIcon = useMemo(
    () => createDriverCarIcon(driverHeading, driverLabel),
    [driverHeading, driverLabel]
  );

  const rawCenter =
    driverLocation || riderLocation || pickupLocation || destinationLocation || center;

  const validCenter: [number, number] =
    rawCenter &&
    Array.isArray(rawCenter) &&
    rawCenter.length === 2 &&
    !isNaN(rawCenter[0]) &&
    !isNaN(rawCenter[1])
      ? rawCenter
      : DEFAULT_MAP_CENTER;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <MapContainer
        center={validCenter}
        zoom={zoom}
        scrollWheelZoom={interactive}
        dragging={interactive}
        zoomControl={false}
        attributionControl={false}
        className="h-full w-full z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {riderLocation && (
          <Marker position={riderLocation} icon={riderIcon} />
        )}

        {pickupLocation && (
          <Marker position={pickupLocation} icon={pickupIcon} />
        )}

        {destinationLocation && (
          <Marker position={destinationLocation} icon={destIcon} />
        )}

        {driverLocation && (
          <Marker position={driverLocation} icon={driverIcon} />
        )}

        {routePolyline && routePolyline.length > 1 && (
          <>
            {/* Soft outer glow */}
            <Polyline
              positions={routePolyline}
              pathOptions={{
                color: "#818cf8",
                weight: 8,
                opacity: 0.35,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
            {/* Sharp inner route */}
            <Polyline
              positions={routePolyline}
              pathOptions={{
                color: "#4338ca",
                weight: 5,
                opacity: 0.95,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
          </>
        )}

        <MapController
          routePolyline={routePolyline}
          markers={[riderLocation, pickupLocation, destinationLocation, driverLocation]}
          center={center}
          padding={padding}
        />

        {onMapClick && <MapEventsHandler onMapClick={onMapClick} />}
      </MapContainer>

      {/* Locate Me FAB Button */}
      {showLocateButton && (
        <button
          type="button"
          onClick={onLocateUser}
          className="absolute bottom-4 right-4 z-[10] flex h-11 w-11 items-center justify-center rounded-full bg-surface text-primary shadow-large border border-border transition hover:scale-105 hover:bg-surface-elevated active:scale-95"
          title="Center on my location"
          aria-label="Locate me"
        >
          <Locate className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
