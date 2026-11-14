// Mock user data for testing the front-end before the backend is connected.
// NOTE: Your backend partner will replace this with real Supabase database queries later.

export interface MockUser {
  id: string;
  name: string;
  email: string;
  password: string; // Stored in plain text here only for simple front-end testing
  role: "student" | "faculty" | "admin";
  idNumber: string;
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
  },
  {
    id: "2",
    name: "Dr. Sarah Smith",
    email: "faculty@campus.edu",
    password: "password123",
    role: "faculty",
    idNumber: "FAC-8821",
  },
  {
    id: "3",
    name: "Admin Officer",
    email: "admin@campus.edu",
    password: "password123",
    role: "admin",
    idNumber: "ADM-0001",
  },
];
