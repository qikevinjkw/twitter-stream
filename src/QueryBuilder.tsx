import {
  Query,
  Builder,
  BasicConfig,
  Utils as QbUtils,
  ImmutableTree,
} from "react-awesome-query-builder";

type ValueSource = "value" | "field" | "func" | "const";

export const InitialQueryValue = { id: QbUtils.uuid(), type: "group" as const };
export const QueryBuilderConfig = {
  ...BasicConfig,
  types: {
    ...BasicConfig.types,
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
      jsonLogic: (field: any, _op: any, val: any) => ({
        regexp_matches: [val, field],
      }),
    },
    // need to add regex support to json logic
    //   jsonLogic.add_operation("regexp_matches", function(pattern, subject){
    //     if( typeof pattern === 'string'){
    //         pattern = new RegExp(pattern);
    //     }
    //     return pattern.test(subject);
    // });
    // jsonLogic.apply({"regexp_matches": ["\\w+(ing)\\w+", "ingest"]});

    // jsonLogic.add_operation("case_insensitive_in", function(wordToMatch, subject){
    //    return subject.toLowerCase().contains(wordToMatch)
    // });

    equals: {
      label: "Equals",
      labelForFormat: "Equals",
      valueSources: ["value"],
      jsonLogic: (field: any, _op: any, val: any) => ({ "==": [val, field] }),
    },
  },
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
} as any;
