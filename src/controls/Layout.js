define([
    "dojo/on",
    "dojo/topic",
    "dojo/aspect",
    "qscript/lang/Class",
    "qfacex/dijit/ITemplated",
    "utilhub/ItemsControl",
    "utilhub/front/comctrls/Toolbar",
    "dojo/i18n!../nls/app",
    "dojo/text!../templates/layout.html",
    "utilhub/front/system/interfaces/IFileDialog",
    "bundle!dependencies/services/media_srv",
    "qfacex/dijit/container/BorderContainer",
    "qfacex/dijit/container/ContentPane",
    "qfacex/dijit/container/TabContainer",
    "qfacex/dijit/text/TextBox",
    "qfacex/dijit/button/Button"
], function(on, topic, aspect, Class, ITemplated, ItemsControl, Toolbar, nlsApp, template, IFileDialog, mediaSrv) {
    var Layout = Class.declare({
        "-parent-": ItemsControl,
        "-interfaces-": [IFileDialog, ITemplated],
        "-protected-": {
            "-fields-": {
                nls: nlsApp,
                templateString: template,
                baseClass: "audioPlayer",
                fontAwesome: FontAwesome
            },

            "-methods-": {
                init: function() {
                    this.overrided();
                    this.dragEventBind();
                    this.clickEventBind();
                },

                clickEventBind: function() {
                    on(this.addAudioNode, "click", Function.hitch(this, "add"));
                    on(this.openAudioNode, "click", Function.hitch(this, "open"));
                    // on(this.uploadAudioNode, "click", Function.hitch(this, "upload"));
                },

                dragEventBind: function() {
                    var self = this;
                    var jAudioTabNode = this.domNode;
                    on(jAudioTabNode, 'drop', function(e) {
                        e.preventDefault();
                        var file = e.dataTransfer.files[0];
                        var reader = new FileReader();
                        reader.onload = function(e) {
                            var url = e.target.result;
                            var obj = {
                                "title": file.name,
                                "mp3": url,
                                "oga": url
                            };
                            self.app.audioPlayList.add(obj, true);

                        };
                        reader.onerror = function(e) {
                            var code = e.target.error.code;
                            if (code === 2) {
                                alert('please don\'t open this page using protocol fill:///');
                            } else {
                                alert('error code: ' + code);
                            }
                        };
                        reader.readAsDataURL(file);
                    });

                    on(jAudioTabNode, 'dragover', function(e) {
                        e.preventDefault();
                    });
                    on(jAudioTabNode, 'dragenter', function(e) {
                        e.preventDefault();
                    });
                },

                _open: function(fileItem) {
                    var url = fileItem.filePath;
                    var title = fileItem.name;
                    this.save(title, url);
                },

                getUrlTitle: function(url) {
                    var splits = url.split('/');
                    var title = splits.length > 0 ? splits[splits.length - 1] : splits[0];
                    return title;
                },

                initPlayerList: function() {
                    var playlist = [];
                    this.memory.query({
                        "mediumType": 1
                    }).forEach(function(item) {
                        var obj = {};
                        obj["title"] = item.title;
                        obj["mp3"] = item.url;
                        obj["oga"] = item.url;
                        playlist.push(obj);
                    });
                    this.audioPlayList = new jPlayerPlaylist({
                        jPlayer: this.jAudioPlayerNode,
                        cssSelectorAncestor: "#" + this.id
                    }, playlist, {
                        swfPath: "./resources/js/jplayer",
                        supplied: "oga, mp3",
                        wmode: "window",
                        smoothPlayBar: true,
                        keyEnabled: false
                    });

                    var self = this;
                    aspect.before(this.audioPlayList, "remove", function(index) {
                        self["delete"](index);
                    }, true);
                }
            }
        },

        "-public-": {
            "-attributes-": {
                memory: {
                    writable: true,
                    "default": null
                },

                app: {
                    writable: true,
                    "default": null
                }
            },

            "-methods-": {
                open: function() {
                    this.showFileDialog({
                        title: "Chose file to add",
                        folderName: "Audios"
                    }).then(Function.hitch(this, function(item) {
                        this._open(item);
                    }), function(error) {
                        console.log(error);
                    });
                },

                add: function() {
                    if (this.audioUrlNode.value.trim() === "") {
                        qfaceDialog.alert({
                            message: nlsApp.urlCanNotBeEmpty
                        });
                    } else {
                        var url = this.audioUrlNode.value.trim();
                        var title = this.getUrlTitle(url);
                        this.save(title, url);
                    }
                },

                upload: function() {

                },

                save: function(title, url) {
                    var obj = {
                        "title": title,
                        "mp3": url,
                        "oga": url
                    };
                    this.audioPlayList.add(obj, true);
                    var config = {
                        "title": title,
                        "url": url,
                        "mediumType": 1
                    };

                    var process = this.audioPlayersrv.save(config);
                    process.then(Function.hitch(this, function(cbData) {
                        var obj = {
                            message: this.nls.addSuccessful
                        };
                        topic.publish("qface/toaster", obj);
                    }));
                },

                "delete": function(index) {
                    var audioList = this.memory.query({
                        "mediumType": 1
                    });

                    if (audioList.length > index - 1) {
                        var mediaId = audioList[index]["mediaId"];
                        var process = this.audioPlayersrv["delete"](mediaId);
                        process.then(Function.hitch(this, function(configData) {
                            topic.publish("qface/toaster", {
                                message: this.nls.deleteSuccessful
                            });
                        }));
                    }
                },

                startup: function() {
                    if (this._started) return;
                    this.initPlayerList();
                    this.overrided();
                    this._started = true;
                }
            }
        },

        "-constructor-": {
            initialize: function( /*Object*/ params, /*DomNode|String?*/ srcNodeRef) {
                this.overrided(params, srcNodeRef);
                this.init();
            }
        }
    });
    return Layout;
});
