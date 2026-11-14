// Mock user data and centralized complaints store for testing the front-end before the backend is connected.
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

// Available faculty members for assignment by Admin
export const availableFaculty: string[] = [
  "Dr. Sarah Smith",
  "Dr. Robert Brown",
  "Prof. Alan Turing",
];

// Exact standardized complaint categories used across the entire application
export const complaintCategories: string[] = [
  "Ragging and Harassment",
  "TA",
  "Hostel",
  "Mess and Food",
  "Discrimination and Misconduct",
];

// Attachment structure for uploaded files
export interface ComplaintAttachment {
  name: string;
  size: string; // e.g. "1.2 MB", "450 KB"
}

// Full Complaint structure
export interface MockComplaint {
  id: string;
  refNumber: string;
  studentName: string;
  category: string;
  subject: string;
  description: string;
  status: "submitted" | "under_review" | "resolved" | "rejected";
  assignedFaculty: string;
  createdAt: string;
  respondents?: string;
  attachments?: ComplaintAttachment[];
  notes?: string;
}

// Initial mock complaints dataset
export let mockComplaints: MockComplaint[] = [
  {
    id: "c1",
    refNumber: "CMP-2024-001",
    studentName: "Alex Johnson",
    category: "Mess and Food",
    subject: "Quality and hygiene in South Campus cafeteria",
    description:
      "The food served during dinner yesterday appeared stale, and basic sanitation standards are not being maintained by the catering staff.",
    status: "submitted",
    assignedFaculty: "Unassigned",
    createdAt: "2026-11-14",
    respondents: "Cafeteria Vendor Lead",
    attachments: [
      { name: "cafeteria_photo_1.jpg", size: "1.4 MB" },
      { name: "inspection_receipt.pdf", size: "420 KB" },
    ],
    notes: "",
  },
  {
    id: "c2",
    refNumber: "CMP-2024-002",
    studentName: "Alex Johnson",
    category: "Hostel",
    subject: "Hot water supply outage on Block B 3rd floor",
    description:
      "The solar geyser heating units on the 3rd floor of Hostel Block B have been broken for the past 4 days. Multiple requests to the caretaker went unaddressed.",
    status: "under_review",
    assignedFaculty: "Dr. Sarah Smith",
    createdAt: "2026-11-12",
    respondents: "Hostel B Maintenance Staff",
    attachments: [
      { name: "geyser_error_log.pdf", size: "850 KB" },
    ],
    notes: "Site inspection scheduled with the campus plumbing contractor.",
  },
  {
    id: "c3",
    refNumber: "CMP-2024-003",
    studentName: "Alex Johnson",
    category: "TA",
    subject: "Grading discrepancy in Operating Systems Lab 2",
    description:
      "My submission passed all test cases during live evaluation, but was awarded 60% due to an automated script error.",
    status: "resolved",
    assignedFaculty: "Dr. Sarah Smith",
    createdAt: "2026-11-10",
    respondents: "TA Mark Williams",
    attachments: [
      { name: "lab2_test_results.png", size: "2.1 MB" },
      { name: "submission_code.pdf", size: "310 KB" },
    ],
    notes: "Reviewed submission code. Test case runner bug confirmed and full marks updated in grading sheet.",
  },
  {
    id: "c4",
    refNumber: "CMP-2024-004",
    studentName: "Alex Johnson",
    category: "Hostel",
    subject: "Study hall ceiling light maintenance request",
    description:
      "Four overhead lights in the 2nd-floor quiet study hall are flickering constantly, making it difficult to study after 7 PM.",
    status: "resolved",
    assignedFaculty: "Dr. Robert Brown",
    createdAt: "2026-11-06",
    respondents: "Estate & Electrical Division",
    attachments: [
      { name: "light_fixture.jpg", size: "1.8 MB" },
    ],
    notes: "Electrician replaced LED ballast fixtures on Nov 7.",
  },
  {
    id: "c5",
    refNumber: "CMP-2024-005",
    studentName: "Michael Chang",
    category: "Ragging and Harassment",
    subject: "Loud noise and intimidation outside dorms at night",
    description:
      "A group of senior students played excessively loud music and banged on freshman dorm doors past 1:00 AM on Sunday night.",
    status: "under_review",
    assignedFaculty: "Dr. Sarah Smith",
    createdAt: "2026-11-04",
    respondents: "Block C 4th Floor Residents",
    attachments: [
      { name: "dorm_corridor_photo.jpg", size: "980 KB" },
    ],
    notes: "Anti-ragging committee meeting scheduled for Nov 18.",
  },
  {
    id: "c6",
    refNumber: "CMP-2024-006",
    studentName: "Emily Davis",
    category: "Discrimination and Misconduct",
    subject: "Library seat reservation conflict during examinations",
    description:
      "Unattended bags were used to block study desks for more than 5 hours against university library code rule 4.2.",
    status: "rejected",
    assignedFaculty: "Admin Review Board",
    createdAt: "2026-11-01",
    respondents: "Library Security Desk",
    attachments: [
      { name: "desk_photo.jpg", size: "1.1 MB" },
    ],
    notes: "Librarian reported the issue was resolved on the spot; desk was cleared within 20 minutes.",
  },
];

// =========================================================================
// CENTRALIZED DATA HELPERS:
// Used by Dashboard, Complaints List, and Details pages so changes sync everywhere
// =========================================================================
const STORAGE_KEY = "campus_complaints_data";

// 1. Get all complaints (reads from browser localStorage if available, else in-memory mock)
export function getComplaints(): MockComplaint[] {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          mockComplaints = parsed;
          return parsed;
        }
      } catch (e) {
        console.error("Failed to parse saved complaints", e);
      }
    }
  }
  return mockComplaints;
}

// 2. Save complaints to both in-memory variable and browser localStorage
export function saveComplaints(newList: MockComplaint[]): void {
  mockComplaints = newList;
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
  }
}

// 3. Add a new complaint (prepends to list so it appears first)
export function addComplaint(newComplaint: MockComplaint): void {
  const current = getComplaints();
  const updated = [newComplaint, ...current];
  saveComplaints(updated);
}

// 4. Update an existing complaint (e.g. status change or faculty assignment)
export function updateComplaint(
  id: string,
  updates: Partial<MockComplaint>
): MockComplaint | undefined {
  const current = getComplaints();
  const index = current.findIndex(
    (c) => c.id === id || c.refNumber.toLowerCase() === id.toLowerCase()
  );
  if (index === -1) return undefined;

  current[index] = { ...current[index], ...updates };
  saveComplaints([...current]);
  return current[index];
}

// 5. Get a single complaint by ID or Reference Number
export function getComplaintById(id: string): MockComplaint | undefined {
  const current = getComplaints();
  return current.find(
    (c) => c.id === id || c.refNumber.toLowerCase() === id.toLowerCase()
  );
}

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
