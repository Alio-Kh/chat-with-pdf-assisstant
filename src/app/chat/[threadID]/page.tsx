"use client";

import { useRef, useState } from "react";
import { Document } from "langchain/document";
import { Message } from "@/types/message.type";
import { BotForm } from "@/components/bot-form";
import { ChatMessages } from "@/components/chat-messages";
import { useEffect } from "react";

export default function Chat({ params }: { params: { threadID: string } }) {
  const [query, setQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [call, setCall] = useState<number>(0);

  useEffect(() => {
    fetch("/api/chat/all", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        threadID: params.threadID,
      }),
    }).then((response) => {
      response.json().then((data) => {
        // invers the order
        let messages = data.data.map((d: any) => {
          if (d.role === "assistant") {
            return {
              type: "botMessage",
              message: d.content[0].text.value,
            };
          } else if (d.role === "user") {
            return {
              type: "userMessage",
              message: d.content[0].text.value,
            };
          }
        });

        messages = messages.reverse();

        setMessageState((state) => ({
          ...state,
          messages: messages,
        }));
      });
    });
  }, []);

  const [messageState, setMessageState] = useState<{
    messages: Message[];
    pending?: string;
    history: [string, string][];
    pendingSourceDocs?: Document[];
  }>({
    messages: [],
    history: [],
  });

  const { messages, history } = messageState;

  const messageListRef = useRef<HTMLDivElement>(null);

  //handle form submission
  async function handleSubmit(e: any) {
    e.preventDefault();

    setError(null);

    if (!query) {
      alert("Please input a question");
      return;
    }

    const question = query.trim();

    setMessageState((state) => ({
      ...state,
      messages: [
        ...state.messages,
        {
          type: "userMessage",
          message: question,
        },
      ],
    }));

    setLoading(true);
    setQuery("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: question,
          threadID: params.threadID,
        }),
      });
      const data = await response.json();
      console.log("data", data);

      if (data.error) {
      	setError(data.error);
      } else {
      	setMessageState((state) => ({
      		...state,
      		messages: [
      			...state.messages,
      			{
      				type: "botMessage",
      				message: data.data[0].content[0].text.value,
      				// sourceDocs: data.sourceDocuments,
      			},
      		],
      		history: [...state.history, [question, data.text]],
      	}));
      }
      console.log("messageState", messageState);

      setLoading(false);

      //scroll to bottom
      messageListRef.current?.scrollTo(0, messageListRef.current.scrollHeight);
    } catch (error) {
      setLoading(false);
      setError("An error occurred while fetching the data. Please try again.");
      console.log("error", error);
    }
  }

  //prevent empty submissions
  const handleEnter = (e: any) => {
    if (e.key === "Enter" && query) {
      handleSubmit(e);
    } else if (e.key == "Enter") {
      e.preventDefault();
    }
  };

  return (
    <>
      <div className="h-full w-10/12 mx-auto flex flex-col gap-4">
        <h1 className="mt-4 text-2xl font-bold leading-[1.1] tracking-tighter text-center">
          Chat With Your Docs <a>New session</a>
        </h1>
        <main className="h-full flex flex-col justify-between items-center p-1">
          <ChatMessages
            messageListRef={messageListRef}
            messages={messages}
            loading={loading}
          />
          <BotForm
            handleSubmit={handleSubmit}
            handleEnter={handleEnter}
            onChange={(value) => setQuery(value)}
            query={query}
            loading={loading}
          />
          {error && (
            <div className="border border-red-400 rounded-md p-4">
              <p className="text-red-500">{error}</p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
