import { Check } from "lucide-react";

interface CircularCheckboxProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

const CircularCheckbox: React.FC<CircularCheckboxProps> = ({ id, checked, onChange, label }) => {
  return (
    <label htmlFor={id} className="flex items-center gap-2 cursor-pointer select-none">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
      />

      <div
        className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center
                   peer-checked:bg-teal-600 peer-checked:border-teal-600 transition-colors"
      >
        {checked && <Check className="w-3 h-3 text-white pointer-events-none" strokeWidth={3} />}
      </div>

      {label && <span className="text-sm text-gray-900">{label}</span>}
    </label>
  );
};

export default CircularCheckbox;
