"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export const HomeView = () => {
  const { data: session } = authClient.useSession();
  const router = useRouter();
  if (!session) {
    return (
      <div className="max-w-xl mx-auto m-10 p-4 flex flex-col gap-4">
        <p>You are not logged in.</p>
      </div>
    );
  }
  return (
    <div className="max-w-xl mx-auto m-10 p-4 flex flex-col gap-4">
      <p>Logged in as {session.user.name || session.user.email}</p>
      <Button
        onClick={() =>
          authClient.signOut({
            fetchOptions: { onSuccess: () => router.push("sign-in") },
          })
        }
      >
        Sign Out
      </Button>
    </div>
  );
};
