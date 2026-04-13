# fastify-xml-body-parser

[![npm version](https://badge.fury.io/js/fastify-xml-body-parser.svg)](https://badge.fury.io/js/fastify-xml-body-parser)

Fastify plugin to parse XML request bodies into JavaScript objects. Powered by [`@nodable/flexible-xml-parser`](https://www.npmjs.com/package/@nodable/flexible-xml-parser).

## Installation

```bash
npm install fastify-xml-body-parser
```

## Quick Start

```js
const fastify = require('fastify')();
const xmlBodyParser = require('fastify-xml-body-parser');

fastify.register(xmlBodyParser);

fastify.post('/api', (req, res) => {
  console.log(req.body); // parsed JS object
  res.send(req.body);
});

fastify.listen({ port: 3000 });
```

Send a request:

```bash
curl -X POST http://localhost:3000/api \
  -H 'Content-Type: application/xml' \
  -d '<book><title>1984</title><year>1949</year></book>'
# → { book: { title: '1984', year: 1949 } }
```

## Options

All options are passed directly to `@nodable/flexible-xml-parser`. The only plugin-specific option is `contentType`.

### `contentType`

Content-type string or array of strings to register the parser for.

**Default:** `['text/xml', 'application/xml', 'application/rss+xml']`

```js
// Single content type
fastify.register(xmlBodyParser, { contentType: 'application/atom+xml' });

// Multiple content types
fastify.register(xmlBodyParser, {
  contentType: ['text/xml', 'application/xml', 'my/xml'],
});
```

### Parser Options (from `@nodable/flexible-xml-parser`)

Any additional options are forwarded to the parser. The plugin sets HTTP-appropriate defaults that differ from the library's own defaults:

| Option | Plugin default | Description |
|---|---|---|
| `skip.attributes` | `false` | Attributes are parsed — common in XML APIs and SOAP/RSS |
| `skip.nsPrefix` | `false` | Set to `true` to strip namespace prefixes |
| `attributes.prefix` | `'@_'` | Prefix for attribute keys |
| `limits.maxNestedTags` | `100` | Rejects deeply nested payloads (DoS guard) |
| `limits.maxAttributesPerTag` | `50` | Rejects attribute-flood payloads (DoS guard) |
| `doctypeOptions.enabled` | `false` | DOCTYPE entity expansion disabled (safe default) |

User-supplied `limits` and `skip` are **merged** with these defaults, so you only need to specify what you want to change.

### Opt out of attribute parsing

```js
fastify.register(xmlBodyParser, {
  skip: { attributes: true },
});
```

### Strip namespace prefixes

```js
fastify.register(xmlBodyParser, {
  skip: { nsPrefix: true },
});
// <soap:Envelope><soap:Body>hello</soap:Body></soap:Envelope>
// → { Envelope: { Body: 'hello' } }
```

### Security: protect against malicious input

For public-facing endpoints, set structural limits:

```js
fastify.register(xmlBodyParser, {
  limits: {
    maxNestedTags: 50,
    maxAttributesPerTag: 20,
  },
  doctypeOptions: { enabled: false }, // default — never expand DOCTYPE from untrusted input
});
```

Malformed or limit-exceeding XML is automatically rejected with a `400 Bad Request` response.

## Error Handling

Parse errors are returned as `400 Bad Request` with a JSON body:

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Invalid Format: <description>"
}
```

All other unexpected errors propagate to Fastify's standard error handler.

## Migration from v2

v3 drops `fast-xml-parser` in favour of `@nodable/flexible-xml-parser`. The API surface is similar but there are breaking changes:

| v2 | v3 |
|---|---|
| `validate: true` | Removed — parse errors always throw `ParseError` and return 400 |
| `removeNSPrefix: true` | `skip: { nsPrefix: true }` |
| `ignoreAttributes: false` | `skip: { attributes: false }` |
| `attributeNamePrefix` | `attributes.prefix` |
| `fastify-plugin` v3 | `fastify-plugin` v5 |
| Fastify `>=3` | Fastify `>=4` |

## License

MIT — [Amit Gupta](https://solothought.com)