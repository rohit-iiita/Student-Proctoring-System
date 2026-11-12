import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Button,
  Hr,
  Tailwind,
  pixelBasedPreset,
} from "react-email";

interface ComplaintRegisteredEmailProps {
  name: string;
  email: string;
  complaintId: string;
  subject: string;
  category: string;
  submittedAt: string;
}

export default function SuccessfulComplaintRegisteredEmail({
  name = "Rohit Mondal",
  email = "rohit@iiita.ac.in",
  complaintId = "CMP-2026-001",
  subject = "Hostel Maintenance Issue",
  category = "Hostel",
  submittedAt = "November 8, 2026",
}: ComplaintRegisteredEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Your complaint has been successfully registered - {complaintId}
      </Preview>

      <Tailwind config={{ presets: [pixelBasedPreset] }}>
        <Body className="bg-gray-100 py-10 font-sans">
          <Container className="mx-auto max-w-140 rounded-xl bg-white px-8 py-10">
            {/* Header */}
            <Section className="text-center">
              <Text className="text-xl font-bold text-blue-700">
                STUDENT PROCTORING SYSTEM
              </Text>
              <Text className="text-xs text-gray-500">IIIT Allahabad</Text>
            </Section>

            <Hr className="my-6 border-gray-200" />

            {/* Success message */}
            <Section>
              <Heading className="text-2xl font-bold text-gray-900">
                Complaint Registered Successfully!
              </Heading>

              <Text className="text-base leading-6 text-gray-600">
                Hello Mr. {name},
              </Text>

              <Text className="text-sm leading-6 text-gray-600">
                Your complaint has been successfully submitted to the Student
                Proctoring System. Our concerned authority will review your
                complaint and take the necessary action.
              </Text>
            </Section>

            {/* Complaint details */}
            <Section className="mt-6 rounded-lg bg-gray-50 p-5">
              <Text className="text-lg font-bold text-gray-800">
                Complaint Details
              </Text>

              <Text className="text-sm text-gray-600">
                <strong>Reference ID:</strong> {complaintId}
              </Text>

              <Text className="text-sm text-gray-600">
                <strong>Subject:</strong> {subject}
              </Text>

              <Text className="text-sm text-gray-600">
                <strong>Category:</strong> {category}
              </Text>

              <Text className="text-sm text-gray-600">
                <strong>Submitted On:</strong> {submittedAt}
              </Text>

              <Text className="text-sm text-gray-600">
                <strong>Registered Email:</strong> {email}
              </Text>
            </Section>

            {/* Next steps */}
            <Section className="mt-6">
              <Heading className="text-base font-semibold text-gray-800">
                What's Next?
              </Heading>

              <Text className="text-sm leading-6 text-gray-600">
                1. Your complaint will be reviewed by the concerned authority.
                <br />
                2. You will receive updates when its status changes.
                <br />
                3. You can track your complaint from your dashboard.
              </Text>
            </Section>

            {/* CTA */}
            <Section className="mt-8 text-center">
              <Button
                href="https://your-domain.com/student/complaints"
                className="rounded-md bg-blue-700 px-6 py-3 text-sm font-semibold text-white"
              >
                Track My Complaint
              </Button>
            </Section>

            <Hr className="my-8 border-gray-200" />

            {/* Footer */}
            <Section className="text-center">
              <Text className="text-xs leading-5 text-gray-500">
                This is an automated confirmation email. Please do not reply to
                this email.
              </Text>

              <Text className="text-xs text-gray-400">
                © 2026 Student Proctoring System | IIIT Allahabad
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
