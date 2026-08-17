import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Activity,
  Navigation,
  RefreshCw,
  Car,
  AlertCircle,
} from "lucide-react";

import { getAdminActiveTrips } from "@/features/admin/api/admin.api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

// Custom Leaflet icons matching sleek neutral theme
const liveCarIcon = L.divIcon({
  html: `<div style="background-color:#18181b;color:#fff;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;box-shadow:0 3px 8px rgba(0,0,0,0.3);border:2px solid #fff;">🚗</div>`,
  className: "custom-car-pin",
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

const campusPinIcon = L.divIcon({
  html: `<div style="background-color:#52525b;color:#fff;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;box-shadow:0 2px 6px rgba(0,0,0,0.3);border:2px solid #fff;">📍</div>`,
  className: "custom-campus-pin",
  iconSize: [24, 24],
  iconAnchor: [12, 24],
});

export default function AdminActiveRidesPage() {
  const [selectedTrip, setSelectedTrip] = useState<any | null>(null);

  const { data: activeTripsRes, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["admin", "trips", "active"],
    queryFn: getAdminActiveTrips,
    staleTime: 1000 * 10,
    refetchInterval: 10000,
  });

  const activeRides = useMemo(() => {
    return Array.isArray(activeTripsRes?.data) ? activeTripsRes.data : [];
  }, [activeTripsRes]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Active Rides & Fleet Monitoring
            </h1>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Real-time GPS telemetry and vehicle positions across the Andhra Pradesh campus network.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-1.5 text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
            <span>{isFetching ? "Syncing..." : "Sync GPS"}</span>
          </Button>
        </div>
      </div>

      {/* ─── Error Alert ─── */}
      {isError && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-red-700 dark:text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
            <span>Unable to load active trips telemetry. {(error as any)?.message || "Service unavailable."}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="text-xs">
            Retry
          </Button>
        </div>
      )}

      {/* ─── Main Map & Sidebar Layout ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Real Leaflet Map */}
        <div className="lg:col-span-2">
          <Card className="h-[560px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs rounded-2xl overflow-hidden relative z-0">
            <MapContainer
              center={[16.5062, 80.648]} // Vijayawada / AP Hub
              zoom={12}
              scrollWheelZoom={true}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Campus Reference Markers */}
              <Marker position={[16.4839, 80.6934]} icon={campusPinIcon}>
                <Popup>
                  <div className="text-xs font-bold">VRSEC Siddhartha Campus</div>
                  <div className="text-[10px] text-zinc-500">Kanuru, Vijayawada</div>
                </Popup>
              </Marker>

              <Marker position={[16.4419, 80.6222]} icon={campusPinIcon}>
                <Popup>
                  <div className="text-xs font-bold">KL Deemed to be University</div>
                  <div className="text-[10px] text-zinc-500">Vaddeswaram, Guntur</div>
                </Popup>
              </Marker>

              <Marker position={[16.5062, 80.648]} icon={campusPinIcon}>
                <Popup>
                  <div className="text-xs font-bold">Benz Circle Transit Hub</div>
                  <div className="text-[10px] text-zinc-500">Vijayawada Center</div>
                </Popup>
              </Marker>

              {/* Live Active Vehicle Markers */}
              {activeRides.map((ride: any) => {
                const lat = ride.sourceLatitude || 16.4839;
                const lng = ride.sourceLongitude || 80.6934;

                return (
                  <Marker
                    key={ride.id}
                    position={[lat, lng]}
                    icon={liveCarIcon}
                    eventHandlers={{
                      click: () => setSelectedTrip(ride),
                    }}
                  >
                    <Popup>
                      <div className="text-xs space-y-1">
                        <div className="font-bold text-zinc-900">
                          {ride.source} ➔ {ride.destination}
                        </div>
                        <div className="text-[10px] text-zinc-500">
                          Driver: {ride.driverName || String(ride.driverId || "").slice(0, 8)}
                        </div>
                        <div className="text-[10px] text-emerald-600 font-bold">
                          Status: {ride.status}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </Card>
        </div>

        {/* Right Column (1 span): Active Rides List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-600" />
              <span>Live Rides ({activeRides.length})</span>
            </h2>
            <span className="text-[11px] text-zinc-500">Auto-refreshing (10s)</span>
          </div>

          <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs rounded-2xl p-4 max-h-[500px] overflow-y-auto space-y-3">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-zinc-500 flex flex-col items-center justify-center gap-2">
                <RefreshCw className="h-5 w-5 animate-spin text-zinc-400" />
                <span>Scanning active rides...</span>
              </div>
            ) : activeRides.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <Car className="mx-auto h-8 w-8 text-zinc-300 dark:text-zinc-600" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  No active rides in progress
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  When students start scheduled commute trips, live GPS telemetry and real-time positions will appear on this map.
                </p>
              </div>
            ) : (
              activeRides.map((ride: any) => {
                const isSelected = selectedTrip?.id === ride.id;

                return (
                  <div
                    key={ride.id}
                    onClick={() => setSelectedTrip(ride)}
                    className={`p-3.5 rounded-xl border text-xs cursor-pointer transition space-y-2 ${
                      isSelected
                        ? "border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-800"
                        : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold text-zinc-900 dark:text-zinc-100">
                        TRP-{String(ride.id || "").slice(0, 8)}
                      </span>
                      <span className="rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 px-2 py-0.5 text-[10px] font-bold border border-emerald-200">
                        {ride.status || "IN_PROGRESS"}
                      </span>
                    </div>

                    <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <Navigation className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                      <span>
                        {ride.source} ➔ {ride.destination}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 pt-1 border-t border-zinc-200/60 dark:border-zinc-800">
                      <span>Seats: {ride.availableSeats ?? 0} Avail</span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">
                        ₹{ride.farePerSeat}/seat
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
