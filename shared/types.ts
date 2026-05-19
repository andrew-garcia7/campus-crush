export type UserRole = "student" | "coach" | "admin";
export type VerificationStatus = "pending" | "verified" | "rejected";

export interface IUserPublic {
  id: string;
  fullName: string;
  age: number;
  university: string;
  bio: string;
  interests: string[];
  photos: string[];
  isVerified: boolean;
}

export interface IApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}
