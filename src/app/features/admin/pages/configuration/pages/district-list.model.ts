export interface DistrictList {
    districtId: string;
    districtName: string;
    stateId: string;
    stateName: string;
    countryId: string;
    countryName: string;
    status: 'A' | 'D';
    activeStatus?: 'Active' | 'Inactive'; // For UI display
    appYN?: string;
    appCenter?: string;
    councilId?: string;
}
