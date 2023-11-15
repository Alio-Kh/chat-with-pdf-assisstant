import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
});

export async function POST(request: Request) {
  const data = await request.json();

  console.log("threadID data", data);

  const { threadID } = data;

  if (!threadID) {
    return Response.json(
      { message: "No threadID in the request" },
      { status: 200 }
    );
  }

  // Display the Assistant's Response
  const messages = await openai.beta.threads.messages.list(threadID);

  return Response.json(messages, { status: 200 });
}
