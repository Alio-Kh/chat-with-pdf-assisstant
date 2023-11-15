import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
});

export async function POST(request: Request) {
  const { threadID, query } = await request.json();

  console.log("threadID", threadID);
  console.log("question", query);

  if (!threadID) {
    return Response.json(
      { message: "No threadID in the request" },
      { status: 200 }
    );
  }

  if (!query) {
    return Response.json(
      { message: "No query in the request" },
      { status: 200 }
    );
  }

  if (!process.env["ASSISSTANT_ID"]) {
    return Response.json(
      { message: "No ASSISSTANT_ID in the environment" },
      { status: 500 }
    );
  }

  const message = await openai.beta.threads.messages.create(threadID, {
    role: "user",
    content: query,
  });

  console.log("message", message);

  let run = await openai.beta.threads.runs.create(threadID, {
    assistant_id: process.env.ASSISSTANT_ID,
    // tools: [{ type: "retrieval" }],
  });

  console.log("run", run);

  // Check the Run status
  while (run.status !== "completed") {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    run = await openai.beta.threads.runs.retrieve(threadID, run.id);
  }

  // Display the Assistant's Response
  const messages = await openai.beta.threads.messages.list(threadID);
  messages.data.forEach((message) => {
    console.log(message.content);
  });
  return Response.json(messages, { status: 200 });
}
