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

    <!-- VIEW SHIPMENT LINK START -->
    <p style="margin-top: 30px;">
      You can view the latest information about your shipment by clicking below:
    </p>

    <a
      href="${process.env.NEXT_PUBLIC_SITE_URL}/track?number=${encodeURIComponent(
        data.trackingNumber
      )}"
      style="
        display: inline-block;
        padding: 14px 24px;
        background-color: #2563eb;
        color: #ffffff;
        text-decoration: none;
        border-radius: 8px;
        font-weight: bold;
      "
    >
      🔎 View Your Shipment
    </a>
    <!-- VIEW SHIPMENT LINK END -->

    <br />
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