import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray, IsDate, IsEnum, IsBoolean, Length, ValidateNested, Min } from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { BaseDto, BaseResponseDto, PaginationDto } from './base.dto';
import { TagResponseDto } from './tag.dto';

// Enum per lo stato del task
export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'inProgress',
  REVIEW = 'review',
  DONE = 'done',
  BLOCKED = 'blocked'
}

// Enum per la priorità del task
export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * DTO per la creazione di un task
 */
export class CreateTaskDto extends BaseDto {
  @IsNotEmpty({ message: 'Task title is required' })
  @IsString({ message: 'Task title must be a string' })
  @Length(1, 200, { message: 'Task title must be between 1 and 200 characters' })
  @Expose()
  title: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @Expose()
  description?: string;

  @IsNotEmpty({ message: 'Status is required' })
  @IsEnum(TaskStatus, { message: 'Status must be one of: todo, in_progress, review, done' })
  @Expose()
  status: TaskStatus;

  @IsNotEmpty({ message: 'Priority is required' })
  @IsEnum(TaskPriority, { message: 'Priority must be one of: low, medium, high, urgent' })
  @Expose()
  priority: TaskPriority;

  @IsOptional()
  @IsString({ message: 'Due date must be a string' })
  @Expose()
  dueDate?: string;

  @IsNotEmpty({ message: 'Project ID is required' })
  @IsNumber({}, { message: 'Project ID must be a number' })
  @Min(1, { message: 'Project ID must be a positive number' })
  @Expose()
  projectId: number;

  @IsOptional()
  @IsArray({ message: 'Tags must be an array' })
  @Expose()
  tags?: number[];

  constructor(
    title: string = '',
    description: string = '',
    status: TaskStatus = TaskStatus.TODO,
    priority: TaskPriority = TaskPriority.MEDIUM,
    dueDate?: string,
    projectId: number = 0,
    tags: number[] = []
  ) {
    super();
    this.title = title;
    this.description = description;
    this.status = status;
    this.priority = priority;
    this.dueDate = dueDate;
    this.projectId = projectId;
    this.tags = tags;
  }
}

/**
 * DTO per l'aggiornamento di un task
 */
export class UpdateTaskDto extends BaseDto {
  @IsOptional()
  @IsString({ message: 'Task title must be a string' })
  @Length(1, 200, { message: 'Task title must be between 1 and 200 characters' })
  @Expose()
  title?: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @Expose()
  description?: string;

  @IsOptional()
  @IsEnum(TaskStatus, { message: 'Status must be one of: todo, in_progress, review, done' })
  @Expose()
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(TaskPriority, { message: 'Priority must be one of: low, medium, high, urgent' })
  @Expose()
  priority?: TaskPriority;

  @IsOptional()
  @IsString({ message: 'Due date must be a string' })
  @Expose()
  dueDate?: string | null;

  @IsOptional()
  @IsArray({ message: 'Tags must be an array' })
  @Expose()
  tags?: number[];

  constructor(
    title?: string,
    description?: string,
    status?: TaskStatus,
    priority?: TaskPriority,
    dueDate?: string | null,
    tags?: number[]
  ) {
    super();
    this.title = title;
    this.description = description;
    this.status = status;
    this.priority = priority;
    this.dueDate = dueDate;
    this.tags = tags;
  }
}

/**
 * DTO per la risposta di un task
 */
export class TaskResponseDto extends BaseDto {
  @IsNumber({}, { message: 'Task ID must be a number' })
  @Expose()
  id: number;

  @IsString({ message: 'Task title must be a string' })
  @Expose()
  title: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @Expose()
  description?: string;

  @IsEnum(TaskStatus, { message: 'Status must be one of: todo, in_progress, review, done' })
  @Expose()
  status: TaskStatus;

  @IsEnum(TaskPriority, { message: 'Priority must be one of: low, medium, high, urgent' })
  @Expose()
  priority: TaskPriority;

  @IsOptional()
  @IsString({ message: 'Due date must be a string' })
  @Expose()
  dueDate?: string;

  @IsNumber({}, { message: 'Project ID must be a number' })
  @Expose()
  projectId: number;

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
    title: string = '',
    description: string = '',
    status: TaskStatus = TaskStatus.TODO,
    priority: TaskPriority = TaskPriority.MEDIUM,
    dueDate?: string,
    projectId: number = 0,
    tags: TagResponseDto[] = [],
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ) {
    super();
    this.id = id;
    this.title = title;
    this.description = description;
    this.status = status;
    this.priority = priority;
    this.dueDate = dueDate;
    this.projectId = projectId;
    this.tags = tags;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

/**
 * DTO per la risposta di una lista di task
 */
export class TaskListResponseDto extends BaseResponseDto {
  @IsArray({ message: 'Tasks must be an array' })
  @ValidateNested({ each: true })
  @Type(() => TaskResponseDto)
  @Expose()
  tasks: TaskResponseDto[];

  @IsOptional()
  @IsNumber({}, { message: 'Total count must be a number' })
  @Expose()
  totalCount?: number;

  constructor(
    success: boolean = true,
    message: string = 'Tasks retrieved successfully',
    tasks: TaskResponseDto[] = [],
    totalCount?: number
  ) {
    super(success, message);
    this.tasks = tasks;
    this.totalCount = totalCount;
  }
}

/**
 * DTO per la risposta di un singolo task
 */
export class SingleTaskResponseDto extends BaseResponseDto {
  @ValidateNested()
  @Type(() => TaskResponseDto)
  @Expose()
  task?: TaskResponseDto;

  constructor(
    success: boolean = true,
    message: string = 'Task operation completed successfully',
    task?: TaskResponseDto
  ) {
    super(success, message);
    this.task = task;
  }
}

/**
 * DTO per la richiesta di paginazione delle attività
 */
export class TaskPaginationDto extends PaginationDto {
  @IsOptional()
  @IsString({ message: 'Search term must be a string' })
  @Expose()
  search?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Project ID must be a number' })
  @Expose()
  projectId?: number;

  @IsOptional()
  @IsEnum(TaskStatus, { message: 'Status must be one of: todo, in_progress, review, done' })
  @Expose()
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(TaskPriority, { message: 'Priority must be one of: low, medium, high, urgent' })
  @Expose()
  priority?: TaskPriority;

  constructor(
    page: number = 1,
    limit: number = 10,
    search: string = '',
    projectId?: number,
    status?: TaskStatus,
    priority?: TaskPriority
  ) {
    super(page, limit);
    this.search = search;
    this.projectId = projectId;
    this.status = status;
    this.priority = priority;
  }
}

/**
 * DTO per l'aggiornamento dello stato di più task contemporaneamente
 */
export class BulkUpdateTaskStatusDto extends BaseDto {
  @IsNotEmpty({ message: 'Task IDs are required' })
  @IsArray({ message: 'Task IDs must be an array' })
  @IsNumber({}, { each: true, message: 'Each task ID must be a number' })
  @Expose()
  taskIds: number[];

  @IsNotEmpty({ message: 'Status is required' })
  @IsEnum(TaskStatus, { message: 'Status must be one of: todo, in_progress, review, done' })
  @Expose()
  status: TaskStatus;

  constructor(taskIds: number[] = [], status: TaskStatus = TaskStatus.TODO) {
    super();
    this.taskIds = taskIds;
    this.status = status;
  }
}
