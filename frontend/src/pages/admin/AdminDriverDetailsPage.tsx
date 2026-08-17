import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ShieldCheck,
  Car,
  Bike,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Loader2,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  getAdminDriver,
  approveAdminDriver,
  rejectAdminDriver,
} from "@/features/admin/api/admin.api";
import { Button } from "@/components/ui/Button";

export default function AdminDriverDetailsPage() {
  const { driverId } = useParams<{ driverId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "driver", driverId],
    queryFn: () => (driverId ? getAdminDriver(driverId) : Promise.resolve(null)),
    enabled: Boolean(driverId),
  });

  const driver = data?.data;

  const approveMutation = useMutation({
    mutationFn: () => (driverId ? approveAdminDriver(driverId) : Promise.resolve(null)),
    onSuccess: () => {
      toast.success("Driver application approved successfully.");
      queryClient.invalidateQueries({ queryKey: ["admin", "drivers", "pending"] });
      navigate("/admin/drivers");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to approve driver.");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () =>
      driverId ? rejectAdminDriver(driverId, rejectReason.trim()) : Promise.resolve(null),
    onSuccess: () => {
      toast.success("Driver application rejected.");
      setShowRejectModal(false);
      queryClient.invalidateQueries({ queryKey: ["admin", "drivers", "pending"] });
      navigate("/admin/drivers");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to reject driver.");
    },
  });

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageContainer>
    );
  }

  if (isError || !driver) {
    return (
      <PageContainer>
        <div className="rounded-3xl border border-border bg-surface p-12 text-center space-y-4">
          <AlertCircle className="h-10 w-10 text-danger mx-auto" />
          <h2 className="text-lg font-bold text-foreground">Driver Not Found</h2>
          <p className="text-xs text-foreground-secondary">
            The requested driver profile could not be located.
          </p>
          <Link
            to="/admin/drivers"
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-xs font-bold text-white"
          >
            Back to Drivers List
          </Link>
        </div>
      </PageContainer>
    );
  }

  const formattedDate = driver.createdAt
    ? new Date(driver.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Recent";

  return (
    <PageContainer>
      {/* Back button & Title */}
      <div className="mb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/admin/drivers")}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-surface border border-border text-foreground hover:bg-surface-subtle transition shadow-soft"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <PageHeader
          title={`${driver.firstName} ${driver.lastName}`}
          subtitle={`Driver Application ID: ${driver.driverId}`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Applicant & License & Vehicle */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Details Card */}
          <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft space-y-4">
            <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2 border-b border-border pb-3">
              <User className="h-4 w-4 text-primary" />
              <span>Applicant Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-foreground-secondary block">Full Name</span>
                <span className="font-bold text-foreground text-sm">
                  {driver.firstName} {driver.lastName}
                </span>
              </div>

              <div>
                <span className="text-foreground-secondary block">Student Status</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>College Verified</span>
                </span>
              </div>

              <div>
                <span className="text-foreground-secondary block">Email</span>
                <span className="font-bold text-foreground">{driver.email}</span>
              </div>

              {driver.phoneNumber && (
                <div>
                  <span className="text-foreground-secondary block">Phone</span>
                  <span className="font-bold text-foreground">{driver.phoneNumber}</span>
                </div>
              )}

              <div>
                <span className="text-foreground-secondary block">Application Date</span>
                <span className="font-bold text-foreground">{formattedDate}</span>
              </div>

              <div>
                <span className="text-foreground-secondary block">Status</span>
                <span className="rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-0.5 text-[11px] font-extrabold inline-block">
                  {driver.status}
                </span>
              </div>
            </div>
          </div>

          {/* Driver's License Document Card */}
          <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft space-y-4">
            <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2 border-b border-border pb-3">
              <FileText className="h-4 w-4 text-primary" />
              <span>Driving License Verification</span>
            </h3>

            <div className="text-xs space-y-1">
              <span className="text-foreground-secondary">License Number:</span>
              <span className="font-mono font-bold text-foreground text-sm block">
                {driver.drivingLicenseNumber}
              </span>
            </div>

            <div>
              <span className="text-foreground-secondary text-xs block mb-2">
                Uploaded License Document:
              </span>
              {driver.licenseImageUrl ? (
                <div className="rounded-2xl border border-border bg-surface-subtle p-3 overflow-hidden">
                  <img
                    src={driver.licenseImageUrl}
                    alt="Driver License"
                    className="max-h-72 w-full object-contain rounded-xl"
                  />
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-border p-6 text-center text-xs text-foreground-secondary">
                  No license image uploaded
                </div>
              )}
            </div>
          </div>

          {/* Vehicle Details Card */}
          {driver.vehicle && (
            <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft space-y-4">
              <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2 border-b border-border pb-3">
                {driver.vehicle.vehicleType === "BIKE" ? (
                  <Bike className="h-4 w-4 text-primary" />
                ) : (
                  <Car className="h-4 w-4 text-primary" />
                )}
                <span>Registered Vehicle</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-foreground-secondary block">Make & Model</span>
                  <span className="font-bold text-foreground">
                    {driver.vehicle.brand} {driver.vehicle.model}
                  </span>
                </div>

                <div>
                  <span className="text-foreground-secondary block">Plate / Reg</span>
                  <span className="font-mono font-bold text-foreground">
                    {driver.vehicle.registrationNumber}
                  </span>
                </div>

                <div>
                  <span className="text-foreground-secondary block">Capacity</span>
                  <span className="font-bold text-foreground">
                    {driver.vehicle.maxPassengerCapacity} Passengers
                  </span>
                </div>
              </div>

              {driver.vehicle.rcImageUrl && (
                <div className="pt-2">
                  <span className="text-foreground-secondary text-xs block mb-2">
                    Vehicle Photo:
                  </span>
                  <div className="rounded-2xl border border-border bg-surface-subtle p-3 overflow-hidden">
                    <img
                      src={driver.vehicle.rcImageUrl}
                      alt="Vehicle Photo"
                      className="max-h-64 w-full object-contain rounded-xl"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Decision Actions */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft space-y-5 sticky top-20">
            <h3 className="text-sm font-extrabold text-foreground">
              Application Decision
            </h3>
            <p className="text-xs text-foreground-secondary leading-relaxed">
              Verify that the driver's license number is valid and the documents are legible before granting driver privileges.
            </p>

            <div className="space-y-3 pt-2">
              <Button
                type="button"
                onClick={() => approveMutation.mutate()}
                loading={approveMutation.isPending}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl py-3.5 text-xs font-extrabold flex items-center justify-center gap-2 shadow-soft"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Approve Application</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => setShowRejectModal(true)}
                className="w-full border-danger/30 text-danger hover:bg-danger-subtle rounded-2xl py-3.5 text-xs font-extrabold flex items-center justify-center gap-2"
              >
                <XCircle className="h-4 w-4" />
                <span>Reject Application</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-6 shadow-premium space-y-4">
            <h3 className="text-base font-extrabold text-foreground">
              Reject Driver Application
            </h3>
            <p className="text-xs text-foreground-secondary leading-relaxed">
              Provide a reason for rejection. This explanation will be displayed to the applicant.
            </p>

            <textarea
              rows={3}
              placeholder="e.g. Driver's license document is blurry or expired. Please upload a clear photo."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full rounded-2xl border border-border bg-surface-subtle p-3 text-xs text-foreground placeholder:text-foreground-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="rounded-xl border border-border px-4 py-2 text-xs font-bold text-foreground hover:bg-surface-subtle"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => rejectMutation.mutate()}
                disabled={rejectMutation.isPending}
                className="rounded-xl bg-danger px-4 py-2 text-xs font-bold text-white hover:bg-danger/90 flex items-center gap-1.5"
              >
                {rejectMutation.isPending && <Loader2 className="h-3 w-3 animate-spin" />}
                <span>Confirm Rejection</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
