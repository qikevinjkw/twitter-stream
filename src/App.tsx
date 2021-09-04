import { Button } from "@blueprintjs/core";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ImmutableTree, Utils as QbUtils } from "react-awesome-query-builder";

import "./App.css";
import {
  InitialQueryValue,
  QueryBuilder,
  QueryBuilderConfig,
} from "./QueryBuilder";
import jsonLogic, { RulesLogic } from "json-logic-js";
import { useVirtual } from "react-virtual";
import { toaster, Tweet } from "./utils";
import { StatusWidget } from "./StatusWidget";
import { TweetCard } from "./TweetCard";
import { SettingsActionPanel } from "./SettingsActionPanel";

const MAX_ARRAY_SIZE = 10_000;
function App() {
  const currentFilterRef = useRef<RulesLogic>();
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [tree, setTree] = useState<ImmutableTree>(
    QbUtils.checkTree(QbUtils.loadTree(InitialQueryValue), QueryBuilderConfig)
  );
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket>();
  const parentRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(false);
  const [capturePercent, setCapturePercent] = useState(0.05);
  const capturePercentRef = useRef<number>(capturePercent);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    capturePercentRef.current = capturePercent;
  }, [capturePercent]);

  const rowVirtualizer = useVirtual({
    size: tweets.length,
    parentRef,
    estimateSize: useCallback(() => 100, []),
    overscan: 5,
  });

  useEffect(() => {
    const ws = new WebSocket(
      process.env.NODE_ENV === "development"
        ? "ws://localhost:4000"
        : "wss://glacial-dawn-01556.herokuapp.com/"
    );
    wsRef.current = ws;
    ws.binaryType = "blob";
    ws.addEventListener("message", (event) => {
      if (isPausedRef.current || Math.random() > capturePercentRef.current) {
        return;
      }
      const tweet = JSON.parse(event.data);
      // we filter on client side because when filter is changed
      // there is a small time interval where server hasn't gotten the new filter
      if (
        currentFilterRef.current === undefined ||
        (currentFilterRef.current &&
          jsonLogic.apply(currentFilterRef.current, tweet))
      ) {
        setTweets((prev) => {
          if (prev.length >= MAX_ARRAY_SIZE) {
            return [tweet, ...prev.slice(0, MAX_ARRAY_SIZE / 2)];
          }
          return [tweet, ...prev];
        });
      }
    });

    ws.addEventListener("open", (params) => {
      toaster.success("Connected!");
      setConnected(true);
      console.log("ws connection open!", params);
    });

    ws.addEventListener("error", (err) => {
      toaster.danger("Error connecting to server");
      console.error("ws error", err);
    });

    ws.addEventListener("close", () => {
      setConnected(false);
      wsRef.current = undefined;
      console.log("ws closed");
    });

    return () => {
      ws.close();
      setConnected(false);
      wsRef.current = undefined;
    };
  }, [retry]);

  const handleReconnect = () => setRetry((prev) => prev + 1);

  const handleQuery = () => {
    const rule = QbUtils.jsonLogicFormat(tree, QueryBuilderConfig);
    currentFilterRef.current = rule.logic as RulesLogic;
    setTweets([]);
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current?.send(
        currentFilterRef.current ? JSON.stringify(currentFilterRef.current) : ""
      );
    }

    setIsPaused(false);
  };

  const handlePlay = () => {
    setIsPaused(false);
    toaster.success("Streaming");
  };
  const handlePause = () => {
    setIsPaused(true);
    toaster.success("Paused");
  };

  const handleScrollToEnd = () => {
    rowVirtualizer.scrollToIndex(rowVirtualizer.totalSize);
  };

  const handleScrollToTop = () => {
    rowVirtualizer.scrollToIndex(0);
  };

  return (
    <div className="App">
      <StatusWidget connected={connected} numOfTweets={tweets.length} />
      <div className="SettingsPanel">
        <QueryBuilder value={tree} onChange={setTree} />
        <SettingsActionPanel
          setCapturePercent={setCapturePercent}
          capturePercent={capturePercent}
          handlePlay={handlePlay}
          handlePause={handlePause}
          handleQuery={handleQuery}
          handleReconnect={handleReconnect}
          isPaused={isPaused}
        />
      </div>
      <div className="TweetsPanel">
        <div ref={parentRef} className="TweetsOverflowContainer">
          <div
            style={{
              height: `${rowVirtualizer.totalSize}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {rowVirtualizer.virtualItems
              .filter((row) => row.index !== undefined)
              .map((virtualRow) => {
                const { user, created_at, retweet_count } =
                  tweets[virtualRow.index];

                return (
                  <TweetCard
                    key={`${user}${created_at}${retweet_count}`}
                    tweetObj={tweets[virtualRow.index]}
                    virtualRow={virtualRow}
                  />
                );
              })}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Button icon="arrow-up" onClick={handleScrollToTop} />
          <Button icon="arrow-down" onClick={handleScrollToEnd} />
        </div>
      </div>
    </div>
  );
}

export default App;
