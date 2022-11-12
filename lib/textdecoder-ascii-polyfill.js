try {
    new TextDecoder('ascii');
} catch {
    const TD = globalThis.TextDecoder;
    globalThis.TextDecoder = class {
        constructor(encoding, options) {
            this.td = encoding === 'ascii' ? null : new TD(encoding, options);
        }

        decode(input, options) {
            if (this.td) return this.td.decode(input, options);
            let r = '';
            for (let i = 0; i < input.length; i++) r += String.fromCharCode(input[i]);
            return r;
        }
    };
}
