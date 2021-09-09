/*global YUI */
YUI.add("regionField",
    function(Y) {
        "use strict";

        var GEP = Y.GEP;
  
        function RegionField(cfg) {
            this.settings = GEP.util.mergeSettings(cfg, {
                fieldID: "regionField"
            });

            this.field = Y.byID(this.settings.fieldID);
    
            if (this.field === null) {
                throw new Error("Cannot find node with ID: " + this.settings.fieldID);
            }
        }
  
        RegionField.prototype.getValue = function() {
            return this.field.get("value");
        };
  
        RegionField.prototype.getDescription = function() {
            var index = this.field.get("selectedIndex"),
                selectedItem = this.field.get("options").item(index);

            return selectedItem.get("innerHTML");
        };

        Y.GEP.RegionField = RegionField;
    }, "0.0.1", {
        requires: ["model"]
    });