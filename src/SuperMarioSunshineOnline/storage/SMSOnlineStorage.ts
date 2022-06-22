import { ISMSOSyncSave } from '../types/SMSAliases';
import { SMSOnlineStorageBase } from './SMSOnlineStorageBase';
import * as API from 'SuperMarioSunshine/API/Imports';
import { IQuestStatus } from 'SuperMarioSunshine/API/imports';

export class SMSOnlineStorage extends SMSOnlineStorageBase {
  networkPlayerInstances: any = {};
  players: any = {};
  worlds: Array<SMSOnlineSave_Server> = [];
  saveGameSetup = false;
}

export interface ISMSOSyncSaveServer extends ISMSOSyncSave {
}

class SMSOSyncSaveServer implements ISMSOSyncSaveServer {
  questStatus!: API.IQuestStatus;
}

export class SMSOnlineSave_Server {
  saveGameSetup = false;
  save: ISMSOSyncSaveServer = new SMSOSyncSaveServer();
}