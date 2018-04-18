# fastify-xml-body-parser
Fastify plugin / module to parse XML payload / body into JS object

[![Code Climate](https://codeclimate.com/github/NaturalIntelligence/fastify-xml-body-parser/badges/gpa.svg)](https://codeclimate.com/github/NaturalIntelligence/fastify-xml-body-parser) 
[<img src="https://www.paypalobjects.com/webstatic/en_US/btn/btn_donate_92x26.png" alt="fastify-xml-body-parser donate button"/>](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=KQJAX48SPUKNC) 

[![Known Vulnerabilities](https://snyk.io/test/github/naturalintelligence/fastify-xml-body-parser/badge.svg)](https://snyk.io/test/github/naturalintelligence/fastify-xml-body-parser) 
[![NPM quality][quality-image]][quality-url]
[![Travis ci Build Status](https://travis-ci.org/NaturalIntelligence/fastify-xml-body-parser.svg?branch=master)](https://travis-ci.org/NaturalIntelligence/fastify-xml-body-parser) 
[![Coverage Status](https://coveralls.io/repos/github/NaturalIntelligence/fastify-xml-body-parser/badge.svg?branch=master)](https://coveralls.io/github/NaturalIntelligence/fastify-xml-body-parser?branch=master) 
[![bitHound Dev Dependencies](https://www.bithound.io/github/NaturalIntelligence/fastify-xml-body-parser/badges/devDependencies.svg)](https://www.bithound.io/github/NaturalIntelligence/fastify-xml-body-parser/master/dependencies/npm)
[![bitHound Overall Score](https://www.bithound.io/github/NaturalIntelligence/fastify-xml-body-parser/badges/score.svg)](https://www.bithound.io/github/NaturalIntelligence/fastify-xml-body-parser) 

[quality-image]: http://npm.packagequality.com/shield/fastify-xml-body-parser.svg?style=flat-square
[quality-url]: http://packagequality.com/#?package=fastify-xml-body-parser

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
```json
{
  sample: 'data'
}
```

## Options
This plugin use [fast-xml-parser](https://github.com/NaturalIntelligence/fast-xml-parser) to parse the XML payload. So it accepts all the options supported by fast-xml-parser.

```js

var options = {
    attributeNamePrefix : "@_",
    attrNodeName: "attr", //default is 'false'
    textNodeName : "#text",
    ignoreAttributes : true,
    ignoreNameSpace : false,
    allowBooleanAttributes : false,
    parseNodeValue : true,
    parseAttributeValue : false,
    trimValues: true,
    decodeHTMLchar: false,
    cdataTagName: "__cdata", //default is 'false'
    cdataPositionChar: "\\c",
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

## Worth to mention

Don't forget to check my other opensource projects

- **[निम्न (NIMN)](https://github.com/nimndata/spec)** : Schema aware object compression. 60% more compressed than JSON. 40% more compressed than msgpack.
- **[imglab](https://github.com/NaturalIntelligence/imglab)** : Web based tool to label images for object. So that they can be used to train dlib or other object detectors. You can integrate 3rd party libraries for fast labeling.
- **[अनुमार्गक (anumargak)](https://github.com/NaturalIntelligence/anumargak)** : The fastest router for node web servers.

* **[fast-xml-parser](https://github.com/NaturalIntelligence/fast-xml-parser)** : Validate XML or Parse XML to JS/JSON rapidly without C/C++ based libraries and no callback. Work with NPM, in all browsers, and CLI.
* **[stubmatic](https://github.com/NaturalIntelligence/stubmatic)** : A QA friendly stub server to mock behaviour of HTTP(s) / REST / SOAP services. Now you can create simulators or mock services in few minutes without coding.
* **[fast-lorem-ipsum](https://github.com/NaturalIntelligence/fast-lorem-ipsum)** : Generate lorem ipsum words, sentences, paragraph very quickly. Better than any generater. Works with NPM, browser, and CLI.
