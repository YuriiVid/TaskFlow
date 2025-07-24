import { useState, ChangeEvent, SyntheticEvent, useCallback } from "react";
import { useLoginMutation } from "../api/authApi";
import { Link, useNavigate } from "react-router-dom";
import { getErrorMessage } from "@utils";
import { Mail, Lock } from "lucide-react";
import Checkbox from "@shared/components/CheckBox";
import InputField from "../components/InputField/InputField";
import AuthLayout from "../components/AuthLayout/AuthLayout";
import AuthFooter from "../components/AuthFooter/AuthFooter";
import "./styles.css";
import LoadingSpinner from "@shared/components/LoadingSpinner/LoadingSpinner";

const LoginPage = () => {
  const [credentials, setCredentials] = useState({
    userName: "",
    password: "",
  });
  const { userName, password } = credentials;

  const [login, { isLoading, isError, error }] = useLoginMutation();
  const navigate = useNavigate();

  const onInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (e: SyntheticEvent) => {
      e.preventDefault();
      try {
        await login(credentials).unwrap();
        navigate("/boards");
      } catch (err) {
        console.error("Login failed:", err);
      }
    },
    [login, credentials, navigate]
  );

  const renderContent = () => {
    return (
      <>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <InputField
            id="email"
            type="email"
            name="userName"
            icon={Mail}
            label="Email address"
            value={userName}
            onChange={onInputChange}
            placeholder="you@example.com"
            required
          />
          <InputField
            id="password"
            type="password"
            name="password"
            icon={Lock}
            label="Password"
            value={password}
            onChange={onInputChange}
            placeholder="••••••••"
            required
          />
          {isError && <div className="error-message">{getErrorMessage(error)}</div>}
          <div className="flex items-center justify-between">
            <Checkbox label="Remember me" id="remember_me" />
            <Link to="/forgot-password" className="auth-link">
              Forgot your password?
            </Link>
          </div>
          <button className="btn-primary w-full" type="submit" disabled={isLoading}>
            {isLoading ? <LoadingSpinner className="h-5 w-5"/> : "Sign In"}
          </button>
        </form>

        <AuthFooter text="Don't have an account?" linkText="Sign up" linkTo="/register" />
      </>
    );
  };

  return <AuthLayout title="Sign in to your account">{renderContent()}</AuthLayout>;
};

export default LoginPage;
