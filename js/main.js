/*global YUI */
YUI().use(
    "selectProjectForm",
    "changeSequenceForm",
    "applyChangesPanel",
    "messageView",
    function(Y) {
        "use strict";

        var GEP = Y.GEP,
            unselectedValue = "_unselected_";

        function initMessagePanel() {
            return new GEP.MessageView({model: new GEP.MessageModel() });
        }

        function initDownloadsPanel(result) {
            var container = Y.byID("download-section"),
                template = Y.byID("download-template").getHTML();

            container.setHTML(Y.Lang.sub(template, result));
        }

        function initSequenceChangesForm(seqInfo) {
            var panel = Y.byID("changelist-section"),
                formIDPrefix = "changeSequence",
                template = Y.byID("changeSequence-template").getHTML(),
                changeSequenceForm,
                applyButtonPrefix;

            panel.setHTML(Y.Lang.sub(template, seqInfo));

            changeSequenceForm = GEP.changeSequenceForm(formIDPrefix, {
                seqInfo: seqInfo,
                service: "services/sequence_lookup.php"
            });

            applyButtonPrefix = "changeSequenceList";

            GEP.applyChangesPanel(applyButtonPrefix, {
                changeSequenceForm: changeSequenceForm,
                service: "services/sequence_updater.php"
            });

            Y.on(applyButtonPrefix + ":result", function(result) {
                initDownloadsPanel(result);

                panel.hide();
            });
        }

        function initSelectProjectForm() {
            var formIDPrefix = "selectRegion",
                projectForm;

            projectForm = GEP.selectProjectForm(formIDPrefix, {
                service: "services/project_lookup.php",
                dsConfig: {
                    source: "services/project_lookup.php",
                    schema: {
                        resultListLocator: "result.projectList",
                        resultFields: ["name", "sequenceLength"]
                    }
                }
            });

            Y.on(formIDPrefix + ":result", function(seqInfo) {
                initSequenceChangesForm(seqInfo);

                projectForm.container.hide(true);
            });
        }

        function buildSpeciesOptions(species) {
            var dbList = window.GEP.ucscDbInfo[species];

            var options = [
                '<option value="' + unselectedValue +
                '" selected>Select a project region</option>'
            ];

            for (var i=0; i<dbList.length; i++) {
                var dbItem = dbList[i];

                options.push('<option value="'+ dbItem.name + '">' +
                    dbItem.description + "</option>");
            }

            return options.join("\n");
        }

        function initSelectProjectRegion() {
            var speciesSelect = Y.byID("selectRegion-speciesField");
            var regionSelect = Y.byID("selectRegion-regionField");
            var regionDetailsSection = Y.byID("regionDetailsFormFields");
            var projectDetailsSection = Y.byID("projectDetailsFormFields");

            speciesSelect.on("change", function(event) {
                var species = event.target.get("value");

                if (species === unselectedValue) {
                    regionDetailsSection.addClass("hidden");
                    projectDetailsSection.addClass("hidden");
                } else {
                    var speciesOptions = buildSpeciesOptions(species);
                    regionSelect.setContent(speciesOptions);
                    regionDetailsSection.removeClass("hidden");
                }
            });

            regionSelect.on("change", function(event) {
                var region = event.target.get("value");

                if (region === unselectedValue) {
                    projectDetailsSection.addClass("hidden");
                } else {
                    Y.byID("selectRegion-projectField").set("value", "");
                    projectDetailsSection.removeClass("hidden");
                }
            });
        }

        function resetForm() {
            Y.byID("selectRegion-speciesField").set("selectedIndex", 0);
            Y.byID("regionDetailsFormFields").addClass("hidden");
        }

        function init() {
            resetForm();
            initMessagePanel();
            initSelectProjectRegion();
            initSelectProjectForm();
        }

        Y.on("domready", init);
    });
