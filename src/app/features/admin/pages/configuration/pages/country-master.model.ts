export interface CountryList {
    countryId: string;
    countryName: string;
    status: 'Yes' | 'No';
    activeStatus?: 'Active' | 'Inactive'; // For UI display
}
