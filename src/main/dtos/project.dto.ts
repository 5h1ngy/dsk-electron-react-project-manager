import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray, IsDate, IsBoolean, Length, Matches, ValidateNested, Min } from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { BaseDto, BaseResponseDto, PaginationDto } from './base.dto';
import { TagResponseDto } from './tag.dto';


export class CreateProjectDto extends BaseDto {
  @IsNotEmpty({ message: 'Project name is required' })
  @IsString({ message: 'Project name must be a string' })
  @Length(1, 100, { message: 'Project name must be between 1 and 100 characters' })
  @Expose()
  name: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @Expose()
  description?: string;

  @IsNotEmpty({ message: 'User ID is required' })
  @IsNumber({}, { message: 'User ID must be a number' })
  @Min(1, { message: 'User ID must be a positive number' })
  @Expose()
  userId: number;
  
  @IsOptional()
  @IsArray({ message: 'Tags must be an array' })
  @Expose()
  tags?: number[];

  constructor(name: string = '', description: string = '', userId: number = 0, tags: number[] = []) {
    super();
    this.name = name;
    this.description = description;
    this.userId = userId;
    this.tags = tags;
  }
}


export class UpdateProjectDto extends BaseDto {
  @IsOptional()
  @IsString({ message: 'Project name must be a string' })
  @Length(1, 100, { message: 'Project name must be between 1 and 100 characters' })
  @Expose()
  name?: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @Expose()
  description?: string;
  
  @IsOptional()
  @IsArray({ message: 'Tags must be an array' })
  @Expose()
  tags?: number[];

  constructor(name?: string, description?: string, tags?: number[]) {
    super();
    this.name = name;
    this.description = description;
    this.tags = tags;
  }
}


export class ProjectResponseDto extends BaseDto {
  @IsNumber({}, { message: 'Project ID must be a number' })
  @Expose()
  id: number;

  @IsString({ message: 'Project name must be a string' })
  @Expose()
  name: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @Expose()
  description?: string;

  @IsNumber({}, { message: 'User ID must be a number' })
  @Expose()
  userId: number;

  @IsOptional()
  @IsArray({ message: 'Tags must be an array' })
  @ValidateNested({ each: true })
  @Type(() => TagResponseDto)
  @Expose()
  tags?: TagResponseDto[];

  @IsDate()
  @Expose()
  createdAt: Date;

  @IsDate()
  @Expose()
  updatedAt: Date;

  constructor(
    id: number = 0, 
    name: string = '', 
    description: string = '', 
    userId: number = 0, 
    tags: TagResponseDto[] = [],
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ) {
    super();
    this.id = id;
    this.name = name;
    this.description = description;
    this.userId = userId;
    this.tags = tags;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}


export class SingleProjectResponseDto extends BaseResponseDto {
  @ValidateNested()
  @Type(() => ProjectResponseDto)
  @Expose()
  project?: ProjectResponseDto;

  constructor(
    success: boolean = true,
    message: string = 'Project operation completed successfully',
    project?: ProjectResponseDto
  ) {
    super(success, message);
    this.project = project;
  }
}

export class ProjectListResponseDto extends BaseResponseDto {
  @IsArray({ message: 'Projects must be an array' })
  @ValidateNested({ each: true })
  @Type(() => ProjectResponseDto)
  @Expose()
  projects: ProjectResponseDto[];

  @IsOptional()
  @IsNumber({}, { message: 'Total count must be a number' })
  @Expose()
  totalCount?: number;

  constructor(
    success: boolean = true, 
    message: string = 'Projects retrieved successfully', 
    projects: ProjectResponseDto[] = [],
    totalCount?: number
  ) {
    super(success, message);
    this.projects = projects;
    this.totalCount = totalCount;
  }
}


export class ProjectPaginationDto extends PaginationDto {
  @IsOptional()
  @IsString({ message: 'Search term must be a string' })
  @Expose()
  search?: string;

  @IsOptional()
  @IsBoolean({ message: 'Include completed must be a boolean' })
  @Expose()
  includeCompleted?: boolean;

  constructor(
    page: number = 1, 
    limit: number = 10, 
    search: string = '', 
    includeCompleted: boolean = true
  ) {
    super(page, limit);
    this.search = search;
    this.includeCompleted = includeCompleted;
  }
}
