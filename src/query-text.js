import './query-text.css';
import axios from 'axios';

const Query = function (el, options) {
    if (!(/^INPUT\.text$/.test(`${el.tagName}.${el.type}`))) {
        throw new TypeError(`Element ${el.tagName}.${el.type} is invaild.`);
    }
    const { host, onInputHook } = Object.assign(this, {
        host: el,
        query: null,
        root: document.body || document.documentElement,
        onInputHook: this.onInputHook.bind(this),
        onItemClick: this.onItemClick.bind(this),
        onRootClick: this.onRootClick.bind(this)
    });
    // merge options
    this.options = Object.assign({}, {
        itemHeight: 32,
        maximum: 7,
        cache: {},
        pathname: '/',
        key: 'value',
        adapters: {
            id: cur => cur.id,
            text: cur => cur.text
        },
        callback: (ctx, cur) => {
            ctx.value = cur;
            ctx.host.value = cur.text;
        }
    }, options);
    // install input hook
    host.addEventListener('input', onInputHook);
};

Query.prototype = {
    constructor: Query,
    build: function (ar) {
        const len = ar.length;
        let { query } = this;
        if (query && !len) return this.onRootClick();
        if (!len) return;
        const height = this.options.itemHeight;
        if (!query) {
            const { host, root, onItemClick, onRootClick } = this,
                max = this.options.maximum,
                [
                    wid, hei,
                    pLeft, pRight, pTop, pBottom,
                    bLeft, bRight, bTop, bBottom
                ] = [
                    'width', 'height',
                    'paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom',
                    'borderLeftWidth', 'borderRightWidth', 'borderTopWidth', 'borderBottomWidth'
                ].map(function (cur) {
                    return parseFloat(this[cur]);
                }, getComputedStyle(host)),
                {
                    offsetParent, offsetLeft, offsetTop
                } = host;
            query = this.query = document.createElement('ul');
            query.className = 'query';
            Object.assign(query.style, {
                width: `${wid + pLeft + pRight + bLeft + bRight}px`,
                maxHeight: `${max * height}px`,
                left: `${offsetLeft}px`,
                top: `${offsetTop + hei + pTop + pBottom + bTop + bBottom}px`
            });
            query.addEventListener('click', onItemClick);
            root.addEventListener('click', onRootClick);
            offsetParent.appendChild(query);
        }
        [...query.children].reduce((ctx, cur) => (ctx.removeChild(cur)) && ctx, query);
        ar.reduce((ctx, cur) => {
            const temp = document.createElement('li');
            Object.assign(temp, {
                className: 'query-item',
                textContent: cur.text,
                'data-value': cur,
                title: cur.text
            });
            temp.style.height = `${height}px`;
            return (ctx.appendChild(temp)) && ctx;
        }, query);
    },
    destroy: function () {
        const { host, onInputHook } = this;
        host.removeEventListener('input', onInputHook);
    },
    onInputHook: async function (ev) {
        const val = ev.target.value,
            { cache, pathname, key, adapters } = this.options;
        let res = cache && cache[val];
        if (!res) {
            const { data } = await axios.get(`${pathname}?${key}=${val}&seed=${Date.now()}`);
            res = Array.isArray(data) ? data : [];
            res = res.map((cur, i, ar) => ({
                id: adapters.id(cur, i, ar), text: adapters.text(cur, i, ar)
            }));
            cache && (cache[val] = res);
        }
        this.build(res);
    },
    onItemClick: function (ev) {
        const [val, callback] = [
            ev.target['data-value'], this.options.callback
        ],
            livable = callback(this, val);
        if (livable) ev.stopPropagation();
    },
    onRootClick: function () {
        const { query, onItemClick, root, onRootClick } = this;
        query.removeEventListener('click', onItemClick);
        query.parentElement.removeChild(query);
        this.query = null;
        root.removeEventListener('click', onRootClick);
    }
};

export default Query;