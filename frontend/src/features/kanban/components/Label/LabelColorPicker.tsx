import React from "react";
import { LABEL_COLORS } from "../../constants/colors";

interface LabelColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
}

export const LabelColorPicker: React.FC<LabelColorPickerProps> = ({ selectedColor, onColorChange }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">Select a color</label>
      <div className="flex justify-center mb-4">
        <div className="grid grid-cols-5 gap-2">
          {LABEL_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => onColorChange(color)}
              className={`w-12 h-8 rounded border-2 transition-all hover:scale-105 ${
                selectedColor === color ? "border-gray-800 ring-2 ring-gray-300" : "border-gray-300"
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
