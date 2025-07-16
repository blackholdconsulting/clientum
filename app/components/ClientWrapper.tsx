"use client";

import { ReactNode } from "react";

// Todo lo que necesite hooks, estado o efectos va aquí dentro
export default function ClientWrapper({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}
