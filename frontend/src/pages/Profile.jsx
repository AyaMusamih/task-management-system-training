import { useState, useEffect, useRef } from "react";
import { Bell, Pencil, Camera } from "lucide-react";
import { getProfile, updateProfile } from "../services/profile.service";
import Input from "../components/shared/Input";
import Button from "../components/shared/Button";
import ChangePasswordSection from "../components/profile/ChangePasswordSection"
import { toastSuccess, toastError } from "../utils/toastHelpers";


const getInitials = (name = "") =>
    name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

const validate = ({ name, email }) => {
    const errors = {};

    if (!name || !name.trim()) {
        errors.name = "Name is required";
    } else if (name.trim().length < 2) {
        errors.name = "Name must be at least 2 characters";
    } else if (name.trim().length > 100) {
        errors.name = "Name must be at most 100 characters";
    }

    if (!email || !email.trim()) {
        errors.email = "Email is required";
    } else if (email.trim().length > 255) {
        errors.email = "Email must be at most 255 characters";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        errors.email = "Invalid email format";
    }

    return errors;
};

const Section = ({ children, className = "" }) => (
    <section className={`mx-6 rounded-xl border border-divider/30 bg-background p-6 flex flex-col gap-4 ${className}`}>
        {children}
    </section>
);

const SectionTitle = ({ children }) => (
    <h2 className="mx-6 mt-5 mb-2 text-profile-sections">{children}</h2>
);

const SkeletonLine = ({ width }) => (
    <div className={`h-4 ${width} skeleton rounded-md mt-1`} />
);

const ProfileField = ({ label, loading, skeletonWidth = "w-48", children }) => (
    <div className="flex flex-col gap-0.5">
        <p className="text-hint text-text-hint">{label}</p>
        {loading ? <SkeletonLine width={skeletonWidth} /> : children}
    </div>
);

const ProfileHeader = ({ profile, loading }) => {
    const [coverHover, setCoverHover] = useState(false);
    const [avatarHover, setAvatarHover] = useState(false);

    return (
        <div className="mx-6 mt-4 rounded-xl border border-divider/30 bg-background p-3 pb-7">

            {/* Cover */}
            <div
                className="relative mx-9 mt-[26px] rounded-xl overflow-hidden cursor-pointer"
                style={{ height: "144px" }}
                onMouseEnter={() => setCoverHover(true)}
                onMouseLeave={() => setCoverHover(false)}
            >
                {loading ? (
                    <div className="w-full h-full skeleton rounded-xl" />
                ) : (
                    <>
                        <div
                            className="w-full h-full"
                            style={{
                                borderRadius: "20px",
                                background: "linear-gradient(135deg, #9E97FF 0%, #5F5B99 100%)",
                            }}
                        />
                        {coverHover && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/40 transition-all duration-200">
                                <Camera className="w-5 h-5 text-white/80" />
                                <span className="text-hint text-white/80">Add a header image</span>
                            </div>
                        )}
                    </>
                )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between pl-4 sm:pl-[65px] pr-3 -mt-15 relative gap-3">
                <div className="flex flex-col sm:flex-row sm:items-end gap-3 items-center sm:items-end">

                    {loading ? (
                        <div className="w-[160px] h-[160px] rounded-full skeleton border-[3px] border-background shrink-0" />
                    ) : (
                        <div
                            className="relative shrink-0 cursor-pointer"
                            style={{ width: "160px", height: "160px" }}
                            onMouseEnter={() => setAvatarHover(true)}
                            onMouseLeave={() => setAvatarHover(false)}
                        >
                            <div className="absolute inset-0 rounded-full p-[4px] bg-black">
                                <div
                                    className="w-full h-full rounded-full"
                                    style={{ background: "linear-gradient(135deg, #85ADFF, #AC8AFF)", padding: "4px" }}
                                >
                                    <div
                                        className="w-full h-full rounded-full flex items-center justify-center overflow-hidden"
                                        style={{ background: "#0d1117" }}
                                    >
                                        <span
                                            className="text-[35px] text-white leading-none"
                                            style={{ fontFamily: "Manrope, sans-serif", fontWeight: 800 }}
                                        >
                                            {getInitials(profile?.name)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            {avatarHover && (
                                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center z-10">
                                    <Camera className="w-6 h-6 text-white" />
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex flex-col gap-1.5 pb-1 mb-2 min-w-0 items-center sm:items-start text-center sm:text-left">
                        {loading ? (
                            <>
                                <div className="h-4 w-36 skeleton rounded-md" />
                                <div className="h-3.5 w-20 skeleton rounded-full" />
                            </>
                        ) : (
                            <>
                                <p className="font-manrope font-extrabold text-[20px] sm:text-[30px] text-text-primary break-words">
                                    {profile?.name}
                                </p>
                                <span
                                    className="inline-flex items-center px-2 py-0.5 rounded-full uppercase tracking-wider w-fit"
                                    style={{
                                        background: profile?.role === "ADMIN" ? "#FFEDD5" : "#DBEAFE",
                                        color: profile?.role === "ADMIN" ? "#994100" : "#1D4ED8",
                                        border: `1px solid ${profile?.role === "ADMIN" ? "#994100" : "#1D4ED8"}`,
                                        fontFamily: "Manrope, sans-serif",
                                        fontWeight: 700,
                                        fontSize: "11px",
                                    }}
                                >
                                    {profile?.role} Role
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);

    // About section
    const [isEditAbout, setIsEditAbout] = useState(false);
    const [formAbout, setFormAbout] = useState({ name: "" });
    const [errorsAbout, setErrorsAbout] = useState({});
    const [savingAbout, setSavingAbout] = useState(false);
    const [submittedAbout, setSubmittedAbout] = useState(false);
    const nameRef = useRef(null);

    // Contact section
    const [isEditContact, setIsEditContact] = useState(false);
    const [formContact, setFormContact] = useState({ email: "" });
    const [errorsContact, setErrorsContact] = useState({});
    const [savingContact, setSavingContact] = useState(false);
    const [submittedContact, setSubmittedContact] = useState(false);
    const emailRef = useRef(null);

    const fetchProfile = async () => {
        setLoading(true);
        setFetchError(null);
        try {
            const data = await getProfile();
            setProfile(data);
        } catch {
            setFetchError("Failed to load profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProfile(); }, []);

    // Validate on change after submit
    useEffect(() => {
        if (submittedAbout) {
            const errs = validate({ name: formAbout.name, email: profile?.email || "" });
            setErrorsAbout({ name: errs.name });
        }
    }, [formAbout, submittedAbout]);

    useEffect(() => {
        if (submittedContact) {
            const errs = validate({ name: profile?.name || "", email: formContact.email });
            setErrorsContact({ email: errs.email });
        }
    }, [formContact, submittedContact]);

    // About handlers
    const handleEditAbout = () => {
        setFormAbout({ name: profile?.name || "" });
        setErrorsAbout({});
        setSubmittedAbout(false);
        setIsEditAbout(true);
    };

    const handleCancelAbout = () => {
        setIsEditAbout(false);
        setErrorsAbout({});
        setSubmittedAbout(false);
    };

    const handleChangeAbout = (e) => {
        setFormAbout((prev) => ({ ...prev, name: e.target.value }));
        if (submittedAbout) setErrorsAbout((prev) => ({ ...prev, name: undefined }));
    };

    const handleSaveAbout = async () => {
        setSubmittedAbout(true);
        const validationErrors = validate({ name: formAbout.name, email: profile?.email || "" });
        const nameError = validationErrors.name ? { name: validationErrors.name } : {};

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            if (validationErrors.name) {
                nameRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            } else if (validationErrors.email) {
                emailRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            }
            toastError("Please fix the errors below before saving", "Validation Error");
            return;
        }

        setSavingContact(true);
        try {
            const updated = await updateProfile({
                name: profile?.name,
                email: formContact.email.trim(),
            });

            const stored = JSON.parse(localStorage.getItem("user") || "{}");
            localStorage.setItem("user", JSON.stringify({ ...stored, email: updated.email }));

            setProfile(updated);
            setIsEditContact(false);
            setSubmittedContact(false);
            setErrorsContact({});

            toastSuccess("Profile Updated", "Your profile information has been saved.");
        } catch (err) {
            if (err?.type === "conflict" || err?.status === 409) {
                setErrors((prev) => ({ ...prev, email: "This email is already taken by another account" }));
                toastError(err, "Email Already In Use");
                return;
            }
            if (err?.type === "validation" && err?.fields) {
                setErrors(err.fields);
                toastError(err, "Validation Error");
                return;
            }
            toastError(err, "Couldn't Save Changes");
        } finally {
            setSavingContact(false);
        }
    };

    const memberSince = profile?.createdAt
        ? new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        }).format(new Date(profile.createdAt))
        : "—";

    return (
        <div className="flex flex-col h-full bg-card-left">

            <div className="flex items-start justify-between px-6 pt-6 pb-3 shrink-0">
                <div>
                    <h1
                        className="font-inter font-medium text-[24px] text-text-primary"
                        style={{ letterSpacing: "-0.45px" }}
                    >
                        My Profile
                    </h1>
                    <p className="font-inter font-normal text-[15px] text-text-primary">
                        Manage your personal information
                    </p>
                </div>
                <button className="relative w-9 h-9 flex items-center justify-center rounded-md bg-admin-btn/40 hover:bg-admin-btn/60 transition-colors cursor-pointer mt-1">
                    <Bell className="w-4 h-4 text-text-primary" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto pb-10">

                {fetchError ? (
                    <div className="mx-6 mt-8 flex flex-col items-center gap-3 text-center">
                        <p className="text-text-secondary">{fetchError}</p>
                        <Button
                            onClick={fetchProfile}
                            className="px-6 bg-accent-blue text-white rounded-lg hover:bg-blue-400 transition"
                        >
                            Retry
                        </Button>
                    </div>
                ) : (
                    <>
                        <p className="mx-6 mt-2 mb-3 text-profile-sections">
                            Profile photo and header image
                        </p>

                        <ProfileHeader
                            profile={profile}
                            loading={loading}
                        />

                        {/* About You */}
                        <SectionTitle>About You</SectionTitle>
                        <Section>
                            <div className="flex justify-between items-start">
                                <div className="flex flex-col gap-0.5">
                                    <p className="text-profile-sections">Full name</p>
                                    <p className="text-input text-text-primary">
                                        Update your display name
                                    </p>
                                </div>
                                {!isEditAbout && (
                                    <button
                                        onClick={handleEditAbout}
                                        className="w-8 h-8 flex items-center justify-center rounded-md bg-admin-btn/40 hover:bg-admin-btn/60 cursor-pointer"
                                    >
                                        <Pencil className="w-4 h-4 text-text-primary" />
                                    </button>
                                )}
                            </div>

                            {isEditAbout ? (
                                <>
                                    <Input
                                        ref={nameRef}
                                        label="Full name"
                                        type="text"
                                        value={formAbout.name}
                                        onChange={handleChangeAbout}
                                        placeholder="Enter your full name"
                                        error={errorsAbout.name}
                                        success={formAbout.name && !errorsAbout.name && submittedAbout}
                                        disabled={savingAbout}
                                    />
                                    <div className="flex flex-col gap-0.5">
                                        <p className="text-field-label text-text-secondary">Member since</p>
                                        <p className="text-profile-info">{memberSince}</p>
                                    </div>
                                    <div className="flex justify-end">
                                        <div className="flex items-center gap-2.5">
                                            <Button
                                                variant="ghost"
                                                onClick={handleCancelAbout}
                                                disabled={savingAbout}
                                                className="px-9 h-10 rounded-lg !bg-input-bg !text-text-primary !text-[14px] cursor-pointer !border-0 !w-auto"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                onClick={handleSaveAbout}
                                                loading={savingAbout}
                                                className="px-8 h-10 rounded-lg !bg-text-primary hover:!bg-text-primary/90 !text-[14px] cursor-pointer !text-background !w-auto whitespace-nowrap"
                                            >
                                                {savingAbout ? "Saving…" : "Update Name"}
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <ProfileField label="Full name*" loading={loading}>
                                        <p className="text-profile-info">{profile?.name}</p>
                                    </ProfileField>
                                    <ProfileField label="Member since" loading={loading} skeletonWidth="w-40">
                                        <p className="text-profile-info">{memberSince}</p>
                                    </ProfileField>
                                </>
                            )}
                        </Section>

                        {/* Contact */}
                        <SectionTitle>Contact</SectionTitle>
                        <Section>
                            <div className="flex justify-between items-start">
                                <div className="flex flex-col gap-0.5">
                                    <p className="text-profile-sections">Email address</p>
                                    <p className="text-input text-text-primary">
                                        Update your email address
                                    </p>
                                </div>
                                {!isEditContact && (
                                    <button
                                        onClick={handleEditContact}
                                        className="w-8 h-8 flex items-center justify-center rounded-md bg-admin-btn/40 hover:bg-admin-btn/60 cursor-pointer"
                                    >
                                        <Pencil className="w-4 h-4 text-text-primary" />
                                    </button>
                                )}
                            </div>

                            {isEditContact ? (
                                <>
                                    <div className="flex flex-col gap-0.5 mb-3">
                                        <p className="text-profile-sections">Current email</p>
                                        <p className="text-input text-text-primary">
                                            Your current email address is{" "}
                                            <span className="font-semibold text-text-primary">{profile?.email}</span>
                                        </p>
                                    </div>
                                    <Input
                                        ref={emailRef}
                                        label="New Email address"
                                        type="email"
                                        value={formContact.email}
                                        onChange={handleChangeContact}
                                        placeholder="Enter new email address"
                                        error={errorsContact.email}
                                        success={formContact.email && !errorsContact.email && submittedContact}
                                        disabled={savingContact}
                                    />
                                    <div className="flex justify-end">
                                        <div className="flex items-center gap-2.5">
                                            <Button
                                                variant="ghost"
                                                onClick={handleCancelContact}
                                                disabled={savingContact}
                                                className="px-6 h-10 rounded-lg !bg-input-bg !text-text-primary !text-[14px] cursor-pointer !border-0 !w-auto"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                onClick={handleSaveContact}
                                                loading={savingContact}
                                                className="px-9 h-10 rounded-lg !bg-text-primary hover:!bg-text-primary/90 !text-[14px] cursor-pointer !text-background !w-auto whitespace-nowrap"
                                            >
                                                {savingContact ? "Saving…" : "Update Email"}
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <ProfileField label="Email address*" loading={loading}>
                                    <p className="text-profile-info">{profile?.email}</p>
                                </ProfileField>
                            )}
                        </Section>

                        {/* Security / Change Password */}
                        <SectionTitle>Security</SectionTitle>
                        <ChangePasswordSection />
                    </>
                )}
            </div>
        </div>
    );
};

export default Profile;