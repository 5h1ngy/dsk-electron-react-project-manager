import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray, IsDate, ValidateNested, Min } from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { BaseDto, BaseResponseDto } from './base.dto';

export class CreateNoteDto extends BaseDto {
  @IsNotEmpty({ message: 'Content is required' })
  @IsString({ message: 'Content must be a string' })
  @IsOptional()
  @Expose()
  content: string | null;

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

export class UpdateNoteDto extends BaseDto {
  @IsNotEmpty({ message: 'Content is required' })
  @IsString({ message: 'Content must be a string' })
  @IsOptional()
  @Expose()
  content: string | null;

  constructor(content: string | null = null) {
    super();
    this.content = content;
  }
}

export class NoteResponseDto extends BaseDto {
  @IsNumber({}, { message: 'Note ID must be a number' })
  @Expose()
  id: number;

  @IsString({ message: 'Content must be a string' })
  @IsOptional()
  @Expose()
  content: string | null;

  @IsNumber({}, { message: 'User ID must be a number' })
  @Expose()
  userId: number;

  @IsOptional()
  @IsNumber({}, { message: 'Project ID must be a number' })
  @Expose()
  projectId: number | null;

  @IsOptional()
  @IsNumber({}, { message: 'Task ID must be a number' })
  @Expose()
  taskId: number | null;

  @IsDate()
  @Expose()
  createdAt: Date;

  @IsDate()
  @Expose()
  updatedAt: Date;

  @IsOptional()
  @IsString({ message: 'Title must be a string' })
  @Expose()
  title: string | null;

  constructor(
    id: number = 0,
    content: string | null = null,
    userId: number = 0,
    projectId: number | null = null,
    taskId: number | null = null,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date(),
    title: string | null = null
  ) {
    super();
    this.id = id;
    this.content = content;
    this.userId = userId;
    this.projectId = projectId;
    this.taskId = taskId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.title = title;
  }
}

export class SingleNoteResponseDto extends BaseResponseDto {
  @ValidateNested()
  @Type(() => NoteResponseDto)
  @Expose()
  note?: NoteResponseDto;

  constructor(
    success: boolean = true,
    message: string = 'Note operation completed successfully',
    note?: NoteResponseDto
  ) {
    super(success, message);
    this.note = note;
  }
}

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