import React from "react";
import {
  FaQuestionCircle,
  FaBox,
  FaCreditCard,
  FaUndo,
  FaMapMarkerAlt,
  FaChevronRight,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { AccountShell } from "./AccountShell";

const topics = [
  ["Where is my order?", FaBox],
  ["Payment issue", FaCreditCard],
  ["Return or refund", FaUndo],
  ["Delivery address", FaMapMarkerAlt],
];

export default function HelpSupportPage() {
  return (
    <AccountShell title="Help & support">
      <div style={{ marginTop: 20 }}>
        {/* SEARCH */}
        <div
          className="ok-card"
          style={{ padding: 18 }}
        >
          <b style={{ fontSize: 16 }}>
            How can we help?
          </b>

          <input
            className="ok-input"
            style={{ marginTop: 14 }}
            placeholder="Search help topics"
          />
        </div>

        {/* POPULAR TOPICS */}
        <div className="ok-section">
          <div className="ok-label">
            Popular
          </div>

          <div className="ok-card ok-list">
            {topics.map(([title, Icon]) => (
              <button
                className="ok-list-item"
                key={title}
                onClick={() =>
                  toast.info(
                    "Support article coming soon"
                  )
                }
              >
                <div className="ok-circle">
                  <Icon />
                </div>

                <div className="ok-grow">
                  <b>{title}</b>
                </div>

                <FaChevronRight size={12} />
              </button>
            ))}
          </div>
        </div>

        {/* CONTACT SUPPORT */}
        <div
          className="ok-card"
          style={{
            padding: 20,
            marginTop: 22,
            textAlign: "center",
          }}
        >
          <FaQuestionCircle
            size={30}
            color="#4f46e5"
          />

          <h3>
            Need more help?
          </h3>

          <p className="ok-muted">
            Contact Odikart support and we'll
            help you resolve the issue.
          </p>

          <button
            className="ok-btn ok-primary"
            onClick={() =>
              toast.info(
                "Connect your support/ticket API here"
              )
            }
          >
            Contact support
          </button>
        </div>
      </div>
    </AccountShell>
  );
}

