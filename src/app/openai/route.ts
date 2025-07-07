import OpenAI from "openai";

export async function POST(request: Request) {
  try {
    const stockData = await request.json();

    const client = new OpenAI();

    const aiResponse = await client.responses.create({
      model: process.env.OPENAI_MODEL,
      instructions:
        "You are a trading guru. Given data on share prices over the past 10 days, write a report of no more than 150 words describing the stocks performance and recommending whether to buy, hold or sell.",
      input: JSON.stringify(stockData),
    });

    return new Response(
      JSON.stringify({
        analysis: aiResponse.output_text,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected exception";
    return new Response(message, { status: 500 });
  }
}
