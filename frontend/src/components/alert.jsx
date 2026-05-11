import { useEffect } from "react";

export default function Alert({ status, title, description }) {
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("show-toast", {
        detail: { status, title, description },
      })
    );
  }, [status, title, description]);

  return null;
}
