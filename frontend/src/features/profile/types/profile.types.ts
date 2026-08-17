export type UUID = string;
export type LocalDateTime = string;

export type UserRole = "RIDER" | "DRIVER" | "ADMIN";
export type UserStatus = "PENDING_VERIFICATION" | "ACTIVE" | "BLOCKED";

export interface UserResponse {
  id: UUID;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  homeAddress?: string;
  homeLatitude?: number;
  homeLongitude?: number;
  emailVerified: boolean;
  collegeEmail?: string;
  collegeVerified: boolean;
  role: UserRole;
  status: UserStatus;
  createdAt?: LocalDateTime;
  updatedAt?: LocalDateTime;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  homeAddress?: string;
  homeLatitude?: number;
  homeLongitude?: number;
  collegeEmail?: string;
}
