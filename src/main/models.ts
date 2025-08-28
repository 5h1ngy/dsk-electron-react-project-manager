//#region Imports
import {
    Table, Column, DataType, Model,
    PrimaryKey, AutoIncrement, CreatedAt,
    UpdatedAt, BeforeCreate, BeforeUpdate,
    AllowNull, BelongsTo, ForeignKey,
    HasMany, BelongsToMany
} from 'sequelize-typescript';
import bcrypt from 'bcryptjs';
//#endregion

//#region Base Model
/**
 * Base model that extends Sequelize Model with common functionality
 * @template T - Type of the model attributes
 */
export class BaseModel<T extends object = any> extends Model<T> {
    /**
     * Override toJSON to ensure proper serialization
     * @returns {object} Plain object representation of the model
     */
    public toJSON(): object {
        return { ...this.get() };
    }
}
//#endregion

//#region Enums
/**
 * Priority levels for tasks
 * @readonly
 * @enum {string}
 */
export enum TaskPriority {
    /** Low priority task */
    LOW = 'low',
    /** Medium priority task */
    MEDIUM = 'medium',
    /** High priority task */
    HIGH = 'high',
    /** Critical priority task */
    CRITICAL = 'critical'
}

/**
 * Status values for tasks
 * @readonly
 * @enum {string}
 */
export enum TaskStatus {
    /** Task is not yet started */
    TODO = 'todo',
    /** Task is in progress */
    IN_PROGRESS = 'inProgress',
    /** Task is completed */
    DONE = 'done',
    /** Task is blocked */
    BLOCKED = 'blocked',
    /** Task is under review */
    REVIEW = 'review'
}
//#endregion

//#region Join Tables
/**
 * Join table for many-to-many relationship between Projects and Tags
 * @extends {Model<ProjectTag>}
 */
@Table({ tableName: 'project_tags', timestamps: true })
export class ProjectTag extends Model<ProjectTag> {
    /** Unique identifier */
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    declare id: number;

    /** Reference to Project */
    @ForeignKey(() => Project)
    @Column(DataType.INTEGER)
    declare projectId: number;

    /** Reference to Tag */
    @ForeignKey(() => Tag)
    @Column(DataType.INTEGER)
    declare tagId: number;

    /** Creation timestamp */
    @CreatedAt
    declare createdAt: Date;

    /** Last update timestamp */
    @UpdatedAt
    declare updatedAt: Date;
}

/**
 * Join table for many-to-many relationship between Tasks and Tags
 * @extends {Model<TaskTag>}
 */
@Table({ tableName: 'TaskTags', timestamps: false })
export class TaskTag extends Model<TaskTag> {
    /** Reference to Task */
    @ForeignKey(() => Task)
    @Column(DataType.INTEGER)
    declare taskId: number;

    /** Reference to Tag */
    @ForeignKey(() => Tag)
    @Column(DataType.INTEGER)
    declare tagId: number;
}
//#endregion

//#region Core Models
/**
 * User model representing application users
 * @extends {BaseModel<User>}
 */
@Table({ tableName: 'Users' })
export class User extends BaseModel<User> {
    /** Unique identifier */
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    declare id: number;

    /** Unique username */
    @Column({ type: DataType.STRING, allowNull: false, unique: true })
    declare username: string;

    /** User's email address */
    @Column({ type: DataType.STRING, allowNull: false, unique: true, validate: { isEmail: true } })
    declare email: string;

    /** Hashed password */
    @Column({ type: DataType.STRING, allowNull: false })
    declare password: string;

    /** Account creation timestamp */
    @CreatedAt
    declare createdAt: Date;

    /** Last update timestamp */
    @UpdatedAt
    declare updatedAt: Date;

    /**
     * Hashes password before creating a new user
     * @param {User} instance - The user instance being created
     */
    @BeforeCreate
    static hashPasswordBeforeCreate(instance: User) {
        instance.password = bcrypt.hashSync(instance.password, 10);
    }

    /**
     * Hashes password before updating a user if password was changed
     * @param {User} instance - The user instance being updated
     */
    @BeforeUpdate
    static hashPasswordBeforeUpdate(instance: User) {
        if (instance.changed('password')) {
            instance.password = bcrypt.hashSync(instance.password, 10);
        }
    }

    /**
     * Verifies if the provided password matches the hashed password
     * @param {string} password - The password to verify
     * @returns {Promise<boolean>} True if password matches
     */
    public async checkPassword(password: string): Promise<boolean> {
        return bcrypt.compare(password, this.password);
    }

    /** User's projects */
    @HasMany(() => Project)
    declare projects: Project[];

    /** User's notes */
    @HasMany(() => Note)
    declare notes: Note[];

    /** User's folders */
    @HasMany(() => Folder)
    declare folders: Folder[];

    /** User's files */
    @HasMany(() => File)
    declare files: File[];
}

/**
 * Represents a project in the system
 * @extends {BaseModel<Project>}
 */
@Table({ tableName: 'Projects' })
export class Project extends BaseModel<Project> {
    /** Unique identifier */
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    declare id: number;

    /** Project name */
    @Column({ type: DataType.STRING, allowNull: false })
    declare name: string;

    /** Project description */
    @AllowNull(true)
    @Column(DataType.TEXT)
    declare description: string | null;

    /** Project creation timestamp */
    @CreatedAt
    declare createdAt: Date;

    /** Last update timestamp */
    @UpdatedAt
    declare updatedAt: Date;

    /** ID of the user who owns this project */
    @ForeignKey(() => User)
    @Column(DataType.INTEGER)
    declare userId: number;

    /** The user who owns this project */
    @BelongsTo(() => User)
    declare user: User;

    /** Tasks associated with this project */
    @HasMany(() => Task)
    declare tasks: Task[];

    /** Notes associated with this project */
    @HasMany(() => Note)
    declare notes: Note[];

    /** Tags associated with this project */
    @BelongsToMany(() => Tag, () => ProjectTag)
    declare tags: Tag[];
}

/**
 * Represents a task within a project
 * @extends {BaseModel<Task>}
 */
@Table({ tableName: 'Tasks' })
export class Task extends BaseModel<Task> {
    /** Unique identifier */
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    declare id: number;

    /** Task title */
    @Column({ type: DataType.STRING, allowNull: false })
    declare title: string;

    /** Detailed task description */
    @AllowNull(true)
    @Column(DataType.TEXT)
    declare description: string | null;

    /** Current status of the task */
    @Column({ type: DataType.ENUM(...Object.values(TaskStatus)), allowNull: false, defaultValue: TaskStatus.TODO })
    declare status: TaskStatus;

    /** Priority level of the task */
    @Column({ type: DataType.ENUM(...Object.values(TaskPriority)), allowNull: false, defaultValue: TaskPriority.MEDIUM })
    declare priority: TaskPriority;

    /** Due date for the task */
    @AllowNull(true)
    @Column(DataType.DATE)
    declare dueDate: Date | null;

    /** Estimated completion date */
    @AllowNull(true)
    @Column(DataType.DATE)
    declare estimationDate: Date | null;

    /** Position for task ordering */
    @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
    declare position: number;

    /** Task creation timestamp */
    @CreatedAt
    declare createdAt: Date;

    /** Last update timestamp */
    @UpdatedAt
    declare updatedAt: Date;

    /** ID of the project this task belongs to */
    @ForeignKey(() => Project)
    @Column(DataType.INTEGER)
    declare projectId: number;

    /** The project this task belongs to */
    @BelongsTo(() => Project)
    declare project: Project;

    /** Files attached to this task */
    @HasMany(() => Attachment)
    declare attachments: Attachment[];

    /** Notes associated with this task */
    @HasMany(() => Note)
    declare notes: Note[];

    /** Tags associated with this task */
    @BelongsToMany(() => Tag, () => TaskTag)
    declare tags: Tag[];
}
//#endregion

// ==============================================
// File Management Models
// ==============================================

//#region File Management Models

/**
 * Represents a file attachment for tasks
 * @extends {BaseModel<Attachment>}
 */
@Table({ tableName: 'Attachments' })
export class Attachment extends BaseModel<Attachment> {
    /** Unique identifier */
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    declare id: number;

    /** Original filename */
    @Column({ type: DataType.STRING, allowNull: false })
    declare name: string;

    /** Path to the stored file */
    @Column({ type: DataType.STRING, allowNull: false })
    declare path: string;

    /** MIME type of the file */
    @Column({ type: DataType.STRING, allowNull: false })
    declare mimeType: string;

    /** File size in bytes */
    @Column({ type: DataType.BIGINT, allowNull: false })
    declare size: number;

    /** Creation timestamp */
    @CreatedAt
    declare createdAt: Date;

    /** Last update timestamp */
    @UpdatedAt
    declare updatedAt: Date;

    /** ID of the task this attachment belongs to */
    @ForeignKey(() => Task)
    @Column(DataType.INTEGER)
    declare taskId: number;

    /** The task this attachment belongs to */
    @BelongsTo(() => Task)
    declare task: Task;
}
//#endregion

// ==============================================
// Tagging System
// ==============================================

//#region Tagging System

/**
 * Represents a tag for categorizing projects and tasks
 * @extends {BaseModel<Tag>}
 */
@Table({ tableName: 'Tags' })
export class Tag extends BaseModel<Tag> {
    /** Unique identifier */
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    declare id: number;

    /** Tag name (must be unique) */
    @Column({ type: DataType.STRING, allowNull: false, unique: true })
    declare name: string;

    /** Tag display color in hex format */
    @Column({
        type: DataType.STRING(7),
        allowNull: false,
        defaultValue: '#1890ff',
        validate: { is: /^#[0-9A-F]{6}$/i }
    })
    declare color: string;

    /** Creation timestamp */
    @CreatedAt
    declare createdAt: Date;

    /** Last update timestamp */
    @UpdatedAt
    declare updatedAt: Date;

    /** Projects associated with this tag */
    @BelongsToMany(() => Project, () => ProjectTag)
    declare projects: Project[];

    /** Tasks associated with this tag */
    @BelongsToMany(() => Task, () => TaskTag)
    declare tasks: Task[];
}
//#endregion

// ==============================================
// File System Models
// ==============================================

//#region File System Models

/**
 * Represents a folder in the file system hierarchy
 * @extends {BaseModel<Folder>}
 */
@Table({ tableName: 'Folders' })
export class Folder extends BaseModel<Folder> {
    /** Unique identifier */
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    declare id: number;

    /** Folder name */
    @Column({ type: DataType.STRING, allowNull: false })
    declare name: string;

    /** ID of the parent folder (null for root folders) */
    @AllowNull(true)
    @ForeignKey(() => Folder)
    @Column(DataType.INTEGER)
    declare parentId: number | null;

    /** Creation timestamp */
    @CreatedAt
    declare createdAt: Date;

    /** Last update timestamp */
    @UpdatedAt
    declare updatedAt: Date;

    /** Parent folder reference */
    @BelongsTo(() => Folder)
    declare parent: Folder;

    /** Child folders */
    @HasMany(() => Folder)
    declare subfolders: Folder[];

    /** Files in this folder */
    @HasMany(() => File)
    declare files: File[];

    /** Notes in this folder */
    @HasMany(() => Note)
    declare notes: Note[];

    /** ID of the user who owns this folder */
    @ForeignKey(() => User)
    @Column(DataType.INTEGER)
    declare userId: number;

    /** The user who owns this folder */
    @BelongsTo(() => User)
    declare user: User;
}

/**
 * Represents a file in the system
 * @extends {BaseModel<File>}
 */
@Table({ tableName: 'Files' })
export class File extends BaseModel<File> {
    /** Unique identifier */
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    declare id: number;

    /** Original filename */
    @Column({ type: DataType.STRING, allowNull: false })
    declare name: string;

    /** Path to the stored file */
    @Column({ type: DataType.STRING, allowNull: false })
    declare path: string;

    /** MIME type of the file */
    @Column({ type: DataType.STRING, allowNull: false })
    declare mimeType: string;

    /** File size in bytes */
    @Column({ type: DataType.INTEGER, allowNull: false })
    declare size: number;

    /** Creation timestamp */
    @CreatedAt
    declare createdAt: Date;

    /** Last update timestamp */
    @UpdatedAt
    declare updatedAt: Date;

    /** ID of the containing folder */
    @ForeignKey(() => Folder)
    @Column(DataType.INTEGER)
    declare folderId: number;

    /** The folder containing this file */
    @BelongsTo(() => Folder)
    declare folder: Folder;

    /** ID of the user who owns this file */
    @ForeignKey(() => User)
    @Column(DataType.INTEGER)
    declare userId: number;

    /** The user who owns this file */
    @BelongsTo(() => User)
    declare user: User;
}

// ==============================================
// Note Management
// ==============================================

//#region Note Management

/**
 * Represents a user note that can be attached to various entities
 * @extends {BaseModel<Note>}
 */
@Table({ tableName: 'Notes' })
export class Note extends BaseModel<Note> {
    /** Unique identifier */
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    declare id: number;

    /** ID of the associated task (optional) */
    @AllowNull(true)
    @ForeignKey(() => Task)
    @Column(DataType.INTEGER)
    declare taskId: number | null;

    /** ID of the associated project (optional) */
    @AllowNull(true)
    @ForeignKey(() => Project)
    @Column(DataType.INTEGER)
    declare projectId: number | null;

    /** Note title */
    @AllowNull(true)
    @Column(DataType.STRING)
    declare title: string | null;

    /** Note content */
    @AllowNull(true)
    @Column(DataType.TEXT)
    declare content: string | null;

    /** ID of the containing folder (optional) */
    @AllowNull(true)
    @ForeignKey(() => Folder)
    @Column(DataType.INTEGER)
    declare folderId: number | null;

    /** ID of the user who owns this note */
    @AllowNull(true)
    @ForeignKey(() => User)
    @Column(DataType.INTEGER)
    declare userId: number;

    /** Creation timestamp */
    @CreatedAt
    declare createdAt: Date;

    /** Last update timestamp */
    @UpdatedAt
    declare updatedAt: Date;

    /** The task this note is associated with */
    @BelongsTo(() => Task)
    declare task: Task;

    /** The project this note is associated with */
    @BelongsTo(() => Project)
    declare project: Project;

    /** The folder containing this note */
    @BelongsTo(() => Folder)
    declare folder: Folder;

    /** The user who owns this note */
    @BelongsTo(() => User)
    declare user: User;
}

//#endregion

// ==============================================
// Model Exports
// ==============================================

/**
 * Array of all model classes for easy importing and initialization
 */

//#region Model Exports

/**
 * Array of all model classes for easy importing and initialization
 * Used by the Sequelize instance to register all models
 */
export const models = [
    // Core Models
    User,
    Project,
    Task,

    // Tagging System
    Tag,
    TaskTag,
    ProjectTag,

    // File Management
    Attachment,
    Folder,
    File,

    // Note Management
    Note,
];

//#endregion