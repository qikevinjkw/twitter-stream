import { Button, Intent, Slider } from "@blueprintjs/core";
import { Tooltip2 } from "@blueprintjs/popover2";

export function SettingsActionPanel({
  setCapturePercent,
  capturePercent,
  handlePlay,
  handlePause,
  handleQuery,
  handleReconnect,
  isPaused,
}: {
  setCapturePercent: (val: number) => void;
  capturePercent: number;
  handlePlay: () => void;
  handlePause: () => void;
  handleQuery: () => void;
  handleReconnect: () => void;
  isPaused: boolean;
}) {
  return (
    <div>
      <h3>Actions</h3>
      <div className="SettingsActionsPanel">
        <Tooltip2 content={isPaused ? "Start Stream" : "Pause Stream"}>
          {isPaused ? (
            <Button intent={Intent.SUCCESS} icon="play" onClick={handlePlay} />
          ) : (
            <Button
              intent={isPaused ? Intent.SUCCESS : Intent.WARNING}
              icon={isPaused ? "play" : "pause"}
              onClick={handlePause}
              active={isPaused}
            />
          )}
        </Tooltip2>

        <Tooltip2 content="Apply Filter">
          <Button
            intent={Intent.PRIMARY}
            icon="filter-open"
            onClick={handleQuery}
          />
        </Tooltip2>
        <Tooltip2 content="Reconnect">
          <Button icon="refresh" onClick={handleReconnect} />
        </Tooltip2>
      </div>
      <div
        style={{
          marginTop: 15,
        }}
      >
        <Tooltip2 content="Larger capture rates may affect performance!">
          <h3>Capture Rate</h3>
        </Tooltip2>

        <Slider
          min={0}
          max={1}
          stepSize={0.01}
          labelStepSize={0.25}
          onChange={setCapturePercent}
          labelRenderer={(val: number) => {
            return `${Math.round(val * 100)}%`;
          }}
          value={capturePercent}
        />
      </div>
    </div>
  );
}
