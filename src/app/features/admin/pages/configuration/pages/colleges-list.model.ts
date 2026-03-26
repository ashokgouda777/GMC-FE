export interface CollegeList {
    collegeId: string;
    collegeName: string;
    collegeCode: string;
    universityId: string;
    universityName: string;
    type: string;
    principalName: string;
    telNumber: string;
    email: string;
    country: string;
    state: string;
    district: string;
    password?: string;
    collegeAddress: string;
    activeStatus: 'Active' | 'Inactive';
}

