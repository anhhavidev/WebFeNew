// Hook debounce - trì hoãn gọi callback sau khoảng thời gian delay
import { useEffect } from "react";

export default function useDebounce(callback, delay, deps) {
  useEffect(() => {
    const handler = setTimeout(() => {
      callback();
    }, delay);

    return () => clearTimeout(handler);
  }, [...(deps || [])]);
}
