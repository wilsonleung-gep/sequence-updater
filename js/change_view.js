/*global YUI */
YUI.add("changeView",
    function(Y) {
        "use strict";

        var GEP = Y.GEP,
            ChangeView = Y.Base.create("changeView", Y.View, [], {
                containerTemplate: '<li class="change-item" />',
                template: Y.one("#item-template").getHTML(),
                events: {
                    ".changeitem-remove": {click: "remove"}
                },
                initializer: function() {
                    var model = this.get("model");

                    model.after("change", this.render, this);

                    model.after("destroy", function() {
                        this.destroy({remove: true});
                    }, this);
                },
                render: function() {
                    var container = this.get("container"),
                        model = this.get("model");

                    container.setHTML(Y.Lang.sub(this.template, model.toJSON()));

                    return this;
                },
                remove: function(e) {
                    e.preventDefault();

                    this.constructor.superclass.remove.call(this);
                    this.get("model").destroy({"delete": true});
                }
            }, {
                ATTRS: {
                    model: {
                        value: null
                    },
                    container: {
                        valueFn: function() {
                            return Y.Node.create(this.containerTemplate);
                        }
                    }
                }
            });

        GEP.ChangeView = ChangeView;
    }, "0.0.1", {
        requires: ["view"]
    });
