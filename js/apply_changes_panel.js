/*global YUI */
YUI.add("applyChangesPanel",
    function(Y) {
        "use strict";

        var applyChangesPanel = function(prefix, cfg) {
            var GEP = Y.GEP,
                settings,
                submitButton,
                statusPanel,
                loadingTemplate,
                xhrConfig;

            settings = GEP.util.mergeSettings(cfg, {
                service: "",
                changeSequenceForm: null,
                loadingTemplateID: "loading-template"
            });

            submitButton = Y.byID(prefix + "-submit");
            statusPanel = Y.byID(prefix + "-status");
            loadingTemplate = Y.byID(settings.loadingTemplateID).getHTML();

            if (submitButton === null) {
                throw new Error("Cannot find submit button: " + prefix);
            }

            xhrConfig = GEP.xhrHelper({prefix: prefix});

            function resetApplyChangesPanel() {
                submitButton.set("disabled", false);
                statusPanel.setHTML("");
            }

            Y.on(prefix + ":xhrerror", function(e) {
                resetApplyChangesPanel();
                Y.fire(prefix + ":error", e);
            });

            Y.on(prefix + ":xhrresult", function(result) {
                resetApplyChangesPanel();
                Y.fire(prefix + ":result", result);
            });

            submitButton.on("click", function(e) {
                e.preventDefault();

                Y.fire(prefix + ":submit");

                var changeSequenceForm = settings.changeSequenceForm,
                    data = changeSequenceForm.seqInfo;

                data.changeList = changeSequenceForm.changeList.toJSON();

                xhrConfig.data = "changeset=" + Y.JSON.stringify(data);

                submitButton.set("disabled", true);
                statusPanel.setHTML(Y.Lang.sub(loadingTemplate, {
                    message: "Updating sequence..."
                }));

                Y.io(settings.service, xhrConfig);

                return false;
            });

            return {
                submitButton: submitButton
            };
        };

        Y.GEP.applyChangesPanel = applyChangesPanel;
    }
    , "0.0.1", {
        requires: [
            "gep", "io-base", "json", "event", "xhrHelper"
        ]
    });