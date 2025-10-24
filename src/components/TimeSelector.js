import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
export default function TimeSelector({ value, onChange }) {
    const [hour, setHour] = React.useState(value.split(':')[0]);
    const [minute, setMinute] = React.useState(value.split(':')[1]);
    React.useEffect(() => {
        onChange(`${hour}:${minute}`);
    }, [hour, minute]);
    return (_jsxs("div", { className: "flex gap-2 items-center", children: [_jsx("select", { className: "border rounded px-2 py-2 text-sm", value: hour, onChange: (e) => setHour(e.target.value), children: Array.from({ length: 24 }, (_, i) => (_jsx("option", { value: i.toString().padStart(2, '0'), children: i.toString().padStart(2, '0') }, i))) }), ":", _jsx("select", { className: "border rounded px-2 py-2 text-sm", value: minute, onChange: (e) => setMinute(e.target.value), children: ['00', '15', '30', '45'].map((min) => (_jsx("option", { value: min, children: min }, min))) })] }));
}
