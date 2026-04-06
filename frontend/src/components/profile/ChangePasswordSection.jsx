import { useState } from "react";
import Input from "../shared/Input";
import Button from "../shared/Button";
import { changePassword } from "../../services/profile.service";
import { CircleCheckBig, CircleCheck, ShieldAlert, ShieldCheck, XCircle } from "lucide-react";
import { showToast } from "../../utils/showToast";
import { Pencil } from "lucide-react";

const ChangePasswordSection = () => {
    const [form, setForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const passwordRules = {
        length: form.newPassword.length >= 8,
        uppercase: /[A-Z]/.test(form.newPassword),
        lowercase: /[a-z]/.test(form.newPassword),
        number: /\d/.test(form.newPassword),
        special: /[^A-Za-z\d]/.test(form.newPassword),
    };

    const passedRules = Object.values(passwordRules).filter(Boolean).length;

    let passwordStrength = "";
    if (passedRules === 5) passwordStrength = "strong";
    else if (passedRules >= 3) passwordStrength = "medium";
    else if (passedRules > 0) passwordStrength = "weak";

    const handleChange = (field) => (e) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
        setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    const validate = () => {
        const newErrors = {};
        if (!form.currentPassword) newErrors.currentPassword = "Current password is required";
        if (!form.newPassword) newErrors.newPassword = "New password is required";
        else if (passedRules < 5)
            newErrors.newPassword = "Password must contain uppercase, lowercase, number, and symbol";

        if (!form.confirmPassword) newErrors.confirmPassword = "Please confirm your new password";
        else if (form.newPassword !== form.confirmPassword)
            newErrors.confirmPassword = "Passwords do not match";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
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

        setLoading(true);
        try {
            await changePassword({
                currentPassword: form.currentPassword,
                newPassword: form.newPassword,
                confirmPassword: form.confirmPassword,
            });

            showToast({
                title: "Password changed successfully",
                description: "Your new password has been saved.",
                icon: <CircleCheckBig className="w-4 h-4" />,
                type: "success",
            });

            setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
            setSubmitted(false);
            setIsEditing(false)
            setErrors({});
        } catch (err) {
            if (err.type === "validation") {
                setErrors(err.errors);
                showToast({
                    title: "Validation Error",
                    description: "Please check your inputs",
                    icon: <XCircle className="w-4 h-4" />,
                    type: "error",
                });
            } else if (err.type === "currentPassword") {
                setErrors((prev) => ({ ...prev, currentPassword: err.message }));
                showToast({
                    title: "Incorrect Password",
                    description: err.message,
                    icon: <XCircle className="w-4 h-4" />,
                    type: "error",
                });
            } else {
                showToast({
                    title: "Failed to change password",
                    description: err.message || "Something went wrong",
                    icon: <XCircle className="w-4 h-4" />,
                    type: "error",
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setForm({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        });
        setErrors({});
    };

    return (
        <section className="mx-6 rounded-xl border border-divider/30 bg-background p-6 flex flex-col">
            <div className="flex justify-between">
                <div className="flex flex-col gap-0.5 mb-6">
                    <p className="text-profile-sections">Change Password</p>
                    <p className="text-input text-text-primary">
                        When you change your password, we keep you logged in to this device but may log you out from your other devices
                    </p>
                </div>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="w-8 h-8 flex items-center justify-center rounded-md bg-admin-btn/40 hover:bg-admin-btn/60 cursor-pointer"
                    >
                        <Pencil className="w-4 h-4 text-text-primary" />
                    </button>
                )}
            </div>
            <Input
                label="Current Password"
                type="password"
                placeholder="Enter current password"
                value={form.currentPassword}
                onChange={handleChange("currentPassword")}
                error={errors.currentPassword}
                disabled={loading || !isEditing}
            />

            <Input
                label="New Password"
                type="password"
                placeholder="Enter new password"
                value={form.newPassword}
                onChange={handleChange("newPassword")}
                error={errors.newPassword}
                disabled={loading || !isEditing}
                helperText={
                    form.newPassword ? (
                        passwordStrength === "strong" ? (
                            <span className="text-success-green flex  items-start  gap-1">
                                <CircleCheck className="password-strength-icon" />
                                Password strength: Strong
                            </span>
                        ) : passwordStrength === "medium" ? (
                            <span className="text-yellow-500 flex  items-start  gap-1">
                                <ShieldAlert className="w-4 h-4" />
                                Password strength: Medium
                            </span>
                        ) : (
                            <span className="text-error-red flex items-start gap-1">
                                <ShieldAlert className="w-4 h-4" />
                                Password strength: Weak
                            </span>
                        )
                    ) : (
                        <span className="text-text-secondary flex items-start gap-1">
                            <ShieldCheck className="w-4 h-4" />
                            Must contain 8+ characters, uppercase, lowercase, number and symbol
                        </span>
                    )
                }
            />

            <Input
                label="Confirm Password"
                type="password"
                placeholder="Confirm new password"
                value={form.confirmPassword}
                onChange={handleChange("confirmPassword")}
                error={errors.confirmPassword}
                disabled={loading || !isEditing}
                helperText={
                    form.confirmPassword ? (
                        form.confirmPassword === form.newPassword ? (
                            <span className="text-success-green flex items-start gap-1">
                                <CircleCheck className="password-strength-icon" />
                                Passwords match
                            </span>
                        ) : (
                            <span className="text-error-red flex items-start gap-1">
                                <ShieldAlert className="w-4 h-4" />
                                Passwords do not match
                            </span>
                        )
                    ) : (
                        <span className="text-text-secondary flex items-start gap-1">
                            <ShieldCheck className="w-4 h-4" />
                            Must match the new password
                        </span>
                    )
                }
            />
            <div className="flex items-center justify-end gap-3">
                <div className=" flex items-center justify-end gap-3">
                    {isEditing && (
                        <Button
                            variant="ghost"
                            onClick={handleCancel}
                            disabled={loading || !isEditing}
                            className="px-6 h-10 rounded-lg !bg-input-bg !text-text-primary !text-[14px] cursor-pointer !border-0 !w-auto"
                        >
                            Cancel
                        </Button>
                    )}
                    {isEditing && (
                        <Button
                            onClick={handleSubmit}
                            loading={loading}
                            disabled={loading || !isEditing}
                            className="px-6 h-10 rounded-lg !bg-text-primary hover:!bg-text-primary/90 !text-[15px] cursor-pointer !text-background !w-auto whitespace-nowrap"
                        >
                            {loading ? "Updating..." : "Update Password"}
                        </Button>
                    )}
                </div>
            </div>

        </section>
    );
};

export default ChangePasswordSection;