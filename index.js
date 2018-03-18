'use strict'

const fp = require('fastify-plugin')
const fxp = require('fast-xml-parser')
const qs = require('qs')

const defaults = {
    contentType: ["text/xml", "application/xml", "application/rss+xml"],
    validate: false
}

function xmlBodyParserPlugin(fastify, options, next) {
    const opts = Object.assign({}, defaults, options || {})

    function contentParser(req, done) {
        const parsingOpts = opts;

        let body = ''
        req.on('error', errorListener)
        req.on('data', dataListener)
        req.on('end', endListener)

        function errorListener (err) {
          done(err)
        }
        function endListener () {
            if (parsingOpts.validate) {
                var result = fxp.validate(body, parsingOpts)
                if (result.err) {
                    const invalidFormat = new Error('Invalid Format: ' + result.err.msg)
                    invalidFormat.statusCode = 400
                    req.removeListener('error', errorListener)
                    req.removeListener('data', dataListener)
                    req.removeListener('end', endListener)
                    done(invalidFormat)
                }
            }
            done(null, fxp.parse(body, parsingOpts))
        }
        function dataListener(data) {
            body = body + data
        }
    }

    if(typeof opts.contentType === "string"){
      fastify.addContentTypeParser(opts.contentType, contentParser)
      //console.log(fastify.hasContentTypeParser(opts.contentType));
    }else{
      for(var i=0; i< opts.contentType.length; i++){
        fastify.addContentTypeParser(opts.contentType[i], contentParser)
      }
    }
    
    next()
}

module.exports = fp(xmlBodyParserPlugin, {
    fastify: '>=1.0.0-rc.1',
    name: 'fastify-xml-body-parser'
})