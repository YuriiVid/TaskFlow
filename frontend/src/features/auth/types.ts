import { AppUser } from "@shared/types";

export interface LoginCredentials {
  userName: string;
  password: string;
}

export interface RegisterCredentials {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface UserDataResponse {
  user: AppUser;
  jwt: string;
}

export interface EmailConfirmation {
  email: string;
  token: string;
}

export interface PasswordReset {
  email: string;
  token: string;
  newPassword: string;
}

export interface TitleMessageResponse {
  title: string;
  message: string;
}
