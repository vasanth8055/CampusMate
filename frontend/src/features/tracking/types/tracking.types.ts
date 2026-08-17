export interface RideLocationResponse {
  id: string;
  tripId: string;
  driverId: string;
  latitude: number;
  longitude: number;
  speed: number | null;
  heading: number | null;
  accuracy: number | null;
  recordedAt: string;
  createdAt: string;
}

export interface LocationUpdateRequest {
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  accuracy?: number;
}
