import * as React from "react";
import Link from "next/link";
import type { TDashboardComplaint, TDashboardRole } from "@/modules/dashboard/types";

interface RecentComplaintsTableProps {
  role: TDashboardRole;
  complaints: TDashboardComplaint[];
}

export function RecentComplaintsTable({ role, complaints }: RecentComplaintsTableProps) {
  const renderStatusBadge = (status: TDashboardComplaint["status"]) => {
    switch (status) {
      case "submitted":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            Submitted
          </span>
        );
      case "under_review":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
            Under Review
          </span>
        );
      case "resolved":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            Resolved
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-600 border border-zinc-200">
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl shadow-xs overflow-hidden">
      <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-zinc-900">
            {role === "student" && "Your Recent Complaints (Raised by you)"}
            {role === "faculty" && "Assigned Complaints (Under your review)"}
            {role === "admin" && "Recent Complaints (System-wide overview)"}
          </h2>
          <p className="text-xs text-zinc-500">
            {role === "student" && `Showing complaints submitted under your student account (${complaints.length} total)`}
            {role === "faculty" && `Showing grievances assigned for review (${complaints.length} total)`}
            {role === "admin" && `Showing the most recent complaints across the university (${complaints.length} total)`}
          </p>
        </div>
        <Link
          href={`/complaints?role=${role}`}
          className="text-xs font-semibold text-zinc-900 hover:text-zinc-600 underline"
        >
          View all complaints &rarr;
        </Link>
      </div>

      <div className="overflow-x-auto">
        {complaints.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-500">
            No complaints found for this role.
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50/75 border-b border-zinc-100 text-zinc-500 font-semibold">
              <tr>
                <th className="py-3 px-4">Ref Number</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Subject</th>
                {role === "admin" && <th className="py-3 px-4">Student</th>}
                {role === "student" && <th className="py-3 px-4">Assigned To</th>}
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-zinc-700">
              {complaints.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-50/60 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-zinc-900">
                    {item.refNumber}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-medium bg-zinc-100 text-zinc-700">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium max-w-xs truncate text-zinc-800">
                    {item.subject}
                  </td>
                  {role === "admin" && (
                    <td className="py-3 px-4 text-zinc-600">
                      {item.studentName}
                    </td>
                  )}
                  {role === "student" && (
                    <td className="py-3 px-4 text-zinc-600">
                      {item.assignedFaculty}
                    </td>
                  )}
                  <td className="py-3 px-4">
                    {renderStatusBadge(item.status)}
                  </td>
                  <td className="py-3 px-4 text-zinc-400 whitespace-nowrap">
                    {item.createdAt}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link href={`/complaints/${item.id}?role=${role}`}>
                      <span className="text-xs font-semibold text-zinc-900 hover:underline cursor-pointer">
                        View
                      </span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
