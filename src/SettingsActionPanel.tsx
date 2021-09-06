import { Button, Intent, Slider, Tag } from "@blueprintjs/core";
import { Tooltip2 } from "@blueprintjs/popover2";
import { RulesLogic } from "json-logic-js";
import { ISavedFilter } from "./App";

export function SettingsActionPanel({
  savedFilters,
  setSavedFilters,
  handleSavedFilterClick,
  setCapturePercent,
  capturePercent,
  handlePlay,
  handlePause,
  handleQuery,
  handleReconnect,
  isPaused,
}: {
  savedFilters: ISavedFilter[];
  setSavedFilters: React.Dispatch<React.SetStateAction<ISavedFilter[]>>;
  setCapturePercent: (val: number) => void;
  capturePercent: number;
  handlePlay: () => void;
  handlePause: () => void;
  handleQuery: () => void;
  handleReconnect: () => void;
  isPaused: boolean;
  handleSavedFilterClick: (jsonLogic: RulesLogic) => void;
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
      <div>
        <h3>Capture Rate</h3>
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
      <div
        style={{
          marginTop: 15,
          display: "flex",
          flexDirection: "column",
          flexWrap: "wrap",
        }}
      >
        <h3>Search History</h3>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
          }}
        >
          {savedFilters.map((filter) => {
            return (
              <Tag
                onClick={() => handleSavedFilterClick(filter.jsonLogic)}
                onRemove={(e) => {
                  e.stopPropagation();
                  setSavedFilters((prev) => {
                    return prev.filter((f) => f.name !== filter.name);
                  });
                }}
              >
                {filter.name}
              </Tag>
            );
          })}
        </div>
      </div>
    </div>
  );
}
