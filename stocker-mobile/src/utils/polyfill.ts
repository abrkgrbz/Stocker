
// Minimal Polyfill for TextEncoder/TextDecoder required by SignalR
// Since we cannot easily install packages, we inline a basic implementation

if (typeof TextEncoder === 'undefined') {
    const TextEncoderPolyfill = class TextEncoder {
        encoding = 'utf-8';
        encode(input: string) {
            let i = 0, len = input.length;
            let res = [];
            for (i = 0; i < len; i++) {
                let code = input.charCodeAt(i);
                if (code < 0x80) {
                    res.push(code);
                } else if (code < 0x800) {
                    res.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
                } else if (code < 0xd800 || code >= 0xe000) {
                    res.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
                } else {
                    i++;
                    code = 0x10000 + (((code & 0x3ff) << 10) | (input.charCodeAt(i) & 0x3ff));
                    res.push(
                        0xf0 | (code >> 18),
                        0x80 | ((code >> 12) & 0x3f),
                        0x80 | ((code >> 6) & 0x3f),
                        0x80 | (code & 0x3f)
                    );
                }
            }
            return new Uint8Array(res);
        }
    } as any;

    if (typeof global !== 'undefined') global.TextEncoder = TextEncoderPolyfill;
    if (typeof window !== 'undefined') window.TextEncoder = TextEncoderPolyfill;
    if (typeof self !== 'undefined') self.TextEncoder = TextEncoderPolyfill;
}

if (typeof TextDecoder === 'undefined') {
    const TextDecoderPolyfill = class TextDecoder {
        encoding = 'utf-8';
        decode(input: Uint8Array) {
            let i = 0, len = input.length;
            let res = '';
            while (i < len) {
                let b1 = input[i++];
                if (b1 < 0x80) {
                    res += String.fromCharCode(b1);
                } else if ((b1 & 0xe0) === 0xc0) {
                    let b2 = input[i++];
                    res += String.fromCharCode(((b1 & 0x1f) << 6) | (b2 & 0x3f));
                } else if ((b1 & 0xf0) === 0xe0) {
                    let b2 = input[i++];
                    let b3 = input[i++];
                    res += String.fromCharCode(((b1 & 0x0f) << 12) | ((b2 & 0x3f) << 6) | (b3 & 0x3f));
                } else {
                    let b2 = input[i++];
                    let b3 = input[i++];
                    let b4 = input[i++];
                    let code = ((b1 & 0x07) << 18) | ((b2 & 0x3f) << 12) | ((b3 & 0x3f) << 6) | (b4 & 0x3f);
                    code -= 0x10000;
                    res += String.fromCharCode(0xd800 + (code >> 10), 0xdc00 + (code & 0x3ff));
                }
            }
            return res;
        }
    } as any;

    if (typeof global !== 'undefined') global.TextDecoder = TextDecoderPolyfill;
    if (typeof window !== 'undefined') window.TextDecoder = TextDecoderPolyfill;
    if (typeof self !== 'undefined') self.TextDecoder = TextDecoderPolyfill;
}
