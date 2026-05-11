import { useEffect, useState } from "react";
import api from "../services/api.js";

export default function Counting() {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let mounted = true;

    api
      .get("/api/doctors")
      .then(({ data }) => {
        if (mounted) setTotal(data?.data?.length || 0);
      })
      .catch((error) => {
        console.error("Error fetching counting doctors:", error);
        if (mounted) setTotal(0);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return <p className="h2 fw-bold text-dark mb-0">{total}</p>;
}
