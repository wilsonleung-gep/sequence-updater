/*global YUI */
YUI.add("validationStatus",
    function (Y) {
        "use strict";

        var ValidationStatus = Y.Base.create("validationStatus", Y.Model, [], {
            initializer: function () {
                this.set("errors", []);

                if (this.get("label") === "") {
                    this.set("label", this.get("name"));
                }
            },
            addError: function (msg) {
                if (Y.Lang.isString(msg)) {
                    this.get("errors").push(msg);
                    return;
                }

                if (!Y.Lang.isArray(msg)) {
                    throw new TypeError(
                        "Error messages must be either an array or a string");
                }

                Y.Array.each(msg, function (e) {
                    this.get("errors").push(e);
                }, this);
            },
            hasErrors: function () {
                return (this.get("errors").length > 0);
            },
            getErrorMessages: function () {
                return this.get("errors").join("\n");
            },
            reset: function () {
                this.setAttrs({
                    errors: [],
                    value: ""
                });
            }
        }, {
            ATTRS: {
                name: {
                    value: ""
                },
                label: {
                    value: ""
                },
                errors: {
                    value: []
                },
                value: {
                    value: ""
                }
            }
        });

        Y.GEP.ValidationStatus = ValidationStatus;
    }, "0.0.1", {
        requires: ["gep", "model"]
    }
);