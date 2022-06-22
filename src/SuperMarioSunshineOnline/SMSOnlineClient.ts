import { SMSOEvents, SMSOPlayerRoom, SMSOPlayerScene, } from "./api/SMSOAPI";
import path from "path";
import { InjectCore } from "modloader64_api/CoreInjection";
import { DiscordStatus } from "modloader64_api/Discord";
import { EventHandler, PrivateEventHandler, EventsClient, bus } from "modloader64_api/EventHandler";
import { IModLoaderAPI, IPlugin, ModLoaderEvents } from "modloader64_api/IModLoaderAPI";
import { ModLoaderAPIInject } from "modloader64_api/ModLoaderAPIInjector";
import { INetworkPlayer, LobbyData, NetworkHandler } from "modloader64_api/NetworkHandler";
import { Preinit, Init, Postinit, onTick } from "modloader64_api/PluginLifecycle";
import { ParentReference, SidedProxy, ProxySide } from "modloader64_api/SidedProxy/SidedProxy";
import { SMSO_UpdateSaveDataPacket, SMSO_DownloadRequestPacket, SMSO_ScenePacket, SMSO_SceneRequestPacket, SMSO_DownloadResponsePacket, SMSO_ErrorPacket, SMSO_RoomPacket } from "./network/SMSOPackets";
import { ISMSOnlineLobbyConfig, SMSOnlineConfigCategory } from "./SMSOnline";
import { SMSOSaveData } from "./save/SMSOnlineSaveData";
import { SMSOnlineStorage } from "./storage/SMSOnlineStorage";
import { SMSOnlineStorageClient } from "./storage/SMSOnlineStorageClient";
import fs from 'fs';
import { SMSO_PRIVATE_EVENTS } from "./api/InternalAPI";
import SMSSerialize from "./storage/SMSSerialize";
import { ISMSCore } from "SuperMarioSunshine/API/SMSAPI";
import { parseFlagChanges } from "./save/parseFlagChanges";
import * as API from "SuperMarioSunshine/API/SMSAPI";
import bitwise from 'bitwise';
import { PuppetOverlord } from "./puppet/PuppetOverlord";

export default class SMSOnlineClient {
    @InjectCore()
    core!: ISMSCore;

    @ModLoaderAPIInject()
    ModLoader!: IModLoaderAPI;

    @ParentReference()
    parent!: IPlugin;

    @SidedProxy(ProxySide.CLIENT, PuppetOverlord)
    puppets!: PuppetOverlord;

    LobbyConfig: ISMSOnlineLobbyConfig = {} as ISMSOnlineLobbyConfig;
    clientStorage: SMSOnlineStorageClient = new SMSOnlineStorageClient();
    config!: SMSOnlineConfigCategory;

    syncContext: number = -1;
    syncTimer: number = 0;
    synctimerMax: number = 60 * 20;
    syncPending: boolean = false;


    @EventHandler(EventsClient.ON_PLAYER_JOIN)
    onPlayerJoined(player: INetworkPlayer) {
        this.clientStorage.players[player.uuid] = "-1";
        this.clientStorage.networkPlayerInstances[player.uuid] = player;
    }

    @EventHandler(EventsClient.ON_PLAYER_LEAVE)
    onPlayerLeave(player: INetworkPlayer) {
        delete this.clientStorage.players[player.uuid];
        delete this.clientStorage.networkPlayerInstances[player.uuid];
    }

    @Preinit()
    preinit() {
        this.config = this.ModLoader.config.registerConfigCategory("SMSOnline") as SMSOnlineConfigCategory;
    }

    @Init()
    init(): void {
    }

    @Postinit()
    postinit() {
        let status: DiscordStatus = new DiscordStatus('Playing SMSOnline', 'On the title screen');
        status.smallImageKey = 'SMSO';
        status.partyId = this.ModLoader.clientLobby;
        status.partyMax = 30;
        status.partySize = 1;
        this.ModLoader.gui.setDiscordStatus(status);
        this.clientStorage.saveManager = new SMSOSaveData(this.core, this.ModLoader);
        this.ModLoader.utils.setIntervalFrames(() => {
            this.inventoryUpdateTick();
        }, 20);
    }

    updateInventory() {
        if (this.core.helper.isTitleScreen() || !this.core.helper.isSceneNumberValid() || this.core.helper.isPaused() || !this.clientStorage.first_time_sync) return;
        if (this.syncTimer > this.synctimerMax) {
            this.clientStorage.lastPushHash = this.ModLoader.utils.hashBuffer(Buffer.from("RESET"));
        }
        let save = this.clientStorage.saveManager.createSave();
        if (this.clientStorage.lastPushHash !== this.clientStorage.saveManager.hash) {
            this.ModLoader.privateBus.emit(SMSO_PRIVATE_EVENTS.DOING_SYNC_CHECK, {});
            this.ModLoader.clientSide.sendPacket(new SMSO_UpdateSaveDataPacket(this.ModLoader.clientLobby, save, this.clientStorage.world));
            this.clientStorage.lastPushHash = this.clientStorage.saveManager.hash;
            this.syncTimer = 0;
        }
    }

    //------------------------------
    // Lobby Setup
    //------------------------------

    @EventHandler(EventsClient.ON_SERVER_CONNECTION)
    onConnect() {
        this.ModLoader.logger.debug("Connected to server.");
        this.clientStorage.first_time_sync = false;
    }

    @EventHandler(EventsClient.CONFIGURE_LOBBY)
    onLobbySetup(lobby: LobbyData): void {
        lobby.data['SMSOnline:data_syncing'] = true;
    }

    @EventHandler(EventsClient.ON_LOBBY_JOIN)
    onJoinedLobby(lobby: LobbyData): void {
        this.clientStorage.first_time_sync = false;
        this.LobbyConfig.data_syncing = lobby.data['SMSOnline:data_syncing'];
        this.ModLoader.logger.info('SMSOnline settings inherited from lobby.');
    }

    //------------------------------
    // Scene handling
    //------------------------------

    @EventHandler(API.SMSEvents.ON_SAVE_LOADED)
    onSaveLoad(Scene: number) {
        if (!this.clientStorage.first_time_sync && !this.syncPending) {

            this.ModLoader.utils.setTimeoutFrames(() => {
                if (this.LobbyConfig.data_syncing) {
                    this.ModLoader.me.data["world"] = this.clientStorage.world;
                    this.ModLoader.clientSide.sendPacket(new SMSO_DownloadRequestPacket(this.ModLoader.clientLobby, new SMSOSaveData(this.core, this.ModLoader).createSave()));
                }
            }, 50);
            this.syncPending = true;
        }
    }

    @EventHandler(API.SMSEvents.ON_SCENE_CHANGE)
    onSceneChange(scene: number) {
        if (!this.clientStorage.first_time_sync && !this.syncPending) {
            this.ModLoader.utils.setTimeoutFrames(() => {
                if (this.LobbyConfig.data_syncing) {
                    this.ModLoader.me.data["world"] = this.clientStorage.world;
                    this.ModLoader.clientSide.sendPacket(new SMSO_DownloadRequestPacket(this.ModLoader.clientLobby, new SMSOSaveData(this.core, this.ModLoader).createSave()));
                }
            }, 300);
            this.syncPending = true;
        }
        this.ModLoader.clientSide.sendPacket(
            new SMSO_ScenePacket(
                this.ModLoader.clientLobby,
                scene
            )
        );
        this.ModLoader.logger.info('client: I moved to scene ' + scene + '.');
        if (this.core.helper.isSceneNumberValid()) {
            this.ModLoader.gui.setDiscordStatus(
                new DiscordStatus(
                    'Playing SMSOnline',
                    'In ' +
                    scene
                )
            );
        }
    }

    @EventHandler(API.SMSEvents.ON_ROOM_CHANGE)
    onRoomChange(scene: string, room: number) {

    }

    @NetworkHandler('SMSO_ScenePacket')
    onSceneChange_client(packet: SMSO_ScenePacket) {
        this.ModLoader.logger.info(
            'client receive: Player ' +
            packet.player.nickname +
            ' moved to scene ' +
            packet.scene
            +
            '.'
        );
        bus.emit(
            SMSOEvents.CLIENT_REMOTE_PLAYER_CHANGED_SCENES,
            new SMSOPlayerScene(packet.player, packet.lobby, packet.scene)
        );
    }

    // This packet is basically 'where the hell are you?' if a player has a puppet on file but doesn't know what scene its suppose to be in.
    @NetworkHandler('SMSO_SceneRequestPacket')
    onSceneRequest_client(packet: SMSO_SceneRequestPacket) {
        if (this.core.save !== undefined) {
            this.ModLoader.clientSide.sendPacketToSpecificPlayer(
                new SMSO_ScenePacket(
                    this.ModLoader.clientLobby,
                    this.core.global.current_scene_number
                ),
                packet.player
            );
        }
    }

    // The server is giving me data.
    @NetworkHandler('SMSO_DownloadResponsePacket')
    onDownloadPacket_client(packet: SMSO_DownloadResponsePacket) {
        this.syncPending = false;
        if (
            this.core.helper.isTitleScreen() ||
            !this.core.helper.isSceneNumberValid()
        ) {
            return;
        }
        if (!packet.host) {
            if (packet.save) {
                //this.clientStorage.saveManager.forceOverrideSave(packet.save!, this.core.save as any, ProxySide.CLIENT);
                //this.clientStorage.saveManager.processKeyRing_OVERWRITE(packet.keys!, this.clientStorage.saveManager.createKeyRing(), ProxySide.CLIENT);
                // Update hash.
                //this.clientStorage.saveManager.createSave();
                this.clientStorage.lastPushHash = this.clientStorage.saveManager.hash;
            }
        } else {
            this.ModLoader.logger.info("The lobby is mine!");
        }
        this.ModLoader.utils.setTimeoutFrames(() => {
            this.clientStorage.first_time_sync = true;
        }, 20);
    }

    @NetworkHandler('SMSO_UpdateSaveDataPacket')
    onSaveUpdate(packet: SMSO_UpdateSaveDataPacket) {
        if (
            this.core.helper.isTitleScreen() ||
            !this.core.helper.isSceneNumberValid()
        ) {
            return;
        }
        if (packet.world !== this.clientStorage.world) {
            return;
        }

        this.clientStorage.saveManager.applySave(packet.save);
        // Update hash.
        this.clientStorage.saveManager.createSave();
        this.clientStorage.lastPushHash = this.clientStorage.saveManager.hash;
    }


    @NetworkHandler('SMSO_ErrorPacket')
    onError(packet: SMSO_ErrorPacket) {
        this.ModLoader.logger.error(packet.message);
    }

    @onTick()
    onTick() {
        if (
            !this.core.helper.isTitleScreen() &&
            this.core.helper.isSceneNumberValid()
        ) {
            if (!this.core.helper.isPaused()) {
                this.ModLoader.me.data["world"] = this.clientStorage.world;
                if (!this.clientStorage.first_time_sync) {
                    return;
                }
                if (this.LobbyConfig.data_syncing) {
                    this.syncTimer++;
                }
            }
        }
    }

    inventoryUpdateTick() {
        //this.updateInventory();
    }

}
