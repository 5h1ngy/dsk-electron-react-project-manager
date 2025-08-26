/**
 * DTO for user registration request
 */
export interface UserRegistrationDto {
  username: string;
  email: string;
  password: string;
}

/**
 * DTO for user login request
 */
export interface UserLoginDto {
  username: string;
  password: string;
}

/**
 * DTO for user response (without sensitive data)
 */
export interface UserResponseDto {
  id: number;
  username: string;
  email: string;
}

/**
 * DTO for registration response
 */
export interface RegisterResponseDto {
  success: boolean;
  message?: string;
  user?: UserResponseDto;
}

/**
 * DTO for login response
 */
export interface LoginResponseDto {
  success: boolean;
  message?: string;
  user?: UserResponseDto;
}

/**
 * DTO for database export response
 */
export interface ExportDatabaseResponseDto {
  success: boolean;
  data?: string;
  message?: string;
}

/**
 * DTO for database import request
 */
export interface ImportDatabaseRequestDto {
  data: string;
}

/**
 * DTO for database import response
 */
export interface ImportDatabaseResponseDto {
  success: boolean;
  message?: string;
}
