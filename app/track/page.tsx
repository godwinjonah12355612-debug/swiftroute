import { getShipment, listTrackingEvents } from "@/lib/database";
import PrintButton from "./PrintButton";
import PackageMedia from "./PackageMedia";
import CopyTrackingButton from "./CopyTrackingButton";
import NotificationForm from "./NotificationForm";

type Props = {
  searchParams: Promise<{ number?: string }>;
};

const progressSteps = [
  "Shipment created",
  "In transit",
  "Hold",
  "At local hub",
  "Out for delivery",
  "Delivered",
];


function getProgressIndex(status?: string | null) {
  const normalizedStatus = String(status ?? "").trim().toLowerCase();

  const index = progressSteps.findIndex(
    (step) => String(step ?? "").trim().toLowerCase() === normalizedStatus
  );

  return index === -1 ? 0 : index;
}

export default async function TrackPage(props: Props) {
  const { number } = await props.searchParams;

  if (!number) {
    return (
      <main className="track-shell">
        <section className="track-card">
          <h1>Track your shipment</h1>
          <p>Enter a tracking number to view your goods.</p>
        </section>
      </main>
    );
  }
const shipment = await getShipment(number);

if (!shipment) {
    return (
      <main className="track-shell">
        <section className="track-card">
          <h1>Shipment not found</h1>
          <p>Please check the tracking number and try again.</p>
          <a href="/" className="back-link">
            ← Back to tracking
          </a>
        </section>
      </main>
    );
  }

  const events = await listTrackingEvents(number);
const currentStep = getProgressIndex(shipment.status);

return (
    <main className="track-shell">
      <section className="track-card">

        <div className="track-header">
          <div>
            <p className="eyebrow">SWIFTROUTE SHIPMENT TRACKING</p>
            <h1>Your goods are being tracked</h1>
            <p>
              View the latest status and information about your shipment.
            </p>
          </div>

          <div className="track-actions">
            <PrintButton />
          </div>
        </div>

        {/* Shipment progress */}
        <section className="progress-section">
          <p className="eyebrow">SHIPMENT PROGRESS</p>

          <div className="progress-tracker">
            {progressSteps.map((step, index) => {
              const completed = index <= currentStep;
const isHold = step.trim().toLowerCase() === "hold";

              return (
                <div
                  className={`progress-step ${
                    completed ? "completed" : ""
                  }`}
                  key={step}
                >
                  <div
  className={`progress-circle progress-color-${index + 1} ${
  completed ? "completed" : ""
} ${isHold ? "hold-circle" : ""}`}
>
  {completed ? "✓" : index + 1}
</div>
                  <span>{step}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Main shipment information */}
        <section className="goods-section">
          <div className="section-heading">
  <div>
  <p className="eyebrow">MY GOODS</p>
  <h2>Shipment information</h2>

  <p className="last-updated">
    🕒 Last updated:{" "}
   {shipment.updatedAt
  ? new Date(shipment.updatedAt).toLocaleString("en-GB")
  : "Not available"}
  </p>
</div>

<span className="status-pill">
  {shipment.status}
</span>
</div>

          <div className="track-grid">

            <div>
  <span>Tracking number</span>

  <div className="tracking-number-row">
    <strong>{shipment.trackingNumber}</strong>
<CopyTrackingButton
  trackingNumber={shipment.trackingNumber}
/>
  </div>
</div>
<div>
  <span>Receiver email</span>
  <strong>
    {shipment.receiverEmail || "Not specified"}
  </strong>
</div>

            <div>
              <span>Current status</span>
              <strong>{shipment.status}</strong>
            </div>

            <div>
              <span>Origin</span>
              <strong>
                {shipment.origin || "Not specified"}
              </strong>
            </div>

            <div>
              <span>Current location</span>
              <strong>
                {shipment.currentLocation || shipment.origin}
              </strong>
            </div>

            <div>
              <span>Destination</span>
              <strong>{shipment.destination}</strong>
            </div>

            <div>
              <span>Estimated delivery</span>
              <strong>
                {shipment.estimatedDelivery || "To be confirmed"}
              </strong>
            </div>

            <div>
              <span>Service</span>
              <strong>{shipment.service}</strong>
            </div>

            <div>
              <span>Package weight</span>
              <strong>
                {shipment.packageWeight || "Not specified"}
              </strong>
            </div>

          </div>
        </section>

       {/* Goods details */}

<section className="goods-details">
  <p className="eyebrow">PACKAGE DETAILS</p>
  <h2>Your goods</h2>

 {shipment.packageImage && (
  <PackageMedia
    src={shipment.packageImage}
    alt={`Package ${shipment.trackingNumber}`}
  />
)}

  <div className="goods-description">
    <span>Package description</span>
    <strong>{shipment.description}</strong>
  </div>
</section>

        {/* Delivery information */}
        <section className="delivery-section">
  <p className="eyebrow">DELIVERY INFORMATION</p>
  <h2>Shipment route</h2>
<div className="route-card">

  {/* Origin */}
  <div className="route-location route-origin">
    <div className="route-icon">📦</div>

    <div>
      <span>Origin</span>
      <strong>
        {shipment.origin || "Shipment origin"}
      </strong>
    </div>
  </div>

  {/* Route progress */}
  <div className="route-line">
    <div className="route-progress"></div>
    <span className="route-arrow">→</span>
  </div>

  {/* Current location */}
  <div className="route-location route-current">
    <div className="route-icon">🚚</div>

    <div>
      <span>Current location</span>

      <strong>
        {shipment.currentLocation ||
          shipment.origin ||
          "In transit"}
      </strong>

      <small>
        {shipment.status}
      </small>
    </div>
  </div>

  {/* Route progress */}
  <div className="route-line">
    <div className="route-progress"></div>
    <span className="route-arrow">→</span>
  </div>

  {/* Destination */}
  <div className="route-location route-destination">
    <div className="route-icon">📍</div>

    <div>
      <span>Destination</span>
      <strong>
        {shipment.destination}
      </strong>
    </div>
  </div>

</div>
</section>

{/* Shipment notifications */}
<section className="notification-section">
  <div className="notification-content">
    <div className="notification-icon">🔔</div>

    <div>
      <p className="eyebrow">SHIPMENT UPDATES</p>
      <h2>Stay updated on your delivery</h2>

      <p>
        Get notified when your shipment status changes or when
        important delivery updates become available.
      </p>
    </div>
  </div>

  <div className="notification-actions">
  <NotificationForm
    trackingNumber={shipment.trackingNumber}
  />
</div>
</section>

        {/* Tracking timeline */}
        <section className="timeline-section">
          <p className="eyebrow">TRACKING HISTORY</p>
          <h2>Shipment timeline</h2>

          {events.length > 0 ? (
            <div className="timeline">

              {events.map((event) => (
                <article
                  className="timeline-item"
                  key={event.id}
                >
                  <div className="timeline-number">
                    ✓
                  </div>

                  <div className="timeline-content">

                    <div className="timeline-top">
                      <strong>{event.status}</strong>

                       <span>
                      {new Date(
                        event.createdAt
                        ).toLocaleString("en-GB")}
                         </span>
                    </div>

                    <p className="timeline-location">
                      📍 {event.location}
                    </p>

                    <p>{event.note}</p>

                  </div>
                </article>
              ))}

            </div>
          ) : (
            <p>No tracking history available yet.</p>
          )}
        </section>
        <section className="payment-section">
  <p className="eyebrow">PAYMENT INFORMATION</p>
  <h2>Shipping payment</h2>

  <div className="track-grid">
    <div>
      <span>Total shipping cost</span>
      <strong>
        {shipment.shippingCost || "Not specified"}
      </strong>
    </div>

    <div>
      <span>Amount paid</span>
      <strong>
        {shipment.amountPaid || "0"}
      </strong>
    </div>

    <div>
      <span>Remaining balance</span>
      <strong>
        {shipment.remainingBalance || "0"}
      </strong>
    </div>

    <div>
      <span>Payment status</span>
      <strong>
        {shipment.paymentStatus || "Pending"}
      </strong>
    </div>
  </div>
</section>       
 <p className="disclaimer">
  Please contact SwiftRoute support if you have questions about
  shipment payment information.
</p>
        <a href="/" className="back-link">
          ← Back to tracking
        </a>

      </section>
    </main>
  );
}