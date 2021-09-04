# Instructions

`yarn install` then
`yarn start`
Open [http://localhost:3000](http://localhost:3000)

## Assumptions Made

- it is ok to stream a certain percentage of tweets instead of always 100%
- lang in tweet is lower case
- the middleware/nodejs throttles messages to client by 50ms (default can be adjusted)

## Thought Process

The problem we face is the producer sending more messages than the consumer can handle. Ideally the consumer can tell the producer to slow down, but since the tweets server doesn't support that we need to throttle ourselves.

I decided to use a nodeJS server to throttle and filter the messages before sending to the browser. By default, the nodeJS server will throttle messages to 50ms. This seemed like a reasonable amount to not overwhelm the client but still sample a large enough size(though more research could have been done here to determine a better default).

When the app starts, the server will begin streaming all tweets throttled at 50ms to the client. This is basically a random sample set to allow users to see what data looks like without having to specify a query.

Users can craft a custom query using the provided filter panel which let's them create complex filters against the fields available in the tweet. The filters can be deeply nested into groups using AND | OR. Once they click the 'Apply Filter' icon, the query will be sent to the server, which will apply that filter against tweets sent to that client.

Some additional features include a capture rate slider which can do an additional throttle on the client side and play/pause to let user stop/start the stream of data. Also a reconnect button in case of disconnects.

The tweets are placed in a virtualized window via react-virtual library which will only create DOM elements for the visible tweets. This improves performance of the UI.

## Improvements That Can be Made

- User feedback to see if the user experience is intuitive and covers their use cases
- Authentication if needed
- Typescript for server code
- retry/reconnect logic - automatically handle reconnect if any issues
- Logging errors to splunk
- Unit and integration tests
- If user needs to be able to see tweets in the past we could use something like Kafka
- use select dropdown for languages filter - currently they need to manually type 'es'
- Light/Dark theme :)
- responsive UI
