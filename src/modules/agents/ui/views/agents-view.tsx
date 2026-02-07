"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";

export const AgentsView = () => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.agents.getMany.queryOptions());

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Agents</h1>
      <div className="space-y-4">
        {data && data.length > 0 ? (
          data.map((agent: any) => (
            <div
              key={agent.id}
              className="border rounded-lg p-4 bg-card text-card-foreground"
            >
              <h2 className="font-semibold text-lg">{agent.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {agent.instructions}
              </p>
              <div className="text-xs text-muted-foreground mt-2">
                User ID: {agent.userId}
              </div>
              <div className="text-xs text-muted-foreground">
                Created:{" "}
                {new Date(agent.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                })}
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground">No agents found</p>
        )}
      </div>
    </div>
  );
};

export const AgentsViewLoading = () => {
  return (
    <LoadingState
      title="Loading agents"
      description="This may take a few seconds"
    />
  );
};

export const AgentsViewError = () => {
  return (
    <ErrorState
      title="Error loading agents"
      description="Something went wrong"
    />
  );
};
