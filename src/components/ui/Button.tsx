import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "blue" | "orange";
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ variant = "blue", children, ...props }) => {
  const base =
    "w-full max-w-xs lg:w-40 mx-auto block rounded-lg px-4 py-2 font-semibold text-white hover:text-white transition duration-200 disabled:text-white/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400";

  const variants = {
    blue: "bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700",
    orange: "bg-orange-500 hover:bg-orange-600 dark:bg-orange-700 dark:hover:bg-orange-800",
  };

  return (
    <button className={`${base} ${variants[variant]}`} {...props}>
      {children}
    </button>
  );
};

export default Button;