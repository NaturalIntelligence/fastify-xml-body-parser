'use strict';

const fp = require('fastify-plugin');
const fxp = require('fast-xml-parser');

const defaults = {
    contentType: ["text/xml", "application/xml", "application/rss+xml"],
    validate: false
}

function xmlBodyParserPlugin(fastify, options, next) {
    const opts = Object.assign({}, defaults, options || {})

    function contentParser(req, payload, done) {
        const xmlParser = new fxp.XMLParser(opts);
        const parsingOpts = opts;

        let body = ''
        payload.on('error', errorListener)
        payload.on('data', dataListener)
        payload.on('end', endListener)

        function errorListener (err) {
          done(err)
        }
        function endListener () {
            if (parsingOpts.validate) {
                const result = fxp.XMLValidator.validate(body, parsingOpts);
                if (result.err) {
                    const invalidFormat = new Error('Invalid Format: ' + result.err.msg);
                    invalidFormat.statusCode = 400;
                    payload.removeListener('error', errorListener);
                    payload.removeListener('data', dataListener);
                    payload.removeListener('end', endListener);
                    done(invalidFormat);
              } else {
                  handleParseXml(body);
              }
            } else {
                handleParseXml(body);
            }
        }
        function dataListener(data) {
            body = body + data;
        }
        function handleParseXml(body) {
            try {
                done(null, xmlParser.parse(body));
            } catch (err) {
                done(err);
            }
        }
    }

    if(typeof opts.contentType === "string"){
      fastify.addContentTypeParser(opts.contentType, contentParser);
      //console.log(fastify.hasContentTypeParser(opts.contentType));
    }else{
      for(var i=0; i< opts.contentType.length; i++){
        fastify.addContentTypeParser(opts.contentType[i], contentParser);
      }
    }
    
    next();
}

module.exports = fp(xmlBodyParserPlugin, {
    fastify: '>=3.0.0',
    name: 'fastify-xml-body-parser'
})
