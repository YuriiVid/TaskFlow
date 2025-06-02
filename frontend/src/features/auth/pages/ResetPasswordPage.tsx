import { useState, useCallback, FormEvent, ChangeEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { useResetPasswordMutation } from "../api/authApi";
import { TitleMessageResponse } from "../types";
import { getErrorMessage } from "@utils";
import { Lock } from "lucide-react";
import InputField from "../components/InputField/InputField";
import AuthLayout from "../components/AuthLayout/AuthLayout";
import LoadingSpinner from "@shared/components/LoadingSpinner/LoadingSpinner";
import LoadingScreen from "@shared/pages/LoadingScreen";
import ErrorScreen from "@shared/pages/ErrorScreen";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [response, setResponse] = useState<TitleMessageResponse | null>(null);

  const [resetPassword, { isLoading, isError, error }] = useResetPasswordMutation();

  const onInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "newPassword") setNewPassword(value);
    if (name === "confirmNewPassword") setConfirmNewPassword(value);
    setFormError(null);
  }, []);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setFormError("Passwords do not match");
      return;
    }
    try {
      const res = await resetPassword({ email, token, newPassword }).unwrap();
      setResponse(res);
    } catch (err) {
      console.error("Reset password error:", err);
    }
  };

  const renderContent = () => {
    if (!token || !email) {
      return (
        <ErrorScreen
          title="Password Reset Failed"
          message="Invalid password reset link. Please request a new password reset."
          type="warning"
          primaryAction={{ text: "Back to Login", to: "/login" }}
          fullScreen={false}
        />
      );
    }

    if (response) {
      return <p>{response.message}</p>;
    }

    if (isLoading) {
      return <LoadingScreen />;
    }

    return (
      <form data-testid="form" className="space-y-6" onSubmit={onSubmit}>
        <InputField
          id="newPassword"
          type="password"
          name="newPassword"
          icon={Lock}
          label="Enter new password"
          value={newPassword}
          onChange={onInputChange}
          placeholder="••••••••"
          required
          pattern="^(?=.*[0-9])(?=.*[!@#$%^&*]).{6,}$"
          title="Password must be at least 6 characters, and include at least one number and one symbol"
        />
        <InputField
          id="confirmNewPassword"
          type="password"
          name="confirmNewPassword"
          icon={Lock}
          label="Confirm new password"
          value={confirmNewPassword}
          onChange={onInputChange}
          placeholder="••••••••"
          required
        />

        {(formError || isError) && <div className="error-message">{formError || getErrorMessage(error)}</div>}

        <button className="btn-primary w-full" type="submit" disabled={isLoading}>
          {isLoading ? <LoadingSpinner className="h-5 w-5" /> : "Reset Password"}
        </button>
      </form>
    );
  };

  return <AuthLayout title={response?.title || "Reset Your Password"}>{renderContent()}</AuthLayout>;
};

export default ResetPassword;
