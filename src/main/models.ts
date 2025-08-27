import {
    Table,
    Column,
    DataType,
    Model,
    PrimaryKey,
    AutoIncrement,
    CreatedAt,
    UpdatedAt,
    BeforeCreate,
    BeforeUpdate,
    AllowNull,
    BelongsTo,
    ForeignKey,
    HasMany,
    BelongsToMany,
} from 'sequelize-typescript';

import bcrypt from 'bcryptjs';

export class BaseModel<T extends object = any> extends Model<T> {
    public toJSON(): object {
        const values = Object.assign({}, this.get());
        return values;
    }
}

@Table({ tableName: 'Users' })
export class User extends BaseModel<User> {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    declare id: number;

    @Column({ type: DataType.STRING, allowNull: false, unique: true })
    declare username: string;

    @Column({ type: DataType.STRING, allowNull: false, unique: true, validate: { isEmail: true } })
    declare email: string;

    @Column({ type: DataType.STRING, allowNull: false })
    declare password: string;

    @CreatedAt
    declare createdAt: Date;

    @UpdatedAt
    declare updatedAt: Date;

    @BeforeCreate
    static hashPasswordBeforeCreate(instance: User) {
        instance.password = bcrypt.hashSync(instance.password, 10);
    }

    @BeforeUpdate
    static hashPasswordBeforeUpdate(instance: User) {
        if (instance.changed('password')) {
            instance.password = bcrypt.hashSync(instance.password, 10);
        }
    }

    public async checkPassword(password: string): Promise<boolean> {
        return bcrypt.compare(password, this.password);
    }

    @HasMany(() => Project)
    declare projects: Project[];

    @HasMany(() => Note)
    declare notes: Note[];

    @HasMany(() => Folder)
    declare folders: Folder[];

    @HasMany(() => File)
    declare files: File[];
}

@Table({ tableName: 'Projects' })
export class Project extends BaseModel<Project> {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    declare id: number;

    @Column({ type: DataType.STRING, allowNull: false })
    declare name: string;

    @AllowNull(true)
    @Column(DataType.TEXT)
    declare description: string | null;

    @CreatedAt
    declare createdAt: Date;

    @UpdatedAt
    declare updatedAt: Date;

    @ForeignKey(() => User)
    @Column(DataType.INTEGER)
    declare userId: number;

    @BelongsTo(() => User)
    declare user: User;

    @HasMany(() => Task)
    declare tasks: Task[];

    @HasMany(() => Note)
    declare notes: Note[];

    @BelongsToMany(() => Tag, () => ProjectTag)
    declare tags: Tag[];
}

enum TaskPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical'
}

enum TaskStatus {
    TODO = 'todo',
    IN_PROGRESS = 'inProgress',
    DONE = 'done',
    BLOCKED = 'blocked',
    REVIEW = 'review'
}

@Table({ tableName: 'Tasks' })
export class Task extends BaseModel<Task> {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    declare id: number;

    @Column({ type: DataType.STRING, allowNull: false })
    declare title: string;

    @AllowNull(true)
    @Column(DataType.TEXT)
    declare description: string | null;

    @Column({ type: DataType.ENUM(...Object.values(TaskStatus)), allowNull: false, defaultValue: TaskStatus.TODO })
    declare status: TaskStatus;

    @Column({ type: DataType.ENUM(...Object.values(TaskPriority)), allowNull: false, defaultValue: TaskPriority.MEDIUM })
    declare priority: TaskPriority;

    @AllowNull(true)
    @Column(DataType.DATE)
    declare dueDate: Date | null;

    @AllowNull(true)
    @Column(DataType.DATE)
    declare estimationDate: Date | null;

    @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
    declare position: number;

    @CreatedAt
    declare createdAt: Date;

    @UpdatedAt
    declare updatedAt: Date;

    @ForeignKey(() => Project)
    @Column(DataType.INTEGER)
    declare projectId: number;

    @BelongsTo(() => Project)
    declare project: Project;

    @HasMany(() => Attachment)
    declare attachments: Attachment[];

    @HasMany(() => Note)
    declare notes: Note[];

    @BelongsToMany(() => Tag, () => TaskTag)
    declare tags: Tag[];
}

@Table({ tableName: 'Attachments' })
export class Attachment extends BaseModel<Attachment> {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    declare id: number;

    @Column({ type: DataType.STRING, allowNull: false })
    declare name: string;

    @Column({ type: DataType.STRING, allowNull: false })
    declare path: string;

    @Column({ type: DataType.STRING, allowNull: false })
    declare mimeType: string;

    @Column({ type: DataType.BIGINT, allowNull: false })
    declare size: number;

    @CreatedAt
    declare createdAt: Date;

    @UpdatedAt
    declare updatedAt: Date;

    @ForeignKey(() => Task)
    @Column(DataType.INTEGER)
    declare taskId: number;

    @BelongsTo(() => Task)
    declare task: Task;
}

@Table({ tableName: 'Tags' })
export class Tag extends BaseModel<Tag> {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    declare id: number;

    @Column({ type: DataType.STRING, allowNull: false, unique: true })
    declare name: string;

    @Column({ type: DataType.STRING(7), allowNull: false, defaultValue: '#1890ff', validate: { is: /^#[0-9A-F]{6}$/i } })
    declare color: string;

    @CreatedAt
    declare createdAt: Date;

    @UpdatedAt
    declare updatedAt: Date;

    @BelongsToMany(() => Project, () => ProjectTag)
    declare projects: Project[];

    @BelongsToMany(() => Task, () => TaskTag)
    declare tasks: Task[];
}

@Table({ tableName: 'project_tags', timestamps: true })
export class ProjectTag extends Model<ProjectTag> {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    declare id: number;

    @ForeignKey(() => Project)
    @Column(DataType.INTEGER)
    declare projectId: number;

    @ForeignKey(() => Tag)
    @Column(DataType.INTEGER)
    declare tagId: number;

    @CreatedAt
    declare createdAt: Date;

    @UpdatedAt
    declare updatedAt: Date;
}

@Table({ tableName: 'TaskTags', timestamps: false })
export class TaskTag extends Model<TaskTag> {
    @ForeignKey(() => Task)
    @Column(DataType.INTEGER)
    declare taskId: number;

    @ForeignKey(() => Tag)
    @Column(DataType.INTEGER)
    declare tagId: number;
}

@Table({ tableName: 'Folders' })
export class Folder extends BaseModel<Folder> {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    declare id: number;

    @Column({ type: DataType.STRING, allowNull: false })
    declare name: string;

    @AllowNull(true)
    @ForeignKey(() => Folder)
    @Column(DataType.INTEGER)
    declare parentId: number | null;

    @CreatedAt
    declare createdAt: Date;

    @UpdatedAt
    declare updatedAt: Date;

    @BelongsTo(() => Folder)
    declare parent: Folder;

    @HasMany(() => Folder)
    declare subfolders: Folder[];

    @HasMany(() => File)
    declare files: File[];

    @HasMany(() => Note)
    declare notes: Note[];

    @ForeignKey(() => User)
    @Column(DataType.INTEGER)
    declare userId: number;

    @BelongsTo(() => User)
    declare user: User;
}

@Table({ tableName: 'Files' })
export class File extends BaseModel<File> {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    declare id: number;

    @Column({ type: DataType.STRING, allowNull: false })
    declare name: string;

    @Column({ type: DataType.STRING, allowNull: false })
    declare path: string;

    @Column({ type: DataType.STRING, allowNull: false })
    declare mimeType: string;

    @Column({ type: DataType.INTEGER, allowNull: false })
    declare size: number;

    @CreatedAt
    declare createdAt: Date;

    @UpdatedAt
    declare updatedAt: Date;

    @ForeignKey(() => Folder)
    @Column(DataType.INTEGER)
    declare folderId: number;

    @BelongsTo(() => Folder)
    declare folder: Folder;

    @ForeignKey(() => User)
    @Column(DataType.INTEGER)
    declare userId: number;

    @BelongsTo(() => User)
    declare user: User;
}

@Table({ tableName: 'Notes' })
export class Note extends BaseModel<Note> {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    declare id: number;

    @AllowNull(true)
    @ForeignKey(() => Task)
    @Column(DataType.INTEGER)
    declare taskId: number | null;

    @AllowNull(true)
    @ForeignKey(() => Project)
    @Column(DataType.INTEGER)
    declare projectId: number | null;

    @AllowNull(true)
    @Column(DataType.STRING)
    declare title: string | null;

    @AllowNull(true)
    @Column(DataType.TEXT)
    declare content: string | null;

    @AllowNull(true)
    @ForeignKey(() => Folder)
    @Column(DataType.INTEGER)
    declare folderId: number | null;

    @AllowNull(true)
    @ForeignKey(() => User)
    @Column(DataType.INTEGER)
    declare userId: number | null;

    @CreatedAt
    declare createdAt: Date;

    @UpdatedAt
    declare updatedAt: Date;

    @BelongsTo(() => Task)
    declare task: Task;

    @BelongsTo(() => Project)
    declare project: Project;

    @BelongsTo(() => Folder)
    declare folder: Folder;

    @BelongsTo(() => User)
    declare user: User;
}

export const models = [
    User,
    Project,
    Tag,
    ProjectTag,
    Task,
    TaskTag,
    Attachment,
    Note,
    Folder,
    File,
];