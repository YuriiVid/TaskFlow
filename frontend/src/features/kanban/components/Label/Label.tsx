import React from "react";

interface LabelProps extends React.HTMLAttributes<HTMLDivElement> {
  color: string;
  children: React.ReactNode;
  className?: string;
}

export const Label: React.FC<LabelProps> = ({ color, children, className, ...props }) => {
  return (
    <div
      className={`font-[Segoe_UI_SemiBold]  ${className} `}
      style={{
        backgroundColor: `${color}`,
        color: `color-mix(in srgb, white 85%, ${color})`,
      }}
      {...props}
    >
      {children}
    </div>
  );
};
