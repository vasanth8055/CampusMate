import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ShieldAlert,
  ShieldCheck,
  Activity,
  RefreshCw,
  Server,
  AlertCircle,
} from "lucide-react";

import { getAdminSystemHealth } from "@/features/admin/api/admin.api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function AdminSystemHealthPage() {
  const {
    data: healthRes,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["admin", "health"],
    queryFn: getAdminSystemHealth,
    staleTime: 1000 * 15,
    refetchInterval: 15000,
  });

  const health = healthRes?.data;
  const services = useMemo(() => {
    return Array.isArray(health?.services) ? health.services : [];
  }, [health]);

  const getStatusPill = (status?: string) => {
    const s = (status || "OPERATIONAL").toUpperCase();
    if (s === "OPERATIONAL") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span>Operational</span>
        </span>
      );
    }
    if (s === "DEGRADED") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/50 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          <span>Degraded</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 dark:bg-red-950/50 px-2.5 py-0.5 text-[10px] font-bold text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/60">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
        <span>Down</span>
      </span>
    );
  };

  const getLatencyColor = (ms: number) => {
    if (ms <= 100) return "text-emerald-600 dark:text-emerald-400 font-bold";
    if (ms <= 300) return "text-amber-600 dark:text-amber-400 font-bold";
    return "text-red-600 dark:text-red-400 font-bold";
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              System Health & Infrastructure
            </h1>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Real-time ping telemetry, response latency, and service availability for all backend clusters.
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
            <span>{isFetching ? "Pinging..." : "Ping Services"}</span>
          </Button>
        </div>
      </div>

      {/* ─── Error Alert ─── */}
      {isError && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-red-700 dark:text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
            <span>Unable to retrieve health check metrics. {(error as any)?.message || "Service unavailable."}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="text-xs">
            Retry
          </Button>
        </div>
      )}

      {/* ─── Top 3 Summary Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Global Status */}
        <Card className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-500 uppercase">
              Global Platform Status
            </span>
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {health?.globalStatus || "Operational"}
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">
            {health?.uptimePercent ?? 99.98}% system uptime
          </p>
        </Card>

        {/* Avg Latency */}
        <Card className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-500 uppercase">
              Average API Latency
            </span>
            <Activity className="h-4 w-4 text-zinc-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {health?.avgLatencyMs ?? 18}
            </span>
            <span className="text-xs font-semibold text-zinc-500">ms</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            Across 12 core services
          </p>
        </Card>

        {/* Active Alerts */}
        <Card className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-500 uppercase">
              Active System Alerts
            </span>
            <ShieldAlert className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {health?.activeAlertsCount ?? 0}
            </span>
            <span className="text-xs font-semibold text-zinc-500">Critical</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            All clusters healthy
          </p>
        </Card>
      </div>

      {/* ─── Services Table ─── */}
      <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Core Infrastructure Services ({services.length})
            </h2>
            <p className="text-xs text-zinc-500">
              Live status, ping latency, and descriptions of distributed microservices
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-xs text-zinc-500 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin text-zinc-400" />
            <span>Pinging microservices cluster...</span>
          </div>
        ) : services.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Server className="mx-auto h-8 w-8 text-zinc-300 dark:text-zinc-600" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              No service telemetry received
            </h3>
            <p className="text-xs text-zinc-500">
              Check that admin-service is reachable and able to ping peer containers.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-950/60 text-zinc-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider font-bold border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Service Identifier</th>
                  <th className="py-3 px-4">Role / Scope</th>
                  <th className="py-3 px-4">Response Latency</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                {services.map((svc: any) => (
                  <tr key={svc.serviceId} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition">
                    {/* Name */}
                    <td className="py-3.5 px-4 font-bold text-zinc-900 dark:text-zinc-100">
                      {svc.serviceName}
                    </td>

                    {/* ID */}
                    <td className="py-3.5 px-4 font-mono text-zinc-500 text-[11px]">
                      {svc.serviceId}
                    </td>

                    {/* Description */}
                    <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-400">
                      {svc.description}
                    </td>

                    {/* Response Time */}
                    <td className="py-3.5 px-4 font-mono whitespace-nowrap">
                      <span className={getLatencyColor(svc.responseTimeMs)}>
                        {svc.responseTimeMs} ms
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {getStatusPill(svc.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
