import { PuppetData } from './PuppetData';
import { INetworkPlayer } from 'modloader64_api/NetworkHandler';
import { bus, EventHandler } from 'modloader64_api/EventHandler';
import { IModLoaderAPI, ModLoaderEvents } from 'modloader64_api/IModLoaderAPI';
import Vector3 from 'modloader64_api/math/Vector3';
import fs from 'fs';
import path from 'path';
import { ISMSCore, SMSEvents } from 'SuperMarioSunshine/API/SMSAPI';
import WWOnline from '../../SuperMarioSunshineOnline';
import { ISMSOnlineHelpers, RemoteSoundPlayRequest, SMSOEvents } from '../api/SMSOAPI';

export class Puppet {
  player: INetworkPlayer;
  id: string;
  data: PuppetData;
  isSpawned = false;
  isSpawning = false;
  isShoveled = false;
  scene: number;
  core: ISMSCore;
  void!: Vector3;
  ModLoader: IModLoaderAPI;
  parent: ISMSOnlineHelpers;
  tunic_color!: number;
  spawnHandle: any = undefined;
  tossedPackets: number = -1;
  uniqueID: number = -1;
  state: number;

  constructor(
    player: INetworkPlayer,
    core: ISMSCore,
    pointer: number,
    ModLoader: IModLoaderAPI,
    parent: ISMSOnlineHelpers,

  ) {
    this.player = player;
    this.data = new PuppetData(pointer, ModLoader, core, parent.getClientStorage()!);
    this.scene = -1;
    this.state = 0;
    this.ModLoader = ModLoader;
    this.core = core;
    this.id = this.ModLoader.utils.getUUID();
    this.parent = parent;
  }


  debug_movePuppetToPlayer() {
    let t = JSON.stringify(this.data);
    let copy = JSON.parse(t);
    Object.keys(copy).forEach((key: string) => {
      (this.data as any)[key] = copy[key];
    });
  }

  doNotDespawnMe(p: number) {
  }

  prevLastEntityPtr: number = 0x0;

  spawn(spawnIndex: number, puppet: Puppet) {
    if (this.isShoveled) {
      this.isShoveled = false;
      this.ModLoader.logger.debug('Puppet resurrected.');
      return;
    }
    if (this.core.helper.isMarioExists() && !this.isSpawned && !this.isSpawning && this.spawnHandle === undefined) {
      bus.emit(SMSOEvents.PLAYER_PUPPET_PRESPAWN, this);

      this.isSpawning = true;
      puppet.data.state = 0x1337;
      console.log("Attempting to spawn puppet with spawnIndex unique id " + spawnIndex + ` || Addr: ${puppet.data.pointer.toString(16)}`);

      // this.commandBuffer.runCommand(Command.COMMAND_TYPE_PUPPET_SPAWN, Buffer.alloc(0), spawnIndex)
    }
    this.ModLoader.utils.setTimeoutFrames(() => { puppet.data.state = 0x1337; }, 60);
  }

  processIncomingPuppetData(data: PuppetData, remote: RemoteSoundPlayRequest) {
    //console.log(`puppet state: ${data.state.toString(16)}`)
    if (this.isSpawned && !this.isShoveled && this.tossedPackets > 100) {
      Object.keys(data).forEach((key: string) => {
        if (key === "sound") {
          if (!remote.isCanceled) {
            (this.data as any)[key] = (data as any)[key];
          }
        } else {
          (this.data as any)[key] = (data as any)[key];
        }
      });
    }
    if (this.tossedPackets <= 100) {
      this.tossedPackets++;
    }
  }

  shovel() {
    if (this.isSpawned) {
      if (this.data.pointer > 0) {
        //this.data.state = 0x0000133F;
        //this.ModLoader.math.rdramWriteV3(this.data.pointer + 0x1F8, this.void);
        this.ModLoader.logger.debug('Puppet ' + this.id + ' shoveled.');
        this.isShoveled = true;
      }
    }
  }

  despawn() {
    if (this.isSpawned) {
      if (this.data.pointer > 0) {
        //et pointer = Buffer.alloc(8);
        //ointer.writeUInt32BE(this.data.pointer, 0);
        //this.commandBuffer.runCommand(Command.COMMAND_TYPE_PUPPET_DESPAWN, pointer, 0)
        //this.data.pointer = 0;
      }
      //this.data.state = 0x0000133F;
      this.isSpawned = false;
      this.isShoveled = false;
      this.ModLoader.logger.debug('Puppet ' + this.id + ' despawned.');
      bus.emit(SMSOEvents.PLAYER_PUPPET_DESPAWNED, this);
    }
    //this.data.state = 0x0000133F;
  }
}
