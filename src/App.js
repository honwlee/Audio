define([
    "dojo/on",
    "qscriptx/store/odb/ArrayStore",
    "utilhub/Application",
    "dojo/i18n!utilhub/front/system/nls/apps",
    "./controls/Layout",
    "dojo/text!./data/songlist.json",
    "bundle!dependencies/services/media_srv",
], function(on, Memory, _App, nlsApps, Layout, songlistJson, mediaSrv) {

    return Class.declare({
        "-parent-": _App,
        "-module-": "apps/Audio/App",
        "-protected-": {
            "-fields-": {
                isDeferred: true,
                height: 570,
                width: 544,
                winMaxed: false,
                maxable: false,
                embeddable: false,
                fixable: false,
                resizable: false,
                title: nlsApps["AudioPlayer"] || "audioPlayer"
            },

            "-methods-": {}
        },

        "-public-": {
            "-attributes-": {},
            "-methods-": {
                init: function(args) {
                    this.overrided();
                    var self = this;
                    self.context.requestService("jplayer_lib").then(function() {
                        self.context.requestService("playlist_lib").then(function() {
                            if (runtime.nodeStarted) {
                                self.initWithData(new Memory({
                                    data: JSON.parse(songlistJson)
                                }));
                                self.deferred.resolve();
                            } else {
                                mediaSrv.init().then(function(memory) {
                                    self.initWithData(memory);
                                    self.deferred.resolve();
                                });
                            }
                        });
                    });
                    return this.deferred.promise;
                },
                initWithData: function(data) {
                    this.mainLayout = new Layout({
                        app: this,
                        memory: data
                    });
                },

                startCallback: function() {
                    // this.mainLayout.initPlayerList();
                    this.mainLayout.resize();
                },

                open: function(item) {
                    this.mainLayout._open(item);
                }
            }
        },

        "-constructor-": {
            initialize: function(args) {
                this.overrided(args);
            }
        }
    });
});
