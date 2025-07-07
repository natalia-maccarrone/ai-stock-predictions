"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const MAX_TICKERS = 3;

export function Form({ className, ...props }: React.ComponentProps<"div">) {
  const [inputValue, setInputValue] = useState<string>("");
  const [tickers, setTickers] = useState<string[]>([]);
  const [isLoadingStockData, setLoadingStockData] = useState(false);
  const [stockAnalysis, setStockAnalysis] = useState("");

  const isValidTicker =
    inputValue !== "" && !tickers.includes(inputValue.toUpperCase());

  const maxTickersReached = tickers.length === MAX_TICKERS;

  const handleAddTicker = (ticker: string) => {
    if (isValidTicker) {
      setStockAnalysis("");
      setTickers((prev) =>
        prev ? [...prev, ticker.toUpperCase()] : [ticker.toUpperCase()]
      );
      setInputValue("");
    }
  };

  const handleRemoveTicker = (ticker: string) =>
    setTickers((prev) => prev.filter((t) => t !== ticker));

  const fetchStockData = async (tickers: string[]) => {
    setLoadingStockData(true);
    try {
      const polygonResponse = await fetch(
        `/polygon?tickers=${tickers.join(",")}`
      );

      const stockData = await polygonResponse.json();

      const openAiResponse = await fetch("/openai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(stockData),
      });

      const analysisData = await openAiResponse.json();

      setStockAnalysis(analysisData.analysis);
    } catch (error) {
      console.error("Error fetching stock data:", error);
    } finally {
      setLoadingStockData(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2 h-[380px]">
          <form
            className="p-6 md:p-8"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddTicker(inputValue);
              }
            }}
          >
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">AI Stock Predictions</h1>
                <p className="text-muted-foreground text-balance text-xs">
                  Add up to three stock tickers to get a stock preditions report
                  (e.g. AMZN, TSLA, AAPL, NVDA, etc)
                </p>
              </div>
              <div className="flex gap-2">
                <Input
                  id="ticker"
                  type="ticker"
                  placeholder="Insert ticker here"
                  required
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  maxLength={4}
                />
                <Button
                  onClick={() => handleAddTicker(inputValue)}
                  disabled={!isValidTicker || maxTickersReached}
                >
                  Add
                </Button>
              </div>

              {tickers.length > 0 ? (
                <div className="grid grid-cols-3 gap-4">
                  {tickers.map((ticker) => (
                    <Button
                      key={ticker}
                      variant="outline"
                      type="button"
                      className="w-full"
                      onClick={() => handleRemoveTicker(ticker)}
                    >
                      {ticker}
                    </Button>
                  ))}
                </div>
              ) : (
                <p className="w-full text-muted-foreground">
                  Your tickers will appear here.
                </p>
              )}

              <Button
                className="w-full"
                disabled={tickers.length === 0 || isLoadingStockData}
                onClick={() => fetchStockData(tickers)}
              >
                {`${isLoadingStockData ? "Generating" : "Generate"} report`}
              </Button>
            </div>
          </form>
          <div className="bg-muted relative hidden md:block overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-black">
            {!!stockAnalysis.length ? (
              <div className="w-full h-full">
                <p className="text-sm text-muted-foreground p-6">
                  {stockAnalysis}
                </p>
              </div>
            ) : (
              <div className="w-full h-full flex justify-center items-center">
                <p className="text-sm text-muted-foreground">
                  Your report will appear here.
                </p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex items-center gap-2 text-xs">
          <span>⚠️</span>
          <p className="text-muted-foreground">
            This is just a demo app. Not real financial advice.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
