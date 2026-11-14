"use client";

import * as React from "react";
import Link from "next/link";
import { Calendar, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MeetingsPlaceholderPage() {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-zinc-200 rounded-2xl p-8 text-center shadow-xs">
        <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-zinc-900">Meetings Management</h1>
        <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
          This module is part of our step-by-step build plan and will be implemented in <strong>Step (e)</strong> (schedule meetings, invite participants, and accept/decline responses).
        </p>
        <div className="mt-6">
          <Link href="/dashboard">
            <Button variant="outline" className="w-full text-xs font-medium">
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
