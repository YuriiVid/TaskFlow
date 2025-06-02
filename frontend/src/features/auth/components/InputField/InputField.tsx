import "./style.css";
const InputField = ({
  id,
  label,
  icon: Icon,
  ...props
}: {
  id: string;
  label: string;
  icon: React.ElementType;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type: string;
  pattern?: string;
  title?: string;
  placeholder?: string;
  required?: boolean;
}) => {
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      <div className="input-wrapper">
        <div className="input-icon-wrapper">
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
        <input id={id} {...props} className="input" />
      </div>
    </div>
  );
};

export default InputField;
