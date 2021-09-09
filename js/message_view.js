/*global YUI */
YUI.add("messageView",

    function(Y) {
        "use strict";

        var GEP = Y.GEP,
            MessageView = Y.Base.create("messageView", Y.View, [], {
                template: Y.one("#message-template").getHTML(),
                initializer: function() {
                    var model = this.get("model");

                    model.after("change", this.render, this);

                    model.after("hideMessage", function() {
                        this.get("container").hide();
                    }, this);

                    model.after("destroy", function() {
                        this.destroy({remove: true});
                    }, this);
                },
                render: function() {
                    var container = this.get("container"),
                        model = this.get("model");

                    container.setHTML(Y.Lang.sub(this.template, {
                        type: model.get("type"),
                        message: GEP.util.nlTobr(model.get("message"))
                    }));

                    container.show();

                    return this;
                }
            }, {
                ATTRS: {
                    model: {
                        value: null
                    },
                    container: {
                        valueFn: function() {
                            return Y.one("#sequpdater-status");
                        }
                    }
                }
            });

        GEP.MessageView = MessageView;
    }, "0.0.1", {
        requires: ["view", "messageModel", "transition"]
    });