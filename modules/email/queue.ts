import "server-only";

import { supabaseAdminClient } from "@/lib/supabase";
import type { TEmailJob } from "./types";

export async function enqueueEmailJob(job: TEmailJob) {
  const { data, error } = await supabaseAdminClient.rpc("enqueue_email_job", {
    p_message: job,
  });

  if (error) {
    const err = error as Error;

    console.error("Email enqueue failed:", error);

    throw new Error(`COULD NOT ADD EMAIL TO QUEUE - ${err.message}`);
  }

  return data;
}
