import React from "react";
import {
  FaFileContract,
  FaShieldAlt,
  FaUndo,
  FaTruck,
  FaBan,
} from "react-icons/fa";
import { AccountShell } from "./AccountShell";

export default function LegalPage() {
  const rows = [
    [
      "Terms & Conditions",
      "The rules for using Odikart",
      FaFileContract,
    ],
    [
      "Privacy Policy",
      "How your data is handled",
      FaShieldAlt,
    ],
    [
      "Refund Policy",
      "Returns and refunds",
      FaUndo,
    ],
    [
      "Shipping Policy",
      "Delivery terms and timelines",
      FaTruck,
    ],
    [
      "Cancellation Policy",
      "Order cancellation rules",
      FaBan,
    ],
  ];

  return (
    <AccountShell title="Terms & privacy">
      <div
        className="ok-card ok-list"
        style={{ marginTop: 20 }}
      >
        {rows.map(([title, description, Icon]) => (
          <button
            className="ok-list-item"
            key={title}
            onClick={() =>
              alert(
                `${title}\n\nAdd your official Odikart policy content here.`
              )
            }
          >
            <div className="ok-circle">
              <Icon />
            </div>

            <div className="ok-grow">
              <b>{title}</b>

              <div className="ok-small">
                {description}
              </div>
            </div>

            <span>›</span>
          </button>
        ))}
      </div>

      <p
        className="ok-small"
        style={{ marginTop: 18 }}
      >
        Replace the placeholder policy text with
        your legally approved Odikart documents
        before production.
      </p>
    </AccountShell>
  );
}

