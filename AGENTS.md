Understand my entire project before generating or modifying any code.

I am building a **Student Proctoring System** using Next.js, TypeScript, Supabase, Tailwind CSS and shadcn/ui.

The application includes the following modules:

1. **Authentication:** Login, signup and role-based access (Student, Faculty, Admin).
2. **Student Management:** Student profiles and account management.
3. **Faculty Management:** Faculty profiles and account management.
4. **Complaint Management:** Students can raise issues; faculty/admin can receive, assign, review and resolve complaints.
5. **Email Notifications:** Automated emails for complaint updates, confirmations and meeting invitations.
6. **In-App Notifications:** Notifications, unread status and notification history.
7. **Meeting Management:** Schedule meetings, invite participants and manage accept/decline responses.
8. **Online Examination:** Create, schedule and manage online examinations.
9. **Online Exam Proctoring:** Track suspicious activities such as tab switching, multiple faces, looking away and other suspicious events, with faculty review.

**Explicitly excluded features:**

- Attendance management.
- Biometric verification.
- Geofencing and location tracking.
- Course management.
- Student course enrollment.

### Development guidelines

1. Follow a modular monolithic architecture within a single Next.js application.
2. Analyze the existing project structure, database schema and dependencies before writing code.
3. Reuse existing components, services, utilities and functions wherever possible.
4. Use Supabase securely with Row Level Security (RLS).
5. Separate server-side and client-side code properly.
6. Use TypeScript and Zod for validation.
7. Maintain consistent UI/UX using Tailwind CSS and shadcn/ui.
8. Follow Next.js best practices and write reusable, maintainable code.
9. Never assume database tables, columns, APIs or functions exist without checking the actual project.
10. Do not unnecessarily rewrite or delete working code.
11. Before implementing a feature, explain the files you plan to create or modify and their purpose.
12. Keep the database schema, backend logic, frontend components and application navigation consistent.

**Important:** Treat this project scope and the existing codebase as the source of truth. Do not generate excluded features unless explicitly requested. Generate all future code according to these requirements.
