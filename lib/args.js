const fs = require('fs');
const path = require('path');
const yargs = require('yargs');

const package = require('../package.json');

module.exports = yargs
    .epilog([
        `${package.name} ${package.version}`,
        package.description,
        'Source: https://github.com/TransparentLC/mdconv',
    ].join('\n'))
    .option('input', {
        alias: 'i',
    })
    .option('output', {
        alias: 'o',
    })
    .option('markdown-theme', {
        alias: 'mt',
        default: 'github',
        choices: fs.readdirSync(path.join(__dirname, '..', 'assets', 'markdown')).map(e => path.parse(e).name),
    })
    .option('highlight-theme', {
        alias: 'ht',
        default: 'github',
        choices: fs.readdirSync(path.join(__dirname, '..', 'assets', 'prism')).map(e => path.parse(e).name),
    })
    .option('custom-content-font', {
        alias: 'cf',
    })
    .option('custom-monospace-font', {
        alias: 'mf',
    })
    .option('math-renderer', {
        alias: 'mr',
        default: 'katex',
        choices: [
            'katex',
            'api-zhihu',
            'api-jianshu',
            'api-math',
            'api-codecogs',
            'api-zhihu-preload',
            'api-jianshu-preload',
            'api-math-preload',
            'api-codecogs-preload',
        ],
    })
    .option('pdf-size', {
        alias: 's',
        default: 'A4',
        choices: [
            'A1', 'A2', 'A3', 'A4', 'A5',
            'A6', 'A7', 'A8', 'A9',
            'B0', 'B1', 'B2', 'B3', 'B4',
            'B5', 'B6', 'B7', 'B8', 'B9',
            'B10',
            'C5E', 'Comm10E', 'DLE', 'Executive', 'Folio',
            'Ledger', 'Legal', 'Letter', 'Tabloid',
        ],
    })
    .option('custom-style', {
        default: '',
        string: true,
    })
    .option('proxy')
    .option('enable-macro', {
        default: false,
        boolean: true,
    })
    .option('show-fonts', {
        default: false,
        boolean: true,
    })
    .check(args => {
        if (args['show-fonts']) {
            return true;
        }
        if (!args.input || !args.output) {
            throw new Error('Input and output files are required!');
        }
        if (!['.htm', '.html', '.pdf'].includes(path.parse(args.output).ext.toLowerCase())) {
            throw new Error('Output file must be HTML or PDF!');
        }

        return true;
    })
    .argv;