# fastify-xml-body-parser
Fastify plugin / module to parse XML payload / body into JS object

<a href="https://opencollective.com/fast-xml-parser/donate" target="_blank">
  <img src="https://opencollective.com/fast-xml-parser/donate/button@2x.png?color=blue" width=200 />
</a>
<a href="https://paypal.me/naturalintelligence"> <img src="static/img/support_paypal.svg" alt="Stubmatic donate button" width="200"/></a>

## Usage
1. Include in package.json
```bash
$npm install fastify-xml-body-parser
#or
$yarn add fastify-xml-body-parser
```

2. Then import in your code and register with fastify

**Sample POST body / payload**
```
<sample>data</sample>
```

```js

const fastify = require('fastify')()

fastify.register(require('fastify-xml-body-parser'))

fastify.post('/', (req, reply) => {
  console.log(req.body.sample)//data
  reply.send(req.body)
})

fastify.listen(8000, (err) => {
  if (err) throw err
})
```

The sent reply would be the object:
```js
{
  sample: 'data'
}
```

## Options
This plugin use [fast-xml-parser](https://github.com/NaturalIntelligence/fast-xml-parser) to parse the XML payload. So it accepts all the options supported by fast-xml-parser.

```js

var options = {
  commentPropName: "#comment",
  preserveOrder: true
};

const fastify = require('fastify')()

fastify.register(require('fastify-xml-body-parser'), options)

```

Additionaly, it supports following options

* **validate**: If it is set to `true`, this plugin validate the payload for valid XML syntax before parsing.
* **contentType**:  It accepts a string or an array of content types. By default it is set to `["text/xml", "application/xml", "application/rss+xml"]`.

**Note**: I've not included body size limit to this plugin because of following reasons
* I believe it's good to use API gateway to handle non-functional requirements, like security.
* There are already some plugins which verifies for body length. It'll be a performance degrade if all the plugins are doing the same thing.


## License
[MIT License](http://jsumners.mit-license.org/)


## Our other projects and research you must try

* **[BigBit standard](https://github.com/amitguptagwl/bigbit)** : 
  * Single text encoding to replace UTF-8, UTF-16, UTF-32 and more with less memory.
  * Single Numeric datatype alternative of integer, float, double, long, decimal and more without precision loss.
* **[Cytorus](https://github.com/NaturalIntelligence/cytorus)**: Now be specific and flexible while running E2E tests.
  * Run tests only for a particular User Story
  * Run tests for a route or from a route
  * Customizable reporting
  * Central dashboard for better monitoring
  * Options to integrate E2E tests with Jira, Github etc using Central dashboard `Tian`.
* **[Stubmatic](https://github.com/NaturalIntelligence/Stubmatic)** : Create fake webservices, DynamoDB or S3 servers, Manage fake/mock stub data, Or fake/Debug any HTTP(s) call.
