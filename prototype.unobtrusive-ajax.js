/*!
** Unobtrusive Ajax support library for Prototype
** By Daniel Lo Nigro (Daniel15)
** http://github.com/Daniel15/PrototypeMvcNet
*/

(function () {
    var data_click = "unobtrusiveAjaxClick",
        data_validation = "unobtrusiveValidation";

    function getFunction(code, argNames) {
        var fn = window, parts = (code || "").split(".");
        while (fn && parts.length) {
            fn = fn[parts.shift()];
        }
        if (typeof (fn) === "function") {
            return fn;
        }
        argNames.push(code);
        return Function.constructor.apply(null, argNames);
    }

    function isMethodProxySafe(method) {
        return method === "GET" || method === "POST";
    }

    function asyncOnBeforeSend(xhr, method) {
        if (!isMethodProxySafe(method)) {
            xhr.setRequestHeader("X-HTTP-Method-Override", method);
        }
    }

    function asyncOnSuccess(element, data, contentType) {
        var mode;

        if (contentType.indexOf("application/x-javascript") !== -1) {  // Prototype already executes JavaScript for us
            return;
        }

        mode = (element.getAttribute("data-ajax-mode") || "").toUpperCase();

        $$(element.getAttribute("data-ajax-update")).each(function (el) {
            switch (mode) {
            case "BEFORE":
                el.insert({ top: data });
                break;
            case "AFTER":
                el.insert({ bottom: data });
                break;
            default:
                el.update(data);
                break;
            }
        });
    }

    function asyncRequest(element, options) {
        var confirm, loading, method, duration;

        confirm = element.getAttribute("data-ajax-confirm");
        if (confirm && !window.confirm(confirm)) {
            return;
        }

        loading = $$(element.getAttribute("data-ajax-loading"));
        loading = loading.length > 0 ? loading[0] : null;
        
        // TODO: Duration for hide/show not supported unless Scriptaculous loaded.
        // TODO: Implement duration using Scriptaculous
        duration = element.getAttribute("data-ajax-loading-duration") || 0;

        Object.extend(options, {
            method: element.getAttribute("data-ajax-method") || options.method,
            url: element.getAttribute("data-ajax-url") || options.url,
            onLoading: function (transport) {
                var result;
                asyncOnBeforeSend(transport.xhr, method);
                result = getFunction(element.getAttribute("data-ajax-begin"), ["xhr"]).apply(this, arguments);
                if (result !== false && loading) {
                    loading.show();
                }
                return result;
            },
            onComplete: function () {
                if (loading)
                    loading.hide();
                getFunction(element.getAttribute("data-ajax-complete"), ["xhr", "status"]).apply(this, arguments);
            },
            onSuccess: function (response) {
                asyncOnSuccess(element, response.responseText, response.transport.getResponseHeader("Content-Type") || "text/html");
                getFunction(element.getAttribute("data-ajax-success"), ["data", "status", "xhr"]).apply(this, arguments);
            },
            onFailure: getFunction(element.getAttribute("data-ajax-failure"), ["xhr", "status", "error"])
        });

        options.parameters["X-Requested-With"] =  "XMLHttpRequest";

        method = options.method.toUpperCase();
        if (!isMethodProxySafe(method)) {
            options.method = "POST";
            options.parameters.push({ name: "X-HTTP-Method-Override", value: method });
        }

        new Ajax.Request(options.url, options);
    }

    function validate(form) {
        var validationInfo = form.retrieve(data_validation);
        return !validationInfo || !validationInfo.validate || validationInfo.validate();
    }

    document.on("click", "a[data-ajax=true]", function (evt) {
        evt.stop();
        var el = evt.element();
        asyncRequest(el, {
            url: el.href,
            method: "GET",
            parameters: {}
        });
    });

    document.on("click", "form[data-ajax=true] input[type=image]", function (evt) {
        var buttonEl = evt.element(),
            name = buttonEl.name,
            form = buttonEl.up('form'),
            data = {};

        data[name + ".x"] = evt.offsetX;
        data[name + ".y"] = evt.offsetY;

        form.store(data_click, data);

        setTimeout(function () {
            $(form).store(data_click, null);
        }, 0);
    });

    document.on("click", "form[data-ajax=true] :submit", function (evt) {
        var buttonEl = evt.element(),
            name = buttonEl.name,
            form = buttonEl.up('form'),
            data = {};

        if (name)
            data[name] = buttonEl.value;
            
        form.store(data_click, data);

        setTimeout(function () {
            form.store(data_click, null);
        }, 0);
    });

    document.on("submit", "form[data-ajax=true]", function (evt) {
        var el = evt.element(),
            clickInfo = el.retrieve(data_click) || [];
        evt.stop();
        if (!validate(el)) {
            return;
        }

        asyncRequest(el, {
            url: el.action,
            method: el.method || "GET",
            parameters: Object.extend(clickInfo, el.serialize(true))
        });
    });
}());
