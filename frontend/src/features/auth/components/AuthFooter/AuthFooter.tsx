import { Link } from "react-router-dom";
import "./style.css";

interface AuthFooterProps {
  text: string;
  linkText: string;
  linkTo: string;
}

const AuthFooter = ({ text, linkText, linkTo }: AuthFooterProps) => {
  return (
    <div className="auth-footer">
      <div className="auth-divider">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="auth-divider-text">
          <span className="bg-white text-gray-500 px-2">{text}</span>
        </div>
      </div>
      <Link to={linkTo} className="btn-outline w-full mt-6">
        {linkText}
      </Link>
    </div>
  );
};

export default AuthFooter;
