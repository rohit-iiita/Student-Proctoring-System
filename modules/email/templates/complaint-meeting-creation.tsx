import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
  Hr,
} from "react-email";
import { formatComplaintCategory } from "@/lib/utils";
import type {
  TComplaintCategory,
  TComplaintMeetingRecipientRole,
} from "@/modules/complaints/types";
import { formatInTimeZone } from "date-fns-tz";

interface ComplaintMeetingCreationProps {
  name: string;
  complaintId: string;
  meetingTitle: string;
  startTime: string;
  endTime: string;
  location: string;
  meeting_url: string | null;
  recipientRole: TComplaintMeetingRecipientRole;
  complaintCategory: TComplaintCategory;
}

export default function ComplaintMeetingCreationEmail({
  name = "Rohit Mondal",
  complaintId = "CMP-1024",
  meetingTitle = "Complaint Discussion Meeting",
  startTime,
  endTime,
  location = "Conference Room 1, IIIT Allahabad",
  complaintCategory = "discrimination_and_misconduct",
  meeting_url = "https://google-meet.com",
  recipientRole = "against",
}: ComplaintMeetingCreationProps) {
  const complaintTitle = formatComplaintCategory(complaintCategory);

  const meetingDate = formatInTimeZone(
    startTime,
    "Asia/Kolkata",
    "dd MMM yyyy",
  );

  return (
    <Html lang="en">
      <Head />

      <Preview>{complaintTitle} meeting scheduled</Preview>

      <Tailwind>
        <Body className="bg-gray-100 font-sans">
          <Container className="mx-auto my-10 max-w-130 rounded-lg bg-white p-8">
            {/* Header */}
            <Section className="text-center">
              <Heading className="text-xl font-bold text-blue-700">
                STUDENT PROCTORING SYSTEM
              </Heading>

              <Text className="text-sm text-gray-500">IIIT Allahabad</Text>
            </Section>

            <Hr className="my-6 border-gray-200" />

            {/* Main content */}
            <Heading className="text-2xl font-bold text-gray-900">
              Complaint Meeting Scheduled
            </Heading>

            <Text className="text-base text-gray-700">Hello Mr. {name},</Text>

            <Text className="text-sm leading-6">
              {recipientRole === "admin"
                ? `${complaintTitle} meeting scheduled.`
                : recipientRole === "against"
                  ? "A meeting has been scheduled to discuss a COMPLAINT AGAINT YOU with AUTHORITIES. Please find the meeting details below and make sure to attend at the scheduled time. Please note that it is important to be present at that meeting."
                  : "A meeting has been scheduled to discuss YOUR COMPLAINT with AUTHORITIES. Please find the meeting details below and make sure to attend at the scheduled time. Please note that it is important to be present at the meeting. Also BRING ANY EVIDENCE supporting your complaint"}
            </Text>

            {/* Meeting details */}
            <Section className="my-6 rounded-lg border border-gray-200 bg-gray-50 p-5">
              <Text className="mb-3 text-lg font-bold text-gray-900">
                MEETING DETAILS
              </Text>

              <Text className="text-sm text-gray-600">
                <strong>Meeting Title:</strong> {meetingTitle}
              </Text>

              <Text className="text-sm text-gray-600">
                <strong>Complaint Reference:</strong> {complaintId}
              </Text>

              <Text className="text-sm text-gray-600">
                <strong>Date:</strong> {meetingDate}
              </Text>

              <Text className="text-sm text-gray-600">
                <strong>Time:</strong> {startTime} to {endTime}
              </Text>

              <Text className="text-sm text-gray-600">
                <strong>Location:</strong> {location || "NOT SPECIFIED"}
              </Text>
            </Section>

            {/* Conditional meeting URL */}
            {meeting_url && (
              <Section className="my-6 text-center">
                <Text className="text-sm text-gray-600">
                  This is an online meeting. Join using the link below:
                </Text>

                <Button
                  href={meeting_url}
                  className="rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white no-underline"
                >
                  Join Meeting
                </Button>

                <Text className="mt-3 break-all text-xs text-gray-500">
                  {meeting_url}
                </Text>
              </Section>
            )}

            {/* Reminder */}
            <Section className="my-5 rounded-md bg-blue-50 p-4">
              <Text className="text-sm font-semibold text-blue-900">
                Important Reminder
              </Text>

              <Text className="text-sm leading-6 text-blue-800">
                Please arrive on time. Keep your complaint reference available
                during the meeting for further discussion.
              </Text>
            </Section>

            <Hr className="my-6 border-gray-200" />

            {/* Footer */}
            <Text className="text-center text-xs leading-5 text-gray-500">
              This is an automated email from the Student Proctoring System.
              <br />
              IIIT Allahabad
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
