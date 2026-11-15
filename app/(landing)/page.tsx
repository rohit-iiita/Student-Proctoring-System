import Link from "next/link";
import {
  ShieldCheck,
  FileText,
  Calendar,
  Bell,
  Video,
  GraduationCap,
  Briefcase,
  Shield,
  ArrowRight,
  CheckCircle2,
  Clock,
  Layers,
} from "lucide-react";

/**
 * Landing Page for the Student Proctoring & Complaint Management System.
 * Clean, beginner-friendly layout with 6 simple sections.
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans text-zinc-900">
      
      {/* =========================================================================
          1. TOP NAVBAR
          Shows the system logo, name, and quick navigation buttons to Login / Signup
         ========================================================================= */}
      <header className="h-16 bg-white border-b border-zinc-200 px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-zinc-900 leading-tight">
              SmartProctor
            </div>
            <div className="text-[10px] text-zinc-500 hidden sm:block">
              Student Proctoring &amp; Complaint System
            </div>
          </div>
        </div>

        {/* Auth Navigation Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-3.5 py-1.5 text-xs font-semibold text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-colors"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="px-3.5 py-1.5 text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl transition-colors shadow-xs"
          >
            Sign Up
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        
        {/* =========================================================================
            2. HERO SECTION
            Clear heading, single-line mission description, and primary CTA buttons
           ========================================================================= */}
        <section className="py-16 md:py-24 px-6 text-center max-w-4xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-xs text-zinc-600 mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Unified Campus Grievance &amp; Proctoring Portal
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-zinc-900 tracking-tight leading-tight">
            Student Proctoring &amp; Complaint Management System
          </h1>

          <p className="text-sm sm:text-base text-zinc-600 mt-4 max-w-2xl leading-relaxed">
            A single platform for student complaints, meetings, notifications and online exam proctoring.
          </p>

          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 mt-8 w-full sm:w-auto">
            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <span>Login to Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/signup"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-800 text-xs font-bold transition-colors flex items-center justify-center"
            >
              Create Account
            </Link>
          </div>
        </section>

        {/* =========================================================================
            3. FEATURES SECTION
            4 simple cards highlighting core platform modules
           ========================================================================= */}
        <section className="py-12 px-6 bg-white border-y border-zinc-200">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="text-center space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-900">
                Core Features
              </h2>
              <p className="text-xs text-zinc-500">
                Everything required to maintain academic integrity and transparent grievance redressal.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Feature 1 */}
              <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 space-y-3 hover:border-zinc-300 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-zinc-900">
                  Raise &amp; Track Complaints
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Students can raise grievances across hostel, mess, academics and ragging with file attachments and real-time status tracking.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 space-y-3 hover:border-zinc-300 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-zinc-900">
                  Meeting Scheduling
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Faculty and admin can schedule formal hearing sessions, track live meetings with remaining time, and gather RSVP responses.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 space-y-3 hover:border-zinc-300 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Bell className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-zinc-900">
                  Notifications
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Instant in-app alerts and email notifications for complaint assignments, status updates, and meeting invitations.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 space-y-3 hover:border-zinc-300 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Video className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-zinc-900">
                  Online Exam Proctoring
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Automated suspicious activity detection (tab switching, multi-face, and gaze tracking) with comprehensive faculty review logs.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            4. HOW IT WORKS SECTION
            3-step sequential workflow
           ========================================================================= */}
        <section className="py-16 px-6 max-w-4xl mx-auto w-full space-y-8">
          <div className="text-center space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900">
              How It Works
            </h2>
            <p className="text-xs text-zinc-500">
              A transparent, structured workflow from grievance submission to final resolution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step 1 */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-3 relative shadow-xs">
              <div className="w-7 h-7 rounded-full bg-zinc-900 text-white font-bold text-xs flex items-center justify-center">
                1
              </div>
              <h3 className="text-sm font-bold text-zinc-900">
                Submit a Complaint
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                The student selects a category, writes the grievance details, attaches supporting proof, and submits with a unique reference number.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-3 relative shadow-xs">
              <div className="w-7 h-7 rounded-full bg-zinc-900 text-white font-bold text-xs flex items-center justify-center">
                2
              </div>
              <h3 className="text-sm font-bold text-zinc-900">
                Authority Reviews &amp; Assigns
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Administrators evaluate the ticket, assign it to an appropriate faculty investigator, and schedule inquiry sessions if required.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-3 relative shadow-xs">
              <div className="w-7 h-7 rounded-full bg-zinc-900 text-white font-bold text-xs flex items-center justify-center">
                3
              </div>
              <h3 className="text-sm font-bold text-zinc-900">
                Get Updates &amp; Resolution
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                The student receives real-time notifications at every milestone until the issue is officially investigated and resolved.
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================================
            5. ROLES SECTION
            3 small cards explaining Student, Faculty, and Admin permissions
           ========================================================================= */}
        <section className="py-12 px-6 bg-white border-t border-zinc-200">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-900">
                User Roles &amp; Access
              </h2>
              <p className="text-xs text-zinc-500">
                Tailored permissions and features for every campus stakeholder.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Student Role */}
              <div className="border border-zinc-200 rounded-2xl p-5 bg-zinc-50/60 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-zinc-900">Student</h3>
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Raise grievances, track status updates, RSVP to hearing invitations, and take proctored online exams.
                </p>
              </div>

              {/* Faculty Role */}
              <div className="border border-zinc-200 rounded-2xl p-5 bg-zinc-50/60 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-zinc-900">Faculty</h3>
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Investigate assigned complaints, add internal notes, schedule inquiry meetings, and review exam proctoring logs.
                </p>
              </div>

              {/* Admin Role */}
              <div className="border border-zinc-200 rounded-2xl p-5 bg-zinc-50/60 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-purple-100 text-purple-700">
                    <Shield className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-zinc-900">Administrator</h3>
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Oversee all campus complaints, assign cases to faculty, manage student and faculty accounts, and view global reports.
                </p>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* =========================================================================
          6. SIMPLE FOOTER
         ========================================================================= */}
      <footer className="border-t border-zinc-200 bg-white py-6 px-6 text-center">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-zinc-800" />
            <span className="font-semibold text-zinc-700">
              Student Proctoring &amp; Complaint Management System
            </span>
          </div>
          <div>
            Built with Next.js, TypeScript &amp; Tailwind CSS &bull; Academic Year 2024–2026
          </div>
        </div>
      </footer>

    </div>
  );
}
