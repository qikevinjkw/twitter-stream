import { Intent } from "@blueprintjs/core";
import {
  BasicConfig,
  Builder,
  ImmutableTree,
  Query,
  Utils as QbUtils,
} from "react-awesome-query-builder";
import { toaster } from "./utils";

type ValueSource = "value" | "field" | "func" | "const";

export const InitialQueryValue = {
  id: QbUtils.uuid(),
  type: "group" as const,
  children1: {
    [QbUtils.uuid()]: {
      type: "rule" as const,
      properties: {
        field: "tweet",
        operator: "contains",
        value: [],
        valueSrc: [],
        valueType: [],
      },
    },
  },
};
export const QueryBuilderConfig = {
  ...BasicConfig,
  fields: {
    retweet_count: {
      label: "Retweet Count",
      type: "number",
      valueSources: ["value" as ValueSource],
      preferWidgets: ["number"],
      defaultOperator: "greater_or_equal",
    },
    created_at: {
      label: "Created At",
      type: "datetime",
      valueSources: ["value" as ValueSource],
      preferWidgets: ["datetime"],
      fieldSettings: {
        jsonLogic: (params: string) => {
          return new Date(params).getTime();
        },
      },
    },
    verified: {
      label: "Verified",
      type: "boolean",
      valueSources: ["value" as ValueSource],
      preferWidgets: ["boolean"],
      defaultOperator: "equal",
      operators: ["equal"],
    },
    tweet: {
      label: "Tweet",
      type: "text",
      valueSources: ["value" as ValueSource],
      preferWidgets: ["text"],
      defaultOperator: "contains",
      operators: ["contains", "regex", "equals"],
    },
    user: {
      label: "User",
      type: "text",
      valueSources: ["value" as ValueSource],
      operators: ["contains", "regex", "equals"],
    },
    lang: {
      label: "Language",
      type: "text",
      valueSources: ["value" as ValueSource],
      operators: ["contains", "regex", "equals"],
    },
  },
  settings: {
    ...BasicConfig.settings,
    showNot: false,
  },
  operators: {
    ...BasicConfig.operators,
    contains: {
      label: "Case Insensitive Contains",
      labelForFormat: "Case Insensitive Contains",
      valueSources: ["value"],
      jsonLogic: (field: any, _op: any, val: any) => {
        return { case_insensitive_in: [val.toLowerCase(), field] };
      },
    },
    regex: {
      label: "Regex",
      labelForFormat: "Regex",
      valueSources: ["value"],
      jsonLogic: (field: any, _op: any, val: string) => {
        console.log("jsonlogic", field, _op, val);
        const regexRemoveLeadingTrailingSlashes = val.replace(/^\/|\/$/g, "");
        try {
          new RegExp(regexRemoveLeadingTrailingSlashes);
        } catch (error) {
          toaster.danger("Invalid regex, should be of form: /textgoeshere/");
        }
        return {
          regexp_matches: [regexRemoveLeadingTrailingSlashes, field],
        };
      },
    },
    equals: {
      label: "Equals",
      labelForFormat: "Equals",
      valueSources: ["value"],
      jsonLogic: (field: any, _op: any, val: any) => ({ "==": [val, field] }),
    },
  },

  types: {
    ...BasicConfig.types,
    select: {
      ...BasicConfig.types.select,
      widgets: {
        ...BasicConfig.types.select.widgets,
        select: {
          ...BasicConfig.types.select.widgets.select,
          operators: ["equals", "contains", "regex"],
        },
      },
    },
    text: {
      ...BasicConfig.types.text,
      widgets: {
        ...BasicConfig.types.text.widgets,
        text: {
          ...BasicConfig.types.text.widgets.text,
          operators: ["contains", "regex", "equals"],
        },
      },
    },
  },
} as any;

export function QueryBuilder({
  onChange,
  value,
}: {
  onChange: (immutableTree: ImmutableTree) => void;
  value: ImmutableTree;
}) {
  const renderBuilder = (props: any) => {
    return <Builder {...props} />;
  };

  return (
    <Query
      {...QueryBuilderConfig}
      value={value}
      onChange={onChange}
      renderBuilder={renderBuilder}
    />
  );
}
