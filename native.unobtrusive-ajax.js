/*!
** Unobtrusive Ajax support library with no JavaScript framework dependencies (eg. jQuery)
** By Daniel Lo Nigro
*/

(function () {
    function $(id) {
        if (!id)
            return null;
        
        if (id.charAt(0) == "#")
            return document.getElementById(id.slice(1));

        throw new Error("$ only supports IDs");
    }
    
    function show(el) {
        el.style.display = 'block';
    }
    
    function hide(el) {
        el.style.display = 'none';
    }
    
    function extend(destination, source) {
        for (var key in source || {})
        {
            if (source.hasOwnProperty(key) && !!source[key])
                destination[key] = source[key];
        }
        return destination;
    }

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
    
    function serializeForm(formEl) {
        // TODO: Add <select>s to this
        var inputEls = formEl.getElementsByTagName("input"),
            data = [],
            inputEl;
            
        for (var i = 0, count = inputEls.length; i < count; i++) {
            inputEl = inputEls[i];
            if (!inputEl.name)
                continue;
                

            data.push({ name: inputEl.name, value: inputEl.value });
        }
        
        return data;
    }
    
    function serializeData(data) {
        var result = [],
        	data = data || [];

        for (var i = 0, count = data.length; i < count; i++)
        {
            result.push(encodeURIComponent(data[i].name) + '=' + encodeURIComponent(data[i].value));
        }

        return result.join('&');
    }

    var getXHR = (function() {
        // W3C
        if (window.XMLHttpRequest) {
            return function() {
                return new XMLHttpRequest();
            };
        }
        // Internet Explorer
        // Reference: http://blogs.msdn.com/b/xmlteam/archive/2006/10/23/using-the-right-version-of-msxml-in-internet-explorer.aspx
        else if (window.ActiveXObject) {
            return function() {
                try { return new ActiveXObject("Msxml2.XMLHTTP.6.0"); } catch(e) { }
                try { return new ActiveXObject("Msxml2.XMLHTTP.3.0"); } catch(e) { }
                try { return new ActiveXObject("Microsoft.XMLHTTP"); } catch(e) { }

                alert('Could not create AJAX requester!');
            };
        }
    })();
    
    function ajax(options) {
        var xhr = getXHR();
        xhr.open(options.type, options.url, true);
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        if (options.type == 'post')
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        
        xhr.onreadystatechange = function() {
            // readyState 4 == complete
            if (xhr.readyState == 4) {
                options.complete();
                if (xhr.status === 200)
                    options.success(xhr.responseText, xhr.status, xhr);
                else
                    options.error(xhr, xhr.status, xhr.responseText);
            }
        };
        
        options.beforeSend(xhr);
        xhr.send(serializeData(options.data));
    }

    function asyncOnBeforeSend(xhr, method) {
        if (!isMethodProxySafe(method)) {
            xhr.setRequestHeader("X-HTTP-Method-Override", method);
        }
    }

    function asyncOnSuccess(element, data, contentType) {
        var mode, update, top, newContent;

        mode = (element.getAttribute("data-ajax-mode") || "").toUpperCase();
        update = $(element.getAttribute("data-ajax-update"));

        switch (mode) {
        case "BEFORE":
            top = update.firstChild;
            newContent = document.createElement("div");
            newContent.innerHTML = data;
            while (newContent.firstChild) {
                update.insertBefore(newContent.firstChild, top);
            }
            break;
        case "AFTER":
            newContent = document.createElement("div");
            newContent.innerHTML = data;
            while (newContent.firstChild) {
                update.appendChild(newContent.firstChild);
            }
            break;
        default:
            update.innerHTML = data;
            break;
        }
    }

    function asyncRequest(element, options) {
        var confirm, loading, method, duration;

        confirm = element.getAttribute("data-ajax-confirm");
        if (confirm && !window.confirm(confirm)) {
            return;
        }

        loading = $(element.getAttribute("data-ajax-loading"));
        duration = element.getAttribute("data-ajax-loading-duration") || 0;

        extend(options, {
            type: element.getAttribute("data-ajax-method") || undefined,
            url: element.getAttribute("data-ajax-url") || undefined,
            beforeSend: function (xhr) {
                var result;
                asyncOnBeforeSend(xhr, method);
                result = getFunction(element.getAttribute("data-ajax-begin"), ["xhr"]).apply(this, arguments);
                if (result !== false && loading) {
                    show(loading);
                }
                return result;
            },
            complete: function () {
                if (loading)
                    hide(loading);
                getFunction(element.getAttribute("data-ajax-complete"), ["xhr", "status"]).apply(this, arguments);
            },
            success: function (data, status, xhr) {
                asyncOnSuccess(element, data, xhr.getResponseHeader("Content-Type") || "text/html");
                getFunction(element.getAttribute("data-ajax-success"), ["data", "status", "xhr"]).apply(this, arguments);
            },
            error: getFunction(element.getAttribute("data-ajax-failure"), ["xhr", "status", "error"])
        });

        options.data.push({ name: "X-Requested-With", value: "XMLHttpRequest" });

        method = options.type.toUpperCase();
        if (!isMethodProxySafe(method)) {
            options.type = "POST";
            options.data.push({ name: "X-HTTP-Method-Override", value: method });
        }

        ajax(options);
    }
    
    // TODO: Use an addEventListener/attachEvent wrapper function for old IE compat
    // Delegate all clicks
    document.body.addEventListener("click", function (evt) {
    	// Ensure the click was on an AJAX link
        if (evt.target.nodeName.toUpperCase() === "A" && evt.target.getAttribute("data-ajax") === "true") {
            evt.preventDefault();
            asyncRequest(evt.target, {
                url: evt.target.href,
                type: "GET",
                data: []
            }); 
        }
    }, false);
    
    // Delegate all submit events
    document.body.addEventListener("submit", function (evt) {
    	// Ensure an AJAX form was submitted
        if (evt.target.nodeName.toUpperCase() !== "FORM" || evt.target.getAttribute("data-ajax") !== "true") {
            return;
        }
        
        evt.preventDefault();
        
        asyncRequest(evt.target, {
            url: evt.target.action,
            type: evt.target.method || "GET",
            data: serializeForm(evt.target) // TODO: clickInfo of button that was pressed to submit form
        }); 
    }, false);
}());
