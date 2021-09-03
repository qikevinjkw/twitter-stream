import { Button, Card, Icon, Intent } from "@blueprintjs/core";
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
import jsonLogic from "json-logic-js";
import { format } from "date-fns";
import { useVirtual } from "react-virtual";

jsonLogic.add_operation("regexp_matches", function (pattern, subject) {
  if (typeof pattern === "string") {
    pattern = new RegExp(pattern);
  }
  return pattern.test(subject);
});
//   jsonLogic.apply({"regexp_matches": ["\\w+(ing)\\w+", "ingest"]});

const letterA = "a".codePointAt(0) as number;
const regionalIndicatorA = "🇦".codePointAt(0) as number;

const toRegionalIndicator = (char: string) =>
  String.fromCodePoint(
    (char.codePointAt(0) as number) - letterA + regionalIndicatorA
  );
function countryShorthandToEmojii(country: string) {
  if (country === "en") {
    return "🇺🇸";
  }
  return country
    .split("")
    .map((char) => toRegionalIndicator(char))
    .join("");
}

jsonLogic.add_operation("case_insensitive_in", function (wordToMatch, subject) {
  return subject.toLowerCase().includes(wordToMatch);
});

interface Tweet {
  tweet: string;
  user: string;
  retweet_count: number;
  created_at: number;
  verified: boolean;
  lang: string;
}

function App() {
  const currentFilterRef = useRef<any>();
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [tree, setTree] = useState<ImmutableTree>(
    QbUtils.checkTree(QbUtils.loadTree(InitialQueryValue), QueryBuilderConfig)
  );
  const wsRef = useRef<WebSocket>();
  const parentRef = useRef<HTMLDivElement>(null);

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
      const tweet = JSON.parse(event.data);
      if (currentFilterRef.current) {
        // we filter on client side because when filter is changed
        // there is a small time interval where server hasn't gotten the new filter
        if (jsonLogic.apply(currentFilterRef.current, tweet)) {
          setTweets((prev) => {
            return [...prev, tweet];
          });
        }
      } else {
        setTweets((prev) => {
          return [...prev, tweet];
        });
      }
    });
    ws.addEventListener("open", (params) => {
      console.log("ws connection open!", params);
    });
    return () => {
      ws.close();
      wsRef.current = undefined;
    };
  }, []);

  const renderBuilder = (props: any) => {
    return <Builder {...props} />;
  };

  const handleQuery = () => {
    const rule = QbUtils.jsonLogicFormat(tree, QueryBuilderConfig);
    currentFilterRef.current = rule.logic;
    setTweets([]);
    wsRef.current?.readyState === WebSocket.OPEN &&
      wsRef.current?.send(JSON.stringify(rule.logic));
  };

  const handleStop = () => {
    wsRef.current?.readyState === WebSocket.OPEN && wsRef.current?.send("");
  };

  return (
    <div
      className="App"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
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
      <div>
        <Button text="Query" intent={Intent.PRIMARY} onClick={handleQuery} />
        <Button text="Stop" intent={Intent.DANGER} onClick={handleStop} />
      </div>
      <div
        ref={parentRef}
        className="List"
        style={{
          height: `800px`,
          width: `80%`,
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
              const { user, verified, tweet, created_at, retweet_count, lang } =
                tweets[virtualRow.index];
              const hashTags = Array.from(
                tweet.matchAll(/\B(\#[a-zA-Z]+\b)(?!;)/g)
              ).map((match) => match[0]);
              return (
                <Card
                  key={`${user}${created_at}${retweet_count}`}
                  style={{
                    position: "absolute",
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
                      padding: "5px 0",
                    }}
                  >
                    {tweet.replaceAll(/\B(\#[a-zA-Z]+\b)(?!;)/g, "")}{" "}
                    {hashTags.map((tag) => (
                      <a
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
                    <span>Retweets {retweet_count}</span>
                    <span
                    // style={{
                    //   marginLeft: 15,
                    // }}
                    >
                      {lang.toUpperCase()} {countryShorthandToEmojii(lang)}
                    </span>
                  </div>
                </Card>
              );
            })}
        </div>
      </div>
    </div>
  );
}

export default App;

// let i = 0;
// let s: EventSource;
// useEffect(() => {
//   let count = {
//     verified: 0,
//     notVerified: 0,
//   }
//   let startTime = performance.now();
//   const msgHandler = (event:MessageEvent<string>) => {
//     i += 1;
//     if (performance.now() - startTime>1000) {
//       s.close()
//       s.removeEventListener("message", msgHandler);
//       console.log('count', count);
//     }
//     const tweet = JSON.parse(event.data) as Tweet;
//     if (tweet.verified) {
//       count.verified += 1;
//     } else {
//       count.notVerified += 1;
//     }

//     if (i % 10 === 0) {
//       console.log('event', i, tweet);
//     }
//   }

//   s = new EventSource("https://tweet-service.herokuapp.com/stream");
//   s.addEventListener("message", msgHandler);
// }, [])
