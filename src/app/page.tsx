"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export default function Home() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const { data: session } = authClient.useSession();

  const onSubmit = async () => {
    await authClient.signUp.email(
      {
        name,
        email,
        password,
      },
      {
        onError: (error) => {
          console.error("Error creating user:", error);
        },
        onSuccess: (data) => {
          console.log("User created successfully:", data);
        },
      }
    );
  };
  const onLogin = async () => {
    await authClient.signIn.email(
      {
        email,
        password,
      },
      {
        onError: (error) => {
          console.error("Error creating user:", error);
        },
        onSuccess: (data) => {
          console.log("User created successfully:", data);
        },
      }
    );
  };

  if (session) {
    console.log("session user", session.user)
    return (
      <div className="max-w-xl mx-auto m-10 p-4 flex flex-col gap-4">
        <p>Logged in as {session.user.name || session.user.email}</p>
        <Button onClick={() => authClient.signOut()}>Sign Out</Button>
      </div>
    );
  }

  return (
    <div className="w-full p-4 flex flex-col gap-y-10">
      <div className="max-w-2xl mx-auto m-10 p-4 flex flex-col gap-4">
        <Input
          placeholder="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          placeholder="password"
          value={password}
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button variant="outline" onClick={onSubmit} className="cursor-pointer">
          Create User
        </Button>
      </div>
      <div className="max-w-2xl mx-auto m-10 p-4 flex flex-col gap-4">
        <Input
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          placeholder="password"
          value={password}
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button variant="outline" onClick={onLogin} className="cursor-pointer">
          Login
        </Button>
      </div>
    </div>
  );
}
