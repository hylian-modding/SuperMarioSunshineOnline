
export interface ISMSClientStorage{
    world: number;
    localization: any;
}

export interface ISMSClientside {
    getClientStorage(): ISMSClientStorage;
}