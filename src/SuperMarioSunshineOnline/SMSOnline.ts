import { IPlugin, IModLoaderAPI, IPluginServerConfig } from 'modloader64_api/IModLoaderAPI';
import { InjectCore } from 'modloader64_api/CoreInjection';
import * as API from 'SuperMarioSunshine/API/Imports'
import { bus } from 'modloader64_api/EventHandler';
import fs from 'fs';
import path from 'path';
import { ProxySide, SidedProxy } from 'modloader64_api/SidedProxy/SidedProxy';
import SMSOnlineClient from './SMSOnlineClient';
import SMSOnlineServer from './SMSOnlineServer';
import { IPacketHeader } from 'modloader64_api/NetworkHandler';
import { SMSOnlineStorageClient } from './storage/SMSOnlineStorageClient';
import { ISMSOnlineHelpers } from './api/SMSOAPI';

export interface ISMSOnlineLobbyConfig {
    data_syncing: boolean;
}

export interface SMSHelpers {
    isTitleScreen(): boolean;
    isSceneNumberValid(): boolean;
    isMarioEnteringLoadingZone(): boolean;
    isPaused(): boolean;
}

export class SMSOnlineConfigCategory {
    itemCountSync: boolean = false;
    enablePuppets: boolean = true;
    syncBottleContents: boolean = true;
}

class SuperMarioSunshineOnline implements IPlugin, ISMSOnlineHelpers, IPluginServerConfig {

    ModLoader!: IModLoaderAPI;
    pluginName?: string | undefined;
    @InjectCore()
    core!: API.ISMSCore;
    @SidedProxy(ProxySide.CLIENT, SMSOnlineClient)
    client!: SMSOnlineClient;
    @SidedProxy(ProxySide.SERVER, SMSOnlineServer)
    server!: SMSOnlineServer;

    // Storage
    LobbyConfig: ISMSOnlineLobbyConfig = {} as ISMSOnlineLobbyConfig;
    clientStorage: SMSOnlineStorageClient = new SMSOnlineStorageClient();

    sendPacketToPlayersInScene(packet: IPacketHeader): void {
        if (this.ModLoader.isServer) {
            this.server.sendPacketToPlayersInScene(packet);
        }
    }

    getClientStorage(): SMSOnlineStorageClient | null {
        return this.client !== undefined ? this.client.clientStorage : null;
    }

    canWriteDataSafely(): boolean {
        return !(!this.core.helper.isMarioControllable() || !this.core.helper.isMarioExists() ||
            this.core.helper.isTitleScreen() || !this.core.helper.isSceneNumberValid() ||
            this.core.helper.isPaused());
    }

    preinit(): void {
        if (this.client !== undefined) this.client.clientStorage = this.clientStorage;
    }
    init(): void {
    }
    postinit(): void {

    }
    onTick(frame?: number | undefined): void {

        if (!this.canWriteDataSafely()) return;
    }

    getServerURL(): string {
        return "192.99.70.23:8010";
    }
}

module.exports = SuperMarioSunshineOnline;

export default SuperMarioSunshineOnline;