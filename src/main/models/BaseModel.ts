import { Model, } from 'sequelize-typescript';

export class BaseModel<T extends object = any> extends Model<T> {
    public toJSON(): object {
        const values = Object.assign({}, this.get());
        return values;
    }
}