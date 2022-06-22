import { ProxySide } from "modloader64_api/SidedProxy/SidedProxy";
import { ISMSOSyncSave } from "../types/SMSAliases";

export interface ISaveSyncData {
    hash: string;
    createSave(): Buffer;
    forceOverrideSave(save: Buffer, storage: ISMSOSyncSave, side: ProxySide): void;
    mergeSave(save: Buffer, storage: ISMSOSyncSave, side: ProxySide): Promise<boolean>;
    applySave(save: Buffer): void;
}
