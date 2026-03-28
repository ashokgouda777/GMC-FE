export interface NationalityList {
    nationalityId: string;
    nationality: string;
    status: 'Yes' | 'No';
    activeStatus?: 'Active' | 'Inactive'; // For UI display
}
