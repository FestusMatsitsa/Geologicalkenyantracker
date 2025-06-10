import { apiRequest } from "./queryClient";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  fullName: string;
  bio?: string;
  fieldExperience?: string;
  education?: string;
  location?: string;
  skills?: string[];
}

export interface AuthResponse {
  user: {
    id: number;
    username: string;
    email: string;
    fullName: string;
    bio?: string;
    fieldExperience?: string;
    skills?: string[];
    education?: string;
    location?: string;
    availability?: string;
    profilePicture?: string;
    createdAt: string;
  };
  token: string;
}

/**
 * Login with email and password
 */
export async function loginUser(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await apiRequest("POST", "/api/auth/login", credentials);
  const data = await response.json();
  return data;
}

/**
 * Register a new user account
 */
export async function registerUser(userData: RegisterData): Promise<AuthResponse> {
  const response = await apiRequest("POST", "/api/auth/register", userData);
  const data = await response.json();
  return data;
}

/**
 * Get current user profile
 */
export async function getCurrentUser() {
  const response = await apiRequest("GET", "/api/users/me");
  const data = await response.json();
  return data;
}

/**
 * Update user profile
 */
export async function updateUserProfile(userData: Partial<RegisterData>) {
  const response = await apiRequest("PUT", "/api/users/me", userData);
  const data = await response.json();
  return data;
}

/**
 * Check if user is authenticated by verifying token
 */
export function isAuthenticated(): boolean {
  const token = localStorage.getItem("auth_token");
  return !!token;
}

/**
 * Get stored auth token
 */
export function getAuthToken(): string | null {
  return localStorage.getItem("auth_token");
}

/**
 * Get stored user data
 */
export function getStoredUser() {
  const userStr = localStorage.getItem("auth_user");
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error("Failed to parse stored user data:", error);
      return null;
    }
  }
  return null;
}

/**
 * Clear authentication data from localStorage
 */
export function clearAuthData(): void {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_user");
}

/**
 * Format user display name
 */
export function formatUserDisplayName(user: { fullName?: string; username?: string }): string {
  return user.fullName || user.username || "Unknown User";
}

/**
 * Get user initials for avatar
 */
export function getUserInitials(user: { fullName?: string; username?: string }): string {
  const name = formatUserDisplayName(user);
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Generate authorization header for API requests
 */
export function getAuthHeader(): Record<string, string> {
  const token = getAuthToken();
  if (token) {
    return {
      Authorization: `Bearer ${token}`,
    };
  }
  return {};
}

/**
 * Check if user has specific role or permission
 */
export function hasPermission(user: any, permission: string): boolean {
  // Basic implementation - can be extended based on role system
  if (!user) return false;
  
  // For now, all authenticated users have basic permissions
  const basicPermissions = [
    "create_post",
    "reply_to_post", 
    "post_job",
    "register_event",
    "upload_resource",
    "send_message"
  ];
  
  return basicPermissions.includes(permission);
}

/**
 * Format geological skills for display
 */
export function formatSkills(skills: string[] = []): string {
  if (skills.length === 0) return "No skills listed";
  if (skills.length <= 3) return skills.join(", ");
  return `${skills.slice(0, 3).join(", ")} +${skills.length - 3} more`;
}

/**
 * Parse skills from comma-separated string
 */
export function parseSkillsString(skillsStr: string): string[] {
  if (!skillsStr) return [];
  return skillsStr
    .split(",")
    .map(skill => skill.trim())
    .filter(skill => skill.length > 0);
}

/**
 * Generate professional URL slug from user data
 */
export function generateUserSlug(user: { username?: string; fullName?: string }): string {
  const name = user.username || user.fullName || "";
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Check if user profile is complete
 */
export function isProfileComplete(user: any): boolean {
  const requiredFields = ["fullName", "bio", "education", "location"];
  return requiredFields.every(field => user[field] && user[field].trim().length > 0);
}

/**
 * Get profile completion percentage
 */
export function getProfileCompletionPercentage(user: any): number {
  const fields = [
    "fullName",
    "bio", 
    "education",
    "location",
    "fieldExperience",
    "skills",
    "availability"
  ];
  
  const completedFields = fields.filter(field => {
    const value = user[field];
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return value && value.toString().trim().length > 0;
  });
  
  return Math.round((completedFields.length / fields.length) * 100);
}
