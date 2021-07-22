const katex = require('katex');
const marked = require('marked');
const prism = require('prismjs');
require('prismjs/components/index')();

const args = require('./args');

// https://github.com/markedjs/marked/issues/1538#issuecomment-526189561

const renderer = new marked.Renderer;

/**
 * @param {String} expr
 * @returns {String|null}
 */
const mathsExpression = expr => {
    if (expr.match(/^\$\$[\s\S]*\$\$$/)) {
        expr = expr.substr(2, expr.length - 4);
        return katex.renderToString(expr, { displayMode: true });
    } else if (expr.match(/^\$[\s\S]*\$$/)) {
        expr = expr.substr(1, expr.length - 2);
        return katex.renderToString(expr, { isplayMode: false });
    }
    return null;
}

const rendererCode = renderer.code;
renderer.code = function (code, lang, escaped) {
    if (args['enable-katex'] && !lang) {
        const math = mathsExpression(code);
        if (math) {
            return math;
        }
    }
    return rendererCode.call(this, code, lang, escaped);
};

const rendererCodespan = renderer.codespan;
renderer.codespan = function (text) {
    if (args['enable-katex']) {
        const math = mathsExpression(text);
        if (math) {
            return math;
        }
    }
    return rendererCodespan.call(this, text);
};

renderer.options.highlight = (code, lang) => {
    if (prism.languages[lang]) {
        return prism.highlight(code, prism.languages[lang], lang);
    } else {
        return code;
    }
};

module.exports = renderer;