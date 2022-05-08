import { Column, Entity, OneToMany } from "typeorm";
import { BaseDBEntity } from "@shared/db-entities/base-db.entity";
import { VmInstance } from "@shared/db-entities/vm-instance.entity";
import { Exclude } from "class-transformer";

@Entity("users")
export class User extends BaseDBEntity {
    @Column({ unique: true })
    public username: string;

    @Column({ unique: true })
    public email: string;

    @Exclude()
    @Column()
    public password: string;

    @OneToMany(() => VmInstance, vmInstance => vmInstance.user)
    public vmInstances?: VmInstance[];
}