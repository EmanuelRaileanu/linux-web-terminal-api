import { Column, Entity, ManyToMany } from "typeorm";
import { BaseDBEntity } from "@shared/db-entities/base-db.entity";
import { User } from "@shared/db-entities/user.entity";

@Entity("operating_systems")
export class OperatingSystem extends BaseDBEntity {
    @Column({ name: "iso_file", unique: true })
    isoFileName: string;

    @Column({ name: "ks_file" })
    ksFileName: string;

    @ManyToMany(() => User, user => user.operatingSystems)
    users?: User[];
}