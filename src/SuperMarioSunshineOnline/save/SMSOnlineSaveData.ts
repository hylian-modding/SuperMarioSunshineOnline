import { ISMSOSyncSave } from "../types/SMSAliases";
import { IKeyRing } from "./IKeyRing";
import { SMSOEvents, SMSOSaveDataItemSet } from "../api/SMSOAPI";
import { bus } from "modloader64_api/EventHandler";
import { IModLoaderAPI } from "modloader64_api/IModLoaderAPI";
import { ProxySide } from "modloader64_api/SidedProxy/SidedProxy";
import { ISaveSyncData } from "./ISaveSyncData";
import { ISMSCore } from 'SuperMarioSunshine/API/SMSAPI'
import SMSSerialize from "../storage/SMSSerialize";
import fs from 'fs';
import { parseFlagChanges } from "./parseFlagChanges";

export class SMSOSaveData implements ISaveSyncData {

  private core: ISMSCore;
  private ModLoader: IModLoaderAPI;
  hash: string = "";

  constructor(core: ISMSCore, ModLoader: IModLoaderAPI) {
    this.core = core;
    this.ModLoader = ModLoader;
  }

  private generateWrapper(): ISMSOSyncSave {
    let obj: any = {};
    let keys = [
    ];

    obj = JSON.parse(JSON.stringify(this.core.save));
    let obj2: any = {};
    for (let i = 0; i < keys.length; i++) {
      obj2[keys[i]] = obj[keys[i]];
    }
    return obj2 as ISMSOSyncSave;
  }

  createSave(): Buffer {
    let obj = this.generateWrapper();
    let buf = SMSSerialize.serializeSync(obj);
    this.hash = this.ModLoader.utils.hashBuffer(buf);
    return buf;
  }

  private processBoolLoop(obj1: any, obj2: any) {
    Object.keys(obj1).forEach((key: string) => {
      if (typeof (obj1[key]) === 'boolean') {
        if (obj1[key] === true && obj2[key] === false) {
          obj2[key] = true;
          bus.emit(SMSOEvents.SAVE_DATA_ITEM_SET, new SMSOSaveDataItemSet(key, obj2[key]));
        }
      }
    });
  }

  private processMixedLoop(obj1: any, obj2: any, blacklist: Array<string>) {
    Object.keys(obj1).forEach((key: string) => {
      if (blacklist.indexOf(key) > -1) return;
      if (typeof (obj1[key]) === 'boolean') {
        if (obj1[key] === true && obj2[key] === false) {
          obj2[key] = obj1[key];
          bus.emit(SMSOEvents.SAVE_DATA_ITEM_SET, new SMSOSaveDataItemSet(key, obj2[key]));
        }
      } else if (typeof (obj1[key]) === 'number') {
        if (obj1[key] > obj2[key]) {
          obj2[key] = obj1[key];
          bus.emit(SMSOEvents.SAVE_DATA_ITEM_SET, new SMSOSaveDataItemSet(key, obj2[key]));
        }
      }
    });
  }

  private processBoolLoop_OVERWRITE(obj1: any, obj2: any) {
    Object.keys(obj1).forEach((key: string) => {
      if (typeof (obj1[key]) === 'boolean') {
        obj2[key] = obj1[key];
      }
    });
  }

  private processMixedLoop_OVERWRITE(obj1: any, obj2: any, blacklist: Array<string>) {
    Object.keys(obj1).forEach((key: string) => {
      if (blacklist.indexOf(key) > -1) return;
      if (typeof (obj1[key]) === 'boolean') {
        obj2[key] = obj1[key];
      } else if (typeof (obj1[key]) === 'number') {
        obj2[key] = obj1[key];
      }
    });
  }

  private isGreaterThan(obj1: number, obj2: number) {
    if (obj1 === 255) obj1 = 0;
    if (obj2 === 255) obj2 = 0;
    return (obj1 > obj2);
  }

  private isNotEqual(obj1: number, obj2: number) {
    if (obj1 === 255) obj1 = 0;
    if (obj2 === 255) obj2 = 0;
    return (obj1 !== obj2);
  }

  forceOverrideSave(save: Buffer, storage: ISMSOSyncSave, side: ProxySide) {
    try {
      let obj: ISMSOSyncSave = SMSSerialize.deserializeSync(save);

    } catch (err: any) {
      console.log(err.stack);
    }
  }


  mergeSave(save: Buffer, storage: ISMSOSyncSave, side: ProxySide): Promise<boolean> {
    return new Promise((accept, reject) => {
      SMSSerialize.deserialize(save).then((obj: ISMSOSyncSave) => {

        accept(true);
      }).catch((err: string) => {
        console.log(err);
        reject(false);
      });
    });
  }

  applySave(save: Buffer) {
    this.mergeSave(save, this.core.save as any, ProxySide.CLIENT).then((bool: boolean) => { }).catch((bool: boolean) => { });
  }

}