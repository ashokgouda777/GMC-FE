export interface CourseList {
    courseId?: string; // Optional if not in GET but in SAVE
    courseName: string;
    shortcutCode: string;
    status: string;
    activeStatus?: 'Active' | 'Inactive'; // For UI display
}

