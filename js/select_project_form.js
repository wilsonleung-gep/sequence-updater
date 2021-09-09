/*global YUI */
YUI.add("selectProjectForm",
    function(Y) {
        "use strict";

        var selectProjectForm = function(prefix, cfg) {
            var GEP = Y.GEP,
                containerID = prefix + "-section",
                settings,
                formContainer,
                form,
                xhrConfig,
                projectField,
                projectFieldDataSource,
                regionField;

            settings = GEP.util.mergeSettings(cfg, {
                service: "",
                formID: prefix + "-form",
                regionFieldID: prefix + "-regionField",
                projectFieldID: prefix + "-projectField",
                acRequestTemplate: "?db={db}&project={query}",
                dsConfig: {
                    source: null,
                    schema: {}
                },
                acConfig: {
                    source: null,
                    resultFilters: "phraseMatch",
                    resultHighlighter: "phraseMatch",
                    maxResults: 10,
                    resultTextLocator: "name"
                }
            });

            formContainer = Y.byID(containerID);
            form = Y.byID(settings.formID);
            regionField = Y.byID(settings.regionFieldID);

            if (formContainer === null || form === null) {
                throw new Error("Cannot find form container: " + prefix);
            }

            function initProjectField() {
                var acConfig = settings.acConfig;

                projectFieldDataSource = new Y.DataSource.IO({
                    source: settings.dsConfig.source
                });

                projectFieldDataSource.plug(Y.Plugin.DataSourceJSONSchema, {
                    schema: settings.dsConfig.schema
                });

                acConfig.source = projectFieldDataSource;

                acConfig.requestTemplate = Y.Lang.sub(
                    settings.acRequestTemplate,
                    {db: regionField.get("value")});

                projectField = Y.byID(settings.projectFieldID).plug(
                    Y.Plugin.AutoComplete, settings.acConfig);
            }

            initProjectField();

            xhrConfig = GEP.xhrHelper({prefix: prefix, method: "GET"});

            regionField.on("change", function(e) {
                var db = e.target.get("value");

                projectField.ac.set("requestTemplate",
                    Y.Lang.sub(settings.acRequestTemplate, {db: db}));
            });

            Y.on(prefix + ":xhrerror", function(e) {
                Y.fire(prefix + ":error", e);
            });

            Y.on(prefix + ":xhrresult", function(matches) {
                var projectList = matches.projectList,
                    selectedIndex,
                    selectedOption,
                    firstMatch,
                    result;

                if (projectList.length === 0) {
                    Y.fire(prefix + ":error", {
                        status: "failure",
                        message: "Cannot find project name in the specified project region",
                        result: []
                    });

                    return;
                }

                selectedIndex = regionField.get("selectedIndex");
                selectedOption = regionField.get("options").item(selectedIndex);

                firstMatch = projectList[0];

                result = {
                    db: regionField.get("value"),
                    assembly: selectedOption.get("innerHTML"),
                    project: firstMatch.name,
                    sequenceLength: firstMatch.sequenceLength
                };

                Y.fire(prefix + ":result", result);
            });


            form.on("submit", function(e) {
                e.preventDefault();

                Y.fire(prefix + ":submit");

                xhrConfig.data = {
                    "db": regionField.get("value"),
                    "project": projectField.get("value"),
                    "match": "exact"
                };

                Y.io(settings.service, xhrConfig);

                return false;
            });

            return {
                container: formContainer,
                form: form
            };
        };

        Y.GEP.selectProjectForm = selectProjectForm;
    }, "0.0.1", {
        requires: [
            "gep", "io-base", "json", "event", "datasource",
            "autocomplete", "autocomplete-filters", "autocomplete-highlighters",
            "xhrHelper"
        ]
    });
