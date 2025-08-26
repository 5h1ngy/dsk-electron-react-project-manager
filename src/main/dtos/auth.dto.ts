import { IsString, IsEmail, IsNotEmpty, IsOptional, IsNumber, Length, Matches } from 'class-validator';
import { Expose } from 'class-transformer';
import { BaseDto, BaseResponseDto } from './base.dto';

export class RegisterRequestDTO extends BaseDto {
  @IsNotEmpty({ message: 'Username is required' })
  @IsString({ message: 'Username must be a string' })
  @Length(3, 50, { message: 'Username must be between 3 and 50 characters' })
  @Expose()
  username!: string;

  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Expose()
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  @Length(8, 100, { message: 'Password must be between 8 and 100 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/, {
    message: 'Password must be at least 8 characters long, with 1 uppercase, 1 lowercase and 1 number',
  })
  @Expose()
  password: string;

  @IsNotEmpty({ message: 'Confirm password is required' })
  @IsString({ message: 'Confirm password must be a string' })
  @Expose()
  confirmPassword: string;

  constructor(username: string = '', email: string = '', password: string = '', confirmPassword: string = '') {
    super();
    this.username = username;
    this.email = email;
    this.password = password;
    this.confirmPassword = confirmPassword;
  }
}

export class RegisterResponseDTO extends BaseResponseDto {
  @IsOptional()
  @Expose()
  user?: UserResponseDTO;

  constructor(success: boolean = true, message?: string, user?: UserResponseDTO) {
    super(success, message);
    this.user = user;
  }
}

/**
 * DTO for user login request
 */
export class LoginRequestDTO extends BaseDto {
  @IsNotEmpty({ message: 'Username is required' })
  @IsString({ message: 'Username must be a string' })
  @Expose()
  username: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  @Expose()
  password: string;

  constructor(username: string = '', password: string = '') {
    super();
    this.username = username;
    this.password = password;
  }
}

export class LoginResponseDTO extends BaseResponseDto {
  @IsOptional()
  @Expose()
  user?: UserResponseDTO;

  @IsOptional()
  @IsString({ message: 'Access token must be a string' })
  @Expose()
  access_token?: string;
  
  @IsOptional()
  @IsString({ message: 'Refresh token must be a string' })
  @Expose()
  refresh_token?: string;
  
  @IsOptional()
  @IsString({ message: 'Token type must be a string' })
  @Expose()
  token_type?: string;

  constructor(success: boolean = true, message?: string, user?: UserResponseDTO, access_token?: string, refresh_token?: string, token_type?: string) {
    super(success, message);
    this.user = user;
    this.access_token = access_token;
    this.refresh_token = refresh_token;
    this.token_type = token_type;
  }
}

/**
 * DTO for user response (without sensitive data)
 */
export class UserResponseDTO extends BaseDto {
  @IsNumber({}, { message: 'User ID must be a number' })
  @Expose()
  id: number;

  @IsString({ message: 'Username must be a string' })
  @Expose()
  username: string;

  @IsEmail({}, { message: 'Email must be a valid email address' })
  @Expose()
  email: string;

  constructor(id: number = 0, username: string = '', email: string = '') {
    super();
    this.id = id;
    this.username = username;
    this.email = email;
  }
}

/**
 * DTO for database export response
 */
export class ExportDatabaseResponseDTO extends BaseResponseDto {
  @IsOptional()
  @IsString({ message: 'Exported data must be a string' })
  @Expose()
  data?: string;

  constructor(success: boolean = true, data?: string, message: string = 'Database exported successfully') {
    super(success, message);
    this.data = data;
  }
}

/**
 * DTO for database import request
 */
export class ImportDatabaseRequestDTO extends BaseDto {
  @IsNotEmpty({ message: 'Data is required' })
  @IsString({ message: 'Data must be a string' })
  @Expose()
  data: string;

  constructor(data: string = '') {
    super();
    this.data = data;
  }
}

/**
 * DTO for database import response
 */
export class ImportDatabaseResponseDTO extends BaseResponseDto {
  @IsOptional()
  @IsNumber({}, { message: 'Record count must be a number' })
  @Expose()
  recordCount?: number;

  constructor(success: boolean = true, message: string = 'Database imported successfully', recordCount: number = 0) {
    super(success, message);
    this.recordCount = recordCount;
  }
}
