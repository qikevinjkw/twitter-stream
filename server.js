const express = require("express");
const { v4: uuid } = require("uuid");
const app = express();
const expressWs = require("express-ws")(app);
const jsonLogic = require("json-logic-js");
const http = require("http");
const EventSource = require("eventsource");
const { throttle } = require("lodash");

jsonLogic.add_operation("regexp_matches", function (pattern, subject) {
  if (typeof pattern === "string") {
    pattern = new RegExp(pattern);
  }
  return pattern.test(subject);
});
jsonLogic.add_operation("case_insensitive_in", function (wordToMatch, subject) {
  return subject.toLowerCase().includes(wordToMatch);
});
jsonLogic.add_operation("Date", Date);

const connectionMapping = {};
app.ws("/", (ws, req) => {
  ws.id = uuid();

  ws.throttledSend = throttle((arg) => {
    ws.send(arg);
  }, 50);
  connectionMapping[ws.id] = { filterJson: null, ws };
  ws.on("message", (msg) => {
    if (!msg) {
      connectionMapping[ws.id].filterJson = null;
    } else {
      connectionMapping[ws.id].filterJson = JSON.parse(msg);
    }
  });

  ws.on("close", () => {
    delete connectionMapping[ws.id];
  });
});

app.get("/", (req, res) => {
  res.sendStatus(200);
});

app.listen(4000, () => {
  console.log("Listening on port 4000");
});

const es = new EventSource("https://tweet-service.herokuapp.com/stream");
es.addEventListener("message", (event) => {
  try {
    const tweet = JSON.parse(event.data);
    Object.entries(connectionMapping).forEach(
      ([connId, { ws, filterJson }]) => {
        if (!filterJson || jsonLogic.apply(filterJson, tweet)) {
          ws.throttledSend(event.data);
        }
      }
    );
  } catch (err) {
    console.error("Error occurred: ", err);
  }
});
