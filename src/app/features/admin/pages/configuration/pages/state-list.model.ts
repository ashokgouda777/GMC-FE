export interface StateList {
    stateId: string;
    stateName: string;
    countryId: string;
    countryName: string;
    status: 'A' | 'D';
    activeStatus?: 'Active' | 'Inactive'; // For UI display
}
