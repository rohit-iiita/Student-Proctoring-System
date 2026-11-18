import "server-only";

import { after } from "next/server";
import { createSupabaseClient } from "@/lib/supabase/server";
import { createNotificationService } from "@/modules/notifications/services";
import { complaintMeetingCreationEmailService } from "@/modules/email/services";
import type { TComplaintCategory } from "@/modules/complaints/types";
import type {
  TCreateMeetingInput,
  TMeetingListItem,
  TMeetingRecipient,
} from "./types";

interface ComplaintWithParties {
  id: string;
  reference_id: string;
  category: string;
  subject: string;
  student_id: string;
  assigned_to: string | null;
  student: {
    profile: { id: string; full_name: string; email: string } | null;
  } | null;
  assigned: {
    profile: { id: string; full_name: string; email: string } | null;
  } | null;
  complaint_respondents: Array<{
    student: {
      profile: { id: string; full_name: string; email: string } | null;
    } | null;
  }> | null;
}

/**
 * Create a meeting linked to a complaint and add every related party as a
 * participant. In-app notifications and emails are dispatched through
 * after() so the admin's response is never blocked on Resend round-trips.
 */
export const createComplaintMeetingService = async ({
  adminId,
  input,
}: {
  adminId: string;
  input: TCreateMeetingInput;
}) => {
  const supabase = await createSupabaseClient();

  // 1. Load the complaint with everyone related to it.
  const { data: complaint, error: complaintError } = await supabase
    .from("complaints")
    .select(
      `id,
       reference_id,
       category,
       subject,
       student_id,
       assigned_to,
       student:students!complaints_student_id_fkey(
         profile:profiles!students_id_fkey(id, full_name, email)
       ),
       assigned:faculty!complaints_assigned_to_fkey(
         profile:profiles!faculty_id_fkey(id, full_name, email)
       ),
       complaint_respondents(
         student:students!complaint_respondents_student_id_fkey(
           profile:profiles!students_id_fkey(id, full_name, email)
         )
       )`,
    )
    .eq("id", input.complaintId)
    .maybeSingle();

  if (complaintError) throw complaintError;
  if (!complaint) throw new Error("Complaint not found.");

  const row = complaint as unknown as ComplaintWithParties;

  // 2. Build the unique recipient list: creator student ("favour"),
  //    against students ("against"), assigned faculty ("faculty") and
  //    other admins ("admin"). The acting admin is never a recipient.
  const recipientMap = new Map<string, TMeetingRecipient>();

  const addRecipient = (
    profile:
      { id: string; full_name: string; email: string } | null | undefined,
    recipientRole: TMeetingRecipient["recipientRole"],
  ) => {
    if (!profile?.id || !profile.email || recipientMap.has(profile.id)) return;
    recipientMap.set(profile.id, {
      userId: profile.id,
      email: profile.email,
      fullName: profile.full_name,
      recipientRole,
    });
  };

  addRecipient(row.student?.profile, "favour");

  for (const respondent of row.complaint_respondents ?? []) {
    addRecipient(respondent.student?.profile, "against");
  }

  addRecipient(row.assigned?.profile, "faculty");

  const { data: admins, error: adminsError } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("role", "admin")
    .neq("id", adminId);

  if (adminsError) throw adminsError;

  for (const admin of admins ?? []) {
    addRecipient(admin, "admin");
  }

  const recipients = Array.from(recipientMap.values());

  // 3. Insert the meeting.
  const { data: meeting, error: meetingError } = await supabase
    .from("meetings")
    .insert({
      complaint_id: row.id,
      created_by: adminId,
      title: input.title,
      description: input.description || null,
      starts_at: new Date(input.startsAt).toISOString(),
      ends_at: new Date(input.endsAt).toISOString(),
      meeting_url: input.meetingUrl?.trim() ? input.meetingUrl.trim() : null,
      location: input.location?.trim() ? input.location.trim() : null,
      status: "scheduled",
    })
    .select("id, title, starts_at, ends_at")
    .single();

  if (meetingError) throw meetingError;

  // 4. Insert participants (invitation_status defaults to "invited").
  if (recipients.length > 0) {
    const { error: participantsError } = await supabase
      .from("meeting_participants")
      .insert(
        recipients.map((recipient) => ({
          meeting_id: meeting.id,
          user_id: recipient.userId,
        })),
      );

    if (participantsError) throw participantsError;
  }

  // 5. Fan out in-app notifications + emails after the response is sent.
  //    Failures are logged, never fail the meeting creation.
  const startsAt = new Date(meeting.starts_at);
  const endsAt = new Date(meeting.ends_at);
  const location = input.location?.trim() || "Online";
  const meetingUrl = input.meetingUrl?.trim() ? input.meetingUrl.trim() : null;

  after(async () => {
    const results = await Promise.allSettled([
      ...recipients.map((recipient) =>
        createNotificationService({
          userId: recipient.userId,
          title: "Meeting Scheduled",
          message: `A meeting "${meeting.title}" has been scheduled for complaint (${row.reference_id}) on ${startsAt.toLocaleString(
            "en-IN",
            { dateStyle: "medium", timeStyle: "short" },
          )}.`,
          notificationType: "meeting",
          metadata: {
            meetingId: meeting.id,
            complaintId: row.id,
            referenceId: row.reference_id,
          },
        }),
      ),
    ]);

    after(async () => {
      await complaintMeetingCreationEmailService({
        email: recipients.map((r) => r.email),
        complaintId: row.reference_id,
        meetingTitle: meeting.title,
        startTime: startsAt,
        endTime: endsAt,
        location,
        complaintCategory: row.category as TComplaintCategory,
        meeting_url: meetingUrl,
      });
    });

    for (const result of results) {
      if (result.status === "rejected") {
        console.warn(
          "Complaint meeting notification/email failed:",
          result.reason,
        );
      }
    }
  });

  return {
    meetingId: meeting.id,
    title: meeting.title,
    recipientCount: recipients.length,
  };
};

interface MeetingParticipantRow {
  invitation_status: TMeetingListItem["invitationStatus"];
  responded_at: string | null;
  meeting: {
    id: string;
    title: string;
    description: string | null;
    starts_at: string;
    ends_at: string;
    meeting_url: string | null;
    location: string | null;
    status: TMeetingListItem["status"];
    created_at: string;
    complaint_id: string | null;
    complaint: { reference_id: string; subject: string } | null;
    creator: { profile: { full_name: string } | null } | null;
  } | null;
}

/**
 * List every meeting relevant to a user, newest start time first:
 *  - participants: meetings they were invited to (with their RSVP status)
 *  - admins: additionally all meetings created by any admin
 */
export const getMyMeetingsService = async ({
  userId,
  role,
}: {
  userId: string;
  role: "student" | "faculty" | "admin";
}): Promise<TMeetingListItem[]> => {
  const supabase = await createSupabaseClient();

  // 1. Meetings where the user is a participant, with their RSVP status.
  const { data: participantRows, error: participantError } = await supabase
    .from("meeting_participants")
    .select(
      `invitation_status,
       responded_at,
       meeting:meetings(
         id,
         title,
         description,
         starts_at,
         ends_at,
         meeting_url,
         location,
         status,
         created_at,
         complaint_id,
         complaint:complaints(reference_id, subject),
         creator:profiles!meetings_created_by_fkey(full_name)
       )`,
    )
    .eq("user_id", userId)
    .order("meeting(starts_at)", { ascending: false });

  if (participantError) {
    console.error("getMyMeetingsService participant error:", participantError);
    throw participantError;
  }

  const meetingMap = new Map<string, TMeetingListItem>();

  for (const raw of (participantRows ??
    []) as unknown as MeetingParticipantRow[]) {
    const meeting = raw.meeting;
    if (!meeting) continue;

    meetingMap.set(meeting.id, {
      id: meeting.id,
      title: meeting.title,
      description: meeting.description ?? null,
      startsAt: meeting.starts_at,
      endsAt: meeting.ends_at,
      meetingUrl: meeting.meeting_url ?? null,
      location: meeting.location ?? null,
      status: meeting.status,
      createdAt: meeting.created_at,
      complaintId: meeting.complaint_id ?? null,
      complaintReferenceId: meeting.complaint?.reference_id ?? null,
      complaintSubject: meeting.complaint?.subject ?? null,
      createdByName: meeting.creator?.profile?.full_name ?? null,
      invitationStatus: raw.invitation_status ?? null,
      respondedAt: raw.responded_at ?? null,
    });
  }

  // 2. Admins also see meetings they created that they aren't a participant of.
  if (role === "admin") {
    const { data: createdRows, error: createdError } = await supabase
      .from("meetings")
      .select(
        `id,
         title,
         description,
         starts_at,
         ends_at,
         meeting_url,
         location,
         status,
         created_at,
         complaint_id,
         complaint:complaints(reference_id, subject),
         creator:profiles!meetings_created_by_fkey(full_name)`,
      )
      .eq("created_by", userId)
      .order("starts_at", { ascending: false });

    if (createdError) {
      console.error("getMyMeetingsService created error:", createdError);
      throw createdError;
    }

    for (const meeting of (createdRows ?? []) as unknown as NonNullable<
      MeetingParticipantRow["meeting"]
    >[]) {
      if (meetingMap.has(meeting.id)) continue;

      meetingMap.set(meeting.id, {
        id: meeting.id,
        title: meeting.title,
        description: meeting.description ?? null,
        startsAt: meeting.starts_at,
        endsAt: meeting.ends_at,
        meetingUrl: meeting.meeting_url ?? null,
        location: meeting.location ?? null,
        status: meeting.status,
        createdAt: meeting.created_at,
        complaintId: meeting.complaint_id ?? null,
        complaintReferenceId: meeting.complaint?.reference_id ?? null,
        complaintSubject: meeting.complaint?.subject ?? null,
        createdByName: meeting.creator?.profile?.full_name ?? null,
        invitationStatus: null,
        respondedAt: null,
      });
    }
  }

  return Array.from(meetingMap.values()).sort(
    (a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime(),
  );
};
