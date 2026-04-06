import { useState, useEffect } from "react";
import { Bell, Pencil, Camera, CircleCheckBig, XCircle } from "lucide-react";
import { getProfile, updateProfile } from "../services/profile.service";
import Input from "../components/shared/Input";
import Button from "../components/shared/Button";
import { showToast } from "../utils/showToast";


const getInitials = (name = "") =>
    name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

const validate = ({ name, email }) => {
    const errors = {};
    if (!name || !name.trim()) {
        errors.name = "Name cannot be empty";
    } else if (name.trim().length < 2) {
        errors.name = "Enter your full name";
    }
    if (!email || !email.trim()) {
        errors.email = "Email cannot be empty";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        errors.email = "Enter a valid email address";
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

const ProfileHeader = ({ profile, isEdit, loading, onEditClick }) => {
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

            <div className="flex items-end justify-between pl-[65px] pr-3 -mt-15 relative">
                <div className="flex items-end gap-3">

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

                    <div className="flex flex-col gap-1.5 pb-1 mb-2">
                        {loading ? (
                            <>
                                <div className="h-4 w-36 skeleton rounded-md" />
                                <div className="h-3.5 w-20 skeleton rounded-full" />
                            </>
                        ) : (
                            <>
                                <p className="font-manrope font-extrabold text-[30px] text-text-primary">
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

                {!isEdit && (
                    <button
                        onClick={onEditClick}
                        className="mb-11 mx-6 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-field-typed cursor-pointer transition-colors hover:brightness-90"
                        style={{ backgroundColor: "#DFE3E6", color: "#2C2F31" }}
                    >
                        <Pencil className="w-4 h-4" style={{ color: "#2C2F31" }} />
                        Edit Profile
                    </button>
                )}
            </div>
        </div>
    );
};

const SecuritySection = () => (
    <>
        <SectionTitle>Security</SectionTitle>
        <Section className="gap-3">
            <div className="flex flex-col gap-1">
                <p className="text-profile-sections">Change Password</p>
                <p className="text-input text-text-primary">
                    When you change your password, we keep you logged in to this device but may log you out from your other devices
                </p>
            </div>
            <Input label="Current Password" type="password" placeholder="Enter your current password" disabled />
            <Input label="New Password" type="password" placeholder="Enter new password" disabled />
            <Input label="Confirm Password" type="password" placeholder="Confirm new password" disabled helperText="Must match the new password" />
        </Section>
    </>
);

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);

    const [isEdit, setIsEdit] = useState(false);
    const [form, setForm] = useState({ name: "", email: "" });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [submitted, setSubmitted] = useState(false);

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

    useEffect(() => {
        if (submitted) setErrors(validate(form));
    }, [form, submitted]);

    const handleEditClick = () => {
        setForm({ name: profile?.name || "", email: profile?.email || "" });
        setErrors({});
        setSubmitted(false);
        setIsEdit(true);
    };

    const handleCancel = () => {
        setIsEdit(false);
        setErrors({});
        setSubmitted(false);
    };

    const handleChange = (field) => (e) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
        if (submitted) setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    const handleSave = async () => {
        setSubmitted(true);
        const validationErrors = validate(form);

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            showToast({
                title: "Validation Error",
                description: "Please fix the errors below before saving",
                icon: <XCircle className="w-4 h-4" />,
                type: "error",
            });
            return;
        }

        setSaving(true);
        try {
            const updated = await updateProfile({
                name: form.name.trim(),
                email: form.email.trim(),
            });

            const stored = JSON.parse(localStorage.getItem("user") || "{}");
            localStorage.setItem("user", JSON.stringify({ ...stored, name: updated.name, email: updated.email }));

            setProfile(updated);
            setIsEdit(false);
            setSubmitted(false);
            setErrors({});

            showToast({
                title: "Profile updated successfully",
                description: "Your profile information has been saved.",
                icon: <CircleCheckBig className="w-4 h-4" />,
                type: "success",
            });
        } catch (err) {
            if (err.status === 409) {
                setErrors((prev) => ({ ...prev, email: "This email is already taken by another account" }));
                showToast({
                    title: "Email already in use",
                    description: "Please use a different email address.",
                    icon: <XCircle className="w-4 h-4" />,
                    type: "error",
                });
                return;
            }

            if (err.data?.errors) {
                const mapped = {};
                err.data.errors.forEach((e) => { mapped[e.param] = e.msg; });
                setErrors(mapped);
                showToast({
                    title: "Couldn't save changes. Please try again.",
                    description: "Fix the highlighted fields and try saving again.",
                    icon: <XCircle className="w-4 h-4" />,
                    type: "error",
                });
                return;
            }

            showToast({
                title: "Couldn't save changes. Please try again.",
                description: err.message || "Something went wrong on our end.",
                icon: <XCircle className="w-4 h-4" />,
                type: "error",
            });
        } finally {
            setSaving(false);
        }
    };

    const localTime = new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZoneName: "shortOffset",
    }).format(new Date());

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
                            isEdit={isEdit}
                            loading={loading}
                            onEditClick={handleEditClick}
                        />

                        {/* About You */}
                        <SectionTitle>About You</SectionTitle>
                        <Section>
                            {isEdit ? (
                                <>
                                    <Input
                                        label="Full name"
                                        type="text"
                                        value={form.name}
                                        onChange={handleChange("name")}
                                        placeholder="Enter your full name"
                                        error={errors.name}
                                        success={form.name && !errors.name && submitted}
                                        disabled={saving}
                                    />
                                    <div className="flex flex-col gap-0.5">
                                        <p className="text-field-label text-text-secondary">Local time</p>
                                        <p className="text-profile-info">{localTime}</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <ProfileField label="Full name*" loading={loading}>
                                        <p className="text-profile-info">{profile?.name}</p>
                                    </ProfileField>
                                    <ProfileField label="Local time*" loading={loading} skeletonWidth="w-40">
                                        <p className="text-profile-info">{localTime}</p>
                                    </ProfileField>
                                </>
                            )}
                        </Section>

                        {/* Contact */}
                        <SectionTitle>Contact</SectionTitle>
                        <Section>
                            {isEdit ? (
                                <>
                                    <div className="flex flex-col gap-0.5 mb-3">
                                        <p className="text-profile-sections">Current email</p>
                                        <p className="text-input text-text-primary">
                                            Your current email address is{" "}
                                            <span className="font-semibold text-text-primary">{profile?.email}</span>
                                        </p>
                                    </div>
                                    <Input
                                        label="New Email address"
                                        type="email"
                                        value={form.email}
                                        onChange={handleChange("email")}
                                        placeholder="Enter new email address"
                                        error={errors.email}
                                        success={form.email && !errors.email && submitted}
                                        disabled={saving}
                                    />
                                </>
                            ) : (
                                <ProfileField label="Email address*" loading={loading}>
                                    <p className="text-profile-info">{profile?.email}</p>
                                </ProfileField>
                            )}
                        </Section>

                        {/* Security */}
                        <SecuritySection />

                        {/* Save / Cancel */}
                        {isEdit && (
                            <div className="mx-6 mt-4 flex items-center justify-end gap-3">
                                <div className="mx-6 mt-4 flex items-center justify-end gap-2.5">
                                    <Button
                                        variant="ghost"
                                        onClick={handleCancel}
                                        disabled={saving}
                                        className="px-6 h-10 rounded-lg !bg-background !text-text-primary !text-[14px] cursor-pointer !border-0 !w-auto"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleSave}
                                        loading={saving}
                                        className="px-6 h-10 rounded-lg !bg-text-primary hover:!bg-text-primary/90 !text-[14px] cursor-pointer !text-background !w-auto whitespace-nowrap"
                                    >
                                        {saving ? "Saving…" : "Save changes"}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Profile;