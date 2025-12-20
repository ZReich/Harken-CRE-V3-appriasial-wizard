export enum ApprausalListingEnum {
}

interface City {
    city: string;
}

export interface FilterComp {
    dateOfAnalysisTo: string,
    dateOfAnalysisFrom: string,
    streetAddress: string,
    compType?: string,
    city: City[],
    state:string;  
}
