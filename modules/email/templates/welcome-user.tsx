import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  pixelBasedPreset,
  Tailwind,
  Text,
  Hr,
} from "react-email";

interface WelcomeEmailProps {
  email: string;
  name: string;
}

export default function WelcomeUserEmail({
  email = "rohit@iiita.ac.in",
  name = "Rohit Mondal",
}: WelcomeEmailProps) {
  return (
    <Html className={`  `}>
      <Head />
      <Preview>Welcome to the Student Proctoring System, {name}!</Preview>

      <Tailwind config={{ presets: [pixelBasedPreset] }}>
        <Body className="bg-gray-100 font-sans py-10">
          <Container className="mx-auto max-w-[560px] rounded-xl bg-white px-8 py-10">
            {/* Header */}
            <Section className="text-center mb-8">
              <Text className="text-xl font-bold text-blue-700">
                STUDENT PROCTORING SYSTEM
              </Text>
              <Text className="text-xs text-gray-500">IIIT Allahabad</Text>
            </Section>

            <Hr className="border-gray-200 mb-8" />

            {/* Welcome message */}
            <Section>
              <Heading className="text-2xl font-bold text-gray-900">
                Welcome, {name}! 👋
              </Heading>

              <Text className="text-sm leading-6 text-gray-600">
                Thank you for joining the Student Proctoring System. Your
                account has been successfully created.
              </Text>
            </Section>

            {/* Account details */}
            <Section className="mt-6 rounded-lg bg-gray-50 p-5">
              <Heading className="text-base font-semibold text-gray-800">
                Your Account Details
              </Heading>

              <Text className="text-sm text-gray-600">
                <strong>Name:</strong> {name}
              </Text>

              <Text className="text-sm text-gray-600">
                <strong>Email:</strong> {email}
              </Text>
            </Section>

            {/* Features */}
            <Section className="mt-6">
              <Text className="text-sm font-semibold text-gray-800">
                What you can do with the platform:
              </Text>

              <Text className="text-sm leading-6 text-gray-600">
                • Raise and track complaints
                <br />
                • Receive notifications of complaints & emails of their updates
                <br />
              </Text>
            </Section>

            {/* CTA */}
            <Section className="mt-8 text-center">
              <Button
                href="https://your-domain.com/login"
                className="rounded-md bg-blue-700 px-6 py-3 text-sm font-semibold text-white"
              >
                Go to Dashboard
              </Button>
            </Section>

            <Hr className="my-8 border-gray-200" />

            {/* Footer */}
            <Section className="text-center">
              <Text className="text-xs leading-5 text-gray-500">
                This is an automated email from the Student Proctoring System at
                IIIT Allahabad.
              </Text>

              <Text className="text-xs text-gray-400">
                © 2026 Student Proctoring System. All rights reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
