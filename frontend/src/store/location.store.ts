import { create } from "zustand";
import { persist } from "zustand/middleware";
import { reverseGeocode, type GeocodedAddress } from "@/features/location/services/geocoding";
import { updateCurrentUser } from "@/features/profile/api/profile.api";
import type { CollegeResponse } from "@/features/college/types/college.types";

export interface SavedLocation {
  address: string;
  latitude: number;
  longitude: number;
}

export interface SelectedCollegeInfo {
  id: string;
  name: string;
  shortName: string;
  cityState: string;
  latitude: number;
  longitude: number;
}

// Verified real fallback for VRSEC (Vijayawada)
export const DEFAULT_COLLEGE: SelectedCollegeInfo = {
  id: "vrsec",
  name: "Velagapudi Ramakrishna Siddhartha Engineering College",
  shortName: "VRSEC",
  cityState: "Vijayawada, AP",
  latitude: 16.4839,
  longitude: 80.6937,
};

interface LocationState {
  // 1. Current Live Location (Physical GPS)
  currentCoords: [number, number] | null;
  currentAddress: string | null;
  isLocating: boolean;
  locationError: string | null;

  // 2. Persisted Saved Home Location
  homeLocation: SavedLocation | null;

  // 3. Selected College Location (From Backend Institution Data)
  selectedCollege: SelectedCollegeInfo;

  // Actions
  fetchCurrentLocation: (force?: boolean) => Promise<GeocodedAddress | null>;
  saveHomeLocation: (home: SavedLocation) => Promise<void>;
  setHomeFromCurrentLocation: () => Promise<SavedLocation | null>;
  setSelectedCollege: (college: CollegeResponse | SelectedCollegeInfo) => void;
  syncFromUserProfile: (userProfile: any) => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set, get) => ({
      currentCoords: null,
      currentAddress: null,
      isLocating: false,
      locationError: null,

      homeLocation: null,
      selectedCollege: DEFAULT_COLLEGE,

      fetchCurrentLocation: async (force = false) => {
        if (!navigator.geolocation) {
          set({ locationError: "Geolocation is not supported by your browser." });
          return null;
        }

        const state = get();
        if (!force && state.currentCoords && state.currentAddress && !state.locationError) {
          return {
            latitude: state.currentCoords[0],
            longitude: state.currentCoords[1],
            formattedAddress: state.currentAddress,
          };
        }

        set({ isLocating: true, locationError: null });

        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              const lat = pos.coords.latitude;
              const lng = pos.coords.longitude;

              try {
                const geo = await reverseGeocode(lat, lng);
                set({
                  currentCoords: [lat, lng],
                  currentAddress: geo.formattedAddress,
                  isLocating: false,
                  locationError: null,
                });
                resolve(geo);
              } catch {
                const fallbackAddress = `Current Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
                set({
                  currentCoords: [lat, lng],
                  currentAddress: fallbackAddress,
                  isLocating: false,
                  locationError: null,
                });
                resolve({
                  latitude: lat,
                  longitude: lng,
                  formattedAddress: fallbackAddress,
                });
              }
            },
            (err) => {
              console.warn("Geolocation permission or retrieval issue:", err.message);
              set({
                isLocating: false,
                locationError: err.message || "Location permission denied",
              });
              resolve(null);
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 60000,
            }
          );
        });
      },

      saveHomeLocation: async (home: SavedLocation) => {
        set({ homeLocation: home });

        // Persist to backend user profile if token exists
        try {
          if (localStorage.getItem("accessToken")) {
            await updateCurrentUser({
              homeAddress: home.address,
              homeLatitude: home.latitude,
              homeLongitude: home.longitude,
            });
          }
        } catch (err) {
          console.warn("Could not sync home location to backend user profile:", err);
        }
      },

      setHomeFromCurrentLocation: async () => {
        const state = get();
        let coords = state.currentCoords;
        let address = state.currentAddress;

        if (!coords || !address) {
          const fresh = await get().fetchCurrentLocation(true);
          if (fresh) {
            coords = [fresh.latitude, fresh.longitude];
            address = fresh.formattedAddress;
          }
        }

        if (coords && address) {
          const home: SavedLocation = {
            address,
            latitude: coords[0],
            longitude: coords[1],
          };
          await get().saveHomeLocation(home);
          return home;
        }

        return null;
      },

      setSelectedCollege: (college: CollegeResponse | SelectedCollegeInfo) => {
        const lat = college.latitude || DEFAULT_COLLEGE.latitude;
        const lng = college.longitude || DEFAULT_COLLEGE.longitude;
        const cityState =
          (college as any).city && (college as any).state
            ? `${(college as any).city}, ${(college as any).state}`
            : (college as any).cityState || "Campus Hub";

        set({
          selectedCollege: {
            id: college.id,
            name: college.name,
            shortName: college.shortName || "Campus",
            cityState,
            latitude: lat,
            longitude: lng,
          },
        });
      },

      syncFromUserProfile: (userProfile: any) => {
        if (
          userProfile?.homeAddress &&
          userProfile?.homeLatitude != null &&
          userProfile?.homeLongitude != null
        ) {
          set({
            homeLocation: {
              address: userProfile.homeAddress,
              latitude: userProfile.homeLatitude,
              longitude: userProfile.homeLongitude,
            },
          });
        }
      },
    }),
    {
      name: "rideloop_location_store",
      partialize: (state) => ({
        homeLocation: state.homeLocation,
        selectedCollege: state.selectedCollege,
      }),
    }
  )
);
