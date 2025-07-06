"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useState } from "react";

const MAX_TICKERS = 3;

export function Form({ className, ...props }: React.ComponentProps<"div">) {
  const [inputValue, setInputValue] = useState<string>("");
  const [tickers, setTickers] = useState<string[]>([]);
  const [isLoadingStockData, setLoadingStockData] = useState(false);
  const [stockData, setStockData] = useState(null);

  const isValidTicker =
    inputValue !== "" && !tickers.includes(inputValue.toUpperCase());

  const maxTickersReached = tickers.length === MAX_TICKERS;

  const handleAddTicker = (ticker: string) => {
    if (isValidTicker) {
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
      const response = await fetch(`/polygon?tickers=${tickers.join(",")}`);

      const data = await response.json();
      setStockData(data);
    } catch (error) {
      console.error("Error fetching stock data:", error);
    } finally {
      setLoadingStockData(false);
    }
  };

  console.log(stockData);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
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
                <p className="text-muted-foreground text-balance">
                  Add up to three stock tickers below to get a stock preditions
                  report
                </p>
              </div>
              <div className="flex gap-2">
                <Input
                  id="ticker"
                  type="ticker"
                  placeholder="MSFT"
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
          <div className="bg-muted relative hidden md:block">
            <div className="w-full h-full flex justify-center items-center">
              <Image width={200} height={200} src="/file.svg" alt="Image" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex items-center gap-2">
          <span>⚠️</span>
          <p className="text-muted-foreground">
            This is just a demo app. Not real financial advice.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
