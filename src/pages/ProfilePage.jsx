import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaBell,
  FaCamera,
  FaCheck,
  FaChevronRight,
  FaHeart,
  FaLock,
  FaMapMarkerAlt,
  FaQuestionCircle,
  FaShieldAlt,
  FaSignOutAlt,
  FaTrash,
  FaUser,
  FaShoppingBag,
  FaCreditCard,
} from "react-icons/fa";

import {
  Modal,
  ModalContent,
  ModalBody,
  ModalFooter,
} from "@heroui/react";

import { toast } from "react-toastify";

// import "./ProfilePage.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function ProfilePage() {
  const token = localStorage.getItem("token");

  /* =====================================================
     STATE
  ===================================================== */

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [openProfile, setOpenProfile] = useState(false);
  const [openSecurity, setOpenSecurity] = useState(false);

  const [showLogoutConfirm, setShowLogoutConfirm] =
    useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] =
    useState(false);

  const [profileLoading, setProfileLoading] =
    useState(false);

  const [passwordLoading, setPasswordLoading] =
    useState(false);

  const [deleteLoading, setDeleteLoading] =
    useState(false);

  const [showProfileNavbar, setShowProfileNavbar] =
    useState(true);

  const lastScrollY = useRef(0);
  const navigate = useNavigate();
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  /* =====================================================
     FETCH USER
  ===================================================== */

  useEffect(() => {
    const fetchUser = async () => {
    if (!token) {
  navigate("/phone-login", { replace: true });
  return;
}
      try {
        const response = await fetch(
          `${BACKEND_URL}/api/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            "Unable to fetch profile"
          );
        }

        const data = await response.json();

        setUser(data.user || data);
      } catch (error) {
        console.error(error);

        toast.error(
          "Unable to load your profile."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token,navigate]);

  /* =====================================================
     NAVBAR SCROLL BEHAVIOR
  ===================================================== */

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (ticking) {
        return;
      }

      window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;

        if (currentScrollY <= 10) {
          setShowProfileNavbar(true);
        } else if (
          currentScrollY >
          lastScrollY.current + 5
        ) {
          setShowProfileNavbar(false);
        } else if (
          currentScrollY <
          lastScrollY.current - 5
        ) {
          setShowProfileNavbar(true);
        }

        lastScrollY.current = currentScrollY;

        ticking = false;
      });

      ticking = true;
    };

    window.addEventListener(
      "scroll",
      handleScroll,
      { passive: true }
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, []);

  /* =====================================================
     HELPERS
  ===================================================== */


  const memberSince = useMemo(() => {
    if (!user?.createdAt) {
      return "Member";
    }

    try {
      return new Date(
        user.createdAt
      ).toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Member";
    }
  }, [user]);

  const fullName = useMemo(() => {
    if (!user) {
      return "User";
    }

    const name = [
      user.firstName,
      user.lastName,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

    return (
      name ||
      user.name ||
      user.username ||
      "User"
    );
  }, [user]);

  const initials = useMemo(() => {
    const words = fullName
      .split(" ")
      .filter(Boolean);

    if (!words.length) {
      return "U";
    }

    return words
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  }, [fullName]);

  /* =====================================================
     PROFILE IMAGE
  ===================================================== */

  const handleProfileImage = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error(
        "Please select a valid image file."
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(
        "Image must be smaller than 5 MB."
      );
      return;
    }

    const previewUrl =
      URL.createObjectURL(file);

    setUser((previous) => ({
      ...previous,
      image: previewUrl,
      imageFile: file,
    }));
  };

  /* =====================================================
     UPDATE PROFILE
  ===================================================== */

  const updateProfile = async () => {
    if (!user) {
      return;
    }

    setProfileLoading(true);

    try {
      const formData = new FormData();

      formData.append(
        "firstName",
        user.firstName || ""
      );

      formData.append(
        "lastName",
        user.lastName || ""
      );

      formData.append(
        "phone",
        user.phone || ""
      );

      if (user.imageFile) {
        formData.append(
          "image",
          user.imageFile
        );
      }

      const response = await fetch(
        `${BACKEND_URL}/api/auth/update-profile`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to update profile."
        );
      }

      setUser(data.user || data);

      setOpenProfile(false);

      toast.success(
        "Profile updated successfully."
      );
    } catch (error) {
      console.error(error);

      toast.error(
        error.message ||
          "Unable to update profile."
      );
    } finally {
      setProfileLoading(false);
    }
  };

  /* =====================================================
     CHANGE PASSWORD
  ===================================================== */

  const changePassword = async () => {
    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = passwordData;

    if (!currentPassword) {
      toast.error(
        "Please enter your current password."
      );
      return;
    }

    if (!newPassword) {
      toast.error(
        "Please enter a new password."
      );
      return;
    }

    if (newPassword.length < 8) {
      toast.error(
        "New password must be at least 8 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(
        "Passwords do not match."
      );
      return;
    }

    setPasswordLoading(true);

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/auth/change-password`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to change password."
        );
      }

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setOpenSecurity(false);

      toast.success(
        "Password changed successfully."
      );
    } catch (error) {
      console.error(error);

      toast.error(
        error.message ||
          "Unable to change password."
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout = () => {
  localStorage.removeItem("token");

  navigate("/phone-login", { replace: true });
};
  /* =====================================================
     DELETE ACCOUNT
  ===================================================== */

  const deleteAccount = async () => {
    setDeleteLoading(true);

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/auth/delete-account`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to delete account."
        );
      }

      localStorage.removeItem("token");

      toast.success(
        "Your account has been deleted."
      );

      setTimeout(() => {
  navigate("/", { replace: true });
      }, 700);
    } catch (error) {
      console.error(error);

      toast.error(
        error.message ||
          "Unable to delete account."
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="od-profile-page">

        <div className="od-profile-loading">

          <div className="od-loading-topbar">
            <div className="od-loading-circle" />

            <div className="od-loading-bar short" />

            <div className="od-loading-circle" />
          </div>

          <div className="od-loading-profile">

            <div className="od-loading-avatar" />

            <div className="od-loading-info">
              <div className="od-loading-bar" />
              <div className="od-loading-bar small" />
              <div className="od-loading-bar tiny" />
            </div>

          </div>

          <div className="od-loading-card" />
          <div className="od-loading-card" />
          <div className="od-loading-card" />

        </div>

      </div>
    );
  }

  /* =====================================================
     EMPTY STATE
  ===================================================== */

  if (!user) {
    return (
      <div className="od-profile-page">

        <div className="od-profile-empty">

          <div className="od-empty-icon">
            <FaUser />
          </div>

          <h2>
            Profile unavailable
          </h2>

          <p>
            We couldn't load your account
            information.
          </p>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
          >
            Try again
          </button>

        </div>

      </div>
    );
  }

  /* =====================================================
     MAIN
  ===================================================== */

  return (
    <div className="od-profile-page">

      {/* ================================================
          PROFILE NAVBAR
      ================================================ */}

      <header
        className={`od-profile-appbar ${
          showProfileNavbar
            ? "od-profile-appbar-visible"
            : "od-profile-appbar-hidden"
        }`}
      >
        <div className="od-profile-appbar-inner">

          <button
            type="button"
            className="od-profile-back"
            onClick={() => navigate("/")}
            aria-label="Go back"
          >
            <FaArrowLeft />
          </button>

          <div className="od-profile-appbar-title">
            My Account
          </div>

          <button
            type="button"
            className="od-profile-header-avatar"
            onClick={() =>
              setOpenProfile(true)
            }
            aria-label="Edit profile"
          >
            {user.image ? (
              <img
                src={user.image}
                alt={fullName}
              />
            ) : (
              initials
            )}
          </button>

        </div>
      </header>


      {/* ================================================
          CONTENT
      ================================================ */}

      <main className="od-profile-content">

        {/* ==============================================
            PROFILE HERO
        ============================================== */}

    {/* ==============================================
    MODERN PROFILE HERO
================================================ */}

<section className="od-profile-hero">

  {/* Decorative background */}
  <div className="od-profile-hero-glow glow-one" />
  <div className="od-profile-hero-glow glow-two" />

  <div className="od-profile-hero-content">

    {/* Profile image */}
    <div className="od-profile-avatar-area">

      <div className="od-profile-avatar-ring">

        <div className="od-profile-avatar">

          {user.image ? (
            <img
              src={user.image}
              alt={fullName}
            />
          ) : (
            <span>{initials}</span>
          )}

        </div>

      </div>

      {/* Camera button */}
      <label
        className="od-profile-camera"
        htmlFor="profile-image"
        title="Change profile photo"
      >
        <FaCamera />

        <input
          id="profile-image"
          type="file"
          accept="image/*"
          onChange={handleProfileImage}
        />
      </label>

    </div>


    {/* Profile information */}
    <div className="od-profile-hero-info">

      <div className="od-profile-name-line">

        <h1>{fullName}</h1>

        {user.isVerified !== false && (
          <span className="od-verified-badge">
            <FaCheck />
            Verified
          </span>
        )}

      </div>


      <p className="od-profile-email">
        {user.email || "No email added"}
      </p>


      <div className="od-profile-meta">

        <span className="od-profile-meta-item">
          <span className="od-meta-icon">
            <FaUser />
          </span>

          Personal account
        </span>

        <span className="od-profile-meta-divider" />

        <span className="od-profile-meta-item">
          <span className="od-meta-dot" />
          Member since {memberSince}
        </span>

      </div>

    </div>


    {/* Edit profile */}
    <button
      type="button"
      className="od-profile-edit-btn"
      onClick={() => setOpenProfile(true)}
    >
      <span className="od-profile-edit-icon">
        <FaUser />
      </span>

      <span>Edit profile</span>

      <FaChevronRight />
    </button>

  </div>

</section>

        {/* ==============================================
            ACCOUNT
        ============================================== */}

        <section className="od-profile-section">

          <SectionHeading
            eyebrow="ACCOUNT"
            title="Your account"
          />

          <div className="od-profile-card">

            <ProfileRow
              variant="blue"
              icon={<FaUser />}
              title="Personal information"
              description="Name, phone number and profile"
              onClick={() =>
                navigate(
                  "/account/personal-information"
                )
              }
            />

            <ProfileRow
              variant="emerald"
              icon={<FaMapMarkerAlt />}
              title="My addresses"
              description="Manage your delivery addresses"
              onClick={() =>
                navigate(
                  "/account/addresses"
                )
              }
            />

            <ProfileRow
              variant="violet"
              icon={<FaShoppingBag />}
              title="My orders"
              description="View your orders and purchases"
              onClick={() =>
                navigate(
                  "/account/orders"
                )
              }
            />

            <ProfileRow
              variant="rose"
              icon={<FaHeart />}
              title="Wishlist"
              description="Products you've saved"
              onClick={() =>
                navigate(
                  "/account/wishlist"
                )
              }
            />

          </div>

        </section>


        {/* ==============================================
            PAYMENTS & SECURITY
        ============================================== */}

        <section className="od-profile-section">

          <SectionHeading
            eyebrow="PROTECTION"
            title="Payments & security"
          />

          <div className="od-profile-card">

            <ProfileRow
              variant="blue"
              icon={<FaLock />}
              title="Security & password"
              description="Password and account security"
              onClick={() =>
                setOpenSecurity(true)
              }
            />

            <ProfileRow
              variant="cyan"
              icon={<FaCreditCard />}
              title="Payment methods"
              description="Cards and saved payment options"
              onClick={() =>
                navigate(
                  "/account/payment-methods"
                )
              }
            />

            <ProfileRow
              variant="purple"
              icon={<FaShieldAlt />}
              title="Account protection"
              description="Privacy and security settings"
              onClick={() =>
                navigate(
                  "/account/security"
                )
              }
            />

          </div>

        </section>


        {/* ==============================================
            PREFERENCES & SUPPORT
        ============================================== */}

        <section className="od-profile-section">

          <SectionHeading
            eyebrow="MORE"
            title="Preferences & support"
          />

          <div className="od-profile-card">

            <ProfileRow
              variant="amber"
              icon={<FaBell />}
              title="Notifications"
              description="Manage your notification preferences"
              onClick={() =>
                navigate(
                  "/account/notifications"
                )
              }
            />

            <ProfileRow
              variant="purple"
              icon={<FaQuestionCircle />}
              title="Help & support"
              description="Get help with your account"
              onClick={() =>
                navigate(
                  "/account/help"
                )
              }
            />

          </div>

        </section>


        {/* ==============================================
            ACCOUNT ACTIONS
        ============================================== */}

        <section className="od-profile-section od-profile-actions-section">

          <div className="od-profile-card">

            <button
              type="button"
              className="od-profile-action-row logout"
              onClick={() =>
                setShowLogoutConfirm(true)
              }
            >

              <span className="od-profile-action-icon">
                <FaSignOutAlt />
              </span>

              <span className="od-profile-action-text">

                <strong>
                  Sign out
                </strong>

                <small>
                  Sign out of this account
                </small>

              </span>

              <span className="od-profile-row-chevron">
                <FaChevronRight />
              </span>

            </button>


            <button
              type="button"
              className="od-profile-action-row delete"
              onClick={() =>
                setShowDeleteConfirm(true)
              }
            >

              <span className="od-profile-action-icon">
                <FaTrash />
              </span>

              <span className="od-profile-action-text">

                <strong>
                  Delete account
                </strong>

                <small>
                  Permanently delete your account
                </small>

              </span>

              <span className="od-profile-row-chevron">
                <FaChevronRight />
              </span>

            </button>

          </div>

        </section>


        {/* ==============================================
            FOOTER
        ============================================== */}

        <footer className="od-profile-footer">

          <div className="od-footer-logo">
            O
          </div>

          <div className="od-footer-brand">

            <strong>
              Odikart
            </strong>

            <span>
              Your shopping, your way
            </span>

          </div>

        </footer>

      </main>


      {/* ================================================
          EDIT PROFILE MODAL
      ================================================ */}

      <Modal
        isOpen={openProfile}
        onOpenChange={setOpenProfile}
        placement="bottom"
        className="od-profile-modal"
      >
        <ModalContent>

          <ModalBody>

            <div className="od-modal-heading">

              <span className="od-section-eyebrow">
                PROFILE
              </span>

              <h2>
                Edit profile
              </h2>

              <p>
                Keep your account details
                up to date.
              </p>

            </div>


            <div className="od-profile-form">

              <div className="od-profile-form-avatar">

                <div className="od-profile-avatar small">

                  {user.image ? (
                    <img
                      src={user.image}
                      alt={fullName}
                    />
                  ) : (
                    <span>
                      {initials}
                    </span>
                  )}

                </div>

                <label
                  htmlFor="modal-profile-image"
                  className="od-change-photo"
                >
                  <FaCamera />
                  Change photo

                  <input
                    id="modal-profile-image"
                    type="file"
                    accept="image/*"
                    onChange={
                      handleProfileImage
                    }
                  />
                </label>

              </div>


              <div className="od-form-grid">

                <FormInput
                  label="First name"
                  type="text"
                  value={
                    user.firstName || ""
                  }
                  placeholder="First name"
                  onChange={(value) =>
                    setUser((previous) => ({
                      ...previous,
                      firstName: value,
                    }))
                  }
                />

                <FormInput
                  label="Last name"
                  type="text"
                  value={
                    user.lastName || ""
                  }
                  placeholder="Last name"
                  onChange={(value) =>
                    setUser((previous) => ({
                      ...previous,
                      lastName: value,
                    }))
                  }
                />

              </div>


              <FormInput
                label="Phone number"
                type="tel"
                value={
                  user.phone || ""
                }
                placeholder="Phone number"
                onChange={(value) =>
                  setUser((previous) => ({
                    ...previous,
                    phone: value,
                  }))
                }
              />


              <div className="od-input-group">

                <span>
                  Email
                </span>

                <input
                  type="email"
                  value={
                    user.email || ""
                  }
                  disabled
                />

                <small>
                  Email cannot be changed here.
                </small>

              </div>

            </div>

          </ModalBody>


          <ModalFooter>

            <button
              type="button"
              className="od-modal-secondary"
              onClick={() =>
                setOpenProfile(false)
              }
            >
              Cancel
            </button>

            <button
              type="button"
              className="od-modal-primary"
              onClick={updateProfile}
              disabled={profileLoading}
            >
              {profileLoading
                ? "Saving..."
                : "Save changes"}
            </button>

          </ModalFooter>

        </ModalContent>
      </Modal>


      {/* ================================================
          SECURITY MODAL
      ================================================ */}

      <Modal
        isOpen={openSecurity}
        onOpenChange={setOpenSecurity}
        placement="bottom"
        className="od-profile-modal"
      >
        <ModalContent>

          <ModalBody>

            <div className="od-modal-heading">

              <span className="od-section-eyebrow">
                SECURITY
              </span>

              <h2>
                Change password
              </h2>

              <p>
                Use a strong password that
                you don't use elsewhere.
              </p>

            </div>


            <div className="od-profile-form">

              <FormInput
                label="Current password"
                type="password"
                value={
                  passwordData.currentPassword
                }
                placeholder="Current password"
                onChange={(value) =>
                  setPasswordData(
                    (previous) => ({
                      ...previous,
                      currentPassword:
                        value,
                    })
                  )
                }
              />

              <FormInput
                label="New password"
                type="password"
                value={
                  passwordData.newPassword
                }
                placeholder="At least 8 characters"
                onChange={(value) =>
                  setPasswordData(
                    (previous) => ({
                      ...previous,
                      newPassword:
                        value,
                    })
                  )
                }
              />

              <FormInput
                label="Confirm new password"
                type="password"
                value={
                  passwordData.confirmPassword
                }
                placeholder="Repeat new password"
                onChange={(value) =>
                  setPasswordData(
                    (previous) => ({
                      ...previous,
                      confirmPassword:
                        value,
                    })
                  )
                }
              />

            </div>

          </ModalBody>


          <ModalFooter>

            <button
              type="button"
              className="od-modal-secondary"
              onClick={() =>
                setOpenSecurity(false)
              }
            >
              Cancel
            </button>

            <button
              type="button"
              className="od-modal-primary"
              onClick={changePassword}
              disabled={passwordLoading}
            >
              {passwordLoading
                ? "Updating..."
                : "Update password"}
            </button>

          </ModalFooter>

        </ModalContent>
      </Modal>


      {/* ================================================
          LOGOUT MODAL
      ================================================ */}

      <Modal
        isOpen={showLogoutConfirm}
        onOpenChange={setShowLogoutConfirm}
        placement="center"
      >
        <ModalContent>

          <ModalBody>

            <div className="od-confirm-modal">

              <div className="od-confirm-icon logout">
                <FaSignOutAlt />
              </div>

              <h2>
                Sign out?
              </h2>

              <p>
                You'll need to sign in again
                to access your account.
              </p>

            </div>

          </ModalBody>


          <ModalFooter>

            <button
              type="button"
              className="od-modal-secondary"
              onClick={() =>
                setShowLogoutConfirm(false)
              }
            >
              Cancel
            </button>

            <button
              type="button"
              className="od-modal-primary"
              onClick={handleLogout}
            >
              Sign out
            </button>

          </ModalFooter>

        </ModalContent>
      </Modal>


      {/* ================================================
          DELETE MODAL
      ================================================ */}

      <Modal
        isOpen={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        placement="center"
      >
        <ModalContent>

          <ModalBody>

            <div className="od-confirm-modal">

              <div className="od-confirm-icon delete">
                <FaTrash />
              </div>

              <h2>
                Delete account?
              </h2>

              <p>
                This action is permanent.
                Your account and associated
                data may no longer be recoverable.
              </p>

            </div>

          </ModalBody>


          <ModalFooter>

            <button
              type="button"
              className="od-modal-secondary"
              onClick={() =>
                setShowDeleteConfirm(false)
              }
              disabled={deleteLoading}
            >
              Cancel
            </button>

            <button
              type="button"
              className="od-modal-primary danger"
              onClick={deleteAccount}
              disabled={deleteLoading}
            >
              {deleteLoading
                ? "Deleting..."
                : "Delete account"}
            </button>

          </ModalFooter>

        </ModalContent>
      </Modal>

    </div>
  );
}


/* =====================================================
   SECTION HEADING
===================================================== */

function SectionHeading({
  eyebrow,
  title,
}) {
  return (
    <div className="od-profile-section-heading">

      <div>
        <span className="od-section-eyebrow">
          {eyebrow}
        </span>

        <h2>
          {title}
        </h2>
      </div>

    </div>
  );
}


/* =====================================================
   PROFILE ROW
===================================================== */

function ProfileRow({
  icon,
  title,
  description,
  onClick,
  variant = "blue",
}) {
  return (
    <button
      type="button"
      className={`od-profile-row od-profile-row-${variant}`}
      onClick={onClick}
    >

      <span className="od-profile-row-icon">
        {icon}
      </span>

      <span className="od-profile-row-content">

        <strong>
          {title}
        </strong>

        <small>
          {description}
        </small>

      </span>

      <span className="od-profile-row-chevron">
        <FaChevronRight />
      </span>

    </button>
  );
}


/* =====================================================
   FORM INPUT
===================================================== */

function FormInput({
  label,
  type,
  value,
  placeholder,
  onChange,
}) {
  return (
    <label className="od-input-group">

      <span>
        {label}
      </span>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
      />

    </label>
  );
}