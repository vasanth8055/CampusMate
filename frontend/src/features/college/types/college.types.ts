export type UUID = string;

export interface CollegeResponse {
  id: UUID;
  name: string;
  shortName?: string;
  emailDomain?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}
