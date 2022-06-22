import * as API from 'SuperMarioSunshine/API/Imports';
import { SMSOSaveData } from '@SuperMarioSunshineOnline/save/SMSOnlineSaveData';

export class SMSOnlineStorageBase {
  constructor() { }
  saveManager!: SMSOSaveData;
  players: any = {};
  networkPlayerInstances: any = {};
}