import { Button, Card, Icon, Intent, Slider } from "@blueprintjs/core";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Builder,
  ImmutableTree,
  Query,
  Utils as QbUtils,
} from "react-awesome-query-builder";
import "react-awesome-query-builder/lib/css/styles.css";
import "./App.css";
import { InitialQueryValue, QueryBuilderConfig } from "./QueryBuilder";
import jsonLogic, { RulesLogic } from "json-logic-js";
import { format } from "date-fns";
import { useVirtual } from "react-virtual";
import { countryShorthandToEmojii, hashTagRegex, Tweet } from "./utils";
import { Tooltip2 } from "@blueprintjs/popover2";

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
  const pauseRef = useRef(false);
  const [capturePercent, setCapturePercent] = useState(0.05);
  const capturePercentRef = useRef<number>(capturePercent);

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
    const ws = new WebSocket("ws://localhost:4000");
    wsRef.current = ws;
    ws.binaryType = "blob";
    ws.addEventListener("message", (event) => {
      if (pauseRef.current || Math.random() > capturePercentRef.current) {
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
      setConnected(true);
      console.log("ws connection open!", params);
    });
    ws.addEventListener("error", (err) => {
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
  }, []);

  const renderBuilder = (props: any) => {
    return <Builder {...props} />;
  };

  const handleQuery = () => {
    const rule = QbUtils.jsonLogicFormat(tree, QueryBuilderConfig);
    currentFilterRef.current = rule.logic as RulesLogic;
    setTweets([]);
    wsRef.current?.readyState === WebSocket.OPEN &&
      wsRef.current?.send(JSON.stringify(rule.logic));
    pauseRef.current = false;
  };

  const handlePlay = () => {
    pauseRef.current = false;
  };
  const handlePause = () => {
    pauseRef.current = true;
  };

  const handleScrollToEnd = () => {
    rowVirtualizer.scrollToIndex(rowVirtualizer.totalSize);
  };
  const handleScrollToTop = () => {
    rowVirtualizer.scrollToIndex(0);
  };
  return (
    <div
      className="App"
      style={{
        display: "flex",
        justifyContent: "space-around",
        margin: 25,
      }}
    >
      <div
        style={{
          position: "fixed",
          right: 5,
          top: 5,
        }}
      >
        {tweets.length} Tweets
        <Icon
          icon="offline"
          intent={connected ? Intent.SUCCESS : Intent.DANGER}
        />
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Query
          {...QueryBuilderConfig}
          value={tree}
          onChange={(immutableTree) => {
            setTree(immutableTree);
          }}
          renderBuilder={renderBuilder}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-around",
          }}
        >
          <Tooltip2 content="Start Stream">
            <Button intent={Intent.SUCCESS} icon="play" onClick={handlePlay} />
          </Tooltip2>

          <Tooltip2 content="Pause Stream">
            <Button
              intent={Intent.WARNING}
              icon="pause"
              onClick={handlePause}
            />
          </Tooltip2>

          <Tooltip2 content="Apply Filter">
            <Button
              intent={Intent.PRIMARY}
              icon="filter-open"
              onClick={handleQuery}
            />
          </Tooltip2>
        </div>
        <div>
          <Tooltip2 content="Larger capture rates may affect performance!">
            Capture Rate
          </Tooltip2>

          <Slider
            min={0}
            max={1}
            stepSize={0.01}
            labelStepSize={0.25}
            onChange={(key) => {
              setCapturePercent(key);
            }}
            labelRenderer={(val: number) => {
              return `${Math.round(val * 100)}%`;
            }}
            value={capturePercent}
          />
        </div>
      </div>
      <div
        style={{
          display: "flex",
          width: 650,
          height: 800,
        }}
      >
        <div
          ref={parentRef}
          className="List"
          style={{
            height: `100%`,
            width: `100%`,
            overflow: "auto",
            border: "1px solid black",
          }}
        >
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
                const {
                  user,
                  verified,
                  tweet,
                  created_at,
                  retweet_count,
                  lang,
                } = tweets[virtualRow.index];
                const hashTags = Array.from(tweet.matchAll(hashTagRegex)).map(
                  (match) => match[0]
                );
                return (
                  <Card
                    key={`${user}${created_at}${retweet_count}`}
                    style={{
                      position: "absolute",
                      padding: 10,
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                        }}
                      >
                        {user}{" "}
                        {verified ? (
                          <Icon intent={Intent.SUCCESS} icon="confirm" />
                        ) : null}
                      </span>
                      <span
                        style={{
                          color: "grey",
                          marginLeft: 10,
                        }}
                      >
                        Created At {format(new Date(created_at), "PPpp")}
                      </span>
                    </div>
                    <div
                      style={{
                        padding: "10px 0",
                      }}
                    >
                      {tweet.replaceAll(hashTagRegex, "")}{" "}
                      {hashTags.map((tag) => (
                        <a
                          key={tag}
                          href={`https://twitter.com/hashtag/${tag.replace(
                            "#",
                            ""
                          )}?src=hashtag_click`}
                        >
                          {tag}
                        </a>
                      ))}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        width: "100%",
                      }}
                    >
                      <span>
                        <Icon icon="refresh" /> {retweet_count}
                      </span>
                      <span>
                        {lang.toUpperCase()} {countryShorthandToEmojii(lang)}
                      </span>
                    </div>
                  </Card>
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
