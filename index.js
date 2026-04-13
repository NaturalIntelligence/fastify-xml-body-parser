import fp from 'fastify-plugin';
import XMLParser, { ParseError } from '@nodable/flexible-xml-parser';

const CONTENT_TYPE_DEFAULTS = ['text/xml', 'application/xml', 'application/rss+xml'];

// Sensible defaults for parsing untrusted HTTP request bodies:
// - attributes included (common in XML APIs and SOAP/RSS payloads)
// - DoS limits to guard against deeply nested or attribute-heavy payloads
// - DOCTYPE entity expansion disabled (safe default for untrusted input)
const PARSER_DEFAULTS = {
    skip: { attributes: false },
    limits: {
        maxNestedTags: 100,
        maxAttributesPerTag: 50,
    },
    doctypeOptions: { enabled: false },
};

function xmlBodyParserPlugin(fastify, options, next) {
    const { contentType = CONTENT_TYPE_DEFAULTS, ...userParserOptions } = options || {};

    // Deep-merge limits/skip so the user can override individual fields without
    // losing the security defaults. Frozen once at registration; shared across requests.
    const parserOptions = Object.freeze({
        ...PARSER_DEFAULTS,
        ...userParserOptions,
        limits: { ...PARSER_DEFAULTS.limits, ...(userParserOptions.limits || {}) },
        skip: { ...PARSER_DEFAULTS.skip, ...(userParserOptions.skip || {}) },
        doctypeOptions: { ...PARSER_DEFAULTS.doctypeOptions, ...(userParserOptions.doctypeOptions || {}) },
    });

    // XMLParser instance must be created per-request: feed()/end() is stateful,
    // so a single shared instance would corrupt concurrent requests.
    // parserOptions is shared safely — it's a plain frozen object.
    function contentParser(req, payload, done) {
        const parser = new XMLParser(parserOptions);

        payload.on('error', errorListener);
        payload.on('data', dataListener);
        payload.on('end', endListener);

        function errorListener(err) {
            done(err);
        }

        function dataListener(chunk) {
            try {
                parser.feed(chunk);
            } catch (err) {
                done(wrapError(err));
            }
        }

        function endListener() {
            try {
                done(null, parser.end());
            } catch (err) {
                done(wrapError(err));
            }
        }
    }

    function wrapError(err) {
        if (err instanceof ParseError) {
            const e = new Error('Invalid Format: ' + err.message);
            e.statusCode = 400;
            return e;
        }
        return err;
    }

    if (typeof contentType === 'string') {
        fastify.addContentTypeParser(contentType, contentParser);
    } else {
        for (let i = 0; i < contentType.length; i++) {
            fastify.addContentTypeParser(contentType[i], contentParser);
        }
    }

    next();
}

export default fp(xmlBodyParserPlugin, {
    fastify: '5.x',
    name: 'fastify-xml-body-parser',
});