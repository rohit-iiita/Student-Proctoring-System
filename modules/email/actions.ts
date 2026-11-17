import "server-only";

import { enqueueEmailJob } from "./queue";
import {
  COMPLAINT_MEETING_EMAIL_SCHEMA,
  COMPLAINT_REGISTRATION_EMAIL_SCHEMA,
  WELCOME_USER_EMAIL_SCHEMA,
} from "./schemas";
import {
  successfullComplaintRegistrationEmailService,
  welcomeUserEmailService,
} from "./services";
import type { TEmailJob } from "./types";

export async function sendWelcomeUserEmailAction(data: {
  email: string;
  name: string;
}) {
  const validation = WELCOME_USER_EMAIL_SCHEMA.safeParse(data);

  if (!validation.success) {
    return {
      success: false,
      message: "Please enter valid data",
    };
  }

  try {
    // await enqueueEmailJob({
    //   type: "welcome_user",
    //   data,
    // });
    await welcomeUserEmailService({ email: data.email, name: data.name });

    return {
      success: true,
      message: "Welcome email added sent.",
    };
  } catch (error: unknown) {
    const err = error as Error;

    return {
      success: "false",
      message: `WELCOME EMAIL not sent - ${err.message}`,
    };
  }
}

export async function sendComplaintRegisteredEmailAction(
  data: Extract<TEmailJob, { type: "complaint_registered" }>["data"],
) {
  const validation = COMPLAINT_REGISTRATION_EMAIL_SCHEMA.safeParse(data);

  if (!validation.success) {
    return {
      success: false,
      message: "Please enter valid data.",
    };
  }

  try {
    // await enqueueEmailJob({
    //   type: "complaint_registered",
    //   data,
    // });
    await successfullComplaintRegistrationEmailService({
      category: data.category,
      complaintId: data.category,
      email: data.email,
      name: data.name,
      subject: data.subject,
      submittedAt: data.submittedAt,
    });

    return {
      success: true,
      message: "Complaint registration sent successfully.",
    };
  } catch (error) {
    const err = error as Error;

    return {
      success: false,
      message: `COMPLAINT REGISTRATION EMAIL not sent - ${err.message}`,
    };
  }
}

export async function sendComplaintMeetingEmailAction(
  data: Extract<TEmailJob, { type: "complaint_meeting_created" }>["data"],
) {
  const validation = COMPLAINT_MEETING_EMAIL_SCHEMA.safeParse(data);

  if (!validation.success) {
    return {
      success: false,
      message: "Please enter valid and data and data-type",
    };
  }

  try {
    // await enqueueEmailJob({
    //   type: "complaint_meeting_created",
    //   data,
    // });

    return {
      success: true,
      message: "Meeting email sent successfully.",
    };
  } catch (error) {
    const err = error as Error;

    return {
      success: false,
      message: `COMPLAINT MEETING EMAIL not sent - ${err.message}`,
    };
  }
}
