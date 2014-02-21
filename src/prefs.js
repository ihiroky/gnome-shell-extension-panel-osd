const Gtk = imports.gi.Gtk;
const GObject = imports.gi.GObject;
const GtkBuilder = Gtk.Builder;
const Lang = imports.lang;
const Mainloop = imports.mainloop;

const Gettext = imports.gettext.domain('gnome-shell-extension-panel-osd');
const _ = Gettext.gettext;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;

const EXTENSIONDIR = Me.dir.get_path();

const PANEL_OSD_SETTINGS_SCHEMA = 'org.gnome.shell.extensions.panel-osd';
const PANEL_OSD_X_POS_KEY = 'x-pos';

const PanelOsdPrefsWidget = new GObject.Class({
    Name: 'PanelOsdExtension.Prefs.Widget',
    GTypeName: 'PanelOsdExtensionPrefsWidget',
    Extends: Gtk.Box,

    _init: function(params) {
        this.parent(params);

        this.initWindow();

        this.add(this.MainWidget);
    },

    Window: new Gtk.Builder(),

    initWindow: function() {
        this.Window.set_translation_domain('gnome-shell-extension-panel-osd');
        this.Window.add_from_file(EXTENSIONDIR + "/panel-osd-settings.ui");

        this.MainWidget = this.Window.get_object("main-widget");

        this.x_scale = this.Window.get_object("scale-x-pos");
        this.x_scale.set_value(this.x_position);
        // prevent from continously updating the value
        this.xScaleTimeout = undefined;
        this.x_scale.connect("value-changed", Lang.bind(this, function(slider) {

            if (this.xScaleTimeout != undefined)
                Mainloop.source_remove(this.xScaleTimeout);
            this.xScaleTimeout = Mainloop.timeout_add(250, Lang.bind(this, function() {
                this.x_position = slider.get_value();
                return false;
            }));

        }));

        this.Window.get_object("button-reset").connect("clicked", Lang.bind(this, function() {
            this.x_scale.set_value(50);;
        }));


    },

    loadConfig: function() {
        this.Settings = Convenience.getSettings(PANEL_OSD_SETTINGS_SCHEMA);
    },

    get x_position() {
        if (!this.Settings)
            this.loadConfig();
        return this.Settings.get_double(PANEL_OSD_X_POS_KEY);
    },

    set x_position(v) {
        if (!this.Settings)
            this.loadConfig();
        this.Settings.set_double(PANEL_OSD_X_POS_KEY, v);
    }

});

function init() {
    Convenience.initTranslations('gnome-shell-extension-panel-osd');
}

function buildPrefsWidget() {
    let widget = new PanelOsdPrefsWidget();
    widget.show_all();
    return widget;
}
