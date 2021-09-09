/*global YUI */
YUI.add("changeModel",
    function(Y) {
        "use strict";

        var GEP = Y.GEP,
            ChangeModel = Y.Base.create("changeModel", Y.Model, [], {
                initializer: function(cfg) {
                    var checkArgsStatus = GEP.util.checkRequiredProperties(cfg,
                        ["position", "sequenceLength", "newSequence", "originalSequence"]);

                    if (! checkArgsStatus.isValid) {
                        throw new TypeError(checkArgsStatus.error);
                    }
                },
                clearErrors: function() {
                    this.set("errors", []);
                },
                hasErrors: function() {
                    return (this.get("errors").length > 0);
                },
                addError: function(err) {
                    this.get("errors").push(err);
                },
                getErrorMessages: function() {
                    return Y.Array.map(this.get("errors"), function(err) {
                        return err.error;
                    });
                },
                toJSON: function() {
                    return {
                        position: this.get("position"),
                        originalSequence: this.get("originalSequence"),
                        newSequence: this.get("newSequence")
                    };
                },
                setSequence: function(value) {
                    if (! Y.Lang.isString(value)) {
                        this.addError({
                            type: "validation",
                            error: "Input does not contain a valid sequence"
                        });
                        return Y.Attribute.INVALID_VALUE;
                    }

                    var sequence = value.toUpperCase(),
                        errorMessage = "";

                    if (/^[ATGC]+$/.test(sequence)) {
                        return sequence;
                    }

                    if (sequence === "") {
                        errorMessage = "Sequence cannot be empty";
                    } else {
                        errorMessage = "Sequence must only contain A, T, G, or C.";
                    }

                    this.addError({
                        type: "validation",
                        error: errorMessage
                    });

                    return Y.Attribute.INVALID_VALUE;
                }
            }, {
                ATTRS: {
                    errors: {
                        value: []
                    },
                    sequenceLength: {
                        value: null,
                        setter: function(value) {
                            var seqLength = GEP.util.tryParseInt(value);

                            if ((seqLength !== null) && (seqLength > 0)) {
                                return seqLength;
                            }

                            this.addError({
                                type: "validation",
                                error: "Cannot add change item:\n" +
                    "Sequence length must be a positive integer"
                            });
                        }
                    },
                    position: {
                        value: 0,
                        setter: function(value) {
                            var position = GEP.util.tryParseInt(value),
                                sequenceLength = this.get("sequenceLength");

                            if ((position !== null) &&
              (position > 0) &&
              (position <= sequenceLength)) {

                                return position;
                            }

                            this.addError({
                                type: "validation",
                                error: "Cannot add change item:\n" +
                    "Position must be an integer between 1 and " +
                    "sequence length (" + sequenceLength + ")"
                            });

                            return Y.Attribute.INVALID_VALUE;
                        }
                    },
                    originalSequence: {
                        value: "",
                        setter: function (value) {
                            return this.setSequence(value);
                        }
                    },
                    newSequence: {
                        value: "",
                        setter: function (value) {
                            return this.setSequence(value);
                        }
                    }
                }
            });

        Y.GEP.ChangeModel = ChangeModel;
    }, "0.0.1", {
        requires: ["model"]
    });