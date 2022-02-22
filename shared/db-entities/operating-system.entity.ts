import { Column, Entity, OneToMany } from "typeorm";
import { BaseDBEntity } from "@shared/db-entities/base-db.entity";
import { VmInstance } from "@shared/db-entities/vm-instance.entity";

@Entity("operating_systems")
export class OperatingSystem extends BaseDBEntity {
    @Column({ name: "iso_file", unique: true })
    isoFileName: string;

    @Column({ name: "ks_file" })
    ksFileName: string;

    @Column({name: "os_variant"})
    osVariant: string;

    @OneToMany(() => VmInstance, vmInstance => vmInstance.operatingSystem)
    vmInstances?: VmInstance;
}