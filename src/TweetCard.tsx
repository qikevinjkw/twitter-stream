import { Card, Icon, Intent } from "@blueprintjs/core";
import { format } from "date-fns";
import { VirtualItem } from "react-virtual/types";
import { countryShorthandToEmojii, hashTagRegex, Tweet } from "./utils";

export function TweetCard({
  tweetObj,
  virtualRow,
}: {
  tweetObj: Tweet;
  virtualRow: VirtualItem;
}) {
  const { user, verified, tweet, created_at, retweet_count, lang } = tweetObj;
  const hashTags = Array.from(tweet.matchAll(hashTagRegex)).map(
    (match) => match[0]
  );
  return (
    <Card
      className="TweetCard"
      style={{
        height: `${virtualRow.size}px`,
        transform: `translateY(${virtualRow.start}px)`,
      }}
    >
      <div>
        <span
          style={{
            fontSize: 15,
            fontWeight: 700,
          }}
        >
          {user}{" "}
          {verified ? <Icon intent={Intent.SUCCESS} icon="confirm" /> : null}
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
}
