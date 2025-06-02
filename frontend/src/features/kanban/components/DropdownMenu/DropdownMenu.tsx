import React, { useRef, useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal } from "lucide-react";

interface MenuItem {
  label: string;
  onClick: (e: React.MouseEvent) => void;
  icon?: React.ReactNode;
  variant?: "danger" | "default";
}

interface DropdownMenuProps {
  items: MenuItem[];
  position?: "left" | "right";
  size?: "sm" | "md";
  trigger?: React.ReactNode;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ items, size = "sm", position = "right", trigger }) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLDivElement | HTMLButtonElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  // Close when clicking outside
  const menuRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    const target = e.target as Node;
    if (!buttonRef.current?.contains(target) && !menuRef.current?.contains(target)) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, handleClickOutside]);

  // Toggle & measure
  const toggle = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top + window.scrollY,
        left: position === "right" ? rect.right + window.scrollX : rect.left - 192,
      });
    }
    setIsOpen((o) => !o);
  };

  // The menu itself, portaled
  const menu = isOpen && (
    <div
      ref={menuRef}
      role="menu"
      style={{
        position: "absolute",
        top: coords.top,
        left: coords.left,
      }}
      className={`w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 ${
        position === "right" ? "origin-top-left" : "origin-top-right"
      }`}
    >
      {items.map((item, i) => (
        <button
          key={i}
          type="button"
          role="menuitem"
          onClick={(e) => {
            item.onClick(e);
            setIsOpen(false);
          }}
          className={
            `w-full px-4 py-2 text-left flex items-center gap-2 text-sm transition-colors ` +
            (item.variant === "danger" ? "text-red-600 hover:bg-red-50" : "text-gray-700 hover:bg-gray-100")
          }
        >
          {item.icon && <span className="w-4 h-4 flex">{item.icon}</span>}
          {item.label}
        </button>
      ))}
    </div>
  );

  return (
    <>
      {trigger ? (
        <div ref={buttonRef as React.RefObject<HTMLDivElement>} onClick={toggle} className="cursor-pointer">
          {trigger}
        </div>
      ) : (
        <button
          ref={buttonRef as React.RefObject<HTMLButtonElement>}
          type="button"
          onClick={toggle}
          aria-haspopup="menu"
          aria-expanded={isOpen}
          className={`rounded-md flex items-center justify-center hover:bg-gray-200 ${size === "sm" ? "p-1" : "p-2"}`}
        >
          <MoreHorizontal color="#6a7282" size={size === "sm" ? 16 : 20} />
        </button>
      )}

      {createPortal(menu, document.getElementById("dropdown-root")!)}
    </>
  );
};
