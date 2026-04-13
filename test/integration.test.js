import { test } from 'node:test';
import assert from 'node:assert/strict';
import Fastify from 'fastify';
import plugin from '../index.js';

async function buildFastify(pluginOptions) {
  const fastify = Fastify();
  await fastify.register(plugin, pluginOptions);
  fastify.post('/test', (req, res) => {
    res.send(req.body);
  });
  await fastify.ready();
  return fastify;
}

async function inject(fastify, body, contentType) {
  return fastify.inject({
    method: 'POST',
    url: '/test',
    payload: body,
    headers: { 'content-type': contentType },
  });
}

test('parses valid XML with all default content types', async (t) => {
  const fastify = await buildFastify({});
  t.after(() => fastify.close());

  for (const ct of ['text/xml', 'application/xml', 'application/rss+xml']) {
    const res = await inject(fastify, '<root><value>42</value></root>', ct);
    assert.equal(res.statusCode, 200);
    assert.deepEqual(JSON.parse(res.body), { root: { value: 42 } });
  }
});

test('parses attributes by default', async (t) => {
  const fastify = await buildFastify({});
  t.after(() => fastify.close());

  const res = await inject(fastify, '<book id="1"><title>1984</title></book>', 'application/xml');
  assert.equal(res.statusCode, 200);
  const body = JSON.parse(res.body);
  assert.equal(body.book['@_id'], 1);
  assert.equal(body.book.title, 1984);
});

test('can opt out of attribute parsing', async (t) => {
  const fastify = await buildFastify({ skip: { attributes: true } });
  t.after(() => fastify.close());

  const res = await inject(fastify, '<book id="1"><title>1984</title></book>', 'application/xml');
  assert.equal(res.statusCode, 200);
  const body = JSON.parse(res.body);
  assert.equal(body.book['@_id'], undefined);
  assert.equal(body.book.title, 1984);
});

test('returns 400 for malformed XML', async (t) => {
  const fastify = await buildFastify({});
  t.after(() => fastify.close());

  const res = await inject(fastify, '<broken><unclosed>', 'text/xml');
  assert.equal(res.statusCode, 400);
  assert.match(JSON.parse(res.body).message, /Invalid Format:/);
});

test('rejects XML exceeding default nested tag limit', async (t) => {
  const fastify = await buildFastify({});
  t.after(() => fastify.close());

  const open = '<a>'.repeat(101);
  const close = '</a>'.repeat(101);
  const res = await inject(fastify, open + 'x' + close, 'text/xml');
  assert.equal(res.statusCode, 400);
  assert.match(JSON.parse(res.body).message, /Invalid Format:/);
});

test('user-supplied limits override defaults (partial merge)', async (t) => {
  const fastify = await buildFastify({ limits: { maxNestedTags: 3 } });
  t.after(() => fastify.close());

  const deep = '<a><b><c><d>too deep</d></c></b></a>';
  const res = await inject(fastify, deep, 'text/xml');
  assert.equal(res.statusCode, 400);

  const shallow = '<root id="1">ok</root>';
  const ok = await inject(fastify, shallow, 'text/xml');
  assert.equal(ok.statusCode, 200);
});

test('strips namespace prefixes when skip.nsPrefix is true', async (t) => {
  const fastify = await buildFastify({ skip: { nsPrefix: true } });
  t.after(() => fastify.close());

  const res = await inject(fastify, '<ns:valid>XML</ns:valid>', 'application/xml');
  assert.equal(res.statusCode, 200);
  assert.deepEqual(JSON.parse(res.body), { valid: 'XML' });
});

test('does not parse non-xml content types (application/json)', async (t) => {
  const fastify = await buildFastify({});
  t.after(() => fastify.close());

  const payload = JSON.stringify({ valid: 'JSON' });
  const res = await inject(fastify, payload, 'application/json');
  assert.equal(res.statusCode, 200);
  assert.deepEqual(JSON.parse(res.body), { valid: 'JSON' });
});

test('parses custom content-type string', async (t) => {
  const fastify = await buildFastify({ contentType: 'my/xml' });
  t.after(() => fastify.close());

  const res = await inject(fastify, '<item>hello</item>', 'my/xml');
  assert.equal(res.statusCode, 200);
  assert.deepEqual(JSON.parse(res.body), { item: 'hello' });
});

test('parses custom content-type array', async (t) => {
  const fastify = await buildFastify({ contentType: ['my/xml', 'custom/xml'] });
  t.after(() => fastify.close());

  for (const ct of ['my/xml', 'custom/xml']) {
    const res = await inject(fastify, '<item>hello</item>', ct);
    assert.equal(res.statusCode, 200);
    assert.deepEqual(JSON.parse(res.body), { item: 'hello' });
  }
});

test('type coercion: numbers and booleans parsed by default', async (t) => {
  const fastify = await buildFastify({});
  t.after(() => fastify.close());

  const xml = '<data><count>10</count><enabled>true</enabled><label>hello</label></data>';
  const res = await inject(fastify, xml, 'text/xml');
  assert.equal(res.statusCode, 200);
  const body = JSON.parse(res.body);
  assert.equal(body.data.count, 10);
  assert.equal(body.data.enabled, true);
  assert.equal(body.data.label, 'hello');
});