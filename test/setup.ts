import jsdom from 'jsdom'
// console.warn('jsdom=', jsdom);

// export default function setup(markup?: string) {
    // @ts-ignore
    // global.document = new jsdom.JSDOM(markup || '<!doctype html><html><body></body></html>');
    // @ts-ignore
    // global.window = document.window;
/*     global.window.addEventListener('error', e => {
        e.preventDefault();
    });
 */
// }
global.dom = new jsdom.JSDOM('<!doctype html><html><body></body></html>');
global.window = global.dom.window;
global.document = global.dom.window.document;
global.navigator = global.window.navigator;
