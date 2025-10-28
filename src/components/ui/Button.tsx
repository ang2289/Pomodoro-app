import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "blue" | "orange";
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ variant = "blue", children, ...props }) => {
  const base =
    "w-full max-w-xs lg:w-40 mx-auto block rounded px-4 py-2 font-medium text-white transition-colors duration-200";

  const variants = {
    blue: "bg-blue-500 hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800",
    orange: "bg-orange-500 hover:bg-orange-600 dark:bg-orange-700 dark:hover:bg-orange-800",
  };

  return (
    <button className={`${base} ${variants[variant]}`} {...props}>
      {children}
    </button>
  );
};

export default Button;