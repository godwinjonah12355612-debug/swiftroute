"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function Home() {
  const router = useRouter();
  const [trackingNumber, setTrackingNumber] = useState("");

  function handleTrackingSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const number = trackingNumber.trim();

    if (!number) {
      return;
    }

    router.push(`/track?number=${encodeURIComponent(number)}`);
  }

  return (
    <main id="top" className="site-shell">
      <nav className="topbar" aria-label="Main navigation">
        <Link className="brand" href="/">
          <span className="brand-mark">S</span>
          <span>SwiftRoute</span>
        </Link>

        <div className="nav-links">
          <Link href="/services">Services</Link>

          <Link href="/contact">Support</Link>

          <Link className="admin-link" href="/admin">
            Admin portal
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">
            Reliable delivery, clear visibility
          </p>

          <h1>
            Every shipment,
            <br />
            exactly where it
            <br />
            needs to be.
          </h1>

          <div className="hero-actions">
            <a href="#tracking" className="primary-action">
              Track a shipment
            </a>

            <Link href="/services" className="secondary-action">
              Explore services →
            </Link>
          </div>

          <p className="hero-text">
            Follow your consignment in real time, receive important updates,
            and access a clean digital receipt whenever you need it.
          </p>
        </div>

        {/* TRACKING CARD */}
        <section
          id="tracking"
          className="tracking-card"
          aria-labelledby="tracking-title"
        >
          <p className="card-kicker">
            Shipment tracking
          </p>

          <h2 id="tracking-title">
            Where is your package?
          </h2>

          <p>
            Enter the tracking number from your email or receipt.
          </p>

          <form
            onSubmit={handleTrackingSubmit}
            className="tracking-form"
          >
            <label htmlFor="tracking-number">
              Tracking number
            </label>

            <div className="input-row">
                   <input
  id="tracking-number"
  placeholder="TRK-8F42K91"
                autoComplete="off"
                value={trackingNumber}
                onChange={(event) =>
                  setTrackingNumber(event.target.value)
                }
                required
              />

              <button type="submit">
                Track
              </button>
            </div>
          </form>

          <p className="privacy-note">
            Only appropriate shipment details are shown publicly.
          </p>
        </section>
      </section>

      {/* SERVICES SECTION */}
<section className="warehouse-service">
  <div className="warehouse-service-image">
    <img
      src="/uploads/warehouse.jpg"
      alt="SwiftRoute warehouse with packages ready for delivery"
    />
  </div>

  <div className="warehouse-service-content">
    <p className="eyebrow">OUR SERVICES</p>

    <h2>
      Reliable logistics from
      <br />
      warehouse to destination.
    </h2>

    <p className="warehouse-service-text">
      SwiftRoute helps keep your shipments moving with reliable handling,
      organized logistics, and clear tracking from collection to delivery.
    </p>

    <div className="service-features">
      <div className="service-feature">
        <span className="service-number">01</span>

        <div>
          <h3>Secure handling</h3>
          <p>
            Your packages are handled carefully throughout every stage of
            delivery.
          </p>
        </div>
      </div>

      <div className="service-feature">
        <span className="service-number">02</span>

        <div>
          <h3>Real-time tracking</h3>
          <p>
            Stay informed with clear shipment updates and important delivery
            milestones.
          </p>
        </div>
      </div>

      <div className="service-feature">
        <span className="service-number">03</span>

        <div>
          <h3>Reliable delivery</h3>
          <p>
            We help move your shipment efficiently toward its final
            destination.
          </p>
        </div>
      </div>
    </div>

    <Link href="/services" className="warehouse-service-button">
      Explore our services →
    </Link>
  </div>
</section>

      {/* TRUST SECTION */}
      <section
        className="trust-row"
        aria-label="Service highlights"
      >
        <div>
          <strong>Fast updates</strong>
          <span>Clear shipment milestones</span>
        </div>

        <div>
          <strong>Secure by design</strong>
          <span>Your private details stay protected</span>
        </div>

        <div>
          <strong>Mobile ready</strong>
          <span>Track and print from your phone</span>
        </div>
      </section> 

      <section className="support-notice">
  <div className="support-notice-content">
    <div className="support-notice-text">
      <p className="support-notice-label">
        NEED HELP WITH YOUR SHIPMENT?
      </p>

      <h2>
        Our support team is here to help you.
      </h2>

      <p>
        If you have questions about your shipment, tracking information,
        delivery status, or any other concern, you can contact our support
        team directly.
      </p>
    </div>

    <a href="/contact" className="support-notice-button">
      Contact support →
    </a>
  </div>
</section>

      {/* FOOTER */}
      <footer id="support">
        <span>© 2026 SwiftRoute Logistics</span>

        <span>
          Need help? Contact our support team with your tracking number.
        </span>
      </footer>
    </main>
  );
}