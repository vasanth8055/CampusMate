import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Car,
  Bike,
  ShieldCheck,
  ArrowLeft,
  ClipboardList,
  CheckCircle2,
  AlertCircle,
  Upload,
  FileText,
  Loader2,
  Edit2,
  Wallet,
  Users,
  GraduationCap,
} from "lucide-react";

import { useAuthStore } from "@/features/auth/store/auth.store";
import { getCurrentUser } from "@/features/profile/api/profile.api";
import { getMyDriver, becomeDriver, uploadLicense } from "@/features/driver/api/driver.api";
import { getMyVehicle, registerVehicle, uploadRcImage } from "@/features/driver/vehicle/api/vehicle.api";
import { CollegeVerificationModal } from "@/features/college/components/CollegeVerificationModal";
import type { DriverResponse } from "@/features/driver/types/driver.types";
import type { VehicleResponse, VehicleType } from "@/features/driver/vehicle/types/vehicle.types";

export default function BecomeDriverPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const authUser = useAuthStore((state) => state.user);

  // Queries
  const { data: userRes } = useQuery({
    queryKey: ["user", "me"],
    queryFn: getCurrentUser,
    staleTime: 1000 * 60 * 2,
  });

  const { data: driverRes, isLoading: driverLoading } = useQuery({
    queryKey: ["driver", "me"],
    queryFn: getMyDriver,
    staleTime: 1000 * 60 * 2,
    retry: false,
  });

  const { data: vehicleRes } = useQuery({
    queryKey: ["driver", "vehicle", "me"],
    queryFn: getMyVehicle,
    staleTime: 1000 * 60 * 2,
    retry: false,
  });

  const userProfile = userRes?.data || null;
  const driver: DriverResponse | null = driverRes?.data || null;
  const vehicle: VehicleResponse | null = vehicleRes?.data || null;

  // Wizard state: 0 = Intro, 1 = License, 2 = Vehicle, 3 = Review
  const [wizardStep, setWizardStep] = useState<number>(0);
  const [isCollegeModalOpen, setIsCollegeModalOpen] = useState(false);

  // Step 1: License Form State
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [licensePreview, setLicensePreview] = useState<string | null>(null);
  const licenseInputRef = useRef<HTMLInputElement>(null);

  // Step 2: Vehicle Form State
  const [vehicleType, setVehicleType] = useState<VehicleType>("CAR");
  const [makeModel, setMakeModel] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [capacity, setCapacity] = useState<number>(4);
  const [vehicleFile, setVehicleFile] = useState<File | null>(null);
  const [vehiclePreview, setVehiclePreview] = useState<string | null>(null);
  const vehicleInputRef = useRef<HTMLInputElement>(null);

  // Pre-fill if existing draft/driver profile exists
  useEffect(() => {
    if (driver?.drivingLicenseNumber) {
      setLicenseNumber(driver.drivingLicenseNumber);
    }
    if (driver?.licenseImageUrl) {
      setLicensePreview(driver.licenseImageUrl);
    }
    if (vehicle) {
      setVehicleType(vehicle.vehicleType);
      setMakeModel(`${vehicle.brand} ${vehicle.model}`.trim());
      setRegistrationNumber(vehicle.registrationNumber);
      setCapacity(vehicle.maxPassengerCapacity);
      if (vehicle.rcImageUrl) {
        setVehiclePreview(vehicle.rcImageUrl);
      }
    }
  }, [driver, vehicle]);

  // License File Selection Handler
  const handleLicenseSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB limit.");
      return;
    }

    setLicenseFile(file);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setLicensePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setLicensePreview(null);
    }
  };

  // Vehicle File Selection Handler
  const handleVehicleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB limit.");
      return;
    }

    setVehicleFile(file);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setVehiclePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setVehiclePreview(null);
    }
  };

  // Submission Mutation (Calls becomeDriver, uploadLicense, registerVehicle, uploadRcImage)
  const submitApplicationMutation = useMutation({
    mutationFn: async () => {
      // 1. Create or update driver profile
      await becomeDriver({ drivingLicenseNumber: licenseNumber.trim() });

      // 2. Upload license if file selected
      if (licenseFile) {
        await uploadLicense(licenseFile);
      }

      // 3. Register vehicle
      const parts = makeModel.trim().split(" ");
      const brand = parts[0] || "Vehicle";
      const model = parts.slice(1).join(" ") || "Model";

      await registerVehicle({
        vehicleType,
        brand,
        model,
        color: "Standard",
        registrationNumber: registrationNumber.trim().toUpperCase(),
        maxPassengerCapacity: capacity,
      });

      // 4. Upload vehicle image if file selected
      if (vehicleFile) {
        await uploadRcImage(vehicleFile);
      }
    },
    onSuccess: () => {
      toast.success("Driver application submitted successfully!");
      qc.invalidateQueries({ queryKey: ["driver", "me"] });
      qc.invalidateQueries({ queryKey: ["driver", "vehicle", "me"] });
      setWizardStep(0);
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Could not submit driver application. Please review your details.";
      toast.error(msg);
    },
  });

  const handleStep1Continue = () => {
    if (!licenseNumber.trim()) {
      toast.error("Please enter your driving license number.");
      return;
    }
    if (!licenseFile && !licensePreview) {
      toast.error("Please upload a photo of your driver's license.");
      return;
    }
    setWizardStep(2);
  };

  const handleStep2Continue = () => {
    if (!makeModel.trim()) {
      toast.error("Please enter your vehicle make and model.");
      return;
    }
    if (!registrationNumber.trim()) {
      toast.error("Please enter your vehicle registration number.");
      return;
    }
    setWizardStep(3);
  };

  const handleFinalSubmit = () => {
    if (!userProfile?.collegeVerified) {
      toast.error("Please verify your college email first before submitting your driver application.");
      setIsCollegeModalOpen(true);
      return;
    }
    submitApplicationMutation.mutate();
  };

  if (driverLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const status = driver?.status;

  // =========================================================================
  // VIEW: APPROVED DRIVER
  // =========================================================================
  if (status === "APPROVED" && wizardStep === 0) {
    return (
      <div className="mx-auto max-w-md pb-24 lg:max-w-xl space-y-6 animate-in fade-in duration-300">
        <div className="rounded-3xl border border-emerald-500/20 bg-surface p-6 shadow-premium text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-foreground">
              Driver Profile Approved!
            </h2>
            <p className="text-xs text-foreground-secondary mt-1">
              Your driver application has been reviewed and verified by CampusMate operations.
            </p>
          </div>

          <div className="rounded-2xl bg-surface-subtle p-4 text-left space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-foreground-secondary">License:</span>
              <span className="font-bold text-foreground">{driver?.drivingLicenseNumber}</span>
            </div>
            {vehicle && (
              <div className="flex justify-between">
                <span className="text-foreground-secondary">Active Vehicle:</span>
                <span className="font-bold text-foreground">
                  {vehicle.brand} {vehicle.model} ({vehicle.registrationNumber})
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => navigate("/driver/dashboard")}
            className="w-full rounded-button bg-primary py-3.5 px-4 text-sm font-bold text-white shadow-medium transition hover:bg-primary-hover active:scale-[0.99]"
          >
            Go to Driver Dashboard
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: PENDING / UNDER REVIEW (Stitch UI #5)
  // =========================================================================
  if (
    (status === "PENDING" || status === "LICENSE_UPLOADED" || status === "UNDER_REVIEW") &&
    wizardStep === 0
  ) {
    const formattedDate = driver?.createdAt
      ? new Date(driver.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "Today";

    const appId = driver?.driverId
      ? `APP-${driver.driverId.slice(0, 4).toUpperCase()}-KT`
      : "APP-8942-KT";

    return (
      <div className="mx-auto max-w-md pb-24 lg:max-w-xl space-y-5 animate-in fade-in duration-300">
        {/* Header */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-surface border border-border text-foreground hover:bg-surface-subtle transition shadow-soft"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-foreground">Application Status</h1>
          </div>
        </div>

        {/* Pending Review Card (Stitch UI #5) */}
        <div className="rounded-3xl border border-border bg-surface p-6 shadow-premium text-center space-y-5">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-subtle text-primary shadow-soft">
            <ClipboardList className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-foreground">
              Application under review
            </h2>
            <p className="text-xs text-foreground-secondary leading-relaxed max-w-xs mx-auto">
              Thank you for applying to drive with us. Our team is currently reviewing your documents and background information. This process typically takes 1-3 business days.
            </p>
          </div>

          {/* Submission Info Box */}
          <div className="rounded-2xl bg-primary-subtle/30 border border-primary/10 p-4 text-xs space-y-2.5 text-left">
            <div className="flex justify-between items-center">
              <span className="text-foreground-secondary">Submission Date</span>
              <span className="font-bold text-foreground">{formattedDate}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-foreground-secondary">Application ID</span>
              <span className="font-mono font-bold text-foreground">{appId}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="w-full rounded-button bg-primary py-3.5 px-4 text-sm font-bold text-white shadow-medium transition hover:bg-primary-hover active:scale-[0.99]"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: REJECTED STATE
  // =========================================================================
  if (status === "REJECTED" && wizardStep === 0) {
    return (
      <div className="mx-auto max-w-md pb-24 lg:max-w-xl space-y-6 animate-in fade-in duration-300">
        <div className="rounded-3xl border border-danger/30 bg-surface p-6 shadow-premium text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-danger-subtle text-danger">
            <AlertCircle className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-foreground">
              Application Not Approved
            </h2>
            <p className="text-xs text-foreground-secondary mt-1 leading-relaxed">
              {driver?.rejectionReason ||
                "Your application did not meet our verification guidelines. You may update your documents and reapply."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setWizardStep(1)}
            className="w-full rounded-button bg-primary py-3.5 px-4 text-sm font-bold text-white shadow-medium transition hover:bg-primary-hover active:scale-[0.99]"
          >
            Update Application & Reapply
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: STEP 1 — LICENSE VERIFICATION (Stitch UI #2)
  // =========================================================================
  if (wizardStep === 1) {
    return (
      <div className="mx-auto max-w-md pb-24 lg:max-w-xl space-y-5 animate-in fade-in duration-300">
        {/* Header & Back */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => setWizardStep(0)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-surface border border-border text-foreground hover:bg-surface-subtle transition shadow-soft"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="text-xs font-bold text-foreground-secondary">
            Step 1 of 3
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 w-full rounded-full bg-surface-subtle overflow-hidden">
          <div className="h-full w-1/3 rounded-full bg-primary transition-all duration-300"></div>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            Verify your driving eligibility
          </h1>
          <p className="text-xs text-foreground-secondary leading-relaxed">
            Please upload a clear, legible photo of your valid driver's license. All corners must be visible.
          </p>
        </div>

        {/* License Number Input */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-foreground">
            Driver's License Number
          </label>
          <input
            type="text"
            placeholder="e.g. DL-9983-4421-X"
            value={licenseNumber}
            onChange={(e) => setLicenseNumber(e.target.value)}
            className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm font-semibold text-foreground placeholder:text-foreground-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* License Document Upload Card (Stitch UI #2) */}
        <div className="space-y-2">
          <input
            type="file"
            ref={licenseInputRef}
            onChange={handleLicenseSelect}
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className="hidden"
          />

          {!licenseFile && !licensePreview ? (
            <div
              onClick={() => licenseInputRef.current?.click()}
              className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-primary/40 bg-surface-subtle/50 p-8 text-center cursor-pointer hover:bg-primary-subtle/20 hover:border-primary transition group"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-subtle text-primary shadow-soft mb-3 group-hover:scale-105 transition">
                <Upload className="h-6 w-6" />
              </div>
              <div className="font-bold text-sm text-primary">
                Tap to upload your license
              </div>
              <div className="text-[11px] text-foreground-secondary mt-1">
                JPG, PNG, or PDF (Max 5MB)
              </div>
            </div>
          ) : (
            <div className="relative rounded-3xl border border-border bg-surface p-4 shadow-soft space-y-3">
              {licensePreview ? (
                <img
                  src={licensePreview}
                  alt="Driver License"
                  className="max-h-48 w-full object-contain rounded-2xl bg-surface-subtle"
                />
              ) : (
                <div className="flex items-center gap-3 p-4 bg-surface-subtle rounded-2xl">
                  <FileText className="h-8 w-8 text-primary" />
                  <span className="text-xs font-semibold text-foreground truncate">
                    {licenseFile?.name || "license_document.pdf"}
                  </span>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => licenseInputRef.current?.click()}
                  className="rounded-xl bg-surface-subtle px-3 py-1.5 text-xs font-bold text-foreground hover:bg-surface border border-border"
                >
                  Replace
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLicenseFile(null);
                    setLicensePreview(null);
                  }}
                  className="rounded-xl bg-danger-subtle px-3 py-1.5 text-xs font-bold text-danger hover:bg-danger/20"
                >
                  Remove
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Continue Button */}
        <button
          type="button"
          onClick={handleStep1Continue}
          className="w-full rounded-button bg-primary py-3.5 px-4 text-sm font-bold text-white shadow-medium transition hover:bg-primary-hover active:scale-[0.99]"
        >
          Continue
        </button>
      </div>
    );
  }

  // =========================================================================
  // VIEW: STEP 2 — VEHICLE DETAILS (Stitch UI #3)
  // =========================================================================
  if (wizardStep === 2) {
    return (
      <div className="mx-auto max-w-md pb-24 lg:max-w-xl space-y-5 animate-in fade-in duration-300">
        {/* Header & Back */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => setWizardStep(1)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-surface border border-border text-foreground hover:bg-surface-subtle transition shadow-soft"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="text-xs font-bold text-foreground-secondary">
            Step 2 of 3 • Vehicle Details
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 w-full rounded-full bg-surface-subtle overflow-hidden">
          <div className="h-full w-2/3 rounded-full bg-primary transition-all duration-300"></div>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            Tell us about your ride
          </h1>
          <p className="text-xs text-foreground-secondary">
            Provide your vehicle specifications for rider matching.
          </p>
        </div>

        {/* Vehicle Type Toggle (Stitch UI #3) */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-foreground">Vehicle Type</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setVehicleType("CAR");
                if (capacity < 2) setCapacity(4);
              }}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border text-sm font-bold transition ${
                vehicleType === "CAR"
                  ? "border-primary bg-primary-subtle/50 text-primary shadow-soft"
                  : "border-border bg-surface text-foreground-secondary hover:bg-surface-subtle"
              }`}
            >
              <Car className="h-4 w-4" />
              <span>Car</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setVehicleType("BIKE");
                setCapacity(1);
              }}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border text-sm font-bold transition ${
                vehicleType === "BIKE"
                  ? "border-primary bg-primary-subtle/50 text-primary shadow-soft"
                  : "border-border bg-surface text-foreground-secondary hover:bg-surface-subtle"
              }`}
            >
              <Bike className="h-4 w-4" />
              <span>Bike</span>
            </button>
          </div>
        </div>

        {/* Make & Model */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-foreground">Make & Model</label>
          <input
            type="text"
            placeholder="e.g. Honda Activa / Hyundai i20 / Maruti Swift"
            value={makeModel}
            onChange={(e) => setMakeModel(e.target.value)}
            className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm font-semibold text-foreground placeholder:text-foreground-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Registration Number */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-foreground">
            Registration Number
          </label>
          <input
            type="text"
            placeholder="e.g. AP 16 AB 1234"
            value={registrationNumber}
            onChange={(e) => setRegistrationNumber(e.target.value.toUpperCase())}
            className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm font-semibold text-foreground uppercase placeholder:text-foreground-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono"
          />

        </div>

        {/* Maximum Seating Capacity */}
        {vehicleType === "CAR" && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground">
              Maximum Seating Capacity (Including driver)
            </label>
            <select
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value={2}>2 Passengers</option>
              <option value={3}>3 Passengers</option>
              <option value={4}>4 Passengers</option>
              <option value={5}>5 Passengers</option>
              <option value={6}>6 Passengers</option>
            </select>
          </div>
        )}

        {/* Vehicle Photo Upload (Stitch UI #3) */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-foreground">Vehicle Photo</label>
          <p className="text-[11px] text-foreground-secondary">
            Upload a clear photo showing the front and side of your vehicle.
          </p>

          <input
            type="file"
            ref={vehicleInputRef}
            onChange={handleVehicleSelect}
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
          />

          {!vehicleFile && !vehiclePreview ? (
            <div
              onClick={() => vehicleInputRef.current?.click()}
              className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-primary/40 bg-surface-subtle/50 p-6 text-center cursor-pointer hover:bg-primary-subtle/20 hover:border-primary transition group"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-subtle text-primary shadow-soft mb-2 group-hover:scale-105 transition">
                <Upload className="h-5 w-5" />
              </div>
              <div className="font-bold text-sm text-primary">
                Tap to upload photo
              </div>
              <div className="text-[11px] text-foreground-secondary mt-0.5">
                JPG or PNG, max 5MB
              </div>
            </div>
          ) : (
            <div className="relative rounded-3xl border border-border bg-surface p-4 shadow-soft space-y-3">
              {vehiclePreview && (
                <img
                  src={vehiclePreview}
                  alt="Vehicle"
                  className="max-h-44 w-full object-contain rounded-2xl bg-surface-subtle"
                />
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => vehicleInputRef.current?.click()}
                  className="rounded-xl bg-surface-subtle px-3 py-1.5 text-xs font-bold text-foreground hover:bg-surface border border-border"
                >
                  Replace
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setVehicleFile(null);
                    setVehiclePreview(null);
                  }}
                  className="rounded-xl bg-danger-subtle px-3 py-1.5 text-xs font-bold text-danger hover:bg-danger/20"
                >
                  Remove
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Continue */}
        <button
          type="button"
          onClick={handleStep2Continue}
          className="w-full rounded-button bg-primary py-3.5 px-4 text-sm font-bold text-white shadow-medium transition hover:bg-primary-hover active:scale-[0.99]"
        >
          Continue
        </button>
      </div>
    );
  }

  // =========================================================================
  // VIEW: STEP 3 — REVIEW APPLICATION (Stitch UI #4)
  // =========================================================================
  if (wizardStep === 3) {
    return (
      <div className="mx-auto max-w-md pb-24 lg:max-w-xl space-y-5 animate-in fade-in duration-300">
        {/* Header & Back */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => setWizardStep(2)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-surface border border-border text-foreground hover:bg-surface-subtle transition shadow-soft"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-1 text-xs font-extrabold">
            Pending Review
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 w-full rounded-full bg-primary overflow-hidden"></div>

        <div className="space-y-1">
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            Review Application
          </h1>
        </div>

        {/* Info Callout */}
        <div className="flex items-start gap-3 rounded-2xl bg-primary-subtle/40 border border-primary/20 p-4 text-xs text-foreground leading-relaxed">
          <AlertCircle className="h-5 w-5 shrink-0 text-primary mt-0.5" />
          <span>
            Your application will be reviewed by CampusMate operations. Please ensure all details below are accurate before submitting.
          </span>
        </div>

        {/* Card 1: Personal Details */}
        <div className="rounded-3xl border border-border bg-surface p-5 shadow-soft space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-2.5">
            <span className="font-extrabold text-sm text-foreground">
              Personal Details
            </span>
            <button
              type="button"
              onClick={() => setWizardStep(1)}
              className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
            >
              <Edit2 className="h-3 w-3" />
              <span>Edit</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-foreground-secondary block">Full Name</span>
              <span className="font-bold text-foreground">
                {authUser?.firstName} {authUser?.lastName}
              </span>
            </div>
            <div>
              <span className="text-foreground-secondary block">College Status</span>
              {userProfile?.collegeVerified ? (
                <span className="font-bold text-emerald-600 dark:text-emerald-400 truncate block">
                  Verified ({userProfile?.collegeEmail || "Campus"})
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsCollegeModalOpen(true)}
                  className="font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
                >
                  <span>Not Verified — Click to Verify</span>
                </button>
              )}
            </div>
            <div className="col-span-2">
              <span className="text-foreground-secondary block">Email Address</span>
              <span className="font-bold text-foreground">{authUser?.email}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Driver's License */}
        <div className="rounded-3xl border border-border bg-surface p-5 shadow-soft space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-2.5">
            <span className="font-extrabold text-sm text-foreground">
              Driver's License
            </span>
            <button
              type="button"
              onClick={() => setWizardStep(1)}
              className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
            >
              <Edit2 className="h-3 w-3" />
              <span>Edit</span>
            </button>
          </div>

          {licensePreview && (
            <img
              src={licensePreview}
              alt="License preview"
              className="max-h-36 w-full object-contain rounded-2xl bg-surface-subtle"
            />
          )}

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-foreground-secondary block">License Number</span>
              <span className="font-mono font-bold text-foreground">{licenseNumber}</span>
            </div>
            <div>
              <span className="text-foreground-secondary block">Status</span>
              <span className="font-bold text-primary">Uploaded</span>
            </div>
          </div>
        </div>

        {/* Card 3: Vehicle Details */}
        <div className="rounded-3xl border border-border bg-surface p-5 shadow-soft space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-2.5">
            <span className="font-extrabold text-sm text-foreground">
              Vehicle Details
            </span>
            <button
              type="button"
              onClick={() => setWizardStep(2)}
              className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
            >
              <Edit2 className="h-3 w-3" />
              <span>Edit</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-subtle text-primary">
              {vehicleType === "CAR" ? (
                <Car className="h-5 w-5" />
              ) : (
                <Bike className="h-5 w-5" />
              )}
            </div>
            <div className="min-w-0">
              <div className="font-bold text-sm text-foreground">{makeModel}</div>
              <div className="text-xs text-foreground-secondary font-mono">
                {registrationNumber} • {capacity} Seats Capacity
              </div>
            </div>
          </div>
        </div>

        {/* Submit Application CTA */}
        <button
          type="button"
          onClick={handleFinalSubmit}
          disabled={submitApplicationMutation.isPending}
          className="w-full rounded-button bg-primary py-4 px-4 text-sm font-bold text-white shadow-medium transition hover:bg-primary-hover active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitApplicationMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Submitting Application...</span>
            </>
          ) : (
            <span>Submit Application</span>
          )}
        </button>
      </div>
    );
  }

  // =========================================================================
  // VIEW: HERO / NOT APPLIED (Stitch UI #1)
  // =========================================================================
  return (
    <div className="mx-auto max-w-md pb-24 lg:max-w-xl space-y-5 animate-in fade-in duration-300">
      {/* Header & Back */}
      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-surface border border-border text-foreground hover:bg-surface-subtle transition shadow-soft"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-foreground">Become a Driver</h1>
        </div>
      </div>

      {/* Hero Banner Card (Stitch UI #1) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-indigo-600 to-violet-700 p-6 text-white shadow-large space-y-3">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur-md">
            <span>Campus Mobility</span>
          </span>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
            <Car className="h-6 w-6" />
          </div>
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl font-black tracking-tight">Become a Driver</h2>
          <p className="text-xs text-white/90 leading-relaxed max-w-xs">
            Join our campus community and turn your daily drive into a rewarding experience.
          </p>
        </div>
      </div>

      {/* Benefits List (Stitch UI #1) */}
      <div className="rounded-3xl border border-border bg-surface p-5 shadow-soft space-y-4">
        {/* Feature 1 */}
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-subtle text-primary shadow-soft">
            <Car className="h-5 w-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-foreground">Share your commute</div>
            <div className="text-xs text-foreground-secondary mt-0.5">
              Post your regular routes and split costs easily.
            </div>
          </div>
        </div>

        {/* Feature 2 */}
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-secondary-subtle text-secondary shadow-soft">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-foreground">Help other students</div>
            <div className="text-xs text-foreground-secondary mt-0.5">
              Provide safe, reliable rides for your peers.
            </div>
          </div>
        </div>

        {/* Feature 3 */}
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 shadow-soft">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-foreground">Earn from available seats</div>
            <div className="text-xs text-foreground-secondary mt-0.5">
              Offset your gas and maintenance expenses.
            </div>
          </div>
        </div>
      </div>

      {/* Safety First Card (Stitch UI #1) */}
      <div className="flex items-start gap-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800/40 p-4 text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
        <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
        <span>
          Safety first. All drivers undergo a quick student ID verification and background review process.
        </span>
      </div>

      {/* College Email Verification Banner if unverified */}
      {!userProfile?.collegeVerified && (
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4 text-xs">
          <div className="flex items-start gap-2.5">
            <GraduationCap className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <span className="font-bold text-foreground block">
                College Email Verification Required
              </span>
              <span className="text-foreground-secondary text-[11px]">
                Verify your campus email to apply as a driver.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsCollegeModalOpen(true)}
            className="rounded-xl bg-amber-600 hover:bg-amber-700 px-3 py-1.5 text-xs font-bold text-white shadow-soft shrink-0"
          >
            Verify Now
          </button>
        </div>
      )}

      {/* CTAs */}
      <div className="space-y-2.5 pt-1">
        <button
          type="button"
          onClick={() => {
            if (!userProfile?.collegeVerified) {
              toast.error("Please verify your college email first before applying.");
              setIsCollegeModalOpen(true);
              return;
            }
            setWizardStep(1);
          }}
          className="w-full rounded-button bg-primary py-3.5 px-4 text-sm font-bold text-white shadow-medium transition hover:bg-primary-hover active:scale-[0.99]"
        >
          Get Started
        </button>
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="w-full rounded-button border border-border bg-surface py-3.5 px-4 text-sm font-bold text-foreground hover:bg-surface-subtle transition"
        >
          Maybe Later
        </button>
      </div>

      {/* College Verification Modal */}
      <CollegeVerificationModal
        isOpen={isCollegeModalOpen}
        onClose={() => setIsCollegeModalOpen(false)}
        initialCollegeEmail={userProfile?.collegeEmail || ""}
        onSuccess={() => qc.invalidateQueries({ queryKey: ["user", "me"] })}
      />
    </div>
  );
}
