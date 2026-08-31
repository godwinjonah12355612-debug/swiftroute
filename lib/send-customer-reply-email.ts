import { brevo } from "@/lib/brevo";

type CustomerReplyEmailData = {
  email: string;
  senderName: string;
  trackingNumber: string;
  reply: string;
};

export async function sendCustomerReplyEmail(
  data: CustomerReplyEmailData
) {
  await brevo.transactionalEmails.sendTransacEmail({
    sender: {
      name: "SwiftRoute Support",
      email: process.env.BREVO_SENDER_EMAIL!,
    },

    to: [
      {
        email: data.email,
      },
    ],

    subject: `SwiftRoute Support Reply: ${data.trackingNumber}`,

    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">

        <h2 style="color: #2563eb;">
          Hello ${data.senderName},
        </h2>

        <p>
          Thank you for contacting SwiftRoute Support.
        </p>

        <p>
          <strong>Tracking Number:</strong>
          ${data.trackingNumber}
        </p>

        <hr />

        <p>
          <strong>Our Reply:</strong>
        </p>

        <p>
          ${data.reply}
        </p>

        <br />

        <p>
          Thank you for choosing SwiftRoute.
        </p>

        <p>
          <strong>SwiftRoute Support Team</strong>
        </p>

      </div>
    `,
  });
}