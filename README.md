# Express Negotiate Events

A Connect/Express style middleware to negotiate notification protocols requested by an HTTP user-agent using the [`Accept-Events`](https://cxres.github.io/prep/draft-gupta-httpbis-per-resource-events.html#accept-events-header) header field.

## Installation

Install **Express Negotiate Events** and **Express Accept Events** using your favourite package manager.

```sh
npm|pnpm|yarn|bun add express-negotiate-events express-accept-events
```

Also install middleware for the notification protocols you might want to support.

## Usage

### Setup

Add the following imports to your server:

```js
import acceptEvents from "express-accept-events";
import negotiateEvents from "express-negotiate-events";

// Assuming the protocol you want to support is Per Resource Events
import prep from "express-prep";
```

### Invocation

Now you are ready to invoke the **Express Negotiate Events** middleware in your server. In case one is using an Express server:

```js
const app = express();

app.use(acceptEvents, negotiateEvents, prep);
```

### Sending Notifications

The **Express Negotiate Events** middleware populates response object with a `sendEvents()` function.

You must specify the notification protocols you wish to support on a given resource as properties of the `config` object. The value of each protocol property is the configuration for that protocol specified as a string. Default configuration is used when the value for a protocol is specified as falsy (but not when the protocol is not specified, in which case the protocol is ignored).

```js
app.get("/foo", (req, res) => {
  // Get the response body first
  const body = getContent(req.url);
  // Get the content-* headers
  const headers = getMediaType(responseBody);

  const failStatus = res.sendEvents({
    body,
    headers,
    config: {
      prep: "",
    },
  });

  if (!failStatus) return;

  // If notifications are not sent, send regular response
  res.setHeaders(new Headers(headers));
  res.write(responseBody);
  res.end();
});
```

### Advanced Configuration

You can customize notifications for each protocol by specifying an object specific to that protocol on the `modifiers` property.

```js
function negotiateEventFields(defaultEvents) {
  // custom negotiation logic supported by PREP.
}

const failStatus = res.sendEvents({
  body,
  headers,
  config: {
    prep: `accept=("message/rfc822";delta="text/plain")`,
  },
  modifiers: {
    prep: {
      negotiateEventFields,
    },
  },
});
```

## Copyright and License

Copyright © 2024, [Rahul Gupta](https://cxres.pages.dev/profile#i) and Express Negotiate Events contributors.

The source code in this repository is released under the [Mozilla Public License v2.0](./LICENSE).
