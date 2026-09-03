"use client";

import { useEffect } from "react";

export default function AdminPage() {
  useEffect(() => { window.location.href = "/admin/login"; }, []);
  return null;
}
