import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useConfirmEmailMutation } from "../api/authApi";
import { TitleMessageResponse } from "../types";
import { getErrorMessage } from "@utils";
import AuthLayout from "../components/AuthLayout/AuthLayout";
import "./styles.css";
import LoadingScreen from "@shared/pages/LoadingScreen";
import ErrorScreen from "@shared/pages/ErrorScreen";

const ConfirmEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [confirmEmail, { isLoading, isError, error }] = useConfirmEmailMutation();
  const [response, setResponse] = useState<TitleMessageResponse | null>(null);

  useEffect(() => {
    const confirm = async () => {
      if (!token || !email) {
        setResponse(null);
        return;
      }
      try {
        const res = await confirmEmail({ email, token }).unwrap();
        setResponse(res);
      } catch (err) {
        console.error("Confirm email error:", err);
      }
    };
    confirm();
  }, [confirmEmail, token, email]);

  const renderContent = () => {
    if (isLoading) {
      return <LoadingScreen />;
    }

    if (isError) {
      return (
        <ErrorScreen
          title="Email Confirmation Failed"
          message={getErrorMessage(error)}
          type="warning"
          primaryAction={{ text: "Back to Login", to: "/login" }}
		  fullScreen={false}
        />
      );
    }

    if (!token || !email) {
      return (
        <>
          <div className="error-message mb-6">
            <h2 className="text-xl font-semibold mb-2">Invalid Link</h2>
            <p>This confirmation link is invalid or has expired.</p>
          </div>
          <div className="flex space-x-4">
            <Link to="/" className="btn-primary">
              Return to Home
            </Link>
            <Link to="/login" className="btn-outline">
              Go to Login
            </Link>
          </div>
        </>
      );
    }

    if (response) {
      return (
        <>
          <h2 className="text-xl font-semibold mb-2">{response.title}</h2>
          <p className="mb-6">{response.message}</p>
          <Link to="/login" className="btn-primary">
            Go to Login
          </Link>
        </>
      );
    }
  };

  return <AuthLayout title={response?.title || "Email Confirmation"}>{renderContent()}</AuthLayout>;
};

export default ConfirmEmailPage;
