import { Icon, Intent } from "@blueprintjs/core";

export function StatusWidget({
  numOfTweets,
  connected,
}: {
  numOfTweets: number;
  connected: boolean;
}) {
  return (
    <div
      style={{
        position: "fixed",
        right: 2,
        top: 2,
      }}
    >
      {numOfTweets} Tweets
      <Icon
        icon="offline"
        intent={connected ? Intent.SUCCESS : Intent.DANGER}
      />
    </div>
  );
}
