import { IsOptional, validateSync, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';

/**
 * Base class for all DTOs
 */
export abstract class BaseDto {
    /**
     * Validate this DTO instance
     * @throws Error if validation fails
     */
    public validate(): ValidationError[] {
        const errors = validateSync(this);
        return errors;
    }

    /**
     * Check if this DTO is valid
     */
    public isValid(): boolean {
        return this.validate().length === 0;
    }

    /**
     * Convert a plain object to this DTO class
     * @param data Plain object with data
     * @returns Instance of this DTO
     */
    public static fromPlain<T extends BaseDto>(this: new () => T, data: Record<string, any>): T {
        return plainToInstance(this, data);
    }

    /**
     * Convert this DTO to a plain object
     */
    public toPlain(): Record<string, any> {
        return Object.assign({}, this);
    }
}

/**
 * Base class for pagination DTOs
 */
export class PaginationDto extends BaseDto {
    @IsOptional()
    page?: number;

    @IsOptional()
    limit?: number;

    constructor(page: number = 1, limit: number = 10) {
        super();
        this.page = page;
        this.limit = limit;
    }

    /**
     * Calculate offset based on page and limit
     */
    public get offset(): number {
        return ((this.page || 1) - 1) * (this.limit || 10);
    }
}

/**
 * Base class for all response DTOs
 */
export class BaseResponseDto extends BaseDto {
    success: boolean;
    message?: string;

    constructor(success: boolean = true, message?: string) {
        super();
        this.success = success;
        this.message = message;
    }
}
