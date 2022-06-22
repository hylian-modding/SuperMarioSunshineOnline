import { IModLoaderAPI, ModLoaderEvents } from 'modloader64_api/IModLoaderAPI';
import { bus, EventHandler } from 'modloader64_api/EventHandler';
import { ISMSCore } from 'SuperMarioSunshine/API/SMSAPI';
import { SMSOnlineStorageClient } from '../storage/SMSOnlineStorageClient';
import { SmartBuffer } from 'smart-buffer';
import zlib from 'zlib';

export class PuppetData {
  pointer: number;
  ModLoader: IModLoaderAPI;
  core: ISMSCore;
  private readonly copyFields: string[] = new Array<string>();
  private storage: SMSOnlineStorageClient;
  private matrixUpdateTicks: number = 0;
  matrixUpdateRate: number = 2;
  private marioPtr = 0x8040E0E8;
  constructor(
    pointer: number,
    ModLoader: IModLoaderAPI,
    core: ISMSCore,
    storage: SMSOnlineStorageClient
  ) {
    this.storage = storage;
    this.pointer = pointer;
    this.ModLoader = ModLoader;
    this.core = core;
    this.copyFields.push('pos');
    this.copyFields.push('rot');
    //this.copyFields.push('accel_dir');
    this.copyFields.push('unk1');
    this.copyFields.push('unk2');
    //this.copyFields.push('base_accel');
    this.copyFields.push('state');
    this.copyFields.push('r_input');
    this.copyFields.push('prev_state');
    this.copyFields.push('substate');
    this.copyFields.push('flags');
    //this.copyFields.push('fwd_spd');
    //this.copyFields.push('angles');
    //this.copyFields.push('health');
    this.copyFields.push('inputs');
    //this.copyFields.push('fludd_angle');
    //this.copyFields.push('yoshi_state');
    //this.copyFields.push('flutter');
    //this.copyFields.push('juice_level');
    //this.copyFields.push('spray_mario');
    //this.copyFields.push('spray_yoshi');
    //this.copyFields.push('grab_target');
    //this.copyFields.push('sunglasses');
  }


  get pos(): Buffer {
    return this.core.mario.pos;
  }

  set pos(pos: Buffer) {
    this.ModLoader.emulator.rdramWriteBuffer(this.pointer + 0x10, pos);
  }

  get rot(): Buffer {
    return this.core.mario.rot;
  }

  set rot(rot: Buffer) {
    this.ModLoader.emulator.rdramWriteBuffer(this.pointer + 0x30, rot);
  }

  get accel_dir(): number {
    return this.core.mario.accel_dir;
  } 
  set accel_dir(flag: number) {
    this.ModLoader.emulator.rdramWritePtr16(this.pointer, 0x90, flag)
  }

  get unk1(): number {
    return this.core.mario.unk1;
  } // unknown
  set unk1(flag: number) {
    this.ModLoader.emulator.rdramWritePtr32(this.pointer, 0x78, flag);
  }

  get unk2(): number {
    return this.core.mario.unk2;
  } //  unknown
  set unk2(flag: number) {
    this.ModLoader.emulator.rdramWritePtr32(this.pointer, 0xEB8, flag);
  }
  get base_accel(): number {
    return this.core.mario.base_accel;
  }
  set base_accel(flag: number) {
    this.ModLoader.emulator.rdramWritePtr32(this.pointer, 0x8C, flag);
  }

  get state(): number {
    return this.ModLoader.emulator.rdramReadPtr32(this.marioPtr, 0x7C);
  }
  set state(flag: number) {
    this.ModLoader.emulator.rdramWrite32(this.pointer + 0x7C, flag);
  }


  get r_input(): number {
    return this.core.mario.r_input;
  }

  set r_input(flag: number) {
    this.ModLoader.emulator.rdramWritePtr32(this.pointer, 0x1C, flag);
  }

  get prev_state(): number {
    return this.core.mario.prev_state;
  }
  set prev_state(flag: number) {
    this.ModLoader.emulator.rdramWritePtr32(this.pointer, 0x80, flag);
  }

  get substate(): number {
    return this.core.mario.substate;
  }
  set substate(flag: number) {
    this.ModLoader.emulator.rdramWritePtr32(this.pointer, 0x84, flag);
  }

  get flags(): number {
    return this.core.mario.flags;
  }
  set flags(flag: number) {
    this.ModLoader.emulator.rdramWritePtr32(this.pointer, 0x118, flag);
  }

  get fludd_angle(): number {
    return this.core.mario.fludd_angle;
  }
  set fludd_angle(flag: number) {
    let TWaterGunPointer = this.ModLoader.emulator.rdramReadPtr32(this.pointer, 0x3E4);
    this.ModLoader.emulator.rdramWritePtr16(TWaterGunPointer, 0x37A, flag);
  }

  get angles(): number {
    return this.core.mario.angles;
  }
  set angles(flag: number) {
    this.ModLoader.emulator.rdramWritePtr16(this.pointer, 0x96, flag);
  }

  get fwd_spd(): number {
    return this.core.mario.fwd_spd;
  }
  set fwd_spd(flag: number) {
    this.ModLoader.emulator.rdramWritePtr16(this.pointer, 0xB0, flag);
  }

  get health(): number {
    return this.core.mario.health;
  }
  set health(flag: number) {
    this.ModLoader.emulator.rdramWritePtr32(this.pointer, 0x120, flag);
  }

  get inputs(): number {
    return this.core.mario.inputs;
  }
  set inputs(flag: number) {
    this.ModLoader.emulator.rdramWritePtr32(this.pointer, 0x74, flag);
  }

  get yoshi_state(): number {
    return this.core.mario.yoshi_state;
  }
  set yoshi_state(flag: number) {
    let TYoshi = this.ModLoader.emulator.rdramReadPtr32(this.pointer, 0x3F0);
    this.ModLoader.emulator.rdramWritePtr8(TYoshi, 0x0, flag);
  }

  get juice_level(): number {
    return this.core.mario.juice_level;
  }
  set juice_level(flag: number) {
    let TYoshi = this.ModLoader.emulator.rdramReadPtr32(this.pointer, 0x3F0);
    this.ModLoader.emulator.rdramWritePtr32(TYoshi, 0xC, flag);
  }

  get flutter(): number {
    return this.core.mario.flutter;
  }
  set flutter(flag: number) {
    let TYoshi = this.ModLoader.emulator.rdramReadPtr32(this.pointer, 0x3F0);
    this.ModLoader.emulator.rdramWritePtr32(TYoshi, 0xB8, flag);
  }

  get spray_mario(): number {
    return this.core.mario.spray_mario;
  }
  set spray_mario(flag: number) {
    let TWaterGunPointer = this.ModLoader.emulator.rdramReadPtr32(this.pointer, 0x3E4);
    this.ModLoader.emulator.rdramWritePtr8(TWaterGunPointer, 0x715, flag);
  }

  get spray_yoshi(): number {
    return this.core.mario.juice_level;
  }
  set spray_yoshi(flag: number) {
    let TWaterGunPointer = this.ModLoader.emulator.rdramReadPtr32(this.pointer, 0x3E4);
    this.ModLoader.emulator.rdramWritePtr8(TWaterGunPointer, 0x153D, flag);
  }

  get grab_target(): number {
    return this.core.mario.grab_target;
  }
  set grab_target(flag: number) {
    this.ModLoader.emulator.rdramWritePtr32(this.pointer, 0x384, flag);
  }

  get sunglasses(): number {
    return this.core.mario.sunglasses;
  }
  set sunglasses(flag: number) {
    let TMarioCap = this.ModLoader.emulator.rdramReadPtr32(this.pointer, 0x3E0);
    this.ModLoader.emulator.rdramWritePtr8(TMarioCap, 0x5, flag);
  }


  toJSON() {
    const jsonObj: any = {};

    for (let i = 0; i < this.copyFields.length; i++) {
      jsonObj[this.copyFields[i]] = (this as any)[this.copyFields[i]];
    }
    return jsonObj;
  }
}