import { Injectable } from "@nestjs/common";
import { INetworkService } from "../entities/INetworkService";
import { VmInstanceService } from "./vm-instance.service";
import { address as getLocalIp } from "ip";
import { getRandomInt } from "@shared/utils";
import { networkInterfaces } from "os";
import { config } from "../config";

@Injectable()
export class NetworkService implements INetworkService {
    private readonly localIp: string;

    constructor(private readonly vmInstanceService: VmInstanceService) {
        this.localIp = getLocalIp();
    }

    private static generateIp(): string {
        const kvmGatewayPrefix = config.kvmGateway.split(".").slice(0, -1).join(".");
        return `${kvmGatewayPrefix}.${getRandomInt(2, 255)}`;
    }

    private static generateMacAddress(): string {
        // KVM mac addresses need to always start with 52:54:00
        return "52:54:00:XX:XX:XX".replace(/X/g, () => {
            return "0123456789ABCDEF".charAt(getRandomInt(0, 16));
        });
    }

    private static getMacAddressesOfCurrentMachine() {
        const macAddresses: string[] = [];
        for (const networkInterface of Object.values(networkInterfaces())) {
            if (networkInterface) {
                for (const entry of networkInterface) {
                    macAddresses.push(entry.mac);
                }
            }
        }
        return macAddresses;
    }

    public async createIp(): Promise<string> {
        const alreadyUsedIps = await this.vmInstanceService.getAllIpsInUse();
        let ip: string;
        do {
            ip = NetworkService.generateIp();
        } while ([...alreadyUsedIps, this.localIp].includes(ip));
        return ip;
    }

    public async createKvmMacAddress(): Promise<string> {
        const alreadyUsedMacAddresses = await this.vmInstanceService.getAllMacAddressesInUse();
        let macAddress: string;
        do {
            macAddress = NetworkService.generateMacAddress();
        } while ([...alreadyUsedMacAddresses, ...NetworkService.getMacAddressesOfCurrentMachine()].includes(macAddress));
        return macAddress;
    }
}