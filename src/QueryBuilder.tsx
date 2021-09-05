import {
  BasicConfig,
  Builder,
  ImmutableTree,
  Query,
  Utils as QbUtils,
} from "react-awesome-query-builder";
import { toaster } from "./utils";
import "react-awesome-query-builder/lib/css/styles.css";
import jsonLogic from "json-logic-js";

type ValueSource = "value" | "field" | "func" | "const";

jsonLogic.add_operation("regex", function (subject, pattern) {
  if (typeof pattern === "string") {
    pattern = new RegExp(pattern);
  }
  return pattern.test(subject);
});

jsonLogic.add_operation("contains", function (subject, wordToMatch) {
  return subject.toLowerCase().includes(wordToMatch);
});

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
      jsonLogic2: "contains",
      jsonLogic: (field: any, _op: any, val: any) => {
        return { contains: [field, val.toLowerCase()] };
      },
    },
    regex: {
      label: "Regex",
      labelForFormat: "Regex",
      valueSources: ["value"],
      jsonLogic2: "regex",
      jsonLogic: (field: any, _op: any, val: string) => {
        const regexRemoveLeadingTrailingSlashes = val.replace(/^\/|\/$/g, "");
        try {
          new RegExp(regexRemoveLeadingTrailingSlashes);
        } catch (error) {
          toaster.danger("Invalid regex, should be of form: /textgoeshere/");
        }
        return {
          regex: [field, regexRemoveLeadingTrailingSlashes],
        };
      },
    },
    equals: {
      label: "Equals",
      labelForFormat: "Equals",
      valueSources: ["value"],
      jsonLogic: "==",
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
    return (
      <div className="query-builder-container" style={{ padding: "10px" }}>
        <div className="query-builder qb-lite">
          <Builder {...props} />;
        </div>
      </div>
    );
  };

  return (
    <div>
      <h3>Filter Panel</h3>
      <Query
        {...QueryBuilderConfig}
        value={value}
        onChange={onChange}
        renderBuilder={renderBuilder}
      />
    </div>
  );
}
