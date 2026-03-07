import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Input from "../../components/shared/Input";
import Button from "../../components/shared/Button";
import AuthLayout from "./AuthLayout";
import axiosInstance from "../../api/axiosInstance";
import GoogleIcon from "../../assets/images/GoogleIcon.png";
import { CircleAlert, CircleCheck, ShieldAlert, ShieldCheck } from 'lucide-react';

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const passwordRules = {
    length: form.password.length >= 8,
    uppercase: /[A-Z]/.test(form.password),
    lowercase: /[a-z]/.test(form.password),
    number: /\d/.test(form.password),
    special: /[^A-Za-z\d]/.test(form.password)
  };

  const passedRules = Object.values(passwordRules).filter(Boolean).length;

  let passwordStrength = "";

  if (passedRules === 5) passwordStrength = "strong";
  else if (passedRules >= 3) passwordStrength = "medium";
  else if (passedRules > 0) passwordStrength = "weak";

  const isFormEmpty = !form.name || !form.email || !form.password;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setSubmitted(false);
  };

  const validateForm = () => {
    const newErrors = {};
    if (form.name.length < 2) newErrors.name = "Name must be at least 2 characters";
    if (!/\S+@\S+\.\S{2,}/.test(form.email)) newErrors.email = "Invalid email format";
    if (form.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    if (!agree) newErrors.agree = "You must agree to the terms and policies";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      const res = await axiosInstance.post("/auth/register", form);

      const { accessToken, user } = res.data.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("user", JSON.stringify(user));

      setSuccess(true);

      setTimeout(() => {
        if (user?.role === "ADMIN") {
          navigate("/admin/dashboard", { state: { success: "Logged in successfully!" } });
        } else if (user?.role === "USER") {
          navigate("/user/dashboard", { state: { success: "Logged in successfully!" } });
        }
      }, 1500);

    } catch (err) {
      const data = err.response?.data;

      if (data?.errors) {
        const backendErrors = {};
        data.errors.forEach(err => {
          backendErrors[err.param] = err.msg;
        });
        setErrors(backendErrors);
      } else if (data?.error) {
        console.log(data?.error);
        setErrors({ general: data.error });

      } else {
        setErrors({ general: "Something went wrong" });
      }
    } finally {
      setLoading(false);
    }
  };

  const isButtonDisabled = isFormEmpty;

  return (
    <AuthLayout type="signup">
      <h1 className="text-heading text-text-primary mb-1">Create an account</h1>

      <p className="text-subtitle text-text-secondary mb-3">
        Already have an account?{" "}
        <Link to="/login" className="text-link font-medium underline">
          Login
        </Link>
      </p>

      {errors.general && (
        <div className="flex items-center gap-2 px-4 py-4 rounded-xl mb-3 text-error-text bg-[#ef444410] border border-[#ef444430] text-error-red">
          < CircleAlert className="error-icon" />{errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">

        <Input
          label="Full Name"
          name="name"
          placeholder="Enter your full name"
          value={form.name}
          onChange={handleChange}
          error={errors.name}
          disabled={loading}
          success={form.name && !errors.name && submitted}
          className="input-field"
        />

        <Input
          label="Email"
          type="email"
          name="email"
          placeholder="Enter your email"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
          disabled={loading}
          success={form.email && !errors.email && submitted}
          className="input-field"
        />

        <Input
          label="Password"
          type="password"
          name="password"
          placeholder="Enter your password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          disabled={loading}
          success={form.password && !errors.password && submitted}
          helperText={
            form.password ? (
              passwordStrength === "strong" ? (
                <span className="text-success-green flex items-center gap-1">
                  <CircleCheck className="password-strength-icon" />
                  Password strength: Strong
                </span>
              ) : passwordStrength === "medium" ? (
                <span className="text-yellow-500 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Password strength: Medium
                </span>
              ) : (
                <span className="text-error-red flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Password strength: Weak
                </span>
              )
            ) : (
              <span className="text-text-secondary flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Must contain 8+ characters, uppercase, lowercase, number and symbol
              </span>
            )
          }
          className="input-field"
        />

        <Input
          label={
            <span>
              By creating an account, I agree to our{" "}
              <a href="#" className="underline text-text-primary">Terms of use</a> and{" "}
              <a href="#" className="underline text-text-primary">Privacy Policy</a>
            </span>
          }
          type="checkbox"
          checked={agree}
          onChange={() => {
            const newAgree = !agree;
            setAgree(newAgree);
            const newErrors = {};
            if (newAgree) {
              if (!form.name.trim()) newErrors.name = "This field is required";
              if (!form.email.trim()) newErrors.email = "This field is required";
              if (!form.password.trim()) newErrors.password = "This field is required";
              if (Object.keys(newErrors).length > 0) {
                setErrors(newErrors);
              }
            }
            setErrors((prev) => ({ ...prev, agree: undefined }));
            setSubmitted(false);
          }
          }
          disabled={loading}
          error={errors.agree}
          success={agree && !errors.agree && submitted}
          className="checkbox"
        />

        <Button
          type="submit"
          size="lg"
          page="signup"
          className="primary-button w-full mt-3 text-btn-text"
          loading={loading}
          success={success}
          disabled={isButtonDisabled}
          error={errors && submitted}
        >
          {loading ? "Creating account…" : success ? "Account created!" : "Create an account"}
        </Button>

        {/* Divider */}
        <div className="flex items-center gap-5">
          <div className="flex-1 h-px bg-divider" />
          <span className="text-[20px] text-text-primary">Or</span>
          <div className="flex-1 h-px bg-divider" />
        </div>

        {/* Google Button */}
        <Button
          variant="secondary"
          type="button"
          className="google-button w-full flex items-center justify-center gap-3 text-google-btn bg-input-bg"
          disabled={loading}
          onClick={() => console.log("Google login")}
        >
          <img src={GoogleIcon} alt="Google" className="w-5 h-5" />
          Continue with Google
        </Button>

      </form>
    </AuthLayout>
  );
}