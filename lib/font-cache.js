const crypto = require('crypto');
const fontkit = require('fontkit');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { promisify } = require('util');
const zlib = require('zlib');

module.exports = (async () => {

const fontCache = {};

if (process.platform === 'win32') {
    const fontPaths = (await fs.promises.readdir(
        path.join(process.env.windir, 'fonts'))
    ).map(e => path.join(process.env.windir, 'fonts', e));
    const fontPathsHash = crypto
        .createHash('sha256')
        .update(JSON.stringify(fontPaths))
        .digest()
        .toString('hex');
    const fontCachePath = path.join(os.tmpdir(), `mdconv-font-cache-${fontPathsHash}`);

    try {
        Object.assign(
            fontCache,
            JSON.parse(
                await promisify(zlib.brotliDecompress)(
                    await fs.promises.readFile(fontCachePath)
                )
            ),
        );
    } catch (error) {
        /**
         * @param {fontkit.Font} f
         * @returns {Set<String>}
         */
        const getFontName = f => {
            /** @type {Set<String>} */
            const result = new Set;
            result.add(f.postscriptName);

            const record = f.name.records;
            for (const locale of Object.keys(record.fontFamily)) {
                const recordLocale = Object.fromEntries([
                    'fontFamily',
                    'fontSubfamily',
                    'preferredFamily',
                    'preferredSubfamily',
                    'fullName'
                ].map(k => [k, (record[k] && typeof record[k][locale] === 'string') ? record[k][locale] : undefined]));

                if (recordLocale.fontFamily && recordLocale.fontSubfamily) {
                    result.add(`${recordLocale.fontFamily} ${recordLocale.fontSubfamily}`)
                }
                if (recordLocale.preferredFamily && recordLocale.preferredSubfamily) {
                    result.add(`${recordLocale.preferredFamily} ${recordLocale.preferredSubfamily}`)
                }
                if (recordLocale.fullName) {
                    result.add(recordLocale.fullName);
                }
            }
            return result;
        };

        let counter = 0;
        for (const f of fontPaths) {
            counter++;
            process.stderr.write(`\rCaching font names and paths, please wait. (${counter}/${fontPaths.length} ${(counter / fontPaths.length * 100).toFixed(2)}%)`);
            try {
                const font = await promisify(fontkit.open)(f);
                if (Array.isArray(font.fonts)) {
                    font.fonts.forEach(e => Array.from(getFontName(e)).forEach(t => fontCache[t] = f));
                } else {
                    Array.from(getFontName(font)).forEach(t => fontCache[t] = f);
                }
            } catch (error) {
                // console.log(error);
            }
        }
        process.stderr.write('\n');

        await fs.promises.writeFile(
            fontCachePath,
            await promisify(zlib.brotliCompress)(
                JSON.stringify(fontCache),
                {
                    [zlib.constants.BROTLI_PARAM_QUALITY]: zlib.constants.BROTLI_MAX_QUALITY,
                }
            )
        );
    }
}

return fontCache;

})()