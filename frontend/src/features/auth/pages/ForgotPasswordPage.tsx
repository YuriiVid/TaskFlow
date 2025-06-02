import { SyntheticEvent, useCallback, useState } from "react";
import { useRequestPasswordResetMutation } from "../api/authApi";
import { TitleMessageResponse } from "../types";
import { getErrorMessage } from "@utils";
import { Link } from "react-router-dom";
import InputField from "../components/InputField/InputField";
import AuthLayout from "../components/AuthLayout/AuthLayout";
import { Mail } from "lucide-react";
import LoadingSpinner from "@shared/components/LoadingSpinner/LoadingSpinner";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [sendReset, { isLoading, isError, error }] = useRequestPasswordResetMutation();
  const [response, setResponse] = useState<TitleMessageResponse | null>(null);

  const handleSubmit = useCallback(
    async (e: SyntheticEvent) => {
      e.preventDefault();
      try {
        const res = await sendReset(email).unwrap();
        setResponse(res);
      } catch (err) {
        console.error("Reset password request failed:", err);
      }
    },
    [email, sendReset]
  );

  const renderContent = () => {
    if (response) {
      return (
        <>
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold mb-2">{response.title}</h2>
            <p className="text-gray-600 mb-4">{response.message}</p>
            <p className="text-gray-500 text-sm">
              If you didn't receive the reset email, please check your spam folder.
            </p>
          </div>
          <div className="space-y-4">
            <button onClick={handleSubmit} disabled={isLoading} className="btn-primary w-full">
              {isLoading ? <LoadingSpinner className="h-5 w-5"/> : "Resend reset email"}
            </button>
            <Link to="/login" className="btn-outline w-full">
              Return to Login
            </Link>
          </div>
        </>
      );
    }

    return (
      <>
        <form onSubmit={handleSubmit} className="space-y-6">
          {isError && <div className="error-message">{getErrorMessage(error)}</div>}
          <InputField
            id="email"
            label="Email address"
            icon={Mail}
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />

          <button className="btn-primary w-full" type="submit" disabled={isLoading}>
            {isLoading ? <LoadingSpinner className="h-5 w-5"/> : "Send Reset Link"}
          </button>
        </form>
        <Link to="/login" className="btn-outline w-full mt-6">
          Return to Login
        </Link>
      </>
    );
  };

  return <AuthLayout title={response?.title || "Forgot Password"}>{renderContent()}</AuthLayout>;
};

export default ForgotPasswordPage;
