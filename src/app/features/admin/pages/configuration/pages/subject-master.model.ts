export interface SubjectMaster {
    subjectId: string;
    sub_code: string;
    shortCode: string;
    subjectName: string;
    courseId: string;
    courseName: string;
    status: string;
    activeStatus: 'Active' | 'Inactive';
}

export interface SubjectSavePayload {
    sub_code: string;
    sub_name: string;
    createdBy: string;
    updatedBy: string | null;
    shortCode: string;
    courseId: string;
    activeStatus: string;
}
