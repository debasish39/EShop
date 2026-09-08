import React from "react";
import "./OdikartBanner.css";

const OdikartBanner = () => {
  return (
    <section className="odikart-banner">
      {/* Background decorations */}
      <div className="banner-glow banner-glow-one"></div>
      <div className="banner-glow banner-glow-two"></div>
      <div className="banner-circle circle-one"></div>
      <div className="banner-circle circle-two"></div>

      <div className="banner-container">
        {/* LEFT CONTENT */}
        <div className="banner-content">
          <div className="brand-area">
            <div className="logo-box">
              <img
                src="/logo.png"
                alt="Odikart"
                className="odikart-logo"
              />
            </div>
          </div>

          <div className="premium-badge">
            <span className="badge-dot"></span>
            PREMIUM SHOPPING EXPERIENCE
          </div>

          <h1 className="banner-title">
            Everything You Need.
            <br />
            <span>One Smart Cart.</span>
          </h1>

          <p className="banner-description">
            Shop electronics, fashion, lifestyle & more at great prices.
            Discover a smarter way to shop with Odikart.
          </p>

          <div className="banner-actions">
            <button className="shop-button">
              Shop Smarter
              <span className="button-arrow">→</span>
            </button>

            <div className="secure-shopping">
              <div className="secure-icon">✓</div>
              <div>
                <strong>Secure Shopping</strong>
                <small>Safe & trusted checkout</small>
              </div>
            </div>
          </div>

          <div className="banner-features">
            <div className="feature">
              <span>⚡</span>
              <div>
                <strong>Quick</strong>
                <small>Easy shopping</small>
              </div>
            </div>

            <div className="feature-divider"></div>

            <div className="feature">
              <span>🛍️</span>
              <div>
                <strong>Everything</strong>
                <small>All in one place</small>
              </div>
            </div>

            <div className="feature-divider"></div>

            <div className="feature">
              <span>🔒</span>
              <div>
                <strong>Secure</strong>
                <small>Shop with confidence</small>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PRODUCT VISUAL */}
        <div className="banner-visual">
          {/* Decorative orbit */}
          <div className="orbit orbit-one"></div>
          <div className="orbit orbit-two"></div>

          {/* Main shopping card */}
          <div className="main-shopping-card">
            <div className="card-top">
              <span>ODIKART</span>
              <span className="card-menu">•••</span>
            </div>

            <div className="shopping-bag">
              <div className="bag-handle"></div>
              <div className="bag-body">
                <span>O</span>
              </div>
            </div>

            <div className="card-bottom">
              <div>
                <small>Smart Shopping</small>
                <strong>Made Simple</strong>
              </div>
              <div className="card-check">✓</div>
            </div>
          </div>

          {/* Smartphone */}
          <div className="product-card phone-card">
            <div className="phone">
              <div className="phone-screen">
                <div className="phone-notch"></div>
                <div className="screen-logo">
                  <img src="/logo.png" alt="" />
                </div>
                <div className="screen-lines">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>

          {/* Headphones */}
          <div className="product-card headphones-card">
            <div className="headphones">
              <div className="headphone-arc"></div>
              <div className="ear-piece left-ear"></div>
              <div className="ear-piece right-ear"></div>
            </div>
          </div>

          {/* Watch */}
          <div className="product-card watch-card">
            <div className="watch-strap"></div>
            <div className="watch-face">
              <div className="watch-time">10:09</div>
              <div className="watch-line"></div>
            </div>
            <div className="watch-strap bottom"></div>
          </div>

          {/* Parcel */}
          <div className="product-card parcel-card">
            <div className="parcel">
              <div className="parcel-top"></div>
              <div className="parcel-front">
                <img src="/logo.png" alt="Odikart" />
              </div>
              <div className="parcel-tape"></div>
            </div>
          </div>

          {/* Floating dots */}
          <div className="floating-dot dot-one"></div>
          <div className="floating-dot dot-two"></div>
          <div className="floating-dot dot-three"></div>
        </div>
      </div>
    </section>
  );
};

export default OdikartBanner;