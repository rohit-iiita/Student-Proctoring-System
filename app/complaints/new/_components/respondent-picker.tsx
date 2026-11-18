"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Users, X, Check, UserRound } from "lucide-react";
import type { TStudentOption } from "@/modules/complaints/types";

interface RespondentPickerProps {
  studentOptions: TStudentOption[];
  selectedIds: string[];
  onChange: (selectedIds: string[]) => void;
}

/**
 * Searchable multi-select for choosing complaint respondents.
 * Students can be searched by full name or enrollment number and are
 * rendered as removable chips once selected.
 */
export function RespondentPicker({
  studentOptions,
  selectedIds,
  onChange,
}: RespondentPickerProps) {
  const [query, setQuery] = React.useState("");
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Close the dropdown when clicking outside of it
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedSet = React.useMemo(() => new Set(selectedIds), [selectedIds]);

  const filteredStudents = React.useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return studentOptions;
    return studentOptions.filter(
      (student) =>
        student.fullName.toLowerCase().includes(term) ||
        (student.enrollmentNo ?? "").toLowerCase().includes(term),
    );
  }, [studentOptions, query]);

  const toggleStudent = (studentId: string) => {
    if (selectedSet.has(studentId)) {
      onChange(selectedIds.filter((id) => id !== studentId));
    } else {
      onChange([...selectedIds, studentId]);
    }
  };

  const removeStudent = (studentId: string) => {
    onChange(selectedIds.filter((id) => id !== studentId));
  };

  const selectedStudents = React.useMemo(
    () =>
      selectedIds
        .map((id) => studentOptions.find((student) => student.id === id))
        .filter((student): student is TStudentOption => Boolean(student)),
    [selectedIds, studentOptions],
  );

  return (
    <div className="space-y-1">
      <Label className="text-xs font-medium text-zinc-700">
        Respondent(s) — Student(s) against whom the complaint is filed{" "}
        <span className="text-zinc-400 font-normal">(Optional)</span>
      </Label>

      <div ref={containerRef} className="relative">
        {/* Search field */}
        <div className="relative">
          <Input
            type="text"
            placeholder="Search students by name or enrollment number..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            className="pl-9 text-xs"
            autoComplete="off"
          />
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Dropdown list */}
        {isOpen && (
          <div className="absolute z-20 mt-1 w-full max-h-56 overflow-y-auto rounded-xl border border-zinc-200 bg-white shadow-lg">
            {filteredStudents.length === 0 ? (
              <div className="p-3 text-xs text-zinc-400 italic text-center">
                {studentOptions.length === 0
                  ? "No students are registered yet."
                  : `No students match "${query.trim()}".`}
              </div>
            ) : (
              <ul className="py-1">
                {filteredStudents.map((student) => {
                  const isSelected = selectedSet.has(student.id);
                  return (
                    <li key={student.id}>
                      <button
                        type="button"
                        onClick={() => toggleStudent(student.id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-zinc-100"
                            : "hover:bg-zinc-50"
                        }`}
                      >
                        <div className="w-6 h-6 rounded-full bg-zinc-200 flex items-center justify-center shrink-0">
                          <UserRound className="w-3.5 h-3.5 text-zinc-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-zinc-900 truncate">
                            {student.fullName}
                          </div>
                          <div className="text-[10px] text-zinc-500 font-mono">
                            {student.enrollmentNo ?? "No enrollment number"}
                          </div>
                        </div>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Selected respondents as chips */}
      {selectedStudents.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {selectedStudents.map((student) => (
            <span
              key={student.id}
              className="inline-flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-[11px]"
            >
              <Users className="w-3 h-3 text-zinc-500" />
              <span className="font-semibold text-zinc-800">
                {student.fullName}
              </span>
              {student.enrollmentNo && (
                <span className="font-mono text-zinc-500">
                  ({student.enrollmentNo})
                </span>
              )}
              <button
                type="button"
                onClick={() => removeStudent(student.id)}
                className="p-0.5 rounded-full text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                title={`Remove ${student.fullName}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <p className="text-[11px] text-zinc-400 mt-0.5">
        Leave empty if this is a general facility or infrastructure complaint.
      </p>
    </div>
  );
}
