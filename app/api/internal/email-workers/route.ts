import { NextRequest, NextResponse } from "next/server";
import { supabaseAdminClient } from "@/lib/supabase/index";
import {
  welcomeUserEmailService,
  complaintMeetingCreationEmailService,
  successfullComplaintRegistrationEmailService,
} from "@/modules/email/services";
import type { TEmailJob } from "@/modules/email/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_RETRIES = 5;

async function processEmailJob(job: TEmailJob) {
  switch (job.type) {
    case "welcome_user":
      return welcomeUserEmailService(job.data);

    case "complaint_registered":
      return successfullComplaintRegistrationEmailService(job.data);

    case "complaint_meeting_created":
      return complaintMeetingCreationEmailService({
        ...job.data,
        startTime: new Date(job.data.startTime),
        endTime: new Date(job.data.endTime),
      });

    default:
      throw new Error("Unknown email job type");
  }
}

export async function POST(request: NextRequest) {
  // Protect this endpoint from public access.
  const authorization = request.headers.get("authorization");

  if (
    !process.env.EMAIL_WORKER_SECRET ||
    authorization !== `Bearer ${process.env.EMAIL_WORKER_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Read up to 5 jobs. Each read hides them for 120 seconds.
  const { data: messages, error } = await supabaseAdminClient.rpc(
    "read_email_jobs",
    {
      p_visibility_timeout: 120,
      p_batch_size: 5,
    },
  );

  if (error) {
    console.error("Queue read error:", error);

    return NextResponse.json(
      { error: "Could not read email queue" },
      { status: 500 },
    );
  }

  let sent = 0;
  let failed = 0;
  let archived = 0;

  for (const message of messages ?? []) {
    try {
      await processEmailJob(message.message as TEmailJob);

      // Delete only after successful email sending.
      const { error: deleteError } = await supabaseAdminClient.rpc(
        "delete_email_job",
        {
          p_message_id: message.msg_id,
        },
      );

      if (deleteError) {
        throw deleteError;
      }

      sent++;
    } catch (error) {
      console.error(`Email job ${message.msg_id} failed:`, error);

      failed++;

      // read_ct is incremented whenever a job is read.
      if (message.read_ct >= MAX_RETRIES) {
        const { error: archiveError } = await supabaseAdminClient.rpc(
          "archive_email_job",
          {
            p_message_id: message.msg_id,
          },
        );

        if (archiveError) {
          console.error(
            `Could not archive email job ${message.msg_id}:`,
            archiveError,
          );
        } else {
          archived++;
        }
      }

      // Otherwise, leave it in the queue.
      // It becomes visible again after the visibility timeout.
    }
  }

  return NextResponse.json({
    success: true,
    processed: sent + failed,
    sent,
    failed,
    archived,
  });
}
