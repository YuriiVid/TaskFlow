import { useState, useEffect, useRef } from "react";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  utcIso?: string;
  onChangeUtc: (newUtcIso: string) => void;
  onEnterSave?: (currentValue: string) => void;
  onEscapeCancel?: () => void;
  className?: string;
}

export function UtcDateTimeInput({ utcIso, onChangeUtc, onEnterSave, onEscapeCancel, className, ...props }: Props) {
  const [localValue, setLocalValue] = useState("");
  const [originalValue, setOriginalValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const skipBlurRef = useRef(false);

  const toLocalInput = (iso: string) => {
    const dt = new Date(iso);
    return new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };

  useEffect(() => {
    if (utcIso) {
      const localVal = toLocalInput(utcIso);
      setLocalValue(localVal);
      setOriginalValue(localVal);
    } else {
      setLocalValue("");
      setOriginalValue("");
    }
  }, [utcIso]);

  const handleBlur = () => {
    if (skipBlurRef.current) {
      skipBlurRef.current = false;
      return;
    }

    if (!localValue) {
      onChangeUtc("");
      return;
    }
    onChangeUtc(new Date(localValue).toISOString());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      skipBlurRef.current = true;
      const utcValue = localValue ? new Date(localValue).toISOString() : "";

      onChangeUtc(utcValue);

      inputRef.current?.blur();

      if (onEnterSave) {
        onEnterSave(utcValue);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      skipBlurRef.current = true;

      setLocalValue(originalValue);
      if (originalValue) {
        onChangeUtc(new Date(originalValue).toISOString());
      } else {
        onChangeUtc("");
      }

      inputRef.current?.blur();

      if (onEscapeCancel) {
        onEscapeCancel();
      }
    }
  };

  return (
    <input
      ref={inputRef}
      type="datetime-local"
      className={className}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      {...props}
    />
  );
}
