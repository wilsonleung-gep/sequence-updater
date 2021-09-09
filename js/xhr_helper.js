/*global YUI */
YUI.add("xhrHelper",
    function(Y) {
        "use strict";

        var xhrHelper = function(cfg) {
            cfg = cfg || {};

            var GEP = Y.GEP,
                HTTP_OK_CODE = 200,
                SUCCESS_STATUS = "success",
                prefix = cfg.prefix || null;

            function fireEvent(eventName, obj) {
                if (prefix !== null) {
                    eventName = prefix + ":" + eventName;
                }

                Y.fire(eventName, obj);
            }

            function onCompleted(id, o, args) {
                if (o.status !== HTTP_OK_CODE) {
                    fireEvent("xhrerror", {
                        transaction: { id: id, args: args },
                        message: ["Web service error: ",
                            o.statusText + " (" + o.status + ")"]
                    });
                }
            }

            function onSuccess(id, o, args) {
                var jsonResponse,
                    status,
                    errorMessage,
                    results;

                try {
                    if ((!o) || (!o.responseText)) {
                        throw new Error("JSON.parse: Invalid response from web service");
                    }

                    jsonResponse = Y.JSON.parse(o.responseText);
                    status = jsonResponse.status || "error";

                    if (status !== SUCCESS_STATUS) {
                        throw new Error(jsonResponse.message);
                    }

                    results = jsonResponse.result;

                    if (! Y.Lang.isObject(results)) {
                        throw new Error("Invalid response from web service: " + results);
                    }

                    results.transaction = results.transaction || { id: id, args: args };

                    fireEvent("xhrresult", results);

                } catch (error) {
                    errorMessage = error.message;

                    if ((errorMessage.indexOf("JSON") === 0) ||
                        (errorMessage.indexOf("Syntax error") === 0) ||
                        (errorMessage.indexOf("Invalid character") === 0) ||
                        (errorMessage.indexOf("Unexpected token") === 0)) {

                        results = o;

                        if (Y.Lang.isObject(o)) {
                            results = o.responseText;
                        }

                        error.message = "Invalid response from web service: " + results;
                    }

                    fireEvent("xhrerror", {
                        message: error.message,
                        transaction: { id: id, args: args }
                    });
                }
            }

            function onFailure(id, o, args) {
                fireEvent("xhrerror", {
                    message: o.responseText,
                    transaction: { id: id, args: args }
                });
            }

            return GEP.util.mergeSettings(cfg, {
                method: "POST",
                on: {
                    complete: onCompleted,
                    success: onSuccess,
                    failure: onFailure
                }
            });
        };

        Y.GEP.xhrHelper = xhrHelper;
    }
    , "0.0.1", {
        requires: ["gep", "json", "event"]
    });
