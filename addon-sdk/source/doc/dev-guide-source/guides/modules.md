<!-- This Source Code Form is subject to the terms of the Mozilla Public
   - License, v. 2.0. If a copy of the MPL was not distributed with this
   - file, You can obtain one at http://mozilla.org/MPL/2.0/. -->

# Modules in the SDK #

[CommonJS](http://wiki.commonjs.org/wiki/CommonJS) is the underlying
infrastructure for both the SDK and the add-ons you build using the SDK.
A CommonJS module is a piece of reusable JavaScript: it exports certain
objects which are thus made available to dependent code. CommonJS defines:

* an object called `exports` which contains all the objects which a CommonJS
module wants to make available to other modules
* a function called `require` which a module can use to import the `exports`
object of another module.

![CommonJS modules](static-files/media/commonjs-modules.png)

Except for [scripts that interact directly with web content](dev-guide/guides/content-scripts/index.html),
all the JavaScript code you'll write or use when developing add-ons using
the SDK is part of a CommonJS module, including:

* [SDK modules](dev-guide/guides/modules.html#SDK Modules):
the JavaScript modules which the SDK provides, such as
[`panel`](modules/sdk/panel.html) and [page-mod](modules/sdk/page-mod.html).
* [Local modules](dev-guide/guides/modules.html#Local Modules):
each of the JavaScript files under your add-ons "lib" directory.
* [External modules](dev-guide/guides/modules.html#External Modules):
reusable modules developed and maintained outside the SDK, but usable by
SDK-based add-ons.

## SDK Modules ##

The modules supplied by the SDK are divided into two sorts:

* [High-level modules](dev-guide/high-level-apis.html) like
[`panel`](modules/sdk/panel.html) and
 [`page-mod`](modules/sdk/page-mod.html) provide relatively simple,
stable APIs for the most common add-on development tasks.
* [Low-level modules](dev-guide/low-level-apis.html) like
[`heritage`](modules/sdk/core/heritage.html) and
[`namespace`](modules/sdk/core/heritage.html) provide more
powerful functionality, and are typically less stable and more
complex.

To use SDK modules, you can pass `require()` a complete path, starting with
"sdk", to the module you want to use. For high-level modules this is just
`sdk/<module_name>`, and for low-level
modules it is `sdk/<path_to_module>/<module_name>`:

    // load the high-level "tabs" module
    var tabs = require("sdk/tabs");

    // load the low-level "uuid" module
    var uuid = require('sdk/util/uuid');

The path to specify for a low-level module is given along with the module
name itself in the title of the module's documentation page (for example,
[system/environment](modules/sdk/system/environment.html)).

Although the [SDK repository in GitHub](https://github.com/mozilla/addon-sdk)
includes copies of these modules, they are built into Firefox and by
default, when you run or build an add-on using
[`cfx run`](dev-guide/cfx-tool.html#cfx-run)
or [`cfx xpi`](dev-guide/cfx-tool.html#cfx-xpi), it is the versions of
the modules in Firefox that are used. If you need to use a different version
of the modules, you can do this by checking out the version of the SDK
that you need and passing the `-o` or
`--overload-modules` option to `cfx run` or `cfx xpi`.

## Local Modules ##

At a minimum, an SDK-based add-on consists of a single module
named `main.js`, but you can factor your add-on's code into a collection
of separate CommonJS modules. Each module is a separate file stored under your
add-on's "lib" directory, and exports the objects you want to make available
to other modules in your add-on. See the tutorial on
[creating reusable modules](dev-guide/tutorials/reusable-modules.html) for
more details.

To import a local module, specify a path relative to the importing module.

For example, the following add-on contains an additional module directly under
"lib", and other modules under subdirectories of "lib":

<ul class="tree">
  <li>my-addon
    <ul>
      <li>lib
        <ul>
          <li>main.js</li>
          <li>password-dialog.js</li>
          <li>secrets
            <ul>
              <li>hash.js</li>
            </ul>
          </li>
          <li>storage
            <ul>
              <li>password-store.js</li>
            </ul>
          </li>
        </ul>
      </li>
    </ul>
  </li>
</ul>

To import modules into `main`:

    // main.js code
    var dialog = require("./password-dialog");
    var hash = require("./secrets/hash");

To import modules into `password-store`:

    // password-store.js code
    var dialog = require("../password-dialog");
    var hash = require("../secrets/hash");

<div style="clear:both"></div>

For backwards compatibility, you may also omit the leading "`./`"
or "`../`" characters, treating the path as an absolute path from
your add-on's "lib" directory:

    var dialog = require("password-dialog");
    var hash = require("secrets/hash");

This form is not recommended for new code, because the behavior of `require`
is more complex and thus less predictable than if you specify the target
module explicitly using a relative path.

## External Modules ##

As well as using the SDK's modules and writing your own, you
can use modules that have been developed outside the SDK and made
available to other add-on authors.

There's a list of these
["community-developed modules"](https://github.com/mozilla/addon-sdk/wiki/Community-developed-modules)
in the SDK's GitHub Wiki, and to learn how to use them, see
the tutorial on
[using external modules to add menu items to Firefox](dev-guide/tutorials/adding-menus.html).

To import external modules, treat them like local modules:
copy them somewhere under your add-ons "lib" directory and
reference them with a path relative to the importing module.

For example, this add-on places external modules in a "dependencies"
directory:

<ul class="tree">
  <li>my-addon
    <ul>
      <li>lib
        <ul>
          <li>main.js</li>
          <li>dependencies
            <ul>
              <li>geolocation.js</li>
            </ul>
          </li>
        </ul>
      </li>
    </ul>
  </li>
</ul>

It can then load them in the same way it would load a local module.
For example, to load from `main`:

    // main.js code
    var geo = require("./dependencies/geolocation");

<div style="clear:both"></div>

## Freezing ##

The SDK
[freezes](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/freeze)
the `exports` object returned by `require`. So a if you import a module using
`require`, you can't change the properties of the object returned:

    self = require("sdk/self");
    // Attempting to define a new property
    // will fail, or throw an exception in strict mode
    self.foo = 1;
    // Attempting to modify an existing property
    // will fail, or throw an exception in strict mode
    self.data = "foo";
