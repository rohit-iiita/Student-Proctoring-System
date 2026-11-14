// Mock user data for testing the front-end before the backend is connected.
// NOTE: Your backend partner will replace this with real Supabase database queries later.

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

// Sample mock complaints
export interface MockComplaint {
  id: string;
  refNumber: string;
  studentName: string;
  category: string;
  subject: string;
  status: "submitted" | "under_review" | "resolved" | "rejected";
  assignedFaculty: string;
  createdAt: string;
}

// Consistent complaints list matching the dashboard summary cards:
// - Alex Johnson (Student) has 4 complaints: 1 submitted, 1 under review, 2 resolved. Total = 4. Unresolved = 2. Resolved = 2.
// - Dr. Sarah Smith (Faculty) has 4 assigned complaints: 2 under review, 2 resolved. Total assigned = 4. Pending = 2. Resolved = 2.
// - Admin sees all 6 complaints.
export const mockComplaints: MockComplaint[] = [
  {
    id: "c1",
    refNumber: "CMP-2024-001",
    studentName: "Alex Johnson",
    category: "Mess & Food",
    subject: "Quality and hygiene in South Campus cafeteria",
    status: "submitted",
    assignedFaculty: "Unassigned",
    createdAt: "2026-11-14",
  },
  {
    id: "c2",
    refNumber: "CMP-2024-002",
    studentName: "Alex Johnson",
    category: "Hostel",
    subject: "Hot water supply outage on Block B 3rd floor",
    status: "under_review",
    assignedFaculty: "Dr. Sarah Smith",
    createdAt: "2026-11-12",
  },
  {
    id: "c3",
    refNumber: "CMP-2024-003",
    studentName: "Alex Johnson",
    category: "TA & Academics",
    subject: "Grading discrepancy in Operating Systems Lab 2",
    status: "resolved",
    assignedFaculty: "Dr. Sarah Smith",
    createdAt: "2026-11-10",
  },
  {
    id: "c4",
    refNumber: "CMP-2024-004",
    studentName: "Alex Johnson",
    category: "Hostel",
    subject: "Study hall ceiling light maintenance request",
    status: "resolved",
    assignedFaculty: "Dr. Robert Brown",
    createdAt: "2026-11-06",
  },
  {
    id: "c5",
    refNumber: "CMP-2024-005",
    studentName: "Michael Chang",
    category: "Ragging & Harassment",
    subject: "Loud noise and intimidation outside dorms at night",
    status: "under_review",
    assignedFaculty: "Dr. Sarah Smith",
    createdAt: "2026-11-04",
  },
  {
    id: "c6",
    refNumber: "CMP-2024-006",
    studentName: "Emily Davis",
    category: "Discrimination & Misconduct",
    subject: "Library seat reservation conflict during examinations",
    status: "rejected",
    assignedFaculty: "Admin Review Board",
    createdAt: "2026-11-01",
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
