import React, { useState } from "react";
import {
  FaHome,
  FaBriefcase,
  FaMapMarkerAlt,
  FaUser,
  FaPhoneAlt,
  FaCity,
  FaCheck,
  FaSave,
} from "react-icons/fa";
import { toast } from "sonner";
import { AccountShell, api } from "./AccountShell";
import { useNavigate } from "react-router-dom";

/* ============================================================
   ADD ADDRESS PAGE
============================================================ */

export default function AddAddressPage() {
  const [f, setF] = useState({
    label: "Home",
    fullName: "",
    phone: "",
    alternatePhone: "",
    addressLine1: "",
    addressLine2: "",
    landmark: "",
    area: "",
    village: "",
    city: "",
    district: "",
    state: "",
    postalCode: "",
    country: "India",
    location: {
      latitude: null,
      longitude: null,
    },
    isDefault: false,
  });

  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const set = (key, value) => {
    setF((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const validate = () => {
    if (!f.fullName.trim()) {
      toast.error("Please enter your full name");
      return false;
    }

    if (!f.phone.trim()) {
      toast.error("Please enter your phone number");
      return false;
    }

    const phone = f.phone.replace(/\D/g, "");

    if (phone.length !== 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return false;
    }

    if (!f.addressLine1.trim()) {
      toast.error("Please enter your address");
      return false;
    }

    if (!f.area.trim()) {
      toast.error("Please enter your area");
      return false;
    }

    if (!f.city.trim()) {
      toast.error("Please enter your city");
      return false;
    }

    if (!f.district.trim()) {
      toast.error("Please enter your district");
      return false;
    }

    if (!f.state.trim()) {
      toast.error("Please enter your state");
      return false;
    }

    if (!/^[1-9][0-9]{5}$/.test(f.postalCode)) {
      toast.error("Please enter a valid 6-digit PIN code");
      return false;
    }

    return true;
  };

  const save = async () => {
    if (saving) return;

    if (!validate()) return;

    setSaving(true);

    try {
      const response = await api("/api/addresses", {
        method: "POST",
        body: JSON.stringify({
          label: f.label,
          fullName: f.fullName.trim(),
          phone: f.phone.trim(),
          alternatePhone: f.alternatePhone.trim(),
          addressLine1: f.addressLine1.trim(),
          addressLine2: f.addressLine2.trim(),
          landmark: f.landmark.trim(),
          area: f.area.trim(),
          village: f.village.trim(),
          city: f.city.trim(),
          district: f.district.trim(),
          state: f.state.trim(),
          postalCode: f.postalCode.trim(),
          country: f.country || "India",
          location: f.location,
          isDefault: Boolean(f.isDefault),
        }),
      });

      toast.success(
        response?.message || "Address saved successfully"
      );

      navigate("/account/addresses");
    } catch (error) {
      console.error("Save address error:", error);

      toast.error(
        error?.message || "Failed to save address"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <AddressForm
      title="Add address"
      f={f}
      set={set}
      save={save}
      saving={saving}
      submit="Save address"
    />
  );
}


/* ============================================================
   REUSABLE ADDRESS FORM
   IMPORTANT:
   This is a NAMED EXPORT because EditAddressPage imports it.
============================================================ */

export function AddressForm({
  title,
  f,
  set,
  save,
  saving,
  submit,
}) {
  const [pinLoading, setPinLoading] = useState(false);
  const [postOffices, setPostOffices] = useState([]);

  /* ==========================================================
     PIN LOOKUP
  ========================================================== */

  const fetchPinDetails = async (pin) => {
    if (!/^[1-9][0-9]{5}$/.test(pin)) {
      return;
    }

    setPinLoading(true);
    setPostOffices([]);

    try {
      const response = await fetch(
        `https://api.postalpincode.in/pincode/${pin}`
      );

      if (!response.ok) {
        throw new Error("PIN lookup failed");
      }

      const data = await response.json();

      if (
        !Array.isArray(data) ||
        !data[0] ||
        data[0].Status !== "Success" ||
        !Array.isArray(data[0].PostOffice) ||
        data[0].PostOffice.length === 0
      ) {
        toast.error("PIN code not found");

        set({
          area: "",
        });

        set("city", "");
        set("district", "");
        set("state", "");

        return;
      }

      const offices = data[0].PostOffice;

      setPostOffices(offices);

      const firstOffice = offices[0];

      set("area", firstOffice.Name || "");

      set(
        "city",
        firstOffice.Block ||
          firstOffice.Division ||
          firstOffice.District ||
          ""
      );

      set("district", firstOffice.District || "");

      set("state", firstOffice.State || "");

      set(
        "country",
        firstOffice.Country || "India"
      );

      toast.success(
        offices.length > 1
          ? `${offices.length} locations found`
          : "Location found"
      );
    } catch (error) {
      console.error("PIN lookup error:", error);

      toast.error(
        "Unable to fetch PIN code details"
      );

      setPostOffices([]);
    } finally {
      setPinLoading(false);
    }
  };


  /* ==========================================================
     PIN CHANGE
  ========================================================== */

  const handlePinChange = (value) => {
    const pin = value
      .replace(/\D/g, "")
      .slice(0, 6);

    set("postalCode", pin);

    /*
     * Clear automatically populated fields
     * until a complete PIN is entered.
     */
    if (pin.length < 6) {
      setPostOffices([]);

      set("area", "");
      set("city", "");
      set("district", "");
      set("state", "");

      return;
    }

    /*
     * Fetch information once 6 digits are entered.
     */
    if (pin.length === 6) {
      fetchPinDetails(pin);
    }
  };


  /* ==========================================================
     POST OFFICE SELECTION
  ========================================================== */

  const handlePostOfficeChange = (officeName) => {
    const selectedOffice = postOffices.find(
      (office) => office.Name === officeName
    );

    if (!selectedOffice) return;

    set(
      "area",
      selectedOffice.Name || ""
    );

    set(
      "city",
      selectedOffice.Block ||
        selectedOffice.Division ||
        selectedOffice.District ||
        ""
    );

    set(
      "district",
      selectedOffice.District || ""
    );

    set(
      "state",
      selectedOffice.State || ""
    );

    set(
      "country",
      selectedOffice.Country || "India"
    );
  };


  /* ==========================================================
     ADDRESS TYPES
  ========================================================== */

  const addressTypes = [
    {
      value: "Home",
      icon: <FaHome size={15} />,
      description: "Personal",
    },
    {
      value: "Office",
      icon: <FaBriefcase size={14} />,
      description: "Work",
    },
    {
      value: "Other",
      icon: <FaMapMarkerAlt size={14} />,
      description: "Other",
    },
  ];


  /* ==========================================================
     UI
  ========================================================== */

  return (
    <AccountShell title={title}>
      <div className="address-form-page">

        {/* INTRO */}

        <div className="address-form-intro">

          <div className="address-form-intro-icon">
            <FaMapMarkerAlt size={19} />
          </div>

          <div>
            <h2>Delivery address</h2>

            <p>
              Add your details so we can deliver your
              orders to the right place.
            </p>
          </div>

        </div>


        <div className="address-form-card">

          {/* ==================================================
              ADDRESS TYPE
          ================================================== */}

          <section className="form-section">

            <div className="form-section-heading">

              <h3>Address type</h3>

              <p>
                Choose a label to identify this address
              </p>

            </div>


            <div className="address-type-grid">

              {addressTypes.map((item) => {

                const active =
                  f.label === item.value;

                return (
                  <button
                    type="button"
                    key={item.value}
                    className={`address-type ${
                      active ? "active" : ""
                    }`}
                    onClick={() =>
                      set("label", item.value)
                    }
                  >

                    <div className="address-type-icon">
                      {item.icon}
                    </div>

                    <div className="address-type-text">

                      <strong>
                        {item.value}
                      </strong>

                      <span>
                        {item.description}
                      </span>

                    </div>


                    {active && (
                      <div className="address-type-check">
                        <FaCheck size={8} />
                      </div>
                    )}

                  </button>
                );
              })}

            </div>

          </section>


          {/* ==================================================
              CONTACT DETAILS
          ================================================== */}

          <section className="form-section">

            <div className="form-section-heading">

              <h3>Contact details</h3>

              <p>
                Who should receive the delivery?
              </p>

            </div>


            <div className="form-grid">

              <Field
                icon={<FaUser />}
                label="Full name"
                required
                value={f.fullName || ""}
                onChange={(value) =>
                  set("fullName", value)
                }
                placeholder="Enter full name"
                autoComplete="name"
              />


              <Field
                icon={<FaPhoneAlt />}
                label="Phone number"
                required
                value={f.phone || ""}
                onChange={(value) =>
                  set(
                    "phone",
                    value
                      .replace(/\D/g, "")
                      .slice(0, 10)
                  )
                }
                placeholder="10-digit phone number"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
              />


              <Field
                icon={<FaPhoneAlt />}
                label="Alternate phone"
                value={f.alternatePhone || ""}
                onChange={(value) =>
                  set(
                    "alternatePhone",
                    value
                      .replace(/\D/g, "")
                      .slice(0, 10)
                  )
                }
                placeholder="Optional"
                type="tel"
                inputMode="numeric"
              />

            </div>

          </section>


          {/* ==================================================
              ADDRESS DETAILS
          ================================================== */}

          <section className="form-section">

            <div className="form-section-heading">

              <h3>Address details</h3>

              <p>
                Enter your complete delivery address
              </p>

            </div>


            <Field
              label="Address line 1"
              required
              value={f.addressLine1 || ""}
              onChange={(value) =>
                set("addressLine1", value)
              }
              placeholder="House / flat number, building, street"
              autoComplete="street-address"
            />


            <Field
              label="Address line 2"
              value={f.addressLine2 || ""}
              onChange={(value) =>
                set("addressLine2", value)
              }
              placeholder="Apartment, floor, block, etc. (optional)"
            />


            <div className="form-grid">

              <Field
                label="Landmark"
                value={f.landmark || ""}
                onChange={(value) =>
                  set("landmark", value)
                }
                placeholder="Nearby landmark"
              />


              {/* AREA */}

              <div className="ok-field">

                <label>
                  Area/Post
                  <span className="required-star">
                    *
                  </span>
                </label>


                {postOffices.length > 1 ? (

                  <select
                    className="ok-input area-select"
                    value={f.area || ""}
                    onChange={(e) =>
                      handlePostOfficeChange(
                        e.target.value
                      )
                    }
                  >

                    {postOffices.map((office) => (

                      <option
                        key={`${office.Name}-${office.Pincode}`}
                        value={office.Name}
                      >
                        {office.Name}
                      </option>

                    ))}

                  </select>

                ) : (

                  <input
                    className="ok-input"
                    value={f.area || ""}
                    onChange={(e) =>
                      set(
                        "area",
                        e.target.value
                      )
                    }
                    placeholder="Locality / area"
                  />

                )}

              </div>

              <Field
                label="Village"
                value={f.village || ""}
                onChange={(value) =>
                  set("village", value)
                }
                placeholder="Enter village"
              />

            </div>

          </section>


          {/* ==================================================
              LOCATION
          ================================================== */}

          <section className="form-section">

            <div className="form-section-heading">

              <h3>Location</h3>

              <p>
                PIN code automatically fills location details
              </p>

            </div>


            <div className="form-grid">

              {/* CITY */}

              <Field
                icon={<FaCity />}
                label="City"
                required
                value={f.city || ""}
                onChange={(value) =>
                  set("city", value)
                }
                placeholder="Enter city"
                autoComplete="address-level2"
              />


              {/* DISTRICT */}

              <Field
                label="District"
                required
                value={f.district || ""}
                onChange={(value) =>
                  set("district", value)
                }
                placeholder="Enter district"
              />


              {/* STATE */}

              <Field
                label="State"
                required
                value={f.state || ""}
                onChange={(value) =>
                  set("state", value)
                }
                placeholder="Enter state"
                autoComplete="address-level1"
              />


              {/* PIN CODE */}

              <div className="ok-field">

                <label>
                  PIN code
                  <span className="required-star">
                    *
                  </span>
                </label>


                <div className="pin-input-wrapper">

                  <input
                    className="ok-input"
                    type="text"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    maxLength={6}
                    value={f.postalCode || ""}
                    onChange={(e) =>
                      handlePinChange(
                        e.target.value
                      )
                    }
                    placeholder={
                      pinLoading
                        ? "Finding location..."
                        : "6-digit PIN"
                    }
                  />


                  {pinLoading && (
                    <span className="pin-spinner" />
                  )}

                </div>


                {pinLoading && (
                  <small className="pin-status">
                    Finding address details...
                  </small>
                )}


                {!pinLoading &&
                  String(f.postalCode || "").length === 6 &&
                  f.state && (
                    <small className="pin-success">
                      ✓ Location found
                    </small>
                  )}

              </div>

            </div>

          </section>


          {/* ==================================================
              COUNTRY
          ================================================== */}

          <section className="form-section country-section">

            <div className="form-section-heading">

              <h3>Country</h3>

              <p>
                Delivery country
              </p>

            </div>


            <Field
              label="Country"
              required
              value={f.country || "India"}
              onChange={(value) =>
                set("country", value)
              }
              placeholder="Country"
              autoComplete="country-name"
            />

          </section>


          {/* ==================================================
              DEFAULT ADDRESS
          ================================================== */}

          <section className="default-address-section">

            <label className="default-address-toggle">

              <input
                type="checkbox"
                checked={Boolean(f.isDefault)}
                onChange={(e) =>
                  set(
                    "isDefault",
                    e.target.checked
                  )
                }
              />


              <span className="custom-checkbox">

                {f.isDefault && (
                  <FaCheck size={9} />
                )}

              </span>


              <span className="default-address-content">

                <strong>
                  Make this my default address
                </strong>

                <small>
                  Use this address automatically during
                  checkout
                </small>

              </span>

            </label>

          </section>


          {/* ==================================================
              ACTIONS
          ================================================== */}

          <div className="address-form-actions">

            <button
              type="button"
              className="ok-btn ok-outline cancel-btn"
              disabled={saving}
              onClick={() =>
                navigate("/account/addresses")
              }
            >
              Cancel
            </button>


            <button
              type="button"
              className="ok-btn ok-primary save-address-btn"
              disabled={saving || pinLoading}
              onClick={save}
            >

              {saving ? (

                <>
                  <span className="save-spinner" />
                  Saving...
                </>

              ) : (

                <>
                  <FaSave size={12} />
                  {submit}
                </>

              )}

            </button>

          </div>

        </div>

      </div>


      {/* ========================================================
          STYLES
      ======================================================== */}

      <style>{`

        .address-form-page {
          width: 100%;
          padding-bottom: 24px;
        }

        .address-form-intro {
          display: flex;
          align-items: center;
          gap: 13px;
          margin-bottom: 18px;
        }

        .address-form-intro-icon {
          width: 44px;
          height: 44px;
          flex: none;
          display: grid;
          place-items: center;
          border-radius: 14px;
          background: #eeedff;
          color: #4f46e5;
        }

        .address-form-intro h2 {
          margin: 0 0 4px;
          color: #111827;
          font-size: 20px;
          font-weight: 800;
          letter-spacing: -.3px;
        }

        .address-form-intro p {
          margin: 0;
          color: #737582;
          font-size: 11px;
          line-height: 1.5;
        }

        .address-form-card {
          overflow: hidden;
          background: #fff;
          border: 1px solid #e8e8ef;
          border-radius: 20px;
          box-shadow:
            0 3px 16px rgba(20,20,40,.05);
        }

        .form-section {
          padding: 21px;
          border-bottom: 1px solid #eef0f4;
        }

        .form-section-heading {
          margin-bottom: 16px;
        }

        .form-section-heading h3 {
          margin: 0 0 4px;
          color: #17181d;
          font-size: 14px;
          font-weight: 800;
        }

        .form-section-heading p {
          margin: 0;
          color: #858894;
          font-size: 10px;
        }

        .address-type-grid {
          display: grid;
          grid-template-columns:
            repeat(3, 1fr);
          gap: 9px;
        }

        .address-type {
          position: relative;
          min-height: 66px;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 10px;
          text-align: left;
          border: 1px solid #e5e7eb;
          border-radius: 13px;
          background: #fff;
          color: #374151;
          cursor: pointer;
          transition:
            border-color .16s ease,
            background .16s ease,
            box-shadow .16s ease;
        }

        .address-type:hover {
          border-color: #c7c5ff;
          background: #fafaff;
        }

        .address-type.active {
          border-color: #6366f1;
          background: #f7f7ff;
          box-shadow:
            0 0 0 2px
            rgba(99,102,241,.08);
        }

        .address-type-icon {
          width: 34px;
          height: 34px;
          flex: none;
          display: grid;
          place-items: center;
          border-radius: 10px;
          background: #f1f5f9;
          color: #64748b;
        }

        .address-type.active
        .address-type-icon {
          background: #eeedff;
          color: #4f46e5;
        }

        .address-type-text {
          min-width: 0;
        }

        .address-type strong {
          display: block;
          margin-bottom: 2px;
          font-size: 11px;
          font-weight: 800;
        }

        .address-type span {
          display: block;
          color: #858894;
          font-size: 9px;
        }

        .address-type-check {
          position: absolute;
          top: 7px;
          right: 7px;
          width: 16px;
          height: 16px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #4f46e5;
          color: #fff;
        }

        .form-grid {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 0 12px;
        }

        .address-form-card .ok-field {
          margin-bottom: 15px;
        }

        .address-form-card
        .ok-field label {
          display: block;
          margin-bottom: 7px;
          color: #4b5563;
          font-size: 11px;
          font-weight: 750;
        }

        .required-star {
          color: #dc2626;
          margin-left: 2px;
        }

        .address-form-card .ok-input {
          width: 100%;
          height: 45px;
          padding: 0 12px;
          box-sizing: border-box;
          border: 1px solid #e1e3ea;
          border-radius: 11px;
          background: #fff;
          color: #111827;
          font-size: 12px;
          outline: none;
          transition:
            border-color .16s ease,
            box-shadow .16s ease;
        }

        .address-form-card
        .ok-input::placeholder {
          color: #a1a5af;
        }

        .address-form-card
        .ok-input:focus {
          border-color: #6366f1;
          box-shadow:
            0 0 0 3px
            rgba(99,102,241,.09);
        }

        .field-with-icon {
          position: relative;
        }

        .field-icon {
          position: absolute;
          left: 13px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          pointer-events: none;
          z-index: 1;
        }

        .field-with-icon .ok-input {
          padding-left: 35px;
        }

        /* PIN */

        .pin-input-wrapper {
          position: relative;
        }

        .pin-input-wrapper .ok-input {
          padding-right: 42px;
        }

        .pin-spinner {
          position: absolute;
          right: 14px;
          top: 50%;
          width: 15px;
          height: 15px;
          margin-top: -8px;
          border: 2px solid #e5e7eb;
          border-top-color: #4f46e5;
          border-radius: 50%;
          animation:
            pinSpin .7s linear infinite;
        }

        .pin-status {
          display: block;
          margin-top: 5px;
          color: #6b7280;
          font-size: 9px;
        }

        .pin-success {
          display: block;
          margin-top: 5px;
          color: #16a34a;
          font-size: 9px;
          font-weight: 700;
        }

        @keyframes pinSpin {
          to {
            transform: rotate(360deg);
          }
        }

        .area-select {
          cursor: pointer;
          appearance: auto;
        }

        .country-section {
          padding-bottom: 6px;
        }

        .default-address-section {
          padding: 18px 21px;
          background: #fafbfc;
          border-bottom: 1px solid #eef0f4;
        }

        .default-address-toggle {
          position: relative;
          display: flex;
          align-items: center;
          gap: 11px;
          cursor: pointer;
        }

        .default-address-toggle input {
          position: absolute;
          opacity: 0;
          pointer-events: none;
        }

        .custom-checkbox {
          width: 19px;
          height: 19px;
          flex: none;
          display: grid;
          place-items: center;
          border: 1.5px solid #cfd2da;
          border-radius: 6px;
          background: #fff;
          color: #fff;
          transition: all .15s ease;
        }

        .default-address-toggle
        input:checked + .custom-checkbox {
          border-color: #4f46e5;
          background: #4f46e5;
        }

        .default-address-content strong {
          display: block;
          margin-bottom: 3px;
          color: #374151;
          font-size: 11px;
          font-weight: 800;
        }

        .default-address-content small {
          display: block;
          color: #858894;
          font-size: 9px;
        }

        .address-form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 9px;
          padding: 18px 21px;
          background: #fff;
        }

        .address-form-actions button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          min-height: 43px;
          border-radius: 11px;
        }

        .cancel-btn {
          min-width: 90px;
        }

        .save-address-btn {
          min-width: 135px;
        }

        .save-address-btn:disabled {
          opacity: .7;
          cursor: not-allowed;
        }

        .save-spinner {
          width: 12px;
          height: 12px;
          border: 2px solid
            rgba(255,255,255,.4);
          border-top-color: #fff;
          border-radius: 50%;
          animation:
            saveSpin .7s linear infinite;
        }

        @keyframes saveSpin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 600px) {

          .address-form-intro h2 {
            font-size: 18px;
          }

          .address-form-card {
            border-radius: 17px;
          }

          .form-section {
            padding: 17px 15px;
          }

          .address-type-grid {
            gap: 7px;
          }

          .address-type {
            min-height: 60px;
            padding: 8px;
            gap: 7px;
          }

          .address-type-icon {
            width: 30px;
            height: 30px;
          }

          .address-type strong {
            font-size: 10px;
          }

          .address-type span {
            font-size: 8px;
          }

          .address-type-check {
            width: 14px;
            height: 14px;
          }

          .form-grid {
            grid-template-columns: 1fr;
            gap: 0;
          }

          .default-address-section {
            padding: 16px 15px;
          }

          .address-form-actions {
            padding: 15px;
          }

          .cancel-btn {
            flex: 1;
          }

          .save-address-btn {
            flex: 1.5;
          }
        }

        @media (max-width: 380px) {

          .address-type-grid {
            grid-template-columns: 1fr;
          }

          .address-type {
            min-height: 54px;
          }

          .address-type span {
            display: inline;
            margin-left: 5px;
          }
        }

      `}</style>
    </AccountShell>
  );
}


/* ============================================================
   REUSABLE FIELD
============================================================ */

function Field({
  icon,
  label,
  required = false,
  value,
  onChange,
  placeholder,
  type = "text",
  inputMode,
  autoComplete,
}) {
  return (
    <div className="ok-field">

      <label>
        {label}

        {required && (
          <span className="required-star">
            *
          </span>
        )}
      </label>

      <div
        className={
          icon
            ? "field-with-icon"
            : ""
        }
      >

        {icon && (
          <span className="field-icon">
            {React.cloneElement(icon, {
              size: 11,
            })}
          </span>
        )}

        <input
          className="ok-input"
          type={type}
          inputMode={inputMode}
          value={value || ""}
          onChange={(e) =>
            onChange(e.target.value)
          }
          placeholder={placeholder}
          autoComplete={autoComplete}
        />

      </div>

    </div>
  );
}

