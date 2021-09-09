/*global YUI */
YUI.add("changeListView",
    function(Y) {
        "use strict";
  
        var GEP = Y.GEP,
            ChangeListView = Y.Base.create("changeListView", Y.View, [], {
                initializer: function() {
                    var modelList = this.get("modelList");

                    modelList.after("add", this.add, this);

                    modelList.after(["add", "remove", "init"], this.render, this);

                },
                add: function(e) {
                    var container = this.get("container"),
                        view = new GEP.ChangeView({model: e.model});

                    container.append(view.render().get("container"));
                },
                render: function() {
                    var modelList = this.get("modelList");
      
                    if (modelList.isEmpty()) {
                        this.get("panel").hide();
                    } else {
                        this.get("panel").show();
                    }
                }
            }, {
                ATTRS: {
                    panel: {
                        valueFn: function() {
                            return Y.one("#changeSequenceList-section");
                        }
                    },
                    container: {
                        valueFn: function() {
                            return Y.one("#changeSequenceList-list");
                        }
                    }
                }
            });
        GEP.ChangeListView = ChangeListView;
    }, "0.0.1", {
        requires: ["view"]
    });
