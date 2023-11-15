import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
});

export async function POST(request: Request) {
  // We create the Thread
  const thread = await openai.beta.threads.create();

  console.log("thread", thread.id);

  //  Add a Message to a Thread
  const message = await openai.beta.threads.messages.create(thread.id, {
    role: "user",
    content: "Say hello!",
    file_ids: [
      "file-ctpYvAV4eVixbfV0cECwwARa",
      "file-FJkGPCqfjoGjFPqqHzFYzeV9",
    ],
  });

  console.log("message", message);

  console.log("process.env.ASSISSTANT_ID", process.env["ASSISSTANT_ID"]);
  //  Run the Assistant
  if (!process.env["ASSISSTANT_ID"]) {
    return Response.json(
      { message: "No ASSISSTANT_ID in the environment" },
      {
        status: 500,
      }
    );
  }

  let run = await openai.beta.threads.runs.create(thread.id, {
    assistant_id: process.env.ASSISSTANT_ID,
    // tools: [{ type: "retrieval" }],
  });

  console.log("run", run);

  // Check the Run status
  while (run.status !== "completed") {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    run = await openai.beta.threads.runs.retrieve(thread.id, run.id);
  }

  // Display the Assistant's Response
  const messages = await openai.beta.threads.messages.list(thread.id);
  messages.data.forEach((message) => {
    console.log(message.content);
  });
  // console.log("messages", thread.id);

  return Response.json({ messages, threadID: thread.id }, { status: 200 });
}
