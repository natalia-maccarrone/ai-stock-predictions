import OpenAI from "openai";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    console.log(searchParams);
    const client = new OpenAI();

    const response = await client.responses.create({
      model: process.env.OPEN_AI_MODEL,
      input: "Input example",
    });

    console.log(response.output_text);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected exception";

    return new Response(message, { status: 500 });
  }
}
