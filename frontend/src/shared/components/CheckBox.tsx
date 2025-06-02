import React from "react";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  id: string;
  /** Pass `false` to skip default styles */
  useDefaultStyles?: boolean;
}

const Checkbox: React.FC<CheckboxProps> = ({ label, id, className = "", useDefaultStyles = true, ...props }) => {
  const baseClass = "h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded";
  const combinedClass = useDefaultStyles ? `${baseClass} ${className}` : className;

  return (
    <div className="flex items-center">
      <input id={id} name={id} type="checkbox" className={combinedClass} {...props} />
      {label && (
        <label htmlFor={id} className="ml-2 text-sm text-gray-900">
          {label}
        </label>
      )}
    </div>
  );
};

export default Checkbox;
