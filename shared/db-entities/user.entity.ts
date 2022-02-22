import { Column, Entity, OneToMany } from "typeorm";
import { BaseDBEntity } from "@shared/db-entities/base-db.entity";
import { VmInstance } from "@shared/db-entities/vm-instance.entity";

@Entity("users")
export class User extends BaseDBEntity {
    @Column({ unique: true })
    public username: string;

    @Column({ unique: true })
    public email: string;

    @Column()
    public password: string;

    @OneToMany(() => VmInstance, vmInstance => vmInstance.user)
    vmInstances?: VmInstance[];
}