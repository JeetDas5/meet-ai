"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

export const HomeView = () => {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.hello.queryOptions({ text: "Jeet" }));

  return (
    <div className="max-w-xl mx-auto m-10 p-4 flex flex-col gap-4">
      {data?.greeting}
    </div>
  );
};
