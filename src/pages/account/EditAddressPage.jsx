import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { AccountShell, api } from "./AccountShell";
import { AddressForm } from "./AddAddressPage";

export default function EditAddressPage() {
  const id = window.location.pathname
    .split("/")
    .filter(Boolean)
    .slice(-2, -1)[0];

  const [f, setF] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ============================================================
  // LOAD ADDRESS
  // ============================================================

  useEffect(() => {
    const loadAddress = async () => {
      try {
        setLoading(true);

        const d = await api("/api/addresses");

        const addresses =
          d.addresses ||
          d.data ||
          [];

        const address = addresses.find(
          (item) =>
            String(item._id || item.id) ===
            String(id)
        );

        if (!address) {
          throw new Error(
            "Address not found"
          );
        }

        setF({
          label:
            address.label || "Home",

          fullName:
            address.fullName || "",

          phone:
            address.phone || "",

          alternatePhone:
            address.alternatePhone || "",

          addressLine1:
            address.addressLine1 || "",

          addressLine2:
            address.addressLine2 || "",

          landmark:
            address.landmark || "",

          area:
            address.area || "",

          village:
            address.village || "",

          city:
            address.city || "",

          district:
            address.district || "",

          state:
            address.state || "",

          postalCode:
            address.postalCode || "",

          country:
            address.country || "India",

          location:
            address.location || {
              latitude: null,
              longitude: null,
            },

          isDefault:
            Boolean(address.isDefault),
        });
      } catch (e) {
        console.error(
          "Load address error:",
          e
        );

        toast.error(
          e.message ||
            "Failed to load address"
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadAddress();
    } else {
      setLoading(false);

      toast.error(
        "Invalid address ID"
      );
    }
  }, [id]);

  // ============================================================
  // UPDATE FORM FIELD
  // ============================================================

  const set = (key, value) => {
    setF((current) => ({
      ...current,
      [key]: value,
    }));
  };

  // ============================================================
  // SAVE / UPDATE ADDRESS
  // ============================================================

  const save = async () => {
    if (!id) {
      toast.error(
        "Invalid address ID"
      );
      return;
    }

    if (!f) {
      toast.error(
        "Address data is not available"
      );
      return;
    }

    if (saving) return;

    setSaving(true);

    try {
      const payload = {
        label:
          String(
            f.label || "Home"
          ).trim(),

        fullName:
          String(
            f.fullName || ""
          ).trim(),

        phone:
          String(
            f.phone || ""
          ).trim(),

        alternatePhone:
          String(
            f.alternatePhone || ""
          ).trim(),

        addressLine1:
          String(
            f.addressLine1 || ""
          ).trim(),

        addressLine2:
          String(
            f.addressLine2 || ""
          ).trim(),

        landmark:
          String(
            f.landmark || ""
          ).trim(),

        area:
          String(
            f.area || ""
          ).trim(),

        village:
          String(
            f.village || ""
          ).trim(),

        city:
          String(
            f.city || ""
          ).trim(),

        district:
          String(
            f.district || ""
          ).trim(),

        state:
          String(
            f.state || ""
          ).trim(),

        postalCode:
          String(
            f.postalCode || ""
          ).trim(),

        country:
          String(
            f.country || "India"
          ).trim(),

        location:
          f.location || {
            latitude: null,
            longitude: null,
          },

        isDefault:
          Boolean(f.isDefault),
      };

      const d = await api(
        `/api/addresses/${id}`,
        {
          method: "PUT",

          body: JSON.stringify(
            payload
          ),
        }
      );

      if (!d || d.success === false) {
        throw new Error(
          d?.message ||
            "Failed to update address"
        );
      }

      toast.success(
        d.message ||
          "Address updated successfully"
      );

      // --------------------------------------------------------
      // Return to checkout if the user came from checkout.
      // Otherwise return to saved addresses.
      // --------------------------------------------------------

      let returnPath =
        "/account/addresses";

      try {
        const stored =
          sessionStorage.getItem(
            "odicart_checkout_return"
          );

        if (stored) {
          const returnData =
            JSON.parse(stored);

          if (
            returnData?.path === "/cart"
          ) {
            returnPath = "/cart";

            // Clear it after consuming it.
            sessionStorage.removeItem(
              "odicart_checkout_return"
            );
          }
        }
      } catch (error) {
        console.warn(
          "Unable to read checkout return path:",
          error
        );
      }

      // Navigate immediately.
      window.location.href =
        returnPath;
    } catch (e) {
      console.error(
        "Update address error:",
        e
      );

      toast.error(
        e.message ||
          "Failed to update address"
      );

      setSaving(false);
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <AccountShell title="Edit address">
        <div className="ok-card ok-empty">
          Loading address...
        </div>
      </AccountShell>
    );
  }

  // ============================================================
  // ADDRESS NOT FOUND
  // ============================================================

  if (!f) {
    return (
      <AccountShell title="Edit address">
        <div className="ok-card ok-empty">
          <h3>
            Address not found
          </h3>

          <p className="ok-muted">
            This address may have been
            deleted or is no longer
            available.
          </p>

          <button
            className="ok-btn ok-primary"
            style={{
              marginTop: 18,
            }}
            onClick={() => {
              window.location.href =
                "/account/addresses";
            }}
          >
            Back to addresses
          </button>
        </div>
      </AccountShell>
    );
  }

  // ============================================================
  // EDIT ADDRESS FORM
  // ============================================================

  return (
    <AccountShell title="Edit address">
      <AddressForm
        title="Edit address"
        f={f}
        set={set}
        save={save}
        saving={saving}
        submit="Save changes"
      />
    </AccountShell>
  );
}

