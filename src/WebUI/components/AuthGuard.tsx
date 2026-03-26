"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getSession } from "@/lib/auth";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace(`/login?next=${encodeURIComponent(pathname ?? "/home")}`);
    }
  }, [router, pathname]);

  return <>{children}</>;
}

