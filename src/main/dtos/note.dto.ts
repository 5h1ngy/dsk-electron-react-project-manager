import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray, IsDate, ValidateNested, Min } from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { BaseDto, BaseResponseDto, PaginationDto } from './base.dto';

/**
 * DTO per la creazione di una nota
 */
export class CreateNoteDto extends BaseDto {
  @IsNotEmpty({ message: 'Content is required' })
  @IsString({ message: 'Content must be a string' })
  @Expose()
  content: string;

  @IsNotEmpty({ message: 'User ID is required' })
  @IsNumber({}, { message: 'User ID must be a number' })
  @Min(1, { message: 'User ID must be a positive number' })
  @Expose()
  userId: number;

  @IsOptional()
  @IsNumber({}, { message: 'Project ID must be a number' })
  @Min(1, { message: 'Project ID must be a positive number' })
  @Expose()
  projectId?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Task ID must be a number' })
  @Min(1, { message: 'Task ID must be a positive number' })
  @Expose()
  taskId?: number;

  constructor(
    content: string = '',
    userId: number = 0,
    projectId?: number,
    taskId?: number
  ) {
    super();
    this.content = content;
    this.userId = userId;
    this.projectId = projectId;
    this.taskId = taskId;
  }
}

/**
 * DTO per l'aggiornamento del contenuto di una nota
 */
export class UpdateNoteDto extends BaseDto {
  @IsNotEmpty({ message: 'Content is required' })
  @IsString({ message: 'Content must be a string' })
  @Expose()
  content: string;

  constructor(content: string = '') {
    super();
    this.content = content;
  }
}

/**
 * DTO per la risposta di una nota
 */
export class NoteResponseDto extends BaseDto {
  @IsNumber({}, { message: 'Note ID must be a number' })
  @Expose()
  id: number;

  @IsString({ message: 'Content must be a string' })
  @Expose()
  content: string;

  @IsNumber({}, { message: 'User ID must be a number' })
  @Expose()
  userId: number;

  @IsOptional()
  @IsNumber({}, { message: 'Project ID must be a number' })
  @Expose()
  projectId?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Task ID must be a number' })
  @Expose()
  taskId?: number;

  @IsDate()
  @Expose()
  createdAt: Date;

  @IsDate()
  @Expose()
  updatedAt: Date;

  constructor(
    id: number = 0,
    content: string = '',
    userId: number = 0,
    projectId?: number,
    taskId?: number,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ) {
    super();
    this.id = id;
    this.content = content;
    this.userId = userId;
    this.projectId = projectId;
    this.taskId = taskId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

/**
 * DTO per la risposta di una lista di note
 */
export class NoteListResponseDto extends BaseResponseDto {
  @IsArray({ message: 'Notes must be an array' })
  @ValidateNested({ each: true })
  @Type(() => NoteResponseDto)
  @Expose()
  notes: NoteResponseDto[];

  @IsOptional()
  @IsNumber({}, { message: 'Total count must be a number' })
  @Expose()
  totalCount?: number;

  constructor(
    success: boolean = true,
    message: string = 'Notes retrieved successfully',
    notes: NoteResponseDto[] = [],
    totalCount?: number
  ) {
    super(success, message);
    this.notes = notes;
    this.totalCount = totalCount;
  }
}

/**
 * DTO per la richiesta di paginazione delle note
 */
export class NotePaginationDto extends PaginationDto {
  @IsOptional()
  @IsString({ message: 'Search term must be a string' })
  @Expose()
  search?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Project ID must be a number' })
  @Expose()
  projectId?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Task ID must be a number' })
  @Expose()
  taskId?: number;

  @IsOptional()
  @IsNumber({}, { message: 'User ID must be a number' })
  @Expose()
  userId?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Folder ID must be a number' })
  @Expose()
  folderId?: number;

  constructor(
    page: number = 1,
    limit: number = 10,
    search: string = '',
    projectId?: number,
    taskId?: number,
    userId?: number,
    folderId?: number
  ) {
    super(page, limit);
    this.search = search;
    this.projectId = projectId;
    this.taskId = taskId;
    this.userId = userId;
    this.folderId = folderId;
  }
}
