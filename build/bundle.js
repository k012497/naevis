
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

    /* src/components/Universe.svelte generated by Svelte v3.43.1 */

    const { console: console_1 } = globals;
    const file$1 = "src/components/Universe.svelte";

    function create_fragment$1(ctx) {
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
    			add_location(div0, file$1, 32, 8, 1006);
    			attr_dev(figure0, "class", "floating-object title svelte-16wr1da");
    			add_location(figure0, file$1, 31, 4, 959);
    			attr_dev(a, "href", "https://www.github.com/k012497");
    			attr_dev(a, "target", "blank");
    			add_location(a, file$1, 30, 4, 898);
    			attr_dev(span0, "class", "svelte-16wr1da");
    			add_location(span0, file$1, 36, 6, 1137);
    			if (!src_url_equal(img0.src, img0_src_value = "./assets/person.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "person");
    			attr_dev(img0, "class", "svelte-16wr1da");
    			add_location(img0, file$1, 37, 6, 1164);
    			attr_dev(figure1, "class", "floating-object person svelte-16wr1da");
    			add_location(figure1, file$1, 35, 4, 1050);
    			if (!src_url_equal(img1.src, img1_src_value = "./assets/star.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "star");
    			attr_dev(img1, "class", "svelte-16wr1da");
    			add_location(img1, file$1, 40, 6, 1310);
    			attr_dev(figure2, "class", "floating-object star svelte-16wr1da");
    			add_location(figure2, file$1, 39, 4, 1227);
    			if (!src_url_equal(img2.src, img2_src_value = "./assets/plant.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "plant");
    			attr_dev(img2, "class", "svelte-16wr1da");
    			add_location(img2, file$1, 43, 6, 1454);
    			attr_dev(figure3, "class", "floating-object plant svelte-16wr1da");
    			add_location(figure3, file$1, 42, 4, 1369);
    			if (!src_url_equal(img3.src, img3_src_value = "./assets/computer.png")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "computer");
    			attr_dev(img3, "class", "svelte-16wr1da");
    			add_location(img3, file$1, 46, 6, 1605);
    			attr_dev(span1, "class", "svelte-16wr1da");
    			add_location(span1, file$1, 47, 8, 1662);
    			attr_dev(figure4, "class", "floating-object computer svelte-16wr1da");
    			add_location(figure4, file$1, 45, 4, 1515);
    			attr_dev(div1, "class", "universe-surface svelte-16wr1da");
    			add_location(div1, file$1, 29, 2, 863);
    			attr_dev(div2, "class", "universe-container svelte-16wr1da");
    			add_location(div2, file$1, 28, 0, 828);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
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
    					listen_dev(figure1, "click", /*click_handler*/ ctx[0], false, false, false),
    					listen_dev(figure2, "click", /*click_handler_1*/ ctx[1], false, false, false),
    					listen_dev(figure3, "click", /*click_handler_2*/ ctx[2], false, false, false),
    					listen_dev(figure4, "click", /*click_handler_3*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			mounted = false;
    			run_all(dispose);
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
    	const screenWidth = window.innerWidth;
    	const screenHeight = window.innerHeight;
    	let universeSurface;

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

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Universe> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		console.log('person');
    	};

    	const click_handler_1 = () => {
    		console.log('star');
    	};

    	const click_handler_2 = () => {
    		console.log('plant');
    	};

    	const click_handler_3 = () => {
    		console.log('project');
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		onDestroy,
    		screenWidth,
    		screenHeight,
    		universeSurface,
    		onMouseMove,
    		bindEvents,
    		unbindEvents
    	});

    	$$self.$inject_state = $$props => {
    		if ('universeSurface' in $$props) universeSurface = $$props.universeSurface;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [click_handler, click_handler_1, click_handler_2, click_handler_3];
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
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let section;
    	let universe;
    	let current;
    	universe = new Universe({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			section = element("section");
    			create_component(universe.$$.fragment);
    			add_location(section, file, 6, 1, 147);
    			add_location(main, file, 5, 0, 139);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, section);
    			mount_component(universe, section, null);
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
    			if (detaching) detach_dev(main);
    			destroy_component(universe);
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
