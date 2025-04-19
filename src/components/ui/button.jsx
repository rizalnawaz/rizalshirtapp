// src/components/ui/button.jsx
import React from "react";

const Button = ({ children, onClick, className, variant }) => {
  const variantStyles = {
    outline: "border border-gray-600 text-gray-600 hover:bg-gray-200",
    secondary: "bg-gray-800 text-white hover:bg-gray-600",
    default: "bg-blue-500 text-white hover:bg-blue-400",
  };

  return (
    <button
      onClick={onClick}
      className={`py-2 px-4 rounded ${variantStyles[variant] || variantStyles.default} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
// JavaScript source code
