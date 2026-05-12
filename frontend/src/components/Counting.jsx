import React from "react";

export default function Counting({ count = 0, loading = false }) {
  if (loading) return <p className="h2 fw-bold text-dark mb-0">...</p>;
  return <p className="h2 fw-bold text-dark mb-0">{count}</p>;
}

