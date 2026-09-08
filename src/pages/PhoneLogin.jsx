import { useEffect, useRef, useState } from "react";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";

import { auth } from "../firebase/firebase";
import AuthLayout from "../components/AuthLayout";

import {
  FaArrowRight,
  FaCheckCircle,
  FaPhoneAlt,
  FaShieldAlt,
} from "react-icons/fa";

import { toast } from "sonner";

const BACKEND_URL = `${import.meta.env.VITE_BACKEND_URL}/api/auth`;

export default function PhoneLogin() {
  /* =====================================================
     NAVIGATION
  ===================================================== */

  const recaptchaVerifierRef = useRef(null);
  const recaptchaWidgetIdRef = useRef(null);
  const otpRefs = useRef([]);

  /* =====================================================
     STATE
  ===================================================== */

  const [step, setStep] = useState("phone");

  const [phone, setPhone] = useState("+91 ");

  const [otp, setOtp] = useState(
    Array(6).fill("")
  );

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  const [errors, setErrors] = useState({});

  const [loading, setLoading] = useState(false);

  const [timer, setTimer] = useState(0);

  const [confirmationResult, setConfirmationResult] =
    useState(null);

  const [firebaseUser, setFirebaseUser] =
    useState(null);

  const [firebaseIdToken, setFirebaseIdToken] =
    useState(null);

  /* =====================================================
     TIMER
  ===================================================== */

  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  /* =====================================================
     RECAPTCHA CLEANUP
  ===================================================== */

  useEffect(() => {
    return () => {
      try {
        if (recaptchaVerifierRef.current) {
          recaptchaVerifierRef.current.clear();
        }
      } catch (error) {
        console.log(
          "Recaptcha cleanup:",
          error
        );
      }

      recaptchaVerifierRef.current = null;
      recaptchaWidgetIdRef.current = null;
    };
  }, []);

  /* =====================================================
     PHONE VALIDATION
  ===================================================== */

  const validatePhone = () => {
    const cleanedPhone = phone
      .replace(/\s/g, "")
      .trim();

    if (!cleanedPhone) {
      setErrors({
        phone: "Phone number is required",
      });

      return false;
    }

    if (!/^\+91[6-9]\d{9}$/.test(cleanedPhone)) {
      setErrors({
        phone:
          "Enter a valid Indian mobile number",
      });

      return false;
    }

    setErrors({});

    return true;
  };

  /* =====================================================
     SETUP RECAPTCHA
     
     IMPORTANT:
     - Create verifier only once.
     - Reuse it for resend.
     - Do NOT recreate it every time.
  ===================================================== */

  const setupRecaptcha = async () => {
    /* Already initialized */
    if (recaptchaVerifierRef.current) {
      return recaptchaVerifierRef.current;
    }

    const container =
      document.getElementById(
        "recaptcha-container"
      );

    if (!container) {
      throw new Error(
        "reCAPTCHA container not found."
      );
    }

    /*
     * Remove any old DOM rendering that may
     * have survived from a previous attempt.
     */
    container.innerHTML = "";

    const verifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "invisible",

        callback: () => {
          console.log(
            "reCAPTCHA verified"
          );
        },

        "expired-callback": () => {
          console.log(
            "reCAPTCHA expired"
          );

          toast.error(
            "reCAPTCHA expired. Please try again."
          );
        },

        "error-callback": () => {
          console.log(
            "reCAPTCHA error"
          );
        },
      }
    );

    recaptchaVerifierRef.current = verifier;

    try {
      const widgetId =
        await verifier.render();

      recaptchaWidgetIdRef.current =
        widgetId;

      console.log(
        "reCAPTCHA rendered:",
        widgetId
      );

      return verifier;
    } catch (error) {
      console.error(
        "reCAPTCHA render error:",
        error
      );

      try {
        verifier.clear();
      } catch {}

      recaptchaVerifierRef.current = null;
      recaptchaWidgetIdRef.current = null;

      throw error;
    }
  };

  /* =====================================================
     RESET RECAPTCHA
     
     Firebase recommends resetting/reusing the
     verifier instead of creating a new verifier.
  ===================================================== */

  const resetRecaptcha = () => {
    try {
      const widgetId =
        recaptchaWidgetIdRef.current;

      if (
        widgetId !== null &&
        widgetId !== undefined &&
        window.grecaptcha
      ) {
        window.grecaptcha.reset(
          widgetId
        );
      }
    } catch (error) {
      console.log(
        "reCAPTCHA reset error:",
        error
      );
    }
  };

  /* =====================================================
     DESTROY RECAPTCHA
     
     Used only when completely necessary.
  ===================================================== */

  const destroyRecaptcha = () => {
    try {
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
      }
    } catch (error) {
      console.log(
        "reCAPTCHA destroy error:",
        error
      );
    }

    recaptchaVerifierRef.current = null;
    recaptchaWidgetIdRef.current = null;

    const container =
      document.getElementById(
        "recaptcha-container"
      );

    if (container) {
      container.innerHTML = "";
    }
  };

  /* =====================================================
     SEND OTP
  ===================================================== */

  const sendOTP = async (e) => {
    e.preventDefault();

    if (!validatePhone()) return;

    setLoading(true);

    try {
      const cleanedPhone = phone
        .replace(/\s/g, "")
        .trim();

      console.log(
        "Sending OTP to:",
        cleanedPhone
      );

      /*
       * Create reCAPTCHA only once.
       */
      const appVerifier =
        await setupRecaptcha();

      /*
       * Firebase sends OTP.
       */
      const confirmation =
        await signInWithPhoneNumber(
          auth,
          cleanedPhone,
          appVerifier
        );

      console.log(
        "Firebase confirmation result:",
        confirmation
      );

      setConfirmationResult(
        confirmation
      );

      setTimer(30);

      setOtp(
        Array(6).fill("")
      );

      setStep("otp");

      toast.success(
        "OTP sent successfully 📱"
      );

      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 200);
    } catch (error) {
      console.error(
        "Firebase phone OTP error:",
        error
      );

      /*
       * Reset reCAPTCHA instead of
       * immediately creating another verifier.
       */
      resetRecaptcha();

      let message =
        "Unable to send OTP";

      switch (error?.code) {
        case "auth/invalid-phone-number":
          message =
            "Invalid phone number.";
          break;

        case "auth/too-many-requests":
          message =
            "Too many attempts. Please try again later.";
          break;

        case "auth/quota-exceeded":
          message =
            "SMS quota exceeded. Please try again later.";
          break;

        case "auth/operation-not-allowed":
          message =
            "Phone authentication is not enabled in Firebase.";
          break;

        case "auth/invalid-app-credential":
          message =
            "Firebase reCAPTCHA verification failed. Check your Firebase configuration and authorized domain.";
          break;

        case "auth/captcha-check-failed":
          message =
            "reCAPTCHA verification failed. Please try again.";
          break;

        default:
          message =
            error?.message ||
            "Unable to send OTP";
      }

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     VERIFY OTP
  ===================================================== */

  const verifyOTP = async (code) => {
    if (!confirmationResult) {
      toast.error(
        "OTP session expired. Please request a new OTP."
      );

      setStep("phone");

      return;
    }

    if (code.length !== 6) {
      toast.error(
        "Enter the complete 6-digit OTP"
      );

      return;
    }

    setLoading(true);

    try {
      /*
       * Firebase verifies OTP.
       */
      const result =
        await confirmationResult.confirm(
          code
        );

      const user = result.user;

      setFirebaseUser(user);

      console.log(
        "Firebase user:",
        user
      );

      /*
       * Get Firebase ID token.
       */
      const idToken =
        await user.getIdToken(true);

      setFirebaseIdToken(idToken);

      console.log(
        "Firebase ID token received"
      );

      /*
       * Send Firebase token to
       * Odikart backend.
       */
      const response =
        await fetch(
          `${BACKEND_URL}/firebase-phone-login`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${idToken}`,
            },

            body: JSON.stringify({
              app: "customer",
            }),
          }
        );

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "Invalid server response"
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to login"
        );
      }

      console.log(
        "Odikart auth response:",
        data
      );

      /* =================================================
         NEW USER
      ================================================= */

      if (data.isNewUser) {
        toast.success(
          "Phone verified! 🎉"
        );

        /*
         * Temporary Odikart JWT.
         */
        if (data.token) {
          localStorage.setItem(
            "tempToken",
            data.token
          );
        }

        /*
         * Save Firebase user information
         * temporarily if needed.
         */
        if (data.user) {
          localStorage.setItem(
            "tempPhoneUser",
            JSON.stringify(
              data.user
            )
          );
        }

        /*
         * Move to profile form.
         */
        setStep("details");

        return;
      }

      /* =================================================
         EXISTING USER
      ================================================= */

      if (data.token) {
        localStorage.setItem(
          "token",
          data.token
        );
      }

      if (data.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(
            data.user
          )
        );
      }

      /*
       * Remove any old temporary token.
       */
      localStorage.removeItem(
        "tempToken"
      );

      localStorage.removeItem(
        "tempPhoneUser"
      );

      toast.success(
        "Welcome back! 🎉"
      );

      window.location.href = "/";
    } catch (error) {
      console.error(
        "OTP verification error:",
        error
      );

      let message =
        "Invalid OTP";

      switch (error?.code) {
        case "auth/invalid-verification-code":
          message =
            "Incorrect OTP. Please try again.";
          break;

        case "auth/code-expired":
          message =
            "OTP expired. Please request a new OTP.";
          break;

        case "auth/session-expired":
          message =
            "OTP session expired. Please request a new OTP.";
          break;

        case "auth/invalid-verification-id":
          message =
            "OTP session is invalid. Please request a new OTP.";
          break;

        default:
          message =
            error?.message ||
            "Invalid OTP";
      }

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     OTP INPUT
  ===================================================== */

  const handleOtpChange = (
    value,
    index
  ) => {
    /*
     * Only numbers.
     */
    if (!/^\d?$/.test(value)) {
      return;
    }

    const updated = [...otp];

    updated[index] = value;

    setOtp(updated);

    /*
     * Clear OTP error.
     */
    setErrors((prev) => ({
      ...prev,
      otp: "",
    }));

    /*
     * Move to next input.
     */
    if (
      value &&
      index < 5
    ) {
      otpRefs.current[
        index + 1
      ]?.focus();
    }

    /*
     * Automatically verify
     * when all six digits exist.
     */
    if (
      updated.every(
        (digit) => digit !== ""
      )
    ) {
      verifyOTP(
        updated.join("")
      );
    }
  };

  /* =====================================================
     OTP KEYBOARD
  ===================================================== */

  const handleOtpKeyDown = (
    e,
    index
  ) => {
    if (
      e.key === "Backspace" &&
      !otp[index] &&
      index > 0
    ) {
      otpRefs.current[
        index - 1
      ]?.focus();
    }
  };

  /* =====================================================
     OTP PASTE
  ===================================================== */

  const handleOtpPaste = (
    e
  ) => {
    e.preventDefault();

    const pasted =
      e.clipboardData
        .getData("text")
        .replace(/\D/g, "")
        .slice(0, 6);

    if (!pasted) return;

    const updated =
      Array(6).fill("");

    pasted
      .split("")
      .forEach(
        (digit, index) => {
          updated[index] =
            digit;
        }
      );

    setOtp(updated);

    /*
     * Focus next empty field
     * or last field.
     */
    const nextIndex =
      Math.min(
        pasted.length,
        5
      );

    otpRefs.current[
      nextIndex
    ]?.focus();

    /*
     * Auto verify.
     */
    if (
      pasted.length === 6
    ) {
      verifyOTP(pasted);
    }
  };

  /* =====================================================
     RESEND OTP
  ===================================================== */

  const resendOTP = async () => {
    if (timer > 0 || loading) {
      return;
    }

    setLoading(true);

    /*
     * Clear old confirmation.
     */
    setConfirmationResult(null);

    setOtp(
      Array(6).fill("")
    );

    try {
      const cleanedPhone =
        phone
          .replace(/\s/g, "")
          .trim();

      /*
       * Reuse the same verifier.
       */
      const appVerifier =
        await setupRecaptcha();

      /*
       * Reset widget before
       * another Firebase request.
       */
      resetRecaptcha();

      const confirmation =
        await signInWithPhoneNumber(
          auth,
          cleanedPhone,
          appVerifier
        );

      setConfirmationResult(
        confirmation
      );

      setTimer(30);

      toast.success(
        "New OTP sent 📱"
      );

      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 200);
    } catch (error) {
      console.error(
        "Resend OTP error:",
        error
      );

      resetRecaptcha();

      let message =
        "Unable to resend OTP";

      switch (error?.code) {
        case "auth/too-many-requests":
          message =
            "Too many attempts. Please try again later.";
          break;

        case "auth/quota-exceeded":
          message =
            "SMS quota exceeded. Please try again later.";
          break;

        case "auth/invalid-app-credential":
          message =
            "Firebase reCAPTCHA verification failed.";
          break;

        default:
          message =
            error?.message ||
            "Unable to resend OTP";
      }

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     PROFILE FORM
  ===================================================== */

  const handleDetailsChange = (
    e
  ) => {
    const {
      name,
      value,
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  /* =====================================================
     COMPLETE PROFILE
  ===================================================== */

  const completeProfile =
    async (e) => {
      e.preventDefault();

      const newErrors = {};

      if (!form.firstName.trim()) {
        newErrors.firstName =
          "First name is required";
      }

      if (!form.lastName.trim()) {
        newErrors.lastName =
          "Last name is required";
      }

      /*
       * Email is optional.
       */
      if (
        form.email.trim() &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          form.email.trim()
        )
      ) {
        newErrors.email =
          "Enter a valid email address";
      }

      setErrors(newErrors);

      if (
        Object.keys(newErrors)
          .length > 0
      ) {
        return;
      }

      setLoading(true);

      try {
        const tempToken =
          localStorage.getItem(
            "tempToken"
          );

        if (!tempToken) {
          throw new Error(
            "Profile session expired. Please login again."
          );
        }

        const response =
          await fetch(
            `${BACKEND_URL}/complete-profile`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${tempToken}`,
              },

              body: JSON.stringify({
                firstName:
                  form.firstName.trim(),

                lastName:
                  form.lastName.trim(),

                /*
                 * Send undefined instead of null
                 * when no email was entered.
                 */
                ...(form.email.trim()
                  ? {
                      email:
                        form.email
                          .trim()
                          .toLowerCase(),
                    }
                  : {}),
              }),
            }
          );

        let data;

        try {
          data =
            await response.json();
        } catch {
          throw new Error(
            "Invalid server response"
          );
        }

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to complete profile"
          );
        }

        /*
         * Save FINAL Odikart JWT.
         */
        if (data.token) {
          localStorage.setItem(
            "token",
            data.token
          );
        }

        /*
         * Save user.
         */
        if (data.user) {
          localStorage.setItem(
            "user",
            JSON.stringify(
              data.user
            )
          );
        }

        /*
         * Remove temporary data.
         */
        localStorage.removeItem(
          "tempToken"
        );

        localStorage.removeItem(
          "tempPhoneUser"
        );

        toast.success(
          "Account created successfully 🎉"
        );

        window.location.href = "/";
      } catch (error) {
        console.error(
          "Complete profile error:",
          error
        );

        toast.error(
          error?.message ||
            "Unable to complete profile"
        );
      } finally {
        setLoading(false);
      }
    };

  /* =====================================================
     BACK TO PHONE
  ===================================================== */

  const backToPhone = () => {
    setStep("phone");

    setOtp(
      Array(6).fill("")
    );

    setErrors({});

    setConfirmationResult(
      null
    );

    setTimer(0);

    /*
     * Keep verifier alive.
     *
     * We do NOT destroy/recreate it
     * just because user changes number.
     */
    resetRecaptcha();
  };

  /* =====================================================
     UI
  ===================================================== */

  return (
    <AuthLayout title="Welcome Back">
      <style>{`
        .phone-root * {
          font-family:
            'Plus Jakarta Sans',
            sans-serif;
        }

        .phone-root {
          animation:
            phoneFade .4s ease;
        }

        @keyframes phoneFade {
          from {
            opacity: 0;
            transform: translateY(8px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .phone-icon {
          width: 58px;
          height: 58px;
          border-radius: 18px;

          display: flex;
          align-items: center;
          justify-content: center;

          margin: 0 auto 18px;

          color: white;

          background:
            linear-gradient(
              135deg,
              #4f46e5,
              #2563eb,
              #7c3aed
            );

          box-shadow:
            0 12px 30px
            rgba(79,70,229,.28);
        }

        .phone-title {
          font-size: 23px;
          font-weight: 700;
          color: #1e1b4b;
          text-align: center;
          margin-bottom: 6px;
        }

        .phone-desc {
          font-size: 13px;
          color: #6b7280;
          text-align: center;
          line-height: 1.6;
          margin-bottom: 22px;
        }

        .form-group {
          margin-bottom: 15px;
        }

        .form-label {
          display: block;
          font-size: 11px;
          font-weight: 700;
          color: #6b7280;
          letter-spacing: .05em;
          text-transform: uppercase;
          margin-bottom: 6px;
        }

        .phone-input {
          width: 100%;
          padding: 14px 15px;

          border-radius: 13px;

          border:
            1.5px solid
            rgba(99,102,241,.16);

          background: #f8faff;

          color: #1e1b4b;

          font-size: 15px;
          font-weight: 600;

          outline: none;

          transition:
            border-color .2s,
            box-shadow .2s,
            background .2s;
        }

        .phone-input:focus {
          background: white;

          border-color: #6366f1;

          box-shadow:
            0 0 0 3px
            rgba(99,102,241,.12);
        }

        .phone-input.error {
          border-color: #f43f5e;
        }

        .form-error {
          color: #f43f5e;
          font-size: 12px;
          font-weight: 600;
          margin-top: 5px;
        }

        .submit-btn {
          width: 100%;

          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;

          padding: 14px 0;

          border-radius: 13px;

          border: none;

          background:
            linear-gradient(
              135deg,
              #4f46e5,
              #2563eb
            );

          color: white;

          font-size: 14px;
          font-weight: 700;

          cursor: pointer;

          transition:
            transform .2s,
            box-shadow .2s;
        }

        .submit-btn:hover {
          transform: translateY(-2px);

          box-shadow:
            0 12px 30px
            rgba(79,70,229,.30);
        }

        .submit-btn:disabled {
          opacity: .6;
          cursor: not-allowed;
          transform: none;
        }

        .otp-inputs {
          display: flex;
          justify-content: center;
          gap: 7px;
          margin: 24px 0 18px;
        }

        .otp-input {
          width: 43px;
          height: 50px;

          text-align: center;

          border-radius: 12px;

          border:
            2px solid
            rgba(99,102,241,.16);

          background: #f8faff;

          color: #1e1b4b;

          font-size: 18px;
          font-weight: 700;

          outline: none;

          transition: .2s;
        }

        .otp-input:focus {
          background: white;

          border-color: #6366f1;

          box-shadow:
            0 0 0 3px
            rgba(99,102,241,.12);
        }

        .verified-box {
          display: flex;
          align-items: center;
          gap: 8px;

          padding: 11px 13px;

          margin-bottom: 15px;

          border-radius: 12px;

          background: #f0fdf4;

          border:
            1px solid
            #bbf7d0;

          color: #15803d;

          font-size: 12px;
          font-weight: 600;
        }

        .details-title {
          font-size: 23px;
          font-weight: 700;
          color: #1e1b4b;
          margin-bottom: 5px;
        }

        .details-desc {
          font-size: 13px;
          line-height: 1.6;
          color: #6b7280;
          margin-bottom: 20px;
        }

        .security-note {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;

          margin-top: 15px;

          font-size: 11px;
          color: #9ca3af;
        }

        .resend-row {
          text-align: center;

          font-size: 12px;

          color: #6b7280;

          margin-bottom: 14px;
        }

        .resend-btn {
          border: none;
          background: none;

          color: #6366f1;

          font-weight: 700;

          cursor: pointer;
        }

        .resend-btn:disabled {
          color: #9ca3af;
          cursor: not-allowed;
        }

        .back-btn {
          width: 100%;

          margin-top: 12px;

          padding: 11px;

          border: none;

          border-radius: 12px;

          background: #eef2ff;

          color: #4f46e5;

          font-size: 12px;
          font-weight: 700;

          cursor: pointer;
        }

        .back-btn:hover {
          background: #e0e7ff;
        }

        /*
         * Keep reCAPTCHA container present but
         * invisible to the normal UI.
         */
        #recaptcha-container {
          min-height: 0;
        }

        @media(max-width:400px) {
          .otp-input {
            width: 39px;
            height: 46px;
          }

          .otp-inputs {
            gap: 5px;
          }
        }
      `}</style>

      <div className="phone-root">

        {/* =================================================
            PHONE
        ================================================= */}

        {step === "phone" && (
          <form onSubmit={sendOTP}>

            <div className="phone-icon">
              <FaPhoneAlt size={20} />
            </div>

            <h2 className="phone-title">
              Continue with Phone
            </h2>

            <p className="phone-desc">
              Enter your mobile number and
              we'll send you a secure OTP.
            </p>

            <div className="form-group">

              <label className="form-label">
                Mobile Number
              </label>

              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  let value =
                    e.target.value;

                  /*
                   * Keep +91 prefix.
                   */
                  if (
                    !value.startsWith(
                      "+91"
                    )
                  ) {
                    value =
                      "+91 " +
                      value
                        .replace(
                          /^\+91\s?/,
                          ""
                        );
                  }

                  setPhone(value);

                  setErrors({});
                }}
                placeholder="+91 9876543210"
                className={`phone-input ${
                  errors.phone
                    ? "error"
                    : ""
                }`}
                autoComplete="tel"
              />

              {errors.phone && (
                <div className="form-error">
                  {errors.phone}
                </div>
              )}

            </div>

            <button
              type="submit"
              disabled={loading}
              className="submit-btn"
            >
              {loading
                ? "Sending OTP..."
                : (
                  <>
                    Send OTP

                    <FaArrowRight
                      size={12}
                    />
                  </>
                )}
            </button>

            <div className="security-note">
              <FaShieldAlt />

              Your phone number is securely verified
            </div>

          </form>
        )}

        {/* =================================================
            OTP
        ================================================= */}

        {step === "otp" && (
          <div>

            <div className="phone-icon">
              <FaShieldAlt size={21} />
            </div>

            <h2 className="phone-title">
              Verify Your Number
            </h2>

            <p className="phone-desc">
              Enter the 6-digit OTP sent to

              <br />

              <strong>
                {phone}
              </strong>
            </p>

            <div className="otp-inputs">

              {otp.map(
                (digit, index) => (
                  <input
                    key={index}

                    ref={(el) => {
                      otpRefs.current[
                        index
                      ] = el;
                    }}

                    className="otp-input"

                    type="text"

                    inputMode="numeric"

                    maxLength={1}

                    value={digit}

                    onChange={(e) =>
                      handleOtpChange(
                        e.target.value,
                        index
                      )
                    }

                    onKeyDown={(e) =>
                      handleOtpKeyDown(
                        e,
                        index
                      )
                    }

                    onPaste={
                      index === 0
                        ? handleOtpPaste
                        : undefined
                    }

                    autoComplete={
                      index === 0
                        ? "one-time-code"
                        : "off"
                    }
                  />
                )
              )}

            </div>

            <div className="resend-row">

              {timer > 0 ? (
                <>
                  Resend OTP in{" "}

                  <strong>
                    {timer}s
                  </strong>
                </>
              ) : (
                <button
                  type="button"
                  className="resend-btn"
                  onClick={
                    resendOTP
                  }
                  disabled={loading}
                >
                  Resend OTP
                </button>
              )}

            </div>

            <button
              type="button"
              className="back-btn"
              onClick={
                backToPhone
              }
              disabled={loading}
            >
              ← Change Number
            </button>

          </div>
        )}

        {/* =================================================
            PROFILE
        ================================================= */}

        {step === "details" && (
          <form
            onSubmit={
              completeProfile
            }
          >

            <div className="phone-icon">
              <FaCheckCircle size={21} />
            </div>

            <h2 className="details-title">
              Almost there! 🎉
            </h2>

            <p className="details-desc">
              Your phone number is verified.
              Tell us a little about yourself
              to finish creating your account.
            </p>

            <div className="verified-box">
              <FaCheckCircle size={13} />

              {phone} · Phone verified
            </div>

            {/* FIRST + LAST */}

            <div
              style={{
                display: "grid",

                gridTemplateColumns:
                  "1fr 1fr",

                gap: 10,
              }}
            >

              {/* FIRST NAME */}

              <div className="form-group">

                <label className="form-label">
                  First Name
                </label>

                <input
                  type="text"
                  name="firstName"
                  value={
                    form.firstName
                  }
                  onChange={
                    handleDetailsChange
                  }
                  placeholder="First name"
                  className={`phone-input ${
                    errors.firstName
                      ? "error"
                      : ""
                  }`}
                  autoComplete="given-name"
                />

                {errors.firstName && (
                  <div className="form-error">
                    {
                      errors.firstName
                    }
                  </div>
                )}

              </div>

              {/* LAST NAME */}

              <div className="form-group">

                <label className="form-label">
                  Last Name
                </label>

                <input
                  type="text"
                  name="lastName"
                  value={
                    form.lastName
                  }
                  onChange={
                    handleDetailsChange
                  }
                  placeholder="Last name"
                  className={`phone-input ${
                    errors.lastName
                      ? "error"
                      : ""
                  }`}
                  autoComplete="family-name"
                />

                {errors.lastName && (
                  <div className="form-error">
                    {
                      errors.lastName
                    }
                  </div>
                )}

              </div>

            </div>

            {/* EMAIL */}

            <div className="form-group">

              <label className="form-label">

                Email Address

                <span
                  style={{
                    marginLeft: 5,
                    color: "#9ca3af",
                    fontWeight: 500,
                    textTransform:
                      "none",
                  }}
                >
                  (optional)
                </span>

              </label>

              <input
                type="email"
                name="email"
                value={
                  form.email
                }
                onChange={
                  handleDetailsChange
                }
                placeholder="you@example.com"
                className={`phone-input ${
                  errors.email
                    ? "error"
                    : ""
                }`}
                autoComplete="email"
              />

              {errors.email && (
                <div className="form-error">
                  {errors.email}
                </div>
              )}

            </div>

            <button
              type="submit"
              disabled={loading}
              className="submit-btn"
            >
              {loading
                ? "Creating Account..."
                : (
                  <>
                    Continue

                    <FaArrowRight
                      size={12}
                    />
                  </>
                )}
            </button>

          </form>
        )}

        {/* =================================================
            FIREBASE RECAPTCHA
        ================================================= */}

        <div
          id="recaptcha-container"
        />

      </div>

    </AuthLayout>
  );
}