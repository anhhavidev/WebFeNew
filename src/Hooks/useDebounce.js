// hooks/useDebounce.js
import { useEffect } from "react";

export default function useDebounce(callback, delay, deps) {
  useEffect(() => {
    const handler = setTimeout(() => {
      callback();
    }, delay);

    return () => clearTimeout(handler);
  }, [...(deps || [])]);
}
