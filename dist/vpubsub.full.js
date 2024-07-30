/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Built-in value references. */
var Symbol = root.Symbol;

/** Used for built-in method references. */
var objectProto$2 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$1 = objectProto$2.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString$1 = objectProto$2.toString;

/** Built-in value references. */
var symToStringTag$1 = Symbol ? Symbol.toStringTag : undefined;

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = hasOwnProperty$1.call(value, symToStringTag$1),
      tag = value[symToStringTag$1];

  try {
    value[symToStringTag$1] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString$1.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag$1] = tag;
    } else {
      delete value[symToStringTag$1];
    }
  }
  return result;
}

/** Used for built-in method references. */
var objectProto$1 = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto$1.toString;

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return nativeObjectToString.call(value);
}

/** `Object#toString` result references. */
var nullTag = '[object Null]',
    undefinedTag = '[object Undefined]';

/** Built-in value references. */
var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (symToStringTag && symToStringTag in Object(value))
    ? getRawTag(value)
    : objectToString(value);
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && baseGetTag(value) == symbolTag);
}

/**
 * A specialized version of `_.map` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 */
function arrayMap(array, iteratee) {
  var index = -1,
      length = array == null ? 0 : array.length,
      result = Array(length);

  while (++index < length) {
    result[index] = iteratee(array[index], index, array);
  }
  return result;
}

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0;

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol ? Symbol.prototype : undefined,
    symbolToString = symbolProto ? symbolProto.toString : undefined;

/**
 * The base implementation of `_.toString` which doesn't convert nullish
 * values to empty strings.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
function baseToString(value) {
  // Exit early for strings to avoid a performance hit in some environments.
  if (typeof value == 'string') {
    return value;
  }
  if (isArray(value)) {
    // Recursively convert values (susceptible to call stack limits).
    return arrayMap(value, baseToString) + '';
  }
  if (isSymbol(value)) {
    return symbolToString ? symbolToString.call(value) : '';
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

/** `Object#toString` result references. */
var asyncTag = '[object AsyncFunction]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    proxyTag = '[object Proxy]';

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  if (!isObject(value)) {
    return false;
  }
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 9 which returns 'object' for typed arrays and other constructors.
  var tag = baseGetTag(value);
  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
}

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

/**
 * Converts `value` to a string. An empty string is returned for `null`
 * and `undefined` values. The sign of `-0` is preserved.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 * @example
 *
 * _.toString(null);
 * // => ''
 *
 * _.toString(-0);
 * // => '-0'
 *
 * _.toString([1, 2, 3]);
 * // => '1,2,3'
 */
function toString(value) {
  return value == null ? '' : baseToString(value);
}

/** Built-in value references. */
var getPrototype = overArg(Object.getPrototypeOf, Object);

/** `Object#toString` result references. */
var objectTag = '[object Object]';

/** Used for built-in method references. */
var funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Used to infer the `Object` constructor. */
var objectCtorString = funcToString.call(Object);

/**
 * Checks if `value` is a plain object, that is, an object created by the
 * `Object` constructor or one with a `[[Prototype]]` of `null`.
 *
 * @static
 * @memberOf _
 * @since 0.8.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 * }
 *
 * _.isPlainObject(new Foo);
 * // => false
 *
 * _.isPlainObject([1, 2, 3]);
 * // => false
 *
 * _.isPlainObject({ 'x': 0, 'y': 0 });
 * // => true
 *
 * _.isPlainObject(Object.create(null));
 * // => true
 */
function isPlainObject(value) {
  if (!isObjectLike(value) || baseGetTag(value) != objectTag) {
    return false;
  }
  var proto = getPrototype(value);
  if (proto === null) {
    return true;
  }
  var Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;
  return typeof Ctor == 'function' && Ctor instanceof Ctor &&
    funcToString.call(Ctor) == objectCtorString;
}

/** Used to generate unique IDs. */
var idCounter = 0;

/**
 * Generates a unique ID. If `prefix` is given, the ID is appended to it.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Util
 * @param {string} [prefix=''] The value to prefix the ID with.
 * @returns {string} Returns the unique ID.
 * @example
 *
 * _.uniqueId('contact_');
 * // => 'contact_104'
 *
 * _.uniqueId();
 * // => '105'
 */
function uniqueId(prefix) {
  var id = ++idCounter;
  return toString(prefix) + id;
}

/**
 * Simple pub/sub broker implementation, with included support for using as a Vue 3.x plugin.
 * @author ckeefer
 */


class Vent{
    constructor(){
        this._channels = Object.create(null);
    }

    /**
     * Decompose the channel event string into channel and event.
     * A channel event pair is expected to be formatted with a period separator, e.g.: channel.event
     * Periods beyond the first are not considered separators.
     * Any event passed without an explicit channel belongs to the implicit 'default' channel.
     * @param {string} channelEvent
     * @returns {{channel: string, event: string}}
     * @static
     * @private
     */
    static _getChannelEvent(channelEvent){
        const sepIdx = channelEvent.indexOf('.');

        return {
            channel:(sepIdx !== -1) ? channelEvent.slice(0, sepIdx) : 'default',
            event:channelEvent.slice(sepIdx + 1)
        };
    }

    /**
     * Get the eventQueue for the given channel and event. If event is not specified,
     * we assume we've received a channelEvent combination, and decompose it via _getChannelEvent.
     * @param {string} channel
     * @param {string=} event
     * @returns {{eventQueue: (Array), currentChannel: ({}), event: (string)}}
     * @private
     */
    _getEventQueue(channel, event){
        if (!event){
            ({channel, event} = Vent._getChannelEvent(channel));
        }

        const currentChannel = (this._channels[channel] = this._channels[channel] ?? Object.create(null)),
            eventQueue = (currentChannel[event] = currentChannel[event] ?? []);

        return {currentChannel, event, eventQueue};
    }

    /**
     * Trigger the given event on the given channel, passing any additional arguments to the event handler.
     * Note that you can subscribe on a single event ('event' - with the implicit default channel, or 'event.channel');
     * or you can subscribe on all events for a channel ('*.channel', with '*' getting the implicit default channel),
     * or you can subscribe to all events ('*.*'). You can not, however, subscribe for a certain event on all channels
     * (e.g. 'event.*') - doing so will just subscribe you to the 'event' on the '*' channel, which is the same
     * as registering for a normal event on any channel.
     * @param {string} channelEvent
     * @param {...any} args
     */
    trigger(channelEvent, ...args){
        const {eventQueue, currentChannel} = this._getEventQueue(channelEvent);
        const cEventQueue = currentChannel['*'] ?? [];
        const {eventQueue:gEventQueue} = this._getEventQueue('*', '*');

        for (const eqh of eventQueue){
            eqh.handler(...args);
        }

        /* Special handling for our global catch-alls, '*' event and '*' channel.
         * These subscribers always receive the channelEvent as the final arg to allow disambiguation within the event.
         */
        for (const eqh of cEventQueue){
            eqh.handler(...args, channelEvent);
        }
        for (const eqh of gEventQueue){
            eqh.handler(...args, channelEvent);
        }
    }

    /**
     * Request a reply from triggering an event. Collects the results of
     * all triggered handlers via Promise.all. Always asynchronous to
     * allow for asynchronous events.
     * Note that `request` supports the same wildcard listeners as `trigger`; unlike with `trigger`,
     * all subscribers will receive the channelEvent as the final argument.
     * @param {string} channelEvent
     * @param {...any} args
     * @returns {Promise<any[]>}
     */
    request(channelEvent, ...args){
        const {eventQueue, currentChannel} = this._getEventQueue(channelEvent);
        const cEventQueue = currentChannel['*'] ?? [];
        const {eventQueue:gEventQueue} = this._getEventQueue('*', '*');

        return Promise.all((eventQueue.concat(cEventQueue).concat(gEventQueue)).map((eqh) => {
            const retVal = eqh.handler(...args, channelEvent);

            if (retVal && isFunction(retVal.then)){
                return retVal;
            }

            return Promise.resolve(retVal);
        }));
    }

    /**
     * Add a handler to a given channel and event.
     * Returns a unique token that can be used to unsubscribe from the event
     * without perturbing other subscriptions.
     * @param {string} channelEvent
     * @param {function} handler
     * @param {object=} context
     * @returns {string}
     */
    on(channelEvent, handler, context){
        const {eventQueue} = this._getEventQueue(channelEvent),
            token = uniqueId('vent-');

        if (!isFunction(handler)){
            throw new Error(`Specified handler for channelEvent ${channelEvent} must be a function.`);
        }

        eventQueue.push({handler:handler.bind(context||this), token});

        return token;
    }

    /**
     * As per on, but unsubscribing immediately before triggering the event handler, such
     * that the event handler is only triggered once by a given event.
     * @param {string} channelEvent
     * @param {function} handler
     * @param {object=} context
     * @returns {string}
     */
    once(channelEvent, handler, context){
        const token = this.on(channelEvent, () => {
            this.off(channelEvent, token);
            handler.apply(context || this, arguments);
        });
    }

    /**
     * Unsubscribe from a given channelEvent. Providing a token will remove
     * only the handler associated with that token. If no token is provided,
     * every handler in the eventQueue for the specified channel/event combination
     * will be removed.
     * @param {string} channelEvent
     * @param {string=} token
     */
    off(channelEvent, token){
        const {currentChannel, event, eventQueue} = this._getEventQueue(channelEvent);

        if (!token){
            currentChannel[event] = [];
            return;
        }

        currentChannel[event] = eventQueue.filter((queueItem) => {
            return queueItem.token !== token;
        });
    }
}

// Construct and export the vent singleton.
const vent = new Vent();

/**
 * Enable installing the Vent as a Vue plugin.
 * This enables access to $vent within Vue instances, and enables automatic
 * teardown of listeners when the vue component goes out of scope (destroyed).
 * @param app Vue App.
 */
function install(app){
    if (install.installed){ return app; }
    install.installed = true;

    app.config.globalProperties.$vent = vent;

    /**
     * On mounted, check for a `vent` object and, if present,
     * use the keys as channelEvents and the values as listener functions.
     * Store the tokens from each registration, and use them to unregister the
     * listeners on destroy.
     */
    app.mixin({
        mounted(){
            const {vent:events} = this.$options;

            if (events && isPlainObject(events)){
                const tokens = new Map();

                for (const event of Object.keys(events)){
                    // Allow for func to be a function set within the vent object directly, or a string.
                    // If a string, we expect it to be the key for a function set on the vue.
                    const func = (isFunction(events[event])) ? events[event] : this[events[event]];
                    const token = vent.on(event, func, this);
                    tokens.set(event, token);
                }

                this._ventTokens = tokens;
            }
        },
        beforeUnmount(){
            const {vent:events} = this.$options;

            if (events && this._ventTokens){
                for (const [event, token] of this._ventTokens){
                    vent.off(event, token);
                }

                delete this._ventTokens;
            }
        }
    });

    return app;
}

export { Vent, vent as default, install, vent };
