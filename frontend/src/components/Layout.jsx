import { useEffect } from "react";
import ToastListener from "./toastListener.jsx";

export default function Layout({ title, children }) {
  useEffect(() => {
    document.title = title || "Klinik Sehat";
  }, [title]);

  return (
    <>
      <ToastListener />
      {children}
    </>
  );
}
