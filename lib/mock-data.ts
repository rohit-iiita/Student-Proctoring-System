// Mock demo data for pages that have not been migrated to Supabase yet.
// NOTE: Complaints now use real database data via modules/complaints.

export interface MockUser {
  id: string;
  name: string;
  email: string;
  password: string; // Stored in plain text here only for simple front-end testing
  role: "student" | "faculty" | "admin";
  idNumber: string; // Roll number for student, Employee ID for faculty/admin
  phone: string;
  department?: string; // Department for faculty
}

// Three sample accounts: one Student, one Faculty, one Admin
export const mockUsers: MockUser[] = [
  {
    id: "1",
    name: "Alex Johnson",
    email: "student@campus.edu",
    password: "password123",
    role: "student",
    idNumber: "2024CS101",
    phone: "9876543210",
  },
  {
    id: "2",
    name: "Dr. Sarah Smith",
    email: "faculty@campus.edu",
    password: "password123",
    role: "faculty",
    idNumber: "FAC-8821",
    phone: "9876543211",
    department: "Computer Science & Engineering",
  },
  {
    id: "3",
    name: "Admin Officer",
    email: "admin@campus.edu",
    password: "password123",
    role: "admin",
    idNumber: "ADM-0001",
    phone: "9876543212",
  },
];

// Sample mock meetings
export interface MockMeeting {
  id: string;
  title: string;
  date: string;
  time: string;
  facultyName: string;
  studentName: string;
  status: "scheduled" | "completed";
}

export const mockMeetings: MockMeeting[] = [
  {
    id: "m1",
    title: "Hostel Committee Inquiry regarding Block B Water",
    date: "2026-11-18",
    time: "10:30 AM",
    facultyName: "Dr. Sarah Smith",
    studentName: "Alex Johnson",
    status: "scheduled",
  },
  {
    id: "m2",
    title: "Academic Grievance Hearing - OS Lab 2",
    date: "2026-11-20",
    time: "02:00 PM",
    facultyName: "Dr. Sarah Smith",
    studentName: "Alex Johnson",
    status: "scheduled",
  },
];
