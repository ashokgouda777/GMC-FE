export interface CountryList {
    countryId: string;
    countryName: string;
    status: 'A' | 'D';
    activeStatus?: 'Active' | 'Inactive'; // For UI display
}
