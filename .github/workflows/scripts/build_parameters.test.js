const assert = require('node:assert/strict');
const test = require('node:test');
const buildParameters = require('./build_parameters');

function getOutputs(ref) {
    const outputs = {};
    const context = {
        ref,
        sha: '1234567890abcdef',
        repo: { owner: 'Example', repo: 'bookstore' }
    };
    const core = {
        setOutput(name, value) {
            outputs[name] = value;
        }
    };

    buildParameters(context, core).injectBuildParameters();
    return outputs;
}

test('replaces unsupported branch characters in Maven version outputs', () => {
    const outputs = getOutputs('refs/heads/fix/change-version-txt');

    assert.equal(outputs.maven_changelist, '-fix-change-version-txt');
    assert.equal(outputs.maven_sha1, '-12345678-SNAPSHOT');
});

test('replaces other characters unsupported by Maven and container tags', () => {
    const outputs = getOutputs('refs/heads/fix/change:version?txt');

    assert.equal(outputs.maven_changelist, '-fix-change-version-txt');
});

test('keeps the existing Dependabot branch normalization', () => {
    const outputs = getOutputs('refs/heads/dependabot/npm_and_yarn/example-1.0.0');

    assert.equal(outputs.maven_changelist, '-dbot-npm_and_yarn');
});

test('leaves release branch version outputs unchanged', () => {
    const outputs = getOutputs('refs/heads/main');

    assert.equal(outputs.maven_changelist, '');
    assert.equal(outputs.maven_sha1, '-12345678');
});
