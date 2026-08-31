import { BrevoClient } from "@getbrevo/brevo";

export const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY!,
});

export async function sendSupportReply(
  email: string,
  name: string,
  trackingNumber: string,
  reply: string
) {
  await brevo.transactionalEmails.sendTransacEmail({
    sender: {
      name: "SwiftRoute Support",
      email: process.env.BREVO_SENDER_EMAIL!,
    },

    to: [
      {
        email,
        name,
      },
    ],

    subject: `SwiftRoute Support Reply - ${trackingNumber}`,

    htmlContent: `
      <h2>Hello ${name},</h2>

      <p>Thank you for contacting SwiftRoute Support.</p>

      <p><strong>Tracking number:</strong> ${trackingNumber}</p>

      <p><strong>Our reply:</strong></p>

      <p>${reply}</p>

      <br />

      <p>Kind regards,<br />
      <strong>SwiftRoute Support</strong></p>
    `,
  });
}