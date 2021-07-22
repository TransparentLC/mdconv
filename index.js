const fs = require('fs');
const { lookpath } = require('lookpath');
const marked = require('marked');
const mustache = require('mustache');
const os = require('os');
const path = require('path');
const wkhtmltopdf = require('wkhtmltopdf');

const args = require('./lib/args');
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

marked.use({ renderer: markedCustomRenderer });

const mdRaw = await fs.promises.readFile(args.input, { encoding: 'utf-8', flag: 'r' });
const mdTokens = marked.lexer(mdRaw);
const mdParsed = marked.parser(mdTokens);
const htmlContent = mustache.render(await fs.promises.readFile(path.join(__dirname, 'assets', 'template.html'), { encoding: 'utf-8', flag: 'r' }), {
    enableKatex: args['enable-katex'],
    customFont: args['custom-font'].map(e => /\.(tt[fc]|otf|svg|eot|woff2?)$/i.test(e) ? `url("file:///${path.resolve(e).replace(/\\/g, '/')}")` : `local("${e}")`).join(','),
    customStyle: args['custom-style'] ? await fs.promises.readFile(args['custom-style'], { encoding: 'utf-8', flag: 'r' }) : '',
    markdownTheme: await fs.promises.readFile(path.join(__dirname, 'assets', 'markdown', `${args['markdown-theme']}.css`), { encoding: 'utf-8', flag: 'r' }),
    prismTheme: await fs.promises.readFile(path.join(__dirname, 'assets', 'prism', `${args['highlight-theme']}.css`), { encoding: 'utf-8', flag: 'r' }),
    markdownContent: mdParsed,
});

switch (path.parse(args.output).ext.toLowerCase()) {
    case '.htm':
    case '.html':
        await fs.promises.writeFile(args.output, htmlContent);
        break;
    case '.pdf':
        wkhtmltopdf(htmlContent, {
            pageSize: args['pdf-size'],
            output: args.output,
            enableLocalFileAccess: true,
        });
        break;
}

})()