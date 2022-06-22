import { IPacketHeader, INetworkPlayer } from 'modloader64_api/NetworkHandler';
import { bus } from 'modloader64_api/EventHandler';
import { Packet } from 'modloader64_api/ModLoaderDefaultImpls';
import { SMSOnlineStorageClient } from '../storage/SMSOnlineStorageClient';

export enum SMSOEvents {
  SERVER_PLAYER_CHANGED_SCENES = 'SMSOnline:onServerPlayerChangedScenes',
  SERVER_PLAYER_CHANGED_ROOMS = 'SMSOnline:onServerPlayerChangedRooms',
  CLIENT_REMOTE_PLAYER_CHANGED_SCENES = 'SMSOnline:onRemotePlayerChangedScenes',
  ON_INVENTORY_UPDATE = 'SMSOnline:OnInventoryUpdate',
  SAVE_DATA_ITEM_SET = 'SMSOnline:SAVE_DATA_ITEM_SET',
  PLAYER_PUPPET_PRESPAWN = 'SMSOnline:onPlayerPuppetPreSpawned',
  PLAYER_PUPPET_SPAWNED = 'SMSOnline:onPlayerPuppetSpawned',
  PLAYER_PUPPET_DESPAWNED = 'SMSOnline:onPlayerPuppetDespawned',
  PLAYER_PUPPET_QUERY = "SMSOnline:PlayerPuppetQuery",
  GAINED_HEART_CONTAINER = 'SMSOnline:GainedHeartContainer',
  GAINED_PIECE_OF_HEART = 'SMSOnline:GainedPieceOfHeart',
  MAGIC_METER_INCREASED = 'SMSOnline:GainedMagicMeter',
  ON_REMOTE_PLAY_SOUND = "SMSOnline:OnRemotePlaySound",
  ON_LOADING_ZONE = "SMSOnline:OnLoadingZone"
}

export class SMSOPlayerScene {
  player: INetworkPlayer;
  lobby: string;
  scene: number;

  constructor(player: INetworkPlayer, lobby: string, scene: number) {
    this.player = player;
    this.scene = scene;
    this.lobby = lobby;
  }
}

export class SMSOPlayerRoom {
  player: INetworkPlayer;
  lobby: string;
  room: number;

  constructor(player: INetworkPlayer, lobby: string, room: number) {
    this.player = player;
    this.room = room;
    this.lobby = lobby;
  }
}

export class SMSOSaveDataItemSet {
  key: string;
  value: boolean | number | Buffer;

  constructor(key: string, value: boolean | number | Buffer) {
    this.key = key;
    this.value = value;
  }
}

export interface ISMSOnlineHelpers {
  sendPacketToPlayersInScene(packet: IPacketHeader): void;
  getClientStorage(): SMSOnlineStorageClient | null;
}

export class RemoteSoundPlayRequest {

  player: INetworkPlayer;
  puppet: any;
  sound_id: number;
  isCanceled: boolean = false;

  constructor(player: INetworkPlayer, puppet: any, sound_id: number) {
    this.player = player;
    this.puppet = puppet;
    this.sound_id = sound_id;
  }

}

export const enum Command{
  COMMAND_TYPE_NONE,
  COMMAND_TYPE_PUPPET_SPAWN,
  COMMAND_TYPE_PUPPET_DESPAWN,
  COMMAND_TYPE_COUNT
}

export interface ICommandBuffer {
  runCommand(command: Command, data: Buffer, uuid?: number): number;
}
