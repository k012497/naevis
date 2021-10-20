
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.43.1' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/components/Header.svelte generated by Svelte v3.43.1 */

    const file$5 = "src/components/Header.svelte";

    function create_fragment$6(ctx) {
    	let header;
    	let nav;
    	let ul;
    	let li;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			header = element("header");
    			nav = element("nav");
    			ul = element("ul");
    			li = element("li");
    			li.textContent = "🏠";
    			attr_dev(li, "class", "svelte-ox7gtf");
    			add_location(li, file$5, 6, 8, 95);
    			attr_dev(ul, "class", "svelte-ox7gtf");
    			add_location(ul, file$5, 5, 6, 82);
    			attr_dev(nav, "class", "svelte-ox7gtf");
    			add_location(nav, file$5, 4, 4, 70);
    			attr_dev(header, "class", "svelte-ox7gtf");
    			add_location(header, file$5, 3, 0, 57);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, nav);
    			append_dev(nav, ul);
    			append_dev(ul, li);

    			if (!mounted) {
    				dispose = listen_dev(
    					li,
    					"click",
    					function () {
    						if (is_function(/*goToHomeSection*/ ctx[0])) /*goToHomeSection*/ ctx[0].apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Header', slots, []);
    	let { goToHomeSection } = $$props;
    	const writable_props = ['goToHomeSection'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('goToHomeSection' in $$props) $$invalidate(0, goToHomeSection = $$props.goToHomeSection);
    	};

    	$$self.$capture_state = () => ({ goToHomeSection });

    	$$self.$inject_state = $$props => {
    		if ('goToHomeSection' in $$props) $$invalidate(0, goToHomeSection = $$props.goToHomeSection);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [goToHomeSection];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { goToHomeSection: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*goToHomeSection*/ ctx[0] === undefined && !('goToHomeSection' in props)) {
    			console.warn("<Header> was created without expected prop 'goToHomeSection'");
    		}
    	}

    	get goToHomeSection() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set goToHomeSection(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Contact.svelte generated by Svelte v3.43.1 */

    const file$4 = "src/components/Contact.svelte";

    function create_fragment$5(ctx) {
    	let div1;
    	let div0;
    	let a;
    	let img0;
    	let img0_src_value;
    	let t;
    	let img1;
    	let img1_src_value;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			a = element("a");
    			img0 = element("img");
    			t = space();
    			img1 = element("img");
    			attr_dev(img0, "class", "hand svelte-dtug4v");
    			if (!src_url_equal(img0.src, img0_src_value = "./assets/3d-hand.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "3d-hand");
    			add_location(img0, file$4, 6, 6, 137);
    			attr_dev(img1, "class", "envelope svelte-dtug4v");
    			if (!src_url_equal(img1.src, img1_src_value = "./assets/letter-envelope.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "letter-envelope");
    			add_location(img1, file$4, 7, 6, 205);
    			attr_dev(a, "href", "mailto: kim.sojin.dev@gmail.com");
    			attr_dev(a, "class", "svelte-dtug4v");
    			add_location(a, file$4, 5, 4, 88);
    			attr_dev(div0, "class", "floating-object svelte-dtug4v");
    			add_location(div0, file$4, 4, 2, 54);
    			attr_dev(div1, "class", "contact svelte-dtug4v");
    			add_location(div1, file$4, 3, 0, 30);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, a);
    			append_dev(a, img0);
    			append_dev(a, t);
    			append_dev(a, img1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Contact', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Contact> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Contact extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Contact",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/components/Home.svelte generated by Svelte v3.43.1 */

    const { console: console_1 } = globals;
    const file$3 = "src/components/Home.svelte";

    function create_fragment$4(ctx) {
    	let section;
    	let div2;
    	let div1;
    	let a;
    	let figure0;
    	let div0;
    	let t1;
    	let figure1;
    	let span0;
    	let t3;
    	let img0;
    	let img0_src_value;
    	let t4;
    	let figure2;
    	let img1;
    	let img1_src_value;
    	let t5;
    	let figure3;
    	let img2;
    	let img2_src_value;
    	let t6;
    	let figure4;
    	let img3;
    	let img3_src_value;
    	let t7;
    	let span1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			section = element("section");
    			div2 = element("div");
    			div1 = element("div");
    			a = element("a");
    			figure0 = element("figure");
    			div0 = element("div");
    			div0.textContent = "WWW";
    			t1 = space();
    			figure1 = element("figure");
    			span0 = element("span");
    			span0.textContent = "contact";
    			t3 = space();
    			img0 = element("img");
    			t4 = space();
    			figure2 = element("figure");
    			img1 = element("img");
    			t5 = space();
    			figure3 = element("figure");
    			img2 = element("img");
    			t6 = space();
    			figure4 = element("figure");
    			img3 = element("img");
    			t7 = space();
    			span1 = element("span");
    			span1.textContent = "project";
    			add_location(div0, file$3, 35, 10, 1090);
    			attr_dev(figure0, "class", "floating-object title svelte-1bc6ndf");
    			add_location(figure0, file$3, 34, 8, 1041);
    			attr_dev(a, "href", "https://www.github.com/k012497");
    			attr_dev(a, "target", "blank");
    			attr_dev(a, "class", "svelte-1bc6ndf");
    			add_location(a, file$3, 33, 6, 976);
    			attr_dev(span0, "class", "svelte-1bc6ndf");
    			add_location(span0, file$3, 39, 8, 1218);
    			if (!src_url_equal(img0.src, img0_src_value = "./assets/person.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "person");
    			attr_dev(img0, "class", "svelte-1bc6ndf");
    			add_location(img0, file$3, 40, 8, 1247);
    			attr_dev(figure1, "class", "floating-object person svelte-1bc6ndf");
    			add_location(figure1, file$3, 38, 6, 1140);
    			if (!src_url_equal(img1.src, img1_src_value = "./assets/star.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "star");
    			attr_dev(img1, "class", "svelte-1bc6ndf");
    			add_location(img1, file$3, 43, 8, 1399);
    			attr_dev(figure2, "class", "floating-object star svelte-1bc6ndf");
    			add_location(figure2, file$3, 42, 6, 1314);
    			if (!src_url_equal(img2.src, img2_src_value = "./assets/plant.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "plant");
    			attr_dev(img2, "class", "svelte-1bc6ndf");
    			add_location(img2, file$3, 46, 8, 1549);
    			attr_dev(figure3, "class", "floating-object plant svelte-1bc6ndf");
    			add_location(figure3, file$3, 45, 6, 1462);
    			if (!src_url_equal(img3.src, img3_src_value = "./assets/computer.png")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "computer");
    			attr_dev(img3, "class", "svelte-1bc6ndf");
    			add_location(img3, file$3, 49, 8, 1694);
    			attr_dev(span1, "class", "svelte-1bc6ndf");
    			add_location(span1, file$3, 50, 10, 1753);
    			attr_dev(figure4, "class", "floating-object computer svelte-1bc6ndf");
    			add_location(figure4, file$3, 48, 6, 1614);
    			attr_dev(div1, "class", "universe-surface svelte-1bc6ndf");
    			add_location(div1, file$3, 32, 4, 939);
    			attr_dev(div2, "class", "universe-container svelte-1bc6ndf");
    			add_location(div2, file$3, 31, 2, 902);
    			add_location(section, file$3, 30, 0, 890);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div2);
    			append_dev(div2, div1);
    			append_dev(div1, a);
    			append_dev(a, figure0);
    			append_dev(figure0, div0);
    			append_dev(div1, t1);
    			append_dev(div1, figure1);
    			append_dev(figure1, span0);
    			append_dev(figure1, t3);
    			append_dev(figure1, img0);
    			append_dev(div1, t4);
    			append_dev(div1, figure2);
    			append_dev(figure2, img1);
    			append_dev(div1, t5);
    			append_dev(div1, figure3);
    			append_dev(figure3, img2);
    			append_dev(div1, t6);
    			append_dev(div1, figure4);
    			append_dev(figure4, img3);
    			append_dev(figure4, t7);
    			append_dev(figure4, span1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(
    						figure1,
    						"click",
    						function () {
    							if (is_function(/*goToContactSection*/ ctx[0])) /*goToContactSection*/ ctx[0].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(figure2, "click", /*click_handler*/ ctx[2], false, false, false),
    					listen_dev(figure3, "click", /*click_handler_1*/ ctx[3], false, false, false),
    					listen_dev(
    						figure4,
    						"click",
    						function () {
    							if (is_function(/*goToProjectSection*/ ctx[1])) /*goToProjectSection*/ ctx[1].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Home', slots, []);
    	const screenWidth = window.innerWidth;
    	const screenHeight = window.innerHeight;
    	let universeSurface;
    	let { goToContactSection } = $$props;
    	let { goToProjectSection } = $$props;

    	const onMouseMove = e => {
    		if (universeSurface) {
    			const moveX = screenWidth / 2 - e.clientX;
    			const moveY = screenHeight / 2 - e.clientY;
    			const degX = moveY / 30;
    			const degY = moveX / 30;
    			universeSurface.style.transform = `rotateX(${degX}deg) rotateY(${degY}deg)`;
    		}
    	};

    	function bindEvents() {
    		document.addEventListener('mousemove', onMouseMove);
    	}

    	function unbindEvents() {
    		document.removeEventListener('mousemove', onMouseMove);
    	}

    	onMount(async () => {
    		universeSurface = document.querySelector('.universe-surface');
    		bindEvents();
    	});

    	onDestroy(async () => {
    		unbindEvents();
    	});

    	const writable_props = ['goToContactSection', 'goToProjectSection'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		console.log('star');
    	};

    	const click_handler_1 = () => {
    		console.log('plant');
    	};

    	$$self.$$set = $$props => {
    		if ('goToContactSection' in $$props) $$invalidate(0, goToContactSection = $$props.goToContactSection);
    		if ('goToProjectSection' in $$props) $$invalidate(1, goToProjectSection = $$props.goToProjectSection);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		onDestroy,
    		screenWidth,
    		screenHeight,
    		universeSurface,
    		goToContactSection,
    		goToProjectSection,
    		onMouseMove,
    		bindEvents,
    		unbindEvents
    	});

    	$$self.$inject_state = $$props => {
    		if ('universeSurface' in $$props) universeSurface = $$props.universeSurface;
    		if ('goToContactSection' in $$props) $$invalidate(0, goToContactSection = $$props.goToContactSection);
    		if ('goToProjectSection' in $$props) $$invalidate(1, goToProjectSection = $$props.goToProjectSection);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [goToContactSection, goToProjectSection, click_handler, click_handler_1];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			goToContactSection: 0,
    			goToProjectSection: 1
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*goToContactSection*/ ctx[0] === undefined && !('goToContactSection' in props)) {
    			console_1.warn("<Home> was created without expected prop 'goToContactSection'");
    		}

    		if (/*goToProjectSection*/ ctx[1] === undefined && !('goToProjectSection' in props)) {
    			console_1.warn("<Home> was created without expected prop 'goToProjectSection'");
    		}
    	}

    	get goToContactSection() {
    		throw new Error("<Home>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set goToContactSection(value) {
    		throw new Error("<Home>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get goToProjectSection() {
    		throw new Error("<Home>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set goToProjectSection(value) {
    		throw new Error("<Home>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/ProjectItem.svelte generated by Svelte v3.43.1 */

    const file$2 = "src/components/ProjectItem.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    // (11:4) {#each images as image}
    function create_each_block_1(ctx) {
    	let img;
    	let img_src_value;
    	let img_alt_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = `/assets/projects/${/*image*/ ctx[7]}.png`)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*image*/ ctx[7]);
    			attr_dev(img, "class", "svelte-1sd4gpb");
    			add_location(img, file$2, 11, 4, 258);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*images*/ 4 && !src_url_equal(img.src, img_src_value = `/assets/projects/${/*image*/ ctx[7]}.png`)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*images*/ 4 && img_alt_value !== (img_alt_value = /*image*/ ctx[7])) {
    				attr_dev(img, "alt", img_alt_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(11:4) {#each images as image}",
    		ctx
    	});

    	return block;
    }

    // (15:2) {#each tags as tag}
    function create_each_block(ctx) {
    	let div;
    	let t_value = /*tag*/ ctx[4] + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "tag svelte-1sd4gpb");
    			add_location(div, file$2, 15, 2, 360);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*tags*/ 2 && t_value !== (t_value = /*tag*/ ctx[4] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(15:2) {#each tags as tag}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div2;
    	let div0;
    	let t0;
    	let t1;
    	let div1;
    	let t2;
    	let each_value_1 = /*images*/ ctx[2];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = /*tags*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = text(/*title*/ ctx[0]);
    			t1 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t2 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "title svelte-1sd4gpb");
    			add_location(div0, file$2, 7, 2, 129);
    			attr_dev(div1, "class", "image svelte-1sd4gpb");
    			add_location(div1, file$2, 9, 2, 206);
    			attr_dev(div2, "class", "project-item svelte-1sd4gpb");
    			add_location(div2, file$2, 6, 0, 100);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, t0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div1, null);
    			}

    			append_dev(div2, t2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*title*/ 1) set_data_dev(t0, /*title*/ ctx[0]);

    			if (dirty & /*images*/ 4) {
    				each_value_1 = /*images*/ ctx[2];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*tags*/ 2) {
    				each_value = /*tags*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div2, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ProjectItem', slots, []);
    	let { title } = $$props;
    	let { desc } = $$props;
    	let { tags } = $$props;
    	let { images } = $$props;
    	const writable_props = ['title', 'desc', 'tags', 'images'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ProjectItem> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    		if ('desc' in $$props) $$invalidate(3, desc = $$props.desc);
    		if ('tags' in $$props) $$invalidate(1, tags = $$props.tags);
    		if ('images' in $$props) $$invalidate(2, images = $$props.images);
    	};

    	$$self.$capture_state = () => ({ title, desc, tags, images });

    	$$self.$inject_state = $$props => {
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    		if ('desc' in $$props) $$invalidate(3, desc = $$props.desc);
    		if ('tags' in $$props) $$invalidate(1, tags = $$props.tags);
    		if ('images' in $$props) $$invalidate(2, images = $$props.images);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [title, tags, images, desc];
    }

    class ProjectItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { title: 0, desc: 3, tags: 1, images: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ProjectItem",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*title*/ ctx[0] === undefined && !('title' in props)) {
    			console.warn("<ProjectItem> was created without expected prop 'title'");
    		}

    		if (/*desc*/ ctx[3] === undefined && !('desc' in props)) {
    			console.warn("<ProjectItem> was created without expected prop 'desc'");
    		}

    		if (/*tags*/ ctx[1] === undefined && !('tags' in props)) {
    			console.warn("<ProjectItem> was created without expected prop 'tags'");
    		}

    		if (/*images*/ ctx[2] === undefined && !('images' in props)) {
    			console.warn("<ProjectItem> was created without expected prop 'images'");
    		}
    	}

    	get title() {
    		throw new Error("<ProjectItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<ProjectItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get desc() {
    		throw new Error("<ProjectItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set desc(value) {
    		throw new Error("<ProjectItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tags() {
    		throw new Error("<ProjectItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tags(value) {
    		throw new Error("<ProjectItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get images() {
    		throw new Error("<ProjectItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set images(value) {
    		throw new Error("<ProjectItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Project.svelte generated by Svelte v3.43.1 */
    const file$1 = "src/components/Project.svelte";

    function create_fragment$2(ctx) {
    	let div;
    	let projectitem0;
    	let t0;
    	let projectitem1;
    	let t1;
    	let projectitem2;
    	let current;

    	projectitem0 = new ProjectItem({
    			props: {
    				title: "웹 LMS 플랫폼",
    				desc: "Codi AI, ALL THAT CODING",
    				tags: ["react", "ts", "nextjs", "graphql", "apollo"],
    				images: ['codiai1', 'codiai2', 'codiai3', 'allthatcoding']
    			},
    			$$inline: true
    		});

    	projectitem1 = new ProjectItem({
    			props: {
    				title: "Blockly 기반 블록 코딩 플랫폼",
    				desc: "Code Sketch 코딩 화면(scratch), Block+ 코딩 화면 (scratch), 엔트리 커스텀 (?)",
    				tags: ["react", "ts", "redux", "graphql", "apollo"],
    				images: ['blockplus', 'codesketch1', 'codesketch2']
    			},
    			$$inline: true
    		});

    	projectitem2 = new ProjectItem({
    			props: {
    				title: "블록 코딩 응용 프로그램",
    				desc: "MODI studio 유지보수 및 모듈 통신을 통한 모듈 진단",
    				tags: ["electronjs", "cordova"],
    				images: []
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(projectitem0.$$.fragment);
    			t0 = space();
    			create_component(projectitem1.$$.fragment);
    			t1 = space();
    			create_component(projectitem2.$$.fragment);
    			attr_dev(div, "class", "project-container svelte-xqxr3x");
    			add_location(div, file$1, 3, 0, 77);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(projectitem0, div, null);
    			append_dev(div, t0);
    			mount_component(projectitem1, div, null);
    			append_dev(div, t1);
    			mount_component(projectitem2, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(projectitem0.$$.fragment, local);
    			transition_in(projectitem1.$$.fragment, local);
    			transition_in(projectitem2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(projectitem0.$$.fragment, local);
    			transition_out(projectitem1.$$.fragment, local);
    			transition_out(projectitem2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(projectitem0);
    			destroy_component(projectitem1);
    			destroy_component(projectitem2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Project', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Project> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ ProjectItem });
    	return [];
    }

    class Project extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Project",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/components/Universe.svelte generated by Svelte v3.43.1 */
    const file = "src/components/Universe.svelte";

    function create_fragment$1(ctx) {
    	let header;
    	let t0;
    	let main;
    	let div;
    	let section0;
    	let project;
    	let t1;
    	let section1;
    	let home;
    	let t2;
    	let section2;
    	let contact;
    	let current;

    	header = new Header({
    			props: {
    				goToHomeSection: /*goToHomeSection*/ ctx[2]
    			},
    			$$inline: true
    		});

    	project = new Project({ $$inline: true });

    	home = new Home({
    			props: {
    				goToProjectSection: /*goToProjectSection*/ ctx[1],
    				goToContactSection: /*goToContactSection*/ ctx[0]
    			},
    			$$inline: true
    		});

    	contact = new Contact({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(header.$$.fragment);
    			t0 = space();
    			main = element("main");
    			div = element("div");
    			section0 = element("section");
    			create_component(project.$$.fragment);
    			t1 = space();
    			section1 = element("section");
    			create_component(home.$$.fragment);
    			t2 = space();
    			section2 = element("section");
    			create_component(contact.$$.fragment);
    			attr_dev(section0, "class", "section project svelte-10zle50");
    			add_location(section0, file, 23, 4, 715);
    			attr_dev(section1, "class", "section home svelte-10zle50");
    			add_location(section1, file, 26, 4, 786);
    			attr_dev(section2, "class", "section contact svelte-10zle50");
    			add_location(section2, file, 32, 4, 954);
    			attr_dev(div, "class", "container svelte-10zle50");
    			add_location(div, file, 22, 2, 687);
    			attr_dev(main, "class", "svelte-10zle50");
    			add_location(main, file, 21, 0, 678);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(header, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, div);
    			append_dev(div, section0);
    			mount_component(project, section0, null);
    			append_dev(div, t1);
    			append_dev(div, section1);
    			mount_component(home, section1, null);
    			append_dev(div, t2);
    			append_dev(div, section2);
    			mount_component(contact, section2, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(project.$$.fragment, local);
    			transition_in(home.$$.fragment, local);
    			transition_in(contact.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(project.$$.fragment, local);
    			transition_out(home.$$.fragment, local);
    			transition_out(contact.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(header, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			destroy_component(project);
    			destroy_component(home);
    			destroy_component(contact);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Universe', slots, []);
    	let containerElem;

    	const goToContactSection = () => {
    		containerElem.style.transform = 'translateX(100%) rotate(-30deg)';
    	};

    	const goToProjectSection = () => {
    		containerElem.style.transform = 'translateX(-100%) rotate(30deg)';
    	};

    	const goToHomeSection = () => {
    		containerElem.style.transform = 'translateX(0) rotate(0)';
    	};

    	onMount(async () => {
    		containerElem = document.querySelector('.container');
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Universe> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Contact,
    		Header,
    		Home,
    		Project,
    		onMount,
    		containerElem,
    		goToContactSection,
    		goToProjectSection,
    		goToHomeSection
    	});

    	$$self.$inject_state = $$props => {
    		if ('containerElem' in $$props) containerElem = $$props.containerElem;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [goToContactSection, goToProjectSection, goToHomeSection];
    }

    class Universe extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Universe",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.43.1 */

    function create_fragment(ctx) {
    	let universe;
    	let current;
    	universe = new Universe({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(universe.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(universe, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(universe.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(universe.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(universe, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Universe });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
        target: document.body,
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
