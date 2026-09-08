import React, { useState } from "react";
import {
  FaBell,
  FaBox,
  FaTag,
  FaTruck,
  FaHeart,
} from "react-icons/fa";
import { AccountShell } from "./AccountShell";

const initial = {
  orders: true,
  delivery: true,
  offers: false,
  wishlist: true,
};

export default function NotificationsPage() {
  const [s, setS] = useState(initial);

  const notificationOptions = [
    [
      "orders",
      "Order updates",
      "Get updates about your purchases",
      FaBox,
    ],
    [
      "delivery",
      "Delivery updates",
      "Know when your order is arriving",
      FaTruck,
    ],
    [
      "offers",
      "Offers & deals",
      "Receive Odikart offers and promotions",
      FaTag,
    ],
    [
      "wishlist",
      "Wishlist alerts",
      "Get alerts for saved products",
      FaHeart,
    ],
  ];

  return (
    <AccountShell title="Notifications">
      <div
        className="ok-card ok-list"
        style={{ marginTop: 20 }}
      >
        {notificationOptions.map(
          ([key, title, description, Icon]) => (
            <label
              className="ok-list-item"
              key={key}
              style={{ cursor: "pointer" }}
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

              <input
                type="checkbox"
                checked={s[key]}
                onChange={(e) =>
                  setS({
                    ...s,
                    [key]: e.target.checked,
                  })
                }
              />
            </label>
          )
        )}
      </div>

      <p
        className="ok-small"
        style={{ marginTop: 14 }}
      >
        Notification preferences are currently
        stored on this device. Connect these
        toggles to your notification API when
        that backend is ready.
      </p>
    </AccountShell>
  );
}

