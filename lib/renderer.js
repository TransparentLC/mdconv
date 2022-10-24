const katex = require('katex');
const marked = require('marked');
const prism = require('prismjs');
require('prismjs/components/index')();

// https://github.com/markedjs/marked/issues/1538#issuecomment-1193178819

const renderer = new marked.Renderer;
renderer.katexUsed = false;

const katexReplacer = text => text
    .replace(/\$\$([\s\S]+?)\$\$/g, (_, /** @type {String} */ expression) => {
        renderer.katexUsed = true;
        for (const [k, v] of [
            ['&amp;', '&'],
            ['&lt;', '<'],
            ['&gt;', '>'],
            ['&quot;', '"'],
        ]) {
            expression = expression.replaceAll(k, v);
        }
        expression = expression.replace(/&#x([\da-f]+);/gi, (_, m) => String.fromCharCode(parseInt(m, 16)));
        expression = expression.replace(/&#(\d+);/gi, (_, m) => String.fromCharCode(parseInt(m, 10)));
        expression = expression.replace(/\\\s+/g, '\\\\ ');
        return katex.renderToString(expression, {
            displayMode: true,
            output: 'html',
        });
    })
    .replace(/\$([^\n]+?)\$/g, (_, /** @type {String} */ expression) => {
        renderer.katexUsed = true;
        for (const [k, v] of [
            ['&amp;', '&'],
            ['&lt;', '<'],
            ['&gt;', '>'],
            ['&quot;', '"'],
        ]) {
            expression = expression.replaceAll(k, v);
        }
        expression = expression.replace(/&#x([\da-f]+);/gi, (_, m) => String.fromCharCode(parseInt(m, 16)));
        expression = expression.replace(/&#(\d+);/gi, (_, m) => String.fromCharCode(parseInt(m, 10)));
        expression = expression.replace(/\\\s+/g, '\\\\ ');
        return katex.renderToString(expression, {
            displayMode: false,
            output: 'html',
        });
    });

['listitems', 'paragraph', 'tablecell', 'text'].forEach(type => {
    const original = renderer[type];
    renderer[type] = (...args) => {
        args[0] = katexReplacer(args[0]);
        return original(...args);
    };
});

renderer.code = function (code, lang) {
    return `<pre class="language-${lang || 'plain'}" style="font-size:inherit;line-height:initial;padding:.8em"><code>${this.options.highlight(code, lang)}</code></pre>`;
};

renderer.options.highlight = (code, lang) => {
    if (prism.languages[lang]) {
        return prism.highlight(code, prism.languages[lang], lang);
    } else {
        return code;
    }
};

module.exports = renderer;