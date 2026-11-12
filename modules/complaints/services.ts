import "server-only";

import { supabaseClient } from "@/lib/supabase";

import type { TComplaintCategory, TComplaintStatus } from "./types";

export const createComplaintService = async ({
  studentId,
  category,
  description,
  subject,
}: {
  studentId: string;
  category: TComplaintCategory;
  subject: string;
  description: string;
}) => {
  const { error } = await supabaseClient.from("complaints").insert({
    student_id: studentId,
    category,
    subject,
    description,
  });

  if (error) throw error;
};

export const updateComplaintService = async ({
  complaintId,
  status,
  resolution,
}: {
  complaintId: string;
  status: TComplaintStatus;
  resolution: string | null;
}) => {
  if (status === "resolved") {
    const { error } = await supabaseClient
      .from("complaints")
      .update({ status, resolution })
      .eq("id", complaintId);

    if (error) throw error;
  } else {
    const { error } = await supabaseClient
      .from("complaints")
      .update({ status })
      .eq("id", complaintId);

    if (error) throw error;
  }
};
