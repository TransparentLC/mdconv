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
    console.log(await fontCache);
    process.exit(0);
}

marked.use({ renderer: markedCustomRenderer });

const mdRaw = await fs.promises.readFile(args.input, { encoding: 'utf-8', flag: 'r' });
const mdTokens = marked.lexer(mdRaw);
const mdParsed = marked.parser(mdTokens);
const fontToCssSrc = (/** @type {String} */ font) => /\.(tt[fc]|otf|svg|eot|woff2?)$/i.test(font) ?
    `url("file:///${path.resolve(font).replace(/\\/g, '/')}")` :
    `local("${font}")`;
for (const k of ['custom-content-font', 'custom-monospace-font']) {
    if ((await fontCache)[args[k]]) {
        console.log(`Found font file for "${args[k]}": ${(await fontCache)[args[k]]}`);
        args[k] = (await fontCache)[args[k]];
    } else {
        console.log(`Can't find font file for "${args[k]}".`);
    }
}
const htmlContent = mustache.render(
    await fs.promises.readFile(
        path.join(__dirname, 'assets', 'template.html'),
        { encoding: 'utf-8', flag: 'r' }
    ),
    {
        katexUsed: markedCustomRenderer.katexUsed,
        customContentFont: fontToCssSrc(args['custom-content-font']),
        customMonospaceFont: fontToCssSrc(args['custom-monospace-font']),
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