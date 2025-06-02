import { useNavigate } from "react-router-dom";
import { ChangeEvent, SyntheticEvent, useCallback, useEffect, useState } from "react";
import { useRegisterMutation } from "../api/authApi";
import { TitleMessageResponse } from "../types";
import { getErrorMessage } from "@utils";
import { setVerifyEmailData } from "../authSlice";
import InputField from "../components/InputField/InputField";
import { Lock, Mail, User } from "lucide-react";
import AuthLayout from "../components/AuthLayout/AuthLayout";
import AuthFooter from "../components/AuthFooter/AuthFooter";
import { useAppDispatch } from "@app/hooks";
import LoadingSpinner from "@shared/components/LoadingSpinner/LoadingSpinner";

interface Credentials {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const RegisterPage = () => {
  const [isRegistered, setIsRegistered] = useState(false);
  const [response, setResponse] = useState<TitleMessageResponse | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<Credentials>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [register, { isLoading, isError, error }] = useRegisterMutation();
  const serverError = isError ? getErrorMessage(error) : null;

  const onInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
    setFormError(null);
  }, []);

  const handleSubmit = useCallback(
    async (e: SyntheticEvent) => {
      e.preventDefault();
      const { password, confirmPassword, firstName, lastName, email } = credentials;

      if (password !== confirmPassword) {
        setFormError("Passwords do not match");
        return;
      }

      try {
        const res = await register({ firstName, lastName, email, password }).unwrap();
        setResponse(res);
        setIsRegistered(true);
      } catch (err) {
        console.error("Registration failed:", err);
      }
    },
    [credentials, register]
  );

  useEffect(() => {
    if (isRegistered && response) {
      dispatch(setVerifyEmailData({ email: credentials.email, initialResponse: response }));
      navigate("/verify-email");
    }
  }, [isRegistered, response, credentials.email, navigate, dispatch]);

  const inputFields = [
    {
      id: "first-name",
      name: "firstName",
      label: "First Name",
      type: "text",
      icon: User,
      placeholder: "John",
      minLength: 3,
    },
    {
      id: "last-name",
      name: "lastName",
      label: "Last Name",
      type: "text",
      icon: User,
      placeholder: "Doe",
      minLength: 3,
    },
    {
      id: "email",
      name: "email",
      label: "Email",
      icon: Mail,
      type: "email",
      placeholder: "you@example.com",
    },
    {
      id: "password",
      name: "password",
      label: "Password",
      icon: Lock,
      type: "password",
      placeholder: "••••••••",
      pattern: "^(?=.*[0-9])(?=.*[!@#$%^&*]).{6,}$",
      title: "Password must be at least 6 characters, and include at least one number and one symbol",
    },
    {
      id: "confirmPassword",
      name: "confirmPassword",
      label: "Confirm Password",
      icon: Lock,
      type: "password",
      placeholder: "••••••••",
    },
  ];

  const renderContent = () => {
    return (
      <>
        <form data-testid="form" className="space-y-6" onSubmit={handleSubmit}>
          {inputFields.map(({ id, name, label, ...rest }) => (
            <InputField
              key={id}
              id={id}
              label={label}
              name={name}
              value={(credentials as any)[name]}
              onChange={onInputChange}
              required
              {...rest}
            />
          ))}

          {(formError || serverError) && <div className="error-message">{formError || serverError}</div>}

          <button className="btn-primary w-full" type="submit" disabled={isLoading}>
            {isLoading ? <LoadingSpinner className="h-5 w-5"/> : "Sign Up"}
          </button>
        </form>

        <AuthFooter text="Already have an account?" linkText="Sign in" linkTo="/login" />
      </>
    );
  };

  return <AuthLayout title="Create an account">{renderContent()}</AuthLayout>;
};

export default RegisterPage;
