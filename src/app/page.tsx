"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleNewSession = async () => {
    try {
      const response = await fetch("/api/chat/new", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log("data", data);
      router.push(`/chat/${data.threadID}`);
    } catch (error) {
      console.error(error);
      // make an alert²
      alert("An error occurred. Please try again."); // Generated code
      // ...
    }
  };

  return (
    <div className="flex items-center justify-center">
      <button onClick={handleNewSession}>Create new session</button>
    </div>
  );
}
