import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useResendConfirmationMutation } from "../api/authApi";
import { TitleMessageResponse } from "../types";
import { getErrorMessage } from "@utils";
import AuthLayout from "../components/AuthLayout/AuthLayout";
import { useAppSelector } from "@app/hooks";
import LoadingSpinner from "@shared/components/LoadingSpinner/LoadingSpinner";
import ErrorScreen from "@shared/pages/ErrorScreen";

const VerifyEmailPage = () => {
  const verifyEmailData = useAppSelector((state) => state.auth.verifyEmailData);
  const [response, setResponse] = useState<TitleMessageResponse | null>(verifyEmailData?.initialResponse || null);
  const [resendConfirmationEmail, { isLoading, isError, error }] = useResendConfirmationMutation();

  const email = verifyEmailData?.email;

  const handleResend = useCallback(async () => {
    if (!email) return;

    try {
      const res = await resendConfirmationEmail(email).unwrap();
      setResponse(res);
    } catch (err) {
      console.error("Resend confirmation error:", err);
    }
  }, [resendConfirmationEmail, email]);

  const renderContent = () => {
    if (!verifyEmailData) {
      return (
        <ErrorScreen
          title="Invalid Request"
          message="No email verification data found. Please try registering again."
          type="notfound"
          primaryAction={{ text: "Back to Login", to: "/login" }}
        />
      );
    }

    if (isError) {
      return (
        <ErrorScreen
          title="Email Verification Failed"
          message={getErrorMessage(error)}
          type="warning"
          primaryAction={{ text: "Back to Login", to: "/login" }}
          fullScreen={false}
        />
      );
    }

    if (!response) {
      return <div className="loading-message">Loading...</div>;
    }

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">{response.title}</h2>
          <p className="text-gray-600 mb-4">{response.message}</p>
          <p className="text-gray-500 text-sm">
            If you didn't receive the confirmation email, please check your spam folder.
          </p>
        </div>
        <div className="space-y-4">
          <button onClick={handleResend} disabled={isLoading} className="btn-primary w-full">
            {isLoading ? <LoadingSpinner className="h-5 w-5" /> : "Resend Confirmation Email"}
          </button>
          <Link to="/login" className="btn-outline w-full">
            Return to Login
          </Link>
        </div>
      </div>
    );
  };

  return <AuthLayout title={response?.title || "Verify Your Email"}>{renderContent()}</AuthLayout>;
};

export default VerifyEmailPage;
