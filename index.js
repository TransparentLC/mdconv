const fontkit = require('fontkit');
const fs = require('fs');
const { lookpath } = require('lookpath');
const marked = require('marked');
const mustache = require('mustache');
const os = require('os');
const path = require('path');
const wkhtmltopdf = require('wkhtmltopdf');

const args = require('./lib/args');
const fontCache = require('./lib/font-cache');
const markedCustomRenderer = require('./lib/renderer');

(async () => {

if (process.pkg && process.platform === 'win32' && !(await lookpath('wkhtmltopdf'))) {
    const wkhtmltopdfPath = path.join(os.tmpdir(), 'wkhtmltopdf-mdconv.exe');
    if (!fs.existsSync(wkhtmltopdfPath)) {
        console.log('"wkhtmltopdf" is not in system PATH, extracting embed executable to:');
        console.log(wkhtmltopdfPath);
        await new Promise(resolve => fs
            .createReadStream(path.join(__dirname, 'bin', 'wkhtmltopdf.exe'))
            .pipe(fs.createWriteStream(wkhtmltopdfPath))
            .on('close', resolve)
        );
    }
    wkhtmltopdf.command = wkhtmltopdfPath;
}

if (args['show-fonts']) {
    const fontCacheMapping = {};
    for (const [fontName, fontPath] of Object.entries(fontCache)) {
        if (fontCacheMapping[fontPath]) {
            fontCacheMapping[fontPath].push(fontName);
        } else {
            fontCacheMapping[fontPath] = [fontName];
        }
    }
    for (const [fontPath, fontNames] of Object.entries(fontCacheMapping)) {
        console.log(`Font names of "${fontPath}":\n${fontNames.map(e => `    ${e}`).join('\n')}`);
    }
    process.exit(0);
}

markedCustomRenderer.nonce = Array(4).fill().map(() => Math.random().toString(16).substring(2, 10)).join('');
markedCustomRenderer.mathRenderer = args['math-renderer'];
markedCustomRenderer.mathRendered = false;
marked.use({
    renderer: markedCustomRenderer,
});

for (const k of ['custom-content-font', 'custom-monospace-font']) {
    if (fontCache[args[k]]) {
        console.log(`Found font file for "${args[k]}": ${fontCache[args[k]]}`);
        args[k] = fontCache[args[k]];
    } else if (typeof args[k] === 'string' && !/\.(tt[fc]|otf|svg|eot|woff2?)$/i.test(args[k])) {
        console.log(`Can't find font file for "${args[k]}".`);
    }
}

let mdRaw = await fs.promises.readFile(args.input, { encoding: 'utf-8', flag: 'r' });
if (args['enable-macro']) {
    const d = new Date;
    const ps20 = s => `${s}`.padStart(2, 0);
    const psname = p => {
        try {
            const f = fontkit.openSync(p);
            return (Array.isArray(f.fonts) ? f.fonts[0] : f).postscriptName;
        } catch (error) {
            return null;
        }
    };

    mdRaw = mdRaw
        .replace(/%MDCONV_VERSION%/g, require('./package.json').version)
        .replace(/%MARKDOWN_THEME%/g, args['markdown-theme'])
        .replace(/%HIGHLIGHT_THEME%/g, args['highlight-theme'])
        .replace(/%CONTENT_FONT%/g, psname(args['custom-content-font']))
        .replace(/%MONOSPACE_FONT%/g, psname(args['custom-monospace-font']))
        .replace(/%DATETIME%/g, '%DATE% %TIME%')
        .replace(/%DATE%/g, `${d.getFullYear()}-${ps20(d.getMonth() + 1)}-${ps20(d.getDate())}`)
        .replace(/%TIME%/g, `${ps20(d.getHours())}:${ps20(d.getMinutes())}:${ps20(d.getSeconds())}`);
}
const mdTokens = marked.lexer(mdRaw);
const mdParsed = marked.parser(mdTokens);
const fontToCssSrc = (/** @type {String} */ font) => /\.(tt[fc]|otf|svg|eot|woff2?)$/i.test(font)
    ? `url("file:///${path.resolve(font).replace(/\\/g, '/')}")`
    : `local("${font}")`;

let htmlContent = mustache.render(
    await fs.promises.readFile(
        path.join(__dirname, 'assets', 'template.html'),
        { encoding: 'utf-8', flag: 'r' }
    ),
    {
        katexUsed: args['math-renderer'] === 'katex' && markedCustomRenderer.mathRendered,
        customContentFont: args['custom-content-font'] ? fontToCssSrc(args['custom-content-font']) : null,
        customMonospaceFont: args['custom-monospace-font'] ? fontToCssSrc(args['custom-monospace-font']) : null,
        customStyle: args['custom-style'] ?
            await fs.promises.readFile(args['custom-style'], { encoding: 'utf-8', flag: 'r' }) :
            '',
        markdownTheme: await fs.promises.readFile(
            path.join(__dirname, 'assets', 'markdown', `${args['markdown-theme']}.css`),
            { encoding: 'utf-8', flag: 'r' }
        ),
        prismTheme: await fs.promises.readFile(
            path.join(__dirname, 'assets', 'prism', `${args['highlight-theme']}.css`),
            { encoding: 'utf-8', flag: 'r' }
        ),
        markdownContent: mdParsed,
    }
);

await Promise.all([
    ...Array.from(
        htmlContent.matchAll(
            new RegExp(`<!-- ${markedCustomRenderer.nonce} preload (\\S*?) -->`, 'g')
        )
    ).map(
        e => fetch(e[1]).then(r => r.text()).then(r => [e[0], r])
    ),
    ...Array.from(
        htmlContent.matchAll(
            new RegExp(`<!-- ${markedCustomRenderer.nonce} preload-base64 (\\S*?) -->`, 'g')
        )
    ).map(
        e => fetch(e[1]).then(r => r.arrayBuffer()).then(r => [e[0], Buffer.from(r).toString('base64')])
    ),
]).then(
    e => e.forEach(
        ([t, r]) => htmlContent = htmlContent.replaceAll(t, r)
    )
);

switch (path.parse(args.output).ext.toLowerCase()) {
    case '.htm':
    case '.html':
        await fs.promises.writeFile(args.output, htmlContent);
        break;
    case '.pdf':
        const wkhtmltopdfConfig = {
            pageSize: args['pdf-size'],
            output: args.output,
            enableLocalFileAccess: true,
        };
        if (args.proxy) wkhtmltopdfConfig.proxy = args.proxy;
        wkhtmltopdf(htmlContent, wkhtmltopdfConfig);
        break;
}

})()