import { jsx as _jsx } from "react/jsx-runtime";
const Button = ({ variant = "blue", children, ...props }) => {
    const base = "rounded px-4 py-2 font-medium text-white transition-colors duration-200";
    const variants = {
        blue: "bg-blue-500 hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800",
        orange: "bg-orange-500 hover:bg-orange-600 dark:bg-orange-700 dark:hover:bg-orange-800",
    };
    return (_jsx("button", { className: `${base} ${variants[variant]}`, ...props, children: children }));
};
export default Button;
