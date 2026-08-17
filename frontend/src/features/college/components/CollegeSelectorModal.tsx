import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, GraduationCap, Building2, Check, X } from "lucide-react";
import { getColleges } from "../api/college.api";
import type { CollegeResponse } from "../types/college.types";

export interface EnrichedCollege {
  id: string;
  name: string;
  shortName: string;
  cityState: string;
  latitude: number;
  longitude: number;
  isRecent?: boolean;
}

export const fallbackColleges: EnrichedCollege[] = [
  {
    id: "vrsec",
    name: "Velagapudi Ramakrishna Siddhartha Engineering College",
    shortName: "VRSEC",
    cityState: "Kanuru, Vijayawada, AP",
    latitude: 16.4839,
    longitude: 80.6937,
    isRecent: true,
  },
  {
    id: "pvpsit",
    name: "Prasad V. Potluri Siddhartha Institute of Technology",
    shortName: "PVPSIT",
    cityState: "Kanuru, Vijayawada, AP",
    latitude: 16.4886,
    longitude: 80.6974,
    isRecent: true,
  },
  {
    id: "klu",
    name: "KL Deemed to be University",
    shortName: "KLU",
    cityState: "Vaddeswaram, Guntur, AP",
    latitude: 16.4422,
    longitude: 80.6225,
    isRecent: false,
  },
  {
    id: "vitap",
    name: "VIT-AP University",
    shortName: "VIT-AP",
    cityState: "Amaravati, AP",
    latitude: 16.4971,
    longitude: 80.5002,
    isRecent: false,
  },
  {
    id: "srmap",
    name: "SRM University-AP",
    shortName: "SRM-AP",
    cityState: "Amaravati, AP",
    latitude: 16.4649,
    longitude: 80.5081,
    isRecent: false,
  },
  {
    id: "aliet",
    name: "Andhra Loyola Institute of Engineering and Technology",
    shortName: "ALIET",
    cityState: "Benz Circle, Vijayawada, AP",
    latitude: 16.5028,
    longitude: 80.6558,
    isRecent: false,
  },
  {
    id: "srkit",
    name: "SRK Institute of Technology",
    shortName: "SRKIT",
    cityState: "Enikepadu, Vijayawada, AP",
    latitude: 16.5298,
    longitude: 80.6972,
    isRecent: false,
  },
  {
    id: "pscmr",
    name: "Potti Sriramulu Chalavadi Mallikarjuna Rao College of Engineering and Technology",
    shortName: "PSCMR",
    cityState: "Kothapet, Vijayawada, AP",
    latitude: 16.5204,
    longitude: 80.6128,
    isRecent: false,
  },
  {
    id: "diet",
    name: "Dhanekula Institute of Engineering and Technology",
    shortName: "DIET",
    cityState: "Ganguru, Vijayawada, AP",
    latitude: 16.4716,
    longitude: 80.7303,
    isRecent: false,
  },
  {
    id: "nriit",
    name: "NRI Institute of Technology",
    shortName: "NRIIT",
    cityState: "Agiripalli, Vijayawada Rural, AP",
    latitude: 16.6669,
    longitude: 80.7719,
    isRecent: false,
  },
];

interface CollegeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (college: EnrichedCollege) => void;
  selectedCollegeId?: string | null;
}

export function CollegeSelectorModal({
  isOpen,
  onClose,
  onSelect,
  selectedCollegeId,
}: CollegeSelectorModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(
    selectedCollegeId || "vrsec"
  );

  const { data: collegesResponse } = useQuery({
    queryKey: ["colleges"],
    queryFn: getColleges,
    staleTime: 1000 * 60 * 30,
  });

  const allColleges = useMemo(() => {
    const backendColleges = collegesResponse?.data ?? [];
    if (backendColleges.length === 0) return fallbackColleges;

    return backendColleges.map((c: CollegeResponse, index: number) => {
      const match = fallbackColleges.find(
        (f) =>
          (c.shortName && f.shortName.toLowerCase() === c.shortName.toLowerCase()) ||
          f.name.toLowerCase() === c.name.toLowerCase()
      );

      const cityState =
        c.city && c.state
          ? `${c.city}, ${c.state}`
          : match?.cityState || "Campus Hub";

      const latitude = c.latitude || match?.latitude || 16.4839;
      const longitude = c.longitude || match?.longitude || 80.6937;

      return {
        id: c.id,
        name: c.name,
        shortName: c.shortName || match?.shortName || "Campus",
        cityState,
        latitude,
        longitude,
        isRecent: index < 2,
      };
    });
  }, [collegesResponse]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return allColleges;
    const q = searchQuery.toLowerCase();
    return allColleges.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.shortName && c.shortName.toLowerCase().includes(q)) ||
        c.cityState.toLowerCase().includes(q)
    );
  }, [allColleges, searchQuery]);

  const recentColleges = useMemo(
    () => filtered.filter((c) => c.isRecent),
    [filtered]
  );
  const supportedColleges = useMemo(
    () => filtered.filter((c) => !c.isRecent),
    [filtered]
  );

  if (!isOpen) return null;

  const handleConfirm = () => {
    const chosen = allColleges.find((c) => c.id === selectedId) || allColleges[0];
    if (chosen) {
      onSelect(chosen);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex max-h-[90vh] w-full max-w-md flex-col rounded-dialog bg-surface shadow-premium border border-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-5 pb-4">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Select your College
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-foreground-secondary hover:bg-surface-subtle transition"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-border-subtle bg-surface-subtle/50">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 h-4 w-4 text-foreground-secondary" />
            <input
              type="text"
              placeholder="Search institutions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-input border border-border bg-surface pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {recentColleges.length > 0 && (
            <div>
              <div className="mb-2 text-[11px] font-bold tracking-wider text-foreground-secondary uppercase">
                Recent Colleges
              </div>
              <div className="space-y-2">
                {recentColleges.map((college) => {
                  const isSelected = selectedId === college.id;
                  return (
                    <div
                      key={college.id}
                      onClick={() => setSelectedId(college.id)}
                      className={`flex items-center justify-between p-3.5 rounded-card border transition cursor-pointer ${
                        isSelected
                          ? "border-primary bg-primary-subtle/30 shadow-soft"
                          : "border-border hover:border-border-secondary hover:bg-surface-subtle"
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-subtle text-primary">
                          <GraduationCap className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-sm text-foreground truncate">
                            {college.name}
                          </div>
                          <div className="text-xs text-foreground-secondary">
                            {college.cityState}
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0 ml-3">
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded-full border transition ${
                            isSelected
                              ? "border-primary bg-primary text-white"
                              : "border-border-secondary bg-surface"
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {supportedColleges.length > 0 && (
            <div>
              <div className="mb-2 text-[11px] font-bold tracking-wider text-foreground-secondary uppercase">
                Supported Institutions
              </div>
              <div className="space-y-2">
                {supportedColleges.map((college) => {
                  const isSelected = selectedId === college.id;
                  return (
                    <div
                      key={college.id}
                      onClick={() => setSelectedId(college.id)}
                      className={`flex items-center justify-between p-3.5 rounded-card border transition cursor-pointer ${
                        isSelected
                          ? "border-primary bg-primary-subtle/30 shadow-soft"
                          : "border-border hover:border-border-secondary hover:bg-surface-subtle"
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary-subtle text-secondary">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-sm text-foreground truncate">
                            {college.name}
                          </div>
                          <div className="text-xs text-foreground-secondary">
                            {college.cityState}
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0 ml-3">
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded-full border transition ${
                            isSelected
                              ? "border-primary bg-primary text-white"
                              : "border-border-secondary bg-surface"
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {filtered.length === 0 && (
            <div className="py-8 text-center text-sm text-foreground-secondary">
              No institution found matching "{searchQuery}".
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="border-t border-border p-4 bg-surface">
          <button
            type="button"
            onClick={handleConfirm}
            className="w-full rounded-button bg-primary py-3 px-4 text-sm font-semibold text-white shadow-medium transition hover:bg-primary-hover active:scale-[0.99]"
          >
            Confirm Selection
          </button>
        </div>
      </div>
    </div>
  );
}
