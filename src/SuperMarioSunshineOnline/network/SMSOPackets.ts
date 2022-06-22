import { PuppetData } from '@SuperMarioSunshineOnline/puppet/PuppetData';
import {
  Packet, UDPPacket
} from 'modloader64_api/ModLoaderDefaultImpls';
import { INetworkPlayer } from 'modloader64_api/NetworkHandler';

export class PacketWithTimeStamp extends Packet{
  timestamp: number = Date.now();
}

export class SMSO_ScenePacket extends Packet {
  scene: number;

  constructor(lobby: string, scene: number) {
    super('SMSO_ScenePacket', 'SMSOnline', lobby, true);
    this.scene = scene;
  }
}

export class SMSO_RoomPacket extends Packet {
  scene: number;
  room: number;

  constructor(lobby: string, scene: number, room: number) {
    super('SMSO_RoomPacket', 'SMSOnline', lobby, true);
    this.scene = scene;
    this.room = room;
  }
}

export class SMSO_SceneRequestPacket extends Packet {
  constructor(lobby: string) {
    super('SMSO_SceneRequestPacket', 'SMSOnline', lobby, true);
  }
}

export class SMSO_DownloadResponsePacket extends Packet {

  save?: Buffer;
  host: boolean;

  constructor(lobby: string, host: boolean) {
    super('SMSO_DownloadResponsePacket', 'SMSOnline', lobby, false);
    this.host = host;
  }
}

export class SMSO_DownloadRequestPacket extends Packet {

  save: Buffer;

  constructor(lobby: string, save: Buffer) {
    super('SMSO_DownloadRequestPacket', 'SMSOnline', lobby, false);
    this.save = save;
  }
}

export class SMSO_UpdateSaveDataPacket extends Packet {

  save: Buffer;
  world: number;

  constructor(lobby: string, save: Buffer, world: number) {
    super('SMSO_UpdateSaveDataPacket', 'SMSOnline', lobby, false);
    this.save = save;
    this.world = world;
  }
}

export class SMSO_ErrorPacket extends Packet{

  message: string;

  constructor(msg: string, lobby: string){
    super('SMSO_ErrorPacket', 'SMSO', lobby, false);
    this.message = msg;
  }

}

export class SMSO_PuppetPacket {
  data: PuppetData;

  constructor(puppetData: PuppetData, lobby: string) {
    this.data = puppetData;
  }
}

export class SMSO_PuppetWrapperPacket extends UDPPacket {

  data: string;

  constructor(packet: SMSO_PuppetPacket, lobby: string) {
    super('SMSO_PuppetPacket', 'SMSO', lobby, false);
    this.data = JSON.stringify(packet);
  }
}