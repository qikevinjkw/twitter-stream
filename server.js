const express = require("express");
const { v4: uuid } = require("uuid");
const app = express();
const expressWs = require("express-ws")(app);
const jsonLogic = require("json-logic-js");
const http = require("http");
const EventSource = require("eventsource");

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

app.listen(4000, () => {
  console.log("Listening on port 4000");
});

const es = new EventSource("https://tweet-service.herokuapp.com/stream");
es.addEventListener("message", (event) => {
  try {
    const tweet = JSON.parse(event.data);
    Object.entries(connectionMapping).forEach(
      ([connId, { ws, filterJson }]) => {
        if (!filterJson) {
          if (Math.random() < 0.00004) {
            ws.send(event.data);
          }
        } else {
          const result = jsonLogic.apply(filterJson, tweet);
          if (result) {
            if (Math.random() < 0.1) {
              ws.send(event.data);
            }
          }
        }
      }
    );
  } catch (err) {
    console.error("Error occurred: ", err);
  }
});

// http.get({
//     agent: false,
//     path: '/stream',
//     hostname: 'tweet-service.herokuapp.com'
// }, (res) => {
//     res.on('data', data => {
//         const dataStr = data.toString()
//         const strData = dataStr.substring(dataStr.indexOf("{"))
//         try {
//             console.log('parse', strData);
//             const jsonData = JSON.parse(strData);
//             Object.entries(connectionMapping).forEach(([connId, {ws, filterJson}]) => {

//                 if (!filterJson) {
//                     if (Math.random() < 0.00001) {
//                         ws.send(strData)
//                     }
//                 } else {
//                     const result = jsonLogic.apply(filterJson, jsonData);
//                     if (result) {
//                         ws.send(strData)
//                     }
//                 }
//             })
//         } catch (err) {
//           console.error("Error occurred: ", err)
//         }

//     })
// })

/**
 when data comes back from tweet server, parse it
 for each client, if the client's filter passes, send the message to that client
 Object.keys(connectionMapping).forEach(conn => {
     if (!conn.filterJson) {
         if (Math.random() < .001)
            conn.ws.send(data)
         return;
     }
     if (jsonLogic.apply(conn.filterJson)) {
         conn.ws.send(data)
     }
 })
 */
