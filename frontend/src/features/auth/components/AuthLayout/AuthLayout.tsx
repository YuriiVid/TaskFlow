import { Layout } from "lucide-react";
import { Link } from "react-router-dom";
import "./style.css";

interface AuthLayoutProps {
  title: string;
  children: React.ReactNode;
}

const AuthLayout = ({ title, children }: AuthLayoutProps) => {
  return (
    <div className="auth-page">
      <div className="auth-header">
        <Link to="/" className="auth-logo">
          <Layout className="h-12 w-12 text-teal-500" />
          <span className="ml-2 text-2xl font-bold text-gray-900">TaskFlow</span>
        </Link>
        <h2 className="auth-title">{title}</h2>
      </div>
      <div className="auth-form-container">
        <div className="auth-card">{children}</div>
      </div>
    </div>
  );
};

export default AuthLayout;
