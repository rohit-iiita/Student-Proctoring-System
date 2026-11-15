// Mock user data and centralized store for complaints, meetings, and notifications.
// NOTE: Your backend partner will replace this with real Supabase database queries and edge functions later.

import { formatTime } from "./utils";

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

// Available faculty members
export const availableFaculty: string[] = [
  "Dr. Sarah Smith",
  "Dr. Robert Brown",
  "Prof. Alan Turing",
];

// Standardized complaint categories used across the entire application
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
// MEETINGS DATA MODEL
// =========================================================================
export interface MeetingParticipant {
  name: string;
  email: string;
  role: "student" | "faculty";
  response: "pending" | "accepted" | "declined";
}

export interface MockMeeting {
  id: string;
  title: string;
  complaintRef: string; // Linked complaint reference number
  date: string; // YYYY-MM-DD
  startTime: string; // e.g. "10:30"
  endTime: string; // e.g. "11:30"
  location: string;
  meetingUrl?: string; // Optional online meeting link
  organizerName: string;
  organizerEmail: string;
  organizerRole: "faculty" | "admin";
  participants: MeetingParticipant[];
  status: "scheduled" | "completed" | "cancelled";
}

export let mockMeetings: MockMeeting[] = [
  {
    id: "m1",
    title: "Hostel Committee Inquiry regarding Block B Water",
    complaintRef: "CMP-2024-002",
    date: "2026-11-18",
    startTime: "10:30",
    endTime: "11:30",
    location: "Faculty Lounge Room 204",
    meetingUrl: "https://meet.google.com/hwb-ptsm-xyz",
    organizerName: "Dr. Sarah Smith",
    organizerEmail: "faculty@campus.edu",
    organizerRole: "faculty",
    participants: [
      {
        name: "Alex Johnson",
        email: "student@campus.edu",
        role: "student",
        response: "pending",
      },
      {
        name: "Dr. Sarah Smith",
        email: "faculty@campus.edu",
        role: "faculty",
        response: "accepted",
      },
    ],
    status: "scheduled",
  },
  {
    id: "m2",
    title: "Academic Grievance Hearing - OS Lab 2",
    complaintRef: "CMP-2024-003",
    date: "2026-11-20",
    startTime: "14:00",
    endTime: "15:00",
    location: "CS Department Conference Hall",
    organizerName: "Dr. Sarah Smith",
    organizerEmail: "faculty@campus.edu",
    organizerRole: "faculty",
    participants: [
      {
        name: "Alex Johnson",
        email: "student@campus.edu",
        role: "student",
        response: "accepted",
      },
    ],
    status: "scheduled",
  },
  {
    id: "m3",
    title: "Preliminary Review on Noise Disturbance",
    complaintRef: "CMP-2024-005",
    date: "2026-11-05",
    startTime: "11:00",
    endTime: "11:45",
    location: "Dean of Student Affairs Office",
    organizerName: "Admin Officer",
    organizerEmail: "admin@campus.edu",
    organizerRole: "admin",
    participants: [
      {
        name: "Dr. Sarah Smith",
        email: "faculty@campus.edu",
        role: "faculty",
        response: "accepted",
      },
      {
        name: "Alex Johnson",
        email: "student@campus.edu",
        role: "student",
        response: "accepted",
      },
      {
        name: "Dr. Robert Brown",
        email: "brown@campus.edu",
        role: "faculty",
        response: "pending", // Shows "No response" in past meetings
      },
    ],
    status: "completed",
  },
];

// =========================================================================
// NOTIFICATIONS DATA MODEL
// =========================================================================
export interface MockNotification {
  id: string;
  recipientEmail: string;
  recipientRole: "student" | "faculty" | "admin";
  title: string;
  message: string;
  time: string;
  read: boolean;
  link?: string;
}

export let mockNotifications: MockNotification[] = [
  {
    id: "n1",
    recipientEmail: "student@campus.edu",
    recipientRole: "student",
    title: "Meeting Invitation",
    message: "You have been invited to 'Hostel Committee Inquiry regarding Block B Water' on 2026-11-18.",
    time: "10 mins ago",
    read: false,
    link: "/meetings?role=student",
  },
  {
    id: "n2",
    recipientEmail: "student@campus.edu",
    recipientRole: "student",
    title: "Complaint Under Review",
    message: "Your complaint CMP-2024-002 has been assigned to Dr. Sarah Smith and is now Under Review.",
    time: "2 hours ago",
    read: false,
    link: "/complaints/c2?role=student",
  },
  {
    id: "n3",
    recipientEmail: "faculty@campus.edu",
    recipientRole: "faculty",
    title: "New Complaint Assigned",
    message: "Complaint CMP-2024-002 (Hostel) has been assigned to you for investigation.",
    time: "1 day ago",
    read: false,
    link: "/complaints/c2?role=faculty",
  },
  {
    id: "n4",
    recipientEmail: "faculty@campus.edu",
    recipientRole: "faculty",
    title: "Meeting Response Received",
    message: "Alex Johnson accepted your invitation for 'Academic Grievance Hearing - OS Lab 2'.",
    time: "2 days ago",
    read: true,
    link: "/meetings?role=faculty",
  },
  {
    id: "n5",
    recipientEmail: "admin@campus.edu",
    recipientRole: "admin",
    title: "New Grievance Submitted",
    message: "Alex Johnson submitted a new complaint CMP-2024-001 (Mess and Food).",
    time: "3 hours ago",
    read: false,
    link: "/complaints/c1?role=admin",
  },
];

// =========================================================================
// CENTRALIZED STORE FUNCTIONS
// =========================================================================
const COMPLAINTS_KEY = "campus_complaints_data";
const MEETINGS_KEY = "campus_meetings_data";
const NOTIFICATIONS_KEY = "campus_notifications_data";

// --- Complaints Helpers ---
export function getComplaints(): MockComplaint[] {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(COMPLAINTS_KEY);
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

export function saveComplaints(newList: MockComplaint[]): void {
  mockComplaints = newList;
  if (typeof window !== "undefined") {
    localStorage.setItem(COMPLAINTS_KEY, JSON.stringify(newList));
  }
}

export function addComplaint(newComplaint: MockComplaint): void {
  const current = getComplaints();
  const updated = [newComplaint, ...current];
  saveComplaints(updated);

  // Automatic Notification for Admin when a new complaint is filed
  // NOTE: Real emails and push notifications will be dispatched by Supabase Edge Functions in production.
  addNotification({
    id: "notif_" + Date.now(),
    recipientEmail: "admin@campus.edu",
    recipientRole: "admin",
    title: "New Grievance Submitted",
    message: `${newComplaint.studentName} submitted a new complaint ${newComplaint.refNumber} (${newComplaint.category}).`,
    time: "Just now",
    read: false,
    link: `/complaints/${newComplaint.id}?role=admin`,
  });
}

export function updateComplaint(
  id: string,
  updates: Partial<MockComplaint>
): MockComplaint | undefined {
  const current = getComplaints();
  const index = current.findIndex(
    (c) => c.id === id || c.refNumber.toLowerCase() === id.toLowerCase()
  );
  if (index === -1) return undefined;

  const oldComplaint = current[index];
  current[index] = { ...current[index], ...updates };
  saveComplaints([...current]);

  // 1. Notification: If assigned faculty changed -> Notify the assigned faculty member
  if (updates.assignedFaculty && updates.assignedFaculty !== oldComplaint.assignedFaculty) {
    const facultyUser = mockUsers.find((u) => u.name === updates.assignedFaculty);
    if (facultyUser) {
      addNotification({
        id: "notif_assign_" + Date.now(),
        recipientEmail: facultyUser.email,
        recipientRole: "faculty",
        title: "New Complaint Assigned",
        message: `Complaint ${oldComplaint.refNumber} (${oldComplaint.category}) has been assigned to you.`,
        time: "Just now",
        read: false,
        link: `/complaints/${oldComplaint.id}?role=faculty`,
      });
    }
  }

  // 2. Notification: If status changed -> Notify the student who submitted the grievance
  if (updates.status && updates.status !== oldComplaint.status) {
    const studentUser = mockUsers.find((u) => u.name === oldComplaint.studentName);
    const formattedStatus = updates.status.replace("_", " ").toUpperCase();
    if (studentUser) {
      addNotification({
        id: "notif_status_" + Date.now(),
        recipientEmail: studentUser.email,
        recipientRole: "student",
        title: "Complaint Status Updated",
        message: `Your complaint ${oldComplaint.refNumber} has been updated to ${formattedStatus}.`,
        time: "Just now",
        read: false,
        link: `/complaints/${oldComplaint.id}?role=student`,
      });
    }
  }

  return current[index];
}

export function getComplaintById(id: string): MockComplaint | undefined {
  const current = getComplaints();
  return current.find(
    (c) => c.id === id || c.refNumber.toLowerCase() === id.toLowerCase()
  );
}

// --- Meetings Helpers ---
export function getMeetings(): MockMeeting[] {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(MEETINGS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          mockMeetings = parsed;
          return parsed;
        }
      } catch (e) {
        console.error("Failed to parse saved meetings", e);
      }
    }
  }
  return mockMeetings;
}

export function saveMeetings(newList: MockMeeting[]): void {
  mockMeetings = newList;
  if (typeof window !== "undefined") {
    localStorage.setItem(MEETINGS_KEY, JSON.stringify(newList));
  }
}

export function addMeeting(newMeeting: MockMeeting): void {
  const current = getMeetings();
  const updated = [newMeeting, ...current];
  saveMeetings(updated);

  // Automatic Notification: Notify each invited participant
  // NOTE: Real email invitations will be sent by the backend Resend service later.
  newMeeting.participants.forEach((p, idx) => {
    const formattedStart = formatTime(newMeeting.startTime);
    const formattedEnd = formatTime(newMeeting.endTime);
    addNotification({
      id: `notif_meet_${Date.now()}_${idx}`,
      recipientEmail: p.email,
      recipientRole: p.role,
      title: "Meeting Invitation",
      message: `You have been invited to '${newMeeting.title}' regarding ${newMeeting.complaintRef} on ${newMeeting.date} from ${formattedStart} to ${formattedEnd}.`,
      time: "Just now",
      read: false,
      link: `/meetings?role=${p.role}`,
    });
  });
}

export function updateMeetingParticipantResponse(
  meetingId: string,
  userEmail: string,
  response: "accepted" | "declined"
): void {
  const current = getMeetings();
  const meeting = current.find((m) => m.id === meetingId);
  if (!meeting) return;

  const participant = meeting.participants.find((p) => p.email === userEmail);
  if (participant) {
    participant.response = response;
    saveMeetings([...current]);

    // Automatic Notification: Notify the meeting organizer of the participant's response
    addNotification({
      id: `notif_resp_${Date.now()}`,
      recipientEmail: meeting.organizerEmail,
      recipientRole: meeting.organizerRole,
      title: "Meeting Response Received",
      message: `${participant.name} has ${response.toUpperCase()} your meeting invitation for '${meeting.title}'.`,
      time: "Just now",
      read: false,
      link: `/meetings?role=${meeting.organizerRole}`,
    });
  }
}

// --- Notifications Helpers ---
export function getNotifications(): MockNotification[] {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(NOTIFICATIONS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          mockNotifications = parsed;
          return parsed;
        }
      } catch (e) {
        console.error("Failed to parse saved notifications", e);
      }
    }
  }
  return mockNotifications;
}

export function saveNotifications(newList: MockNotification[]): void {
  mockNotifications = newList;
  if (typeof window !== "undefined") {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(newList));
  }
}

export function addNotification(notif: MockNotification): void {
  const current = getNotifications();
  const updated = [notif, ...current];
  saveNotifications(updated);
}

export function markNotificationAsRead(id: string): void {
  const current = getNotifications();
  const updated = current.map((n) => (n.id === id ? { ...n, read: true } : n));
  saveNotifications(updated);
}

export function markAllNotificationsAsRead(userEmail: string): void {
  const current = getNotifications();
  const updated = current.map((n) =>
    n.recipientEmail === userEmail ? { ...n, read: true } : n
  );
  saveNotifications(updated);
}

export function getUnreadNotificationCount(userEmail: string): number {
  const current = getNotifications();
  return current.filter((n) => n.recipientEmail === userEmail && !n.read).length;
}
