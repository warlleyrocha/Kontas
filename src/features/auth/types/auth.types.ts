import type { User } from "@/src/features/user/types/user.types";
export interface GoogleLoginRequest {
  token: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
}
