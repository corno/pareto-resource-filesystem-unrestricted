import assert from 'node:assert/strict'
import test from 'node:test'
import { createRequire } from 'node:module'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { $ as filesystem } from '../typescript/lib/dist/index.js'

const require = createRequire(new URL('../typescript/lib/package.json', import.meta.url))
const { literal } = require('pareto-core/command')
const { pg, ph, sentence } = require('pareto-fountain-pen/modules/paragraph/schemas/paragraph/shorthands/deprecated')
const { n } = require('pareto-filesystem-unrestricted-api/modules/helpers/schemas/to_be_written_directory_content/shorthands/target')
const { $$: write_directory } = require('pareto-filesystem-unrestricted-api/modules/helpers/commands/implementations/write_directory_content')
const run = (command, parameters) => new Promise((resolve, reject) =>
    command.execute(parameters, (error) => error).__start(resolve, reject)
)
const context = (path) => ({ start: ['absolute', null], subpath: literal.list(path.split('/').filter(Boolean)) })
const value = pg.sentences([
    sentence([ph.text('first')]),
    sentence([ph.indent(pg.sentences([sentence([ph.text('nested')])]))]),
    sentence([]),
])
const fixture = async (t) => {
    const path = await mkdtemp(join(tmpdir(), 'pareto-paragraph-files-'))
    t.after(() => rm(path, { recursive: true, force: true }))
    return path
}

test('writes paragraph chunks with indentation and CRLF', async (t) => {
    const path = await fixture(t)
    await run(filesystem.commands['write file'], {
        path: { context: context(join(path, 'nested')), node: 'output.txt' },
        content: { paragraph: value, parameters: { indentation: '\t', newline: '\r\n' } },
    })
    assert.equal(await readFile(join(path, 'nested/output.txt'), 'utf8'), 'first\r\n\tnested\r\n\r\n')
})

test('empty paragraph produces an empty file', async (t) => {
    const path = await fixture(t)
    await run(filesystem.commands['write file'], {
        path: { context: context(path), node: 'empty.txt' },
        content: { paragraph: ['nothing', null], parameters: { indentation: '    ', newline: '\n' } },
    })
    assert.equal(await readFile(join(path, 'empty.txt'), 'utf8'), '')
})

test('directory writer forwards paragraphs and per-file formatting recursively', async (t) => {
    const path = await fixture(t)
    const command = write_directory({
        'remove before writing': false,
        'replace spaces in node names by underscores': false,
    }, null, filesystem.commands)
    await run(command, {
        path: context(path),
        directory: literal.dictionary({
            'one.txt': n.file(value, '--', '\n'),
            nested: n.directory(literal.dictionary({
                'two.txt': n.file(value, '\t', '\r\n'),
            })),
        }),
    })
    assert.equal(await readFile(join(path, 'one.txt'), 'utf8'), 'first\n--nested\n\n')
    assert.equal(await readFile(join(path, 'nested/two.txt'), 'utf8'), 'first\r\n\tnested\r\n\r\n')
})
