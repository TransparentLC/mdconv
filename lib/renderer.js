const katex = require('katex');
const marked = require('marked');
const prism = require('prismjs');
require('prismjs/components/index')();
require('mathjax').init({
    loader: {
        load: ['input/tex', 'output/svg'],
    },
}).then(e => globalThis.MathJax = e);


// https://github.com/markedjs/marked/issues/1538#issuecomment-1193178819

const renderer = new marked.Renderer;

const mathRenderer = text => text
    .replace(/\$\$([\s\S]+?)\$\$/g, (_, /** @type {String} */ expression) => {
        renderer.mathRendered = true;
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
        switch (renderer.mathRenderer) {
            case 'katex':
                return katex.renderToString(expression, {
                    displayMode: true,
                    output: 'html',
                });
            case 'mathjax':
                return MathJax.startup.adaptor.outerHTML(MathJax.tex2svg(expression, {
                    display: true,
                })).replace(/\s+stroke="currentColor"\s+/g, ' ').replace(/\s+stroke-width="0"\s+/g, ' ');
            // case 'api-zhihu':
            //     return `<p style="text-align:center"><img src="https://www.zhihu.com/equation?tex=${encodeURIComponent(expression)}"></p>`;
            // case 'api-jianshu':
            //     return `<p style="text-align:center"><img src="https://math.jianshu.com/math?formula=${encodeURIComponent(expression)}"></p>`;
            // case 'api-math':
            //     return `<p style="text-align:center"><img src="https://math.vercel.app/?from=${encodeURIComponent(expression)}"></p>`;
            // case 'api-markdowner':
            //     return `<p style="text-align:center"><img src="https://math.markdowner.net/math?from=${encodeURIComponent(expression)}"></p>`;
            // case 'api-codecogs':
            // case 'api-codecogs-svg':
            //     return `<p style="text-align:center"><img src="https://latex.codecogs.com/svg?${encodeURIComponent(expression)}"></p>`;
            // case 'api-codecogs-png':
            //     return `<p style="text-align:center"><img src="https://latex.codecogs.com/png?${encodeURIComponent(expression)}"></p>`;
            // case 'api-codecogs-gif':
            //     return `<p style="text-align:center"><img src="https://latex.codecogs.com/gif?${encodeURIComponent(expression)}"></p>`;
            // case 'api-zhihu-preload':
            //     return `<p style="text-align:center"><!-- ${renderer.nonce} preload https://www.zhihu.com/equation?tex=${encodeURIComponent(expression)} --></p>`;
            // case 'api-jianshu-preload':
            //     return `<p style="text-align:center"><!-- ${renderer.nonce} preload https://math.jianshu.com/math?formula=${encodeURIComponent(expression)} --></p>`;
            // case 'api-math-preload':
            //     return `<p style="text-align:center"><!-- ${renderer.nonce} preload https://math.vercel.app/?from=${encodeURIComponent(expression)} --></p>`;
            // case 'api-markdowner-preload':
            //     return `<p style="text-align:center"><!-- ${renderer.nonce} preload https://math.markdowner.net/math?from=${encodeURIComponent(expression)} --></p>`;
            // case 'api-codecogs-preload':
            // case 'api-codecogs-svg-preload':
            //     return `<p style="text-align:center"><!-- ${renderer.nonce} preload https://latex.codecogs.com/svg?${encodeURIComponent(expression)} --></p>`;
            // case 'api-codecogs-png-preload':
            //     return `<p style="text-align:center"><img style="vertical-align:middle" src="data:image/png;base64,<!-- ${renderer.nonce} preload-base64 https://latex.codecogs.com/png?${encodeURIComponent(expression)} -->"></p>`;
            // case 'api-codecogs-gif-preload':
            //     return `<p style="text-align:center"><img style="vertical-align:middle" src="data:image/gif;base64,<!-- ${renderer.nonce} preload-base64 https://latex.codecogs.com/gif?${encodeURIComponent(expression)} -->"></p>`;
        }
    })
    .replace(/\$([^\n]+?)\$/g, (_, /** @type {String} */ expression) => {
        renderer.mathRendered = true;
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
        switch (renderer.mathRenderer) {
            case 'katex':
                return katex.renderToString(expression, {
                    displayMode: false,
                    output: 'html',
                });
            case 'mathjax':
                return MathJax.startup.adaptor.outerHTML(MathJax.tex2svg(expression, {
                    display: false,
                })).replace(/\s+stroke="currentColor"\s+/g, ' ').replace(/\s+stroke-width="0"\s+/g, ' ');
            // case 'api-zhihu':
            //     return `<img style="vertical-align:middle" src="https://www.zhihu.com/equation?tex=${encodeURIComponent(expression)}">`;
            // case 'api-jianshu':
            //     return `<img style="vertical-align:middle" src="https://math.jianshu.com/math?formula=${encodeURIComponent(expression)}">`;
            // case 'api-math':
            //     return `<img style="vertical-align:middle" src="https://math.vercel.app/?inline=${encodeURIComponent(expression)}">`;
            // case 'api-markdowner':
            //     return `<img style="vertical-align:middle" src="https://math.markdowner.net/math?inline=${encodeURIComponent(expression)}">`;
            // case 'api-codecogs':
            // case 'api-codecogs-svg':
            //     return `<img style="vertical-align:middle" src="https://latex.codecogs.com/svg?${encodeURIComponent(expression)}">`;
            // case 'api-codecogs-png':
            //     return `<img style="vertical-align:middle" src="https://latex.codecogs.com/png?${encodeURIComponent(expression)}">`;
            // case 'api-codecogs-gif':
            //     return `<img style="vertical-align:middle" src="https://latex.codecogs.com/gif?${encodeURIComponent(expression)}">`;
            // case 'api-zhihu-preload':
            //     return `<span style="vertical-align:middle;display:inline-block"><!-- ${renderer.nonce} preload https://www.zhihu.com/equation?tex=${encodeURIComponent(expression)} --></span>`;
            // case 'api-jianshu-preload':
            //     return `<span style="vertical-align:middle;display:inline-block"><!-- ${renderer.nonce} preload https://math.jianshu.com/math?formula=${encodeURIComponent(expression)} --></span>`;
            // case 'api-math-preload':
            //     return `<span style="vertical-align:middle;display:inline-block"><!-- ${renderer.nonce} preload https://math.vercel.app/?inline=${encodeURIComponent(expression)} --></span>`;
            // case 'api-markdowner-preload':
            //     return `<span style="vertical-align:middle;display:inline-block"><!-- ${renderer.nonce} preload https://math.markdowner.net/math?inline=${encodeURIComponent(expression)} --></span>`;
            // case 'api-codecogs-preload':
            // case 'api-codecogs-svg-preload':
            //     return `<span style="vertical-align:middle;display:inline-block"><!-- ${renderer.nonce} preload https://latex.codecogs.com/svg?${encodeURIComponent(expression)} --></span>`;
            // case 'api-codecogs-png-preload':
            //     return `<img style="vertical-align:middle" src="data:image/png;base64,<!-- ${renderer.nonce} preload-base64 https://latex.codecogs.com/png?${encodeURIComponent(expression)} -->">`;
            // case 'api-codecogs-gif-preload':
            //     return `<img style="vertical-align:middle" src="data:image/gif;base64,<!-- ${renderer.nonce} preload-base64 https://latex.codecogs.com/gif?${encodeURIComponent(expression)} -->">`;
        }
    });

['listitems', 'paragraph', 'tablecell', 'text'].forEach(type => {
    const original = renderer[type];
    renderer[type] = (...args) => {
        args[0] = mathRenderer(args[0]);
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