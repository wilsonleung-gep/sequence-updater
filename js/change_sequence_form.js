/*global YUI */
YUI.add("changeSequenceForm",
    function(Y) {
        "use strict";

        var changeSequenceForm = function(prefix, cfg) {
            var GEP = Y.GEP,
                containerID = prefix + "-section",
                settings,
                formContainer,
                changeList,
                surroundPanel,
                positionField,
                originalSequenceField,
                newSequenceField,
                extractedInfo,
                fieldErrorTemplate,
                form;

            settings = GEP.util.mergeSettings(cfg, {
                seqInfo: null,
                service: "",
                formID: prefix + "-form",
                surroundPanelID: prefix + "-surroundSequence-panel",
                surroundTemplateID: "surroundSequence-template",
                loadingTemplateID: "loading-template",
                fieldErrorTemplateID: "fieldError-template",
                positionFieldID: prefix + "-positionField",
                originalSequenceFieldID: prefix + "-originalSequenceField",
                newSequenceFieldID: prefix + "-newSequenceField"
            });

            formContainer = Y.byID(containerID);
            form = Y.byID(settings.formID);

            positionField = Y.byID(settings.positionFieldID);
            originalSequenceField = Y.byID(settings.originalSequenceFieldID);
            newSequenceField = Y.byID(settings.newSequenceFieldID);
            surroundPanel = Y.byID(settings.surroundPanelID);
            fieldErrorTemplate = Y.byID(settings.fieldErrorTemplateID).getHTML();

            if (formContainer === null || form === null) {
                throw new Error("Cannot find form container: " + prefix);
            }

            function initChangeList() {
                changeList = new GEP.ChangeList();

                return new GEP.ChangeListView({ modelList: changeList });
            }

            function showSurroundPanel(msg) {
                surroundPanel.setHTML(msg);
                surroundPanel.show();
            }

            function parsePositionValue(taintedValue) {
                var position = parseInt(taintedValue, 10),
                    sequenceLength = settings.seqInfo.sequenceLength,
                    status = new GEP.ValidationStatus({
                        name: "position",
                        label: "Position"
                    });

                if (position.toString() !== taintedValue) {
                    status.addError("Start position is not a valid integer");
                    return status;
                }

                if ((position < 1) || (position > sequenceLength)) {
                    status.addError("Position (" + position +
          ") must be between 1 and sequence length (" +
          sequenceLength + ")");

                    return status;
                }

                status.set("value", position);

                return status;
            }

            function initPositionField() {
                var lookupPrefix = settings.positionFieldID,
                    surroundTemplate = Y.byID(settings.surroundTemplateID).getHTML(),
                    loadingTemplate = Y.byID(settings.loadingTemplateID).getHTML(),
                    seqInfo = settings.seqInfo,
                    lookupXhrConfig;

                lookupXhrConfig = GEP.xhrHelper({
                    prefix: lookupPrefix,
                    method: "GET"
                });

                Y.on(lookupPrefix + ":xhrresult", function(info) {
                    extractedInfo = info;
                    showSurroundPanel(Y.Lang.sub(surroundTemplate, extractedInfo));
                });

                Y.on(lookupPrefix + ":xhrerror", function(info) {
                    showSurroundPanel(Y.Lang.sub(fieldErrorTemplate, info));
                });

                positionField.on("change", function(e) {
                    var positionStatus = parsePositionValue(e.target.get("value"));

                    if (positionStatus.hasErrors()) {
                        showSurroundPanel(Y.Lang.sub(fieldErrorTemplate, {
                            message: positionStatus.getErrorMessages()
                        }));
                        return;
                    }

                    showSurroundPanel(Y.Lang.sub(loadingTemplate, {
                        message: "Retrieving sequence..."
                    }));

                    lookupXhrConfig.data = {
                        db: seqInfo.db,
                        project: seqInfo.project,
                        sequenceLength: seqInfo.sequenceLength,
                        position: positionStatus.get("value")
                    };

                    Y.io(settings.service, lookupXhrConfig);
                });
            }

            function resetChangeListForm() {
                form.reset();
                positionField.focus();
                surroundPanel.hide();
            }

            function validateSequence(fieldName, fieldLabel, changeItem, changeItemStatus) {
                var actual = changeItem.get(fieldName);

                if ((!actual) || (actual === "")) {
                    changeItemStatus.addError(fieldLabel + " must only contain A, T, G, or C.");
                }
            }

            function validateOriginalSequence(changeItem, changeItemStatus) {
                if ((! extractedInfo) || (! extractedInfo.surroundStart)) {
                    return;
                }

                var offset = extractedInfo.surroundStart.length,
                    actual,
                    expected;

                validateSequence("originalSequence", "Original sequence", changeItem, changeItemStatus);

                actual = changeItem.get("originalSequence");
                expected = extractedInfo.sequence.substr(offset, actual.length);

                if (actual !== expected) {
                    changeItemStatus.addError(Y.Lang.sub(
                        "Original sequence field ({actual}) does not match " +
           "the expected sequence in the database ({expected})", {
                            actual: actual,
                            expected: expected
                        }));
                }
            }

            function validateChangeItem(changeItem) {
                var position = changeItem.get("position"),
                    changeItemStatus = new GEP.ValidationStatus({
                        name: "changeItem"
                    });

                if (changeItem.hasErrors()) {
                    changeItemStatus.addError(changeItem.getErrorMessages());
                    return changeItemStatus;
                }

                if (changeList.getById(position)) {
                    changeItemStatus.addError("Position " + position +
                " already exists in the change list");
                }

                validateOriginalSequence(changeItem, changeItemStatus);
                validateSequence("newSequence", "New sequence", changeItem, changeItemStatus);

                return changeItemStatus;
            }

            function initAddChangeListForm() {
                form.on("submit", function(e) {
                    e.preventDefault();

                    Y.fire(prefix + ":submit");

                    var changeItemStatus,
                        position = positionField.get("value"),
                        changeItem = new GEP.ChangeModel({
                            sequenceLength: settings.seqInfo.sequenceLength,
                            id: position,
                            position: position,
                            originalSequence: originalSequenceField.get("value"),
                            newSequence: newSequenceField.get("value")
                        });

                    changeItemStatus = validateChangeItem(changeItem);

                    if (changeItemStatus.hasErrors()) {
                        Y.fire(prefix + ":error", {
                            message: changeItemStatus.getErrorMessages()
                        });

                        return false;
                    }

                    changeList.add(changeItem);

                    resetChangeListForm();

                    return false;
                });
            }

            initPositionField();
            initChangeList();
            initAddChangeListForm();
            positionField.focus();

            return {
                container: formContainer,
                form: form,
                changeList: changeList,
                seqInfo: settings.seqInfo
            };
        };

        Y.GEP.changeSequenceForm = changeSequenceForm;
    }
    , "0.0.1", {
        requires: [
            "gep", "io-base", "json", "event", "xhrHelper", "validationStatus",
            "changeList", "changeListView", "changeView", "changeModel"
        ]
    });
