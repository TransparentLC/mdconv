require('./lib/textdecoder-ascii-polyfill');

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

markedCustomRenderer.mathRenderer = args['math-renderer'];
markedCustomRenderer.mathRendered = false;
marked.use({
    async: true,
    walkTokens: async token => {
        if (token.type === 'image') {
            if (token.href.match(/^https?:\/\//) && args['embed-images']) {
                const request = await fetch(token.href);
                const mime = request.headers.get('Content-Type');
                const data = Buffer.from(await request.arrayBuffer()).toString('base64').replace(/=+$/, '');
                token.href = `data:${mime};base64,${data}`;
            } else if (!token.href.match(/^https?:\/\//) && (path.parse(args.output).ext.toLowerCase() === '.pdf' || args['embed-images'])) {
                try {
                    const imagePath = path.isAbsolute(token.href) ? token.href : path.join(path.dirname(args.input), token.href);
                    let mime = '';
                    switch (path.parse(imagePath).ext.toLowerCase()) {
                        case '.jpg':
                        case '.jpeg':
                            mime = 'image/jpeg';
                            break;
                        case '.png':
                            mime = 'image/png';
                            break;
                        case '.gif':
                            mime = 'image/gif';
                            break;
                        case '.svg':
                            mime = 'image/svg+xml';
                            break;
                        case '.webp':
                            mime = 'image/webp';
                            break;
                        case '.avif':
                            mime = 'image/avif';
                            break;
                        case '.jxl':
                            mime = 'image/jxl';
                            break;
                    }
                    const data = Buffer.from(await fs.promises.readFile(imagePath, { flag: 'r' })).toString('base64').replace(/=+$/, '');
                    token.href = `data:${mime};base64,${data}`;
                } catch (error) {
                    console.log(`Can't load local image: ${token.href} (${error})`);
                }
            }
        }
    },
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
        .replaceAll('%MDCONV_VERSION%', require('./package.json').version)
        .replaceAll('%MARKDOWN_THEME%', args['markdown-theme'])
        .replaceAll('%HIGHLIGHT_THEME%', args['highlight-theme'])
        .replaceAll('%CONTENT_FONT%', psname(args['custom-content-font']))
        .replaceAll('%MONOSPACE_FONT%', psname(args['custom-monospace-font']))
        .replaceAll('%DATETIME%', '%DATE% %TIME%')
        .replaceAll('%DATE%', `${d.getFullYear()}-${ps20(d.getMonth() + 1)}-${ps20(d.getDate())}`)
        .replaceAll('%TIME%', `${ps20(d.getHours())}:${ps20(d.getMinutes())}:${ps20(d.getSeconds())}`);
}
const mdParsed = await marked.parse(mdRaw);
const fontToCssSrc = (/** @type {String} */ font) => /\.(tt[fc]|otf|svg|eot|woff2?)$/i.test(font)
    ? `url("file:///${path.resolve(font).replace(/\\/g, '/')}")`
    : `local("${font}")`;

let htmlContent = mustache.render(
    await fs.promises.readFile(
        path.join(__dirname, 'assets', 'template.mustache'),
        { encoding: 'utf-8', flag: 'r' }
    ),
    {
        katexUsed: args['math-renderer'] === 'katex' && markedCustomRenderer.mathRendered,
        mathjaxUsed: args['math-renderer'] === 'mathjax' && markedCustomRenderer.mathRendered,
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