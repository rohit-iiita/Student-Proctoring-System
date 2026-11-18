/** Student row shown on the admin "Manage Students" page */
export interface TAdminStudentListItem {
  id: string;
  fullName: string;
  email: string | null;
  enrollmentNo: string | null;
  department: string | null;
  semester: number | null;
  batchYear: number | null;
  createdAt: string;
}

/** Faculty row shown on the admin "Manage Faculty" page */
export interface TAdminFacultyListItem {
  id: string;
  fullName: string;
  email: string | null;
  employeeId: string | null;
  department: string | null;
  designation: string | null;
  createdAt: string;
}
