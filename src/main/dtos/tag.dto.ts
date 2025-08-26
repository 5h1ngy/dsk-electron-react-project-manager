import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray, IsDate, Length, ValidateNested, Min } from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { BaseDto, BaseResponseDto } from './base.dto';

/**
 * DTO for tag creation request
 */
export class CreateTagDto extends BaseDto {
  @IsNotEmpty({ message: 'Tag name is required' })
  @IsString({ message: 'Tag name must be a string' })
  @Length(1, 50, { message: 'Tag name must be between 1 and 50 characters' })
  @Expose()
  name: string;

  @IsOptional()
  @IsString({ message: 'Color must be a string' })
  @Length(4, 7, { message: 'Color must be a valid hex code' })
  @Expose()
  color?: string;

  constructor(name: string = '', color: string = '#6e6e6e') {
    super();
    this.name = name;
    this.color = color;
  }
}

/**
 * DTO for tag update request
 */
export class UpdateTagDto extends BaseDto {
  @IsOptional()
  @IsString({ message: 'Tag name must be a string' })
  @Length(1, 50, { message: 'Tag name must be between 1 and 50 characters' })
  @Expose()
  name?: string;

  @IsOptional()
  @IsString({ message: 'Color must be a string' })
  @Length(4, 7, { message: 'Color must be a valid hex code' })
  @Expose()
  color?: string;

  constructor(name?: string, color?: string) {
    super();
    this.name = name;
    this.color = color;
  }
}

/**
 * DTO for tag response
 */
export class TagResponseDto extends BaseDto {
  @IsNumber({}, { message: 'Tag ID must be a number' })
  @Expose()
  id: number;

  @IsString({ message: 'Tag name must be a string' })
  @Expose()
  name: string;

  @IsOptional()
  @IsString({ message: 'Color must be a string' })
  @Expose()
  color?: string;

  @IsDate()
  @Expose()
  createdAt: Date;

  @IsDate()
  @Expose()
  updatedAt: Date;

  constructor(
    id: number = 0, 
    name: string = '', 
    color: string = '#6e6e6e',
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ) {
    super();
    this.id = id;
    this.name = name;
    this.color = color;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

/**
 * DTO for tag list response
 */
export class TagListResponseDto extends BaseResponseDto {
  @IsArray({ message: 'Tags must be an array' })
  @ValidateNested({ each: true })
  @Type(() => TagResponseDto)
  @Expose()
  tags: TagResponseDto[];

  @IsOptional()
  @IsNumber({}, { message: 'Total count must be a number' })
  @Expose()
  totalCount?: number;

  constructor(
    success: boolean = true, 
    message: string = 'Tags retrieved successfully', 
    tags: TagResponseDto[] = [],
    totalCount?: number
  ) {
    super(success, message);
    this.tags = tags;
    this.totalCount = totalCount;
  }
}
