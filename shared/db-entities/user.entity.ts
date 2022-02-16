import { Column, Entity, JoinTable, ManyToMany } from "typeorm";
import { BaseDBEntity } from "@shared/db-entities/base-db.entity";
import { OperatingSystem } from "@shared/db-entities/operating-system.entity";

@Entity("users")
export class User extends BaseDBEntity {
    @Column({ unique: true })
    public username: string;

    @Column({ unique: true })
    public email: string;

    @Column()
    public password: string;

    @ManyToMany(() => OperatingSystem, os => os.users)
    @JoinTable({
        name: "users_operating_systems",
        joinColumn: {
            name: "user_id",
            referencedColumnName: "id"
        },
        inverseJoinColumn: {
            name: "operating_system_id",
            referencedColumnName: "id"
        }
    })
    operatingSystems?: OperatingSystem[];
}