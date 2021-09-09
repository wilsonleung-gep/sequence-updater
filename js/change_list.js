/*global YUI */
YUI.add("changeList",
    function(Y) {
        "use strict";
  
        var ChangeList = Y.Base.create("changeList", Y.ModelList, [], {
            model: Y.GEP.ChangeModel,

            comparator: function(model) {
                return model.get("position");
            },

            numChanges: function() {
                return this.size();
            }
        });

        Y.GEP.ChangeList = ChangeList;
    }
    , "0.0.1", {
        requires: ["changeModel", "model-list"]
    });
