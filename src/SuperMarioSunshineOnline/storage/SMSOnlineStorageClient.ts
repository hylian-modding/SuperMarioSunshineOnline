import { SMSOnlineStorageBase } from './SMSOnlineStorageBase';
// import * as API from 'SuperMarioSunshine/API/SMSAPI'

export class SMSOnlineStorageClient extends SMSOnlineStorageBase {
  world: number = 0;
  first_time_sync = false;
  lastPushHash = "!";
  localization: any = {};
  localization_island: any = {};
  scene_keys: any = {};
  room_keys: any = {};
  flagHash: string = "";
}
