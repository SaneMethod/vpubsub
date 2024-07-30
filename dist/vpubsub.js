import { isFunction, uniqueId, isPlainObject } from 'lodash-es';

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
