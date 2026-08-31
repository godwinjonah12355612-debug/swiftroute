import Link from "next/link";
import { redirect } from "next/navigation";
import { createCustomerMessage, getShipment } from "@/lib/database";
import { sendNewMessageNotificationEmail } from
  "@/lib/send-new-message-notification-email";


async function sendMessage(formData: FormData) {
  "use server";

  const trackingNumber = String(
    formData.get("trackingNumber") ?? ""
  )
    .trim()
    .toUpperCase();

  const senderName = String(
    formData.get("senderName") ?? ""
  ).trim();

  const senderEmail = String(
    formData.get("senderEmail") ?? ""
  ).trim();

  const message = String(
    formData.get("message") ?? ""
  ).trim();

  const shipment = getShipment(trackingNumber);

  if (!shipment) {
    redirect("/contact?error=shipment-not-found");
  }

  if (!senderName || !senderEmail || !message) {
    redirect(
      `/contact?number=${encodeURIComponent(
        trackingNumber
      )}&error=missing-details`
    );
  }

  createCustomerMessage({
    trackingNumber,
    senderName,
    senderEmail,
    message,
    status: "Open",
    createdAt: new Date().toISOString(),
  });

  try {
    await sendNewMessageNotificationEmail({
  email: process.env.ADMIN_EMAIL!,
  shipmentSenderName: shipment.customerName,
  customerName: senderName,
  customerEmail: senderEmail,
  trackingNumber,
  message,
});

    console.log(
  "New customer message notification sent to admin:",
  process.env.ADMIN_EMAIL
);
  } catch (error) {
    console.error(
      "Failed to send new customer message notification:",
      error
    );
  }

  redirect(
    `/contact?number=${encodeURIComponent(
      trackingNumber
    )}&sent=1`
  );
}

export default async function ContactPage(props: PageProps<"/contact">) {
  const { number, error, sent } = await props.searchParams;
  const trackingNumber = typeof number === "string" ? number.toUpperCase() : "";
  return <main className="contact-page"><Link className="brand" href="/"><span className="brand-mark">S</span><span>SwiftRoute</span></Link><section className="contact-card"><p className="eyebrow">Customer support</p><h1>Ask about your shipment</h1><p>Send a message to our support team. Your conversation stays private and is never shown on the public tracking page.</p>{sent === "1" ? <div className="success-message">Your message has been sent. We will reply using the email address you provided.</div> : <form action={sendMessage} className="admin-form"><label>Tracking number<input name="trackingNumber" defaultValue={trackingNumber} required /></label><label>Your name<input name="senderName" required /></label><label>Your email<input name="senderEmail" type="email" required /></label><label>Message<textarea name="message" placeholder="Tell us how we can help" required /></label>{error && <p className="form-error">{error === "shipment-not-found" ? "We could not find that shipment. Check the tracking number." : "Please complete every field."}</p>}<button>Send message</button></form>}<Link className="back-link" href="/">← Back to tracking</Link></section></main>;
}
