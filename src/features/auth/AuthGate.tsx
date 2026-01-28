"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [allowed, setAllowed] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      router.replace("/login");
      return;
    }

    const run = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      if (!data.session) {
        router.replace("/login");
        return;
      }

      setAllowed(true);
    };

    run();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setAllowed(false);
        router.replace("/login");
        return;
      }

      setAllowed(true);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [router, pathname]);

  if (!allowed) return null;
  return <>{children}</>;
}

