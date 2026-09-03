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
  <div style="
    margin: 0;
    padding: 40px 20px;
    background-color: #f4f7fb;
    font-family: Arial, Helvetica, sans-serif;
    color: #172033;
  ">

    <div style="
      max-width: 620px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 18px;
      overflow: hidden;
      box-shadow: 0 8px 30px rgba(20, 40, 80, 0.08);
    ">

      <!-- HEADER -->
      <div style="
        background: linear-gradient(135deg, #2563eb, #1d4ed8);
        padding: 28px 30px;
        text-align: center;
      ">
        <div style="
          font-size: 28px;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: 0.5px;
        ">
          SwiftRoute
        </div>

        <div style="
          margin-top: 6px;
          font-size: 14px;
          color: #dbeafe;
        ">
          Shipment & Delivery Support
        </div>
      </div>

      <!-- CONTENT -->
      <div style="padding: 32px 30px;">

        <h1 style="
          margin: 0 0 10px;
          font-size: 25px;
          line-height: 1.3;
          color: #172033;
        ">
          Hello ${data.senderName},
        </h1>

        <p style="
          margin: 0 0 25px;
          font-size: 16px;
          line-height: 1.7;
          color: #667085;
        ">
          Thank you for contacting SwiftRoute Support.
          We have received your message and our support team has responded.
        </p>

        <!-- TRACKING CARD -->
        <div style="
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 25px;
        ">

          <div style="
            font-size: 12px;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
          ">
            Tracking Number
          </div>

          <div style="
            font-size: 20px;
            font-weight: 800;
            color: #172033;
            letter-spacing: 0.5px;
          ">
            ${data.trackingNumber}
          </div>

        </div>

        <!-- REPLY SECTION -->
        <div style="
          margin-bottom: 25px;
        ">

          <div style="
            font-size: 13px;
            font-weight: 800;
            color: #2563eb;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 10px;
          ">
            SwiftRoute Support Reply
          </div>

          <div style="
            background-color: #eff6ff;
            border-left: 4px solid #2563eb;
            border-radius: 10px;
            padding: 20px;
          ">

            <p style="
              margin: 0;
              font-size: 16px;
              line-height: 1.8;
              color: #27364d;
              white-space: pre-line;
            ">
              ${data.reply}
            </p>

          </div>

        </div>

        <!-- TRACKING BUTTON -->
        <div style="
          text-align: center;
          margin: 30px 0;
        ">

          <p style="
            margin: 0 0 18px;
            font-size: 15px;
            line-height: 1.6;
            color: #667085;
          ">
            You can view the latest information about your shipment
            using the button below.
          </p>

          <a
            href="${process.env.NEXT_PUBLIC_SITE_URL}/track?number=${encodeURIComponent(
              data.trackingNumber
            )}"
            style="
              display: inline-block;
              padding: 15px 28px;
              background-color: #2563eb;
              color: #ffffff;
              text-decoration: none;
              border-radius: 10px;
              font-size: 16px;
              font-weight: 700;
              box-shadow: 0 5px 14px rgba(37, 99, 235, 0.25);
            "
          >
            🔎 View Your Shipment
          </a>

        </div>

        <!-- DIVIDER -->
        <div style="
          height: 1px;
          background-color: #e5e7eb;
          margin: 30px 0;
        "></div>

        <p style="
          margin: 0 0 8px;
          font-size: 15px;
          line-height: 1.6;
          color: #667085;
        ">
          Thank you for choosing SwiftRoute.
        </p>

        <p style="
          margin: 0;
          font-size: 15px;
          font-weight: 700;
          color: #172033;
        ">
          SwiftRoute Support Team
        </p>

      </div>

      <!-- FOOTER -->
      <div style="
        background-color: #f8fafc;
        padding: 20px 30px;
        text-align: center;
        border-top: 1px solid #e5e7eb;
      ">

        <p style="
          margin: 0;
          font-size: 12px;
          line-height: 1.6;
          color: #94a3b8;
        ">
          This email was sent by SwiftRoute Support regarding
          your shipment.
        </p>

      </div>

    </div>

  </div>
`,
});
}