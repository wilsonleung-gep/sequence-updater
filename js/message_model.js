/*global YUI */
YUI.add("messageModel",

    function(Y) {
        "use strict";

        var GEP = Y.GEP,
            MessageModel = Y.Base.create("messageModel", Y.Model, [], {
                setError: function(e) {
                    this.setAttrs({
                        message: e.message,
                        type: "error"
                    });
                },
                initializer: function() {
                    this.publish("showMessage", {broadcast: 1});
                    this.publish("hideMessage", {broadcast: 1});

                    this.on("showMessage", function(e) {
                        this.setAttrs(e);
                    });

                    this.on("showError", function(e) {
                        this.setError(e);
                    });

                    Y.on("*:error", function(e) {
                        this.setError(e);
                    }, this);

                    Y.on("*:submit", function() {
                        this.fire("hideMessage");
                    }, this);
                }
            }, {
                ATTRS: {
                    message: {
                        value: "",
                        setter: function(value) {
                            var message = value;

                            if (Y.Lang.isArray(value)) {
                                message = value.join("\n");
                            }

                            return message;
                        }
                    },
                    type: {
                        value: "info"
                    }
                }
            });

        GEP.MessageModel = MessageModel;
    }, "0.0.1", {
        requires: ["model"]
    });