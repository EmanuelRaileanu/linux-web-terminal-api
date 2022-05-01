import { VmInstanceService } from "../src/services/vm-instance.service";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepository, QueryFailedError, Repository } from "typeorm";
import { VmInstance } from "@shared/db-entities/vm-instance.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ENTITIES } from "@shared/db-entities";
import { config } from "../src/config";
import { User } from "@shared/db-entities/user.entity";
import { OperatingSystem } from "@shared/db-entities/operating-system.entity";
import { SessionUserEntity } from "@shared/entities";
import { CreateVmInstanceRequest } from "../src/entities/vm-manager.entities";
import { UserNotFoundError } from "@shared/errors";

describe(VmInstanceService, () => {
    let moduleRef: TestingModule;
    let vmInstanceService: VmInstanceService;
    let userRepository: Repository<User>;
    let operatingSystemRepository: Repository<OperatingSystem>;
    let vmInstanceRepository: Repository<VmInstance>;
    let vmInstances: VmInstance[];
    let users: User[];
    let operatingSystems: OperatingSystem[];

    beforeAll(async () => {
        moduleRef = await Test.createTestingModule({
            imports: [
                TypeOrmModule.forFeature([VmInstance, User]),
                TypeOrmModule.forRoot({
                    type: "mysql",
                    ...config.db,
                    database: config.testDb,
                    entities: ENTITIES
                })
            ],
            providers: [VmInstanceService]
        }).compile();

        vmInstanceService = moduleRef.get<VmInstanceService>(VmInstanceService);
        userRepository = getRepository(User);
        operatingSystemRepository = getRepository(OperatingSystem);
        vmInstanceRepository = getRepository(VmInstance);

        users = [
            {
                id: "0ccc0621-a001-4d65-bca4-1e5c2def975f",
                username: "instantiate",
                email: "instantiate@gmail.com",
                password: "doesntMatter",
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: "3c2bac04-82d5-4823-8dfd-de1a5c4b350c",
                username: "crawler",
                email: "crawler@gmail.com",
                password: "doesntMatter",
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        operatingSystems = [
            {
                id: "142d06c6-a9c2-4442-9d18-27cef2642a91",
                isoFileName: "image11.iso",
                ksFileName: "centos.ks",
                osVariant: "fedora7",
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: "516fc477-9feb-41d7-8b95-92fbc7252d43",
                isoFileName: "image12.iso",
                ksFileName: "ubuntu.ks",
                osVariant: "ubuntu18.04",
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        vmInstances = [
            {
                id: "3857a514-0bd8-40a6-bd61-8fc8938c63fb",
                name: "vm-instance",
                username: "scallop",
                timezone: "Europe/Bucharest",
                diskSize: 10,
                memory: 1024,
                numberOfVirtualCpus: 1,
                networkInterface: "virbr0",
                macAddress: "52:54:00:51:94:8a",
                ip: "192.168.122.31",
                user: users[0],
                operatingSystem: operatingSystems[0],
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: "4e109835-07cb-4769-b770-9c31255ac4c1",
                name: "vm-instance-ubuntu",
                username: "shellfish",
                timezone: "Europe/Bucharest",
                diskSize: 13,
                memory: 2048,
                numberOfVirtualCpus: 2,
                networkInterface: "virbr0",
                macAddress: "52:54:00:51:94:8b",
                ip: "192.168.122.32",
                user: users[1],
                operatingSystem: operatingSystems[1],
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        await userRepository.insert(users);
        await operatingSystemRepository.insert(operatingSystems);
        await vmInstanceRepository.insert(vmInstances);
    });

    afterAll(async () => {
        await vmInstanceRepository.remove(vmInstances);
        await operatingSystemRepository.remove(operatingSystems);
        await userRepository.remove(users);
        return moduleRef.close();
    });

    test("Getting all MAC addresses in use successfully", async () => {
        const macAddresses = await vmInstanceService.getAllMacAddressesInUse();
        expect(Array.isArray(macAddresses)).toBeTruthy();
        expect(vmInstances.map(vmi => vmi.macAddress)).toEqual(macAddresses);
    });

    test("Getting all IPs already in use successfully", async () => {
        const ips = await vmInstanceService.getAllIpsInUse();
        expect(Array.isArray(ips)).toBeTruthy();
        expect(vmInstances.map(vmi => vmi.ip)).toEqual(ips);
    });

    test("Getting all the vm instances of one user successfully", () => {
        return expect(vmInstanceService.findAllForUser(users[0] as SessionUserEntity)).resolves.toEqual([vmInstances[0]]);
    });

    test("Getting all the vm instances of a non-existent user returning empty array", () => {
        const fakeUser: User = {
            id: "d8cc557a-9418-4a67-a35b-23dd869804ca",
            username: "fake",
            password: "password",
            email: "faker@email.com",
            createdAt: new Date(),
            updatedAt: new Date()
        };
        return expect(vmInstanceService.findAllForUser(fakeUser as SessionUserEntity)).resolves.toEqual([]);
    });

    test("Finding vm instance by id successfully", () => {
        return expect(vmInstanceService.findById(vmInstances[0].id)).resolves.toEqual(vmInstances[0]);
    });

    test("Finding vm instance by id returning undefined when the vm instance doesn't exist", () => {
        return expect(vmInstanceService.findById("2fe3b492-ff9b-4ea4-b815-e46f3e4aa8b1")).resolves.toEqual(undefined);
    });

    test("Finding vm instance by name successfully", () => {
        return expect(vmInstanceService.findByName(vmInstances[0].name)).resolves.toEqual(vmInstances[0]);
    });

    test("Finding vm instance by name returning undefined when the vm instance doesn't exist", () => {
        return expect(vmInstanceService.findByName("instance-3")).resolves.toEqual(undefined);
    });

    test("Creating VM instance successfully", async () => {
        const user: SessionUserEntity = {
            id: users[0].id,
            username: users[0].username,
            email: users[0].email
        };
        const newVmInstance: CreateVmInstanceRequest = {
            name: "vm-instance-3",
            username: "scallop",
            timezone: "Europe/Bucharest",
            diskSize: 10,
            memory: 1024,
            numberOfVirtualCpus: 1,
            networkInterface: "virbr0",
            macAddress: "52:54:00:51:94:8c",
            ip: "192.168.122.33",
            user_id: users[0].id,
            operatingSystem: operatingSystems[1]
        };
        const newVmInstanceEntity = await vmInstanceService.create(user, newVmInstance);
        vmInstances.push(newVmInstanceEntity);
        return expect(vmInstanceService.findByName(newVmInstance.name)).resolves.toEqual(newVmInstanceEntity);
    });

    test("Creating VM instance fails with UserNotFoundError when the session user doesn't exist in the database", () => {
        const user: SessionUserEntity = {
            id: "5ce22949-5ae0-4ede-8f58-d8367bfc15bc",
            username: users[0].username,
            email: users[0].email
        };
        return expect(vmInstanceService.create(user, {} as CreateVmInstanceRequest)).rejects.toThrowError(UserNotFoundError);
    });

    test("Creating VM instance fails with QueryFailedError when a VM with the same name already exists (breaks unique constraint)", () => {
        const user: SessionUserEntity = {
            id: users[0].id,
            username: users[0].username,
            email: users[0].email
        };
        const newVmInstance: CreateVmInstanceRequest = {
            name: "vm-instance",
            username: "scallop",
            timezone: "Europe/Bucharest",
            diskSize: 10,
            memory: 1024,
            numberOfVirtualCpus: 1,
            networkInterface: "virbr0",
            macAddress: "52:54:00:51:94:8d",
            ip: "192.168.122.34",
            user_id: users[0].id,
            operatingSystem: operatingSystems[1]
        };
        return expect(vmInstanceService.create(user, newVmInstance)).rejects.toThrowError(QueryFailedError);
    });

    test("Deleting VM instance by id successfully", async () => {
        const id = vmInstances[0].id;
        await vmInstanceService.deleteById(id);
        return expect(vmInstanceService.findById(id)).resolves.toEqual(undefined);
    });

    test("Deleting VM instance by id returns undefined when the VM instance doesn't exist", () => {
        const promise = vmInstanceService.deleteById("198cff60-9a92-4381-8278-c35cd83c1bef");
        return expect(promise).resolves.toEqual(undefined);
    });

    test("Deleting VM instance by name successfully", async () => {
        const name = vmInstances[1].name;
        await vmInstanceService.deleteByVmName(name);
        return expect(vmInstanceService.findByName(name)).resolves.toEqual(undefined);
    });

    test("Deleting VM instance by name returns undefined when the VM instance doesn't exist", () => {
        const promise = vmInstanceService.deleteByVmName("instance-13");
        return expect(promise).resolves.toEqual(undefined);
    });
});