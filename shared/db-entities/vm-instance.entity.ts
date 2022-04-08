import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseDBEntity } from "@shared/db-entities/base-db.entity";
import { User } from "@shared/db-entities/user.entity";
import { OperatingSystem } from "@shared/db-entities/operating-system.entity";

@Entity("vm_instances")
export class VmInstance extends BaseDBEntity {
    @Column({ unique: true })
    name: string;

    @Column()
    username: string;

    @Column()
    timezone: string;

    @Column({ name: "disk_size" })
    diskSize: number;

    @Column()
    memory: number;

    @Column({ name: "number_of_virtual_cpus" })
    numberOfVirtualCpus: number;

    @Column({ name: "mac_address", unique: true })
    macAddress: string;

    @Column({ unique: true })
    ip: string;

    @Column({ name: "network_interface" })
    networkInterface: string;

    @ManyToOne(() => User, user => user.vmInstances)
    @JoinColumn({ name: "user_id" })
    user: User;

    @ManyToOne(() => OperatingSystem, os => os.vmInstances)
    @JoinColumn({ name: "operating_system_id" })
    operatingSystem: OperatingSystem;
}