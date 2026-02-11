# VPubSub

## Easy-to-use Pub/Sub Broker (With built-in Vue 3.x plugin support)

### What is It?

VPubSub implements the [Publish/Subscribe pattern](https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern) allowing you to `subscribe` to messages of interest, and `publish` those same messages from elsewhere within your application - your subscribers then receive these messages (via callback functions).

If you're not familiar with this pattern, it's a very flexible form of event handling. It allows communications between different components or services while keeping them decoupled - the publisher of an event never needs to know the identity of any potential subscribers, and vice-versa.

Keeping components of your application from being tightly coupled is generally good design, but you'll need to consider whether it's appropriate and helpful in your particular use-case - no tool is always the right tool, not every problem is a nail in want of a hammer. Pub/sub can become a problem in a complex application where events are coming in hot-and-heavy, because it can be difficult to track down just where any given event is coming from.

You should be careful in making events easily referenceable (e.g. don't use a bare string as your key, have a central place where all event names are visible and importable from), and opt for single-hops as often as possible (e.g. avoid having an event publication trigger a subscriber to publish another event which causes a subscriber to publish another event, etc. - instead, have a single publication trigger subscribers, without allowing the subscribers to publish their own events in turn).

If you know pub/sub is what you need, or you're considering it, read on!



### How Does It Work?

Let's look at some common and uncommon use-cases, both in general, and then including Vue - both with the [Options API](https://vuejs.org/api/#options-api), and the [Composition API](https://vuejs.org/api/#composition-api):

#### Subscribe to a single event

```js
import {vent} from "vpubsub";

const EVENTS = {
    PLAYER:{
        START:'player.start',
        END:'player.end',
    }
};

vent.on(EVENTS.PLAYER.START, (arg1, arg2, ...rst) => {
    // Do something useful with the event and arguments.
    // The arguments will be whatever was passed during the call to `trigger`.
});

// ... elsewhere in your application ...
vent.trigger(EVENTS.PLAYER.START, 'event', 'args', 40, 'or', 'as', 'many as you like',)
```

#### Subscribe to all events on a channel

Did you notice the `channel.event` structure of the event name in our example above? All events within VPubSub belong to a `channel` - a way of organizing events together. This also allows us to perform operations on a channel-basis, like subscribe to all events for that channel.

```js
import {vent} from "vpubsub";

const EVENTS = {
    PLAYER:{
        START:'player.start',
        END:'player.end',
    }
};

/**
 * Subscribers to wildcard events will receive the channelEvent as the last argument,
 * allowing for disambiguation within the handler.
 */
vent.on('*.player', (arg1, arg2, ..., channelEvent) => {
    switch(channelEvent){
        case EVENTS.PLAYER.START:
            break;
        case EVENTS.PLAYER.END:
            break;
        default:
            break;
    }
});
```

#### Subscribe to all events

While not recommended, you can add a subscriber to all events by subscribing to the wildcard `*` event on the wildcard `*` channel. This could be used for debugging events, as you'll be able to see all traffic across the bus:

```js
/**
 * As with wildcard channel events, the channelEvent will always be the last argument
 * when subscribing to all events.
 */
vent.on('*.*', (arg1, arg2, ..., channelEvent) => {
    console.log(arg1, channelEvent);
});
```

#### Requests

In addition to one-way event publishing, we can also perform two-way event *messaging* by making requests. Requests always return a promise that resolves with the responses from all subscribers.

```js
import {vent} from "vpubsub";

const EVENTS = {
    PLAYER:{
        START:'player.start',
        END:'player.end',
    }
};

vent.on(EVENTS.PLAYER.START, () => {
    // Perform some work and return a response.
    const data = {...};
    return data;
});

// ... elsewhere in your application ...

vent.request(EVENTS.PLAYER.START, async(res) => {
    // Do something useful with the response(s) from the subscriber(s).
    const [resp1] = await res;
    console.log(resp1);
});
```

The same special wildcard channel event and global wildcard that you can use with `trigger` also apply to `request`, as detailed above.



### How Does It Work With Vue?

VPubSub comes with built-in support for using it as a plugin with Vue 3. First, let's install it, and then we'll take a look at using it with the Options or Composition APIs.

#### Installation

Let's create a `plugins/vent.js` file, that looks like this:

```js
/**
 * Return our vent utility as a plugin in Vue for install.
 */

import {install} from "vpubsub";

export default install;
```

Then, in `main.js` (your Vue app's point of entry), we can use it like so:

```js
import {createApp} from 'vue';
import vent from "plugins/vent";
import App from "App.vue";

const vue = createApp(App);

vue.use(vent);
```

You can also skip creating a plugin wrapper, and use it like so:

```js
import {install as vent} from "vpubsub";
import {createApp} from 'vue';
import App from "App.vue";

const vue = createApp(App);

vue.use(vent);
```

#### Options API

When installed as a Vue plugin, VPubSub adds a new element to the Options API, the `vent` option. This should be an object similar to `methods` or `computed` in your component, that has the events as the key and *either* a direct function as the subscriber, or the name of a method in your component as a string.

You also gain access to the `vent` singleton as a globally available component property, via `$vent`; you can reference it from within any component via `this.$vent`.

For example:

```vue
<template>
	<div><!-- ...Your template contents... --></div>
</template>
<script lang="js">
const EVENTS = {
	PLAYER:{
		START:'player.start',
		END:'player.end',
	}
};

export default {
    name: "VComponent",
    props:{
    	vprop:{
    		type:Boolean,
    		default:true,
    	}
        // ... Your Props ...
    },
    vent:{
    	// Indirect binding - the named function within this component will be bound.
        [EVENTS.PLAYER.START]:'recalcPoints',
        // Direct binding - this function will be bound.
        [EVENTS.PLAYER.END](arg1, arg2){
        	// Called whenever the `EVENTS.PLAYER.END` event is triggered or requested.
        }
    },
    methods:{
    	/**
    	 * This method will be called whenever the `EVENTS.PLAYER.START` event is
    	 * triggered or requested.
    	 */
    	recalcPoints(arg1, arg2){
    		// Because the `vent` events are bound to the component, you can use
    		// this to get props, data, computed, etc. of the component.
    		console.log(this.vprop);
    	},
        /**
         * Trigger an event as a result of doing something.
         */
        doSomething(){
            this.$vent.trigger(EVENTS.PLAYER.END);
        },
        /**
         * Request replies from subscribers.
         */
        getSomething(){
            this.$vent.request(EVENTS.PLAYER.END).then((res) => {
                const [resp] = res;
                console.log(resp);
            });
        },
    },
};
</script>
```

All events specified in the `vent` object are bound to the context of the component on `mounted`, and unbound during `beforeUnmount`. This means that you can use `this` to refer to the context of the component within these functions and access `data`, `props`, computed properties, etc.; and that the listeners will be safely bound and unbound automagically for you without any need to manually subscribe or unsubscribe.

#### Composition API

Using VPubSub with the Composition API is similar to using it outside of Vue, and can be used in a `setup` script tag in single-file components.

```vue
<script setup>
    import {vent} from "vpubsub";
    import EVENTS from "events";
    
    function onStart(arg1, arg2){
        // Do something on player start.
    }
    function onStartRequest(arg1, arg2){
        // Return something player start request.
        return 42;
    }
    
    vent.on(EVENTS.PLAYER.START, onStart);
    vent.on(EVENTS.PLAYER.START, onStartRequest);
    
    vent.trigger(EVENTS.PLAYER.START, 1, 2);
    vent.request(EVENTS.PLAYER.START, 1, 2).then(async(res) => {
        const [res1, res2] = await res;
        console.log(res1, res2);
    });
</script>
```



#### What are my import options?

As for imports, you can choose between importing from `vpubsub`, which expects `lodash-es` as a peer dependency but doesn't bake in the parts it needs; or you can import from `"vpubsub/dist/vpubsub.full.js"` which bakes in just those bits of `lodash-es` that it relies on.



#### This is pretty neat! I'd like to use it in my project.

Go for it. 👍

The [License.txt](./LICENSE.txt) file contains the details - this project is licensed under the Mozilla Public License, Version 2.0.
