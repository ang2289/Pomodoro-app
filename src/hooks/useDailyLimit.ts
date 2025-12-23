// src/hooks/useDailyLimit.ts
import { useState, useEffect } from "react";

const STORAGE_KEY = "rxv-daily-usage";

export function useDailyLimit(feature: string, limit: number) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    const today = new Date().toDateString();

    if (!data[today]) {
      data[today] = {};
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    setCount(data[today][feature] || 0);
  }, [feature]);

  const addOne = () => {
    const today = new Date().toDateString();
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");

    if (!data[today]) data[today] = {};
    if (!data[today][feature]) data[today][feature] = 0;

    data[today][feature] += 1;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setCount(data[today][feature]);
  };

  return { count, addOne, limit, isExceeded: count >= limit };
}

















