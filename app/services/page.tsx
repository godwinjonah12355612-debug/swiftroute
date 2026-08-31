export default function ServicesPage() {
  return (
    <main className="site-shell">
      {/* HOW IT WORKS */}
      <section className="steps" id="services">
        <div className="steps-heading">
          <p className="eyebrow">
            Simple from start to finish
          </p>

          <h2>
            Track a shipment in three simple steps
          </h2>

          <p className="steps-intro">
            SwiftRoute gives you a simple and reliable way to follow your
            shipment from the moment it is created until it reaches its final
            destination.
          </p>
        </div>

        <div className="step-grid">

          {/* STEP 1 */}
          <article className="step-card">
            <div className="step-top">
              <span className="step-number">01</span>

              <div className="step-icon" aria-hidden="true">
                📦
              </div>
            </div>

            <div className="step-visual step-visual-package">
              <div className="visual-circle">
                📦
              </div>
            </div>

            <h3>Receive your tracking number</h3>

            <p>
              Once your shipment is registered, you receive a unique tracking
              number that securely identifies your package.
            </p>

            <p className="step-description">
              Keep this number safe. You can use it at any time to access
              important information about your shipment and follow its journey.
            </p>

            <span className="step-label">
              Shipment created
            </span>
          </article>

          {/* STEP 2 */}
          <article className="step-card">
            <div className="step-top">
              <span className="step-number">02</span>

              <div className="step-icon" aria-hidden="true">
                📍
              </div>
            </div>

            <div className="step-visual step-visual-location">
              <div className="visual-circle">
                📍
              </div>
            </div>

            <h3>Check your shipment status</h3>

            <p>
              Enter your tracking number to view the latest information about
              your shipment in one convenient place.
            </p>

            <p className="step-description">
              Follow important updates including shipment progress, location,
              status changes, and key delivery milestones.
            </p>

            <a href="/#tracking" className="step-action">
              Track shipment →
            </a>
          </article>

          {/* STEP 3 */}
          <article className="step-card">
            <div className="step-top">
              <span className="step-number">03</span>

              <div className="step-icon" aria-hidden="true">
                ✓
              </div>
            </div>

            <div className="step-visual step-visual-delivery">
              <div className="visual-circle">
                🚚
              </div>
            </div>

            <h3>Follow your delivery</h3>

            <p>
              Stay informed as your shipment continues its journey toward its
              destination.
            </p>

            <p className="step-description">
              Review your shipment information and keep track of important
              delivery updates until your package has reached its final
              destination.
            </p>

            <a href="/#tracking" className="step-action">
              Start tracking →
            </a>
          </article>

        </div>
      </section>

      {/* ADDITIONAL INFORMATION SECTION */}
      <section className="tracking-benefits">
        <div className="benefits-content">
          <p className="eyebrow">
            Stay informed
          </p>

          <h2>
            Everything you need to follow your shipment
          </h2>

          <p>
            SwiftRoute brings your shipment information together in one simple
            place, making it easier to stay informed throughout the delivery
            journey.
          </p>

          <div className="benefit-list">
            <div className="benefit-item">
              <span>📦</span>
              <div>
                <h3>Shipment information</h3>
                <p>
                  View important details connected to your shipment.
                </p>
              </div>
            </div>

            <div className="benefit-item">
              <span>📍</span>
              <div>
                <h3>Progress updates</h3>
                <p>
                  Follow important milestones as your shipment moves forward.
                </p>
              </div>
            </div>

            <div className="benefit-item">
              <span>🚚</span>
              <div>
                <h3>Delivery updates</h3>
                <p>
                  Stay informed as your shipment approaches its destination.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}