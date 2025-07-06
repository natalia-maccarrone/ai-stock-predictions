import { DateTime } from "luxon";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tickersParam = searchParams.get("tickers");

    if (!tickersParam) {
      return new Response("Missing tickers parameter", { status: 400 });
    }

    const tickers = tickersParam.split(",");

    const startDate = DateTime.fromJSDate(new Date())
      .minus({ days: 3 })
      .toFormat("yyyy-MM-dd");
    const endDate = DateTime.fromJSDate(new Date())
      .minus({ days: 1 })
      .toFormat("yyyy-MM-dd");

    const stockData = await Promise.all(
      tickers.map(async (ticker: string) => {
        const polygonResponse = await fetch(
          `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${startDate}/${endDate}?apiKey=${process.env.POLYGON_API_KEY}`
        );

        if (!polygonResponse.ok) {
          throw new Error(`Failed to fetch data for ${ticker}`);
        }

        const data = await polygonResponse.json();
        return { ticker, data };
      })
    );
    return new Response(JSON.stringify(stockData), {
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
