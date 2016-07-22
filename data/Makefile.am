extensionurl = https://github.com/jenslody/gnome-shell-extension-panel-osd

# Change these to modify how installation is performed
topextensiondir = $(datadir)/gnome-shell/extensions

uuid = panel-osd@berend.de.schouwer.gmail.com

extensiondir = $(topextensiondir)/$(uuid)

dist_extension_DATA = panel-osd-settings.ui

nodist_extension_DATA = metadata.json $(EXTRA_EXTENSION)

EXTRA_DIST = metadata.json.in

metadata.json: metadata.json.in $(top_builddir)/config.status
	$(AM_V_GEN) sed -e "s|[@]LOCALEDIR@|$(datadir)/locale|" \
	    -e "s|[@]uuid@|$(uuid)|" \
	    -e "s|[@]url@|$(extensionurl)|" \
	    -e "s|[@]version@|$(GIT_VERSION)|" $< > $@

CLEANFILES = metadata.json

gsettings_SCHEMAS = org.gnome.shell.extensions.panel-osd.gschema.xml

@GSETTINGS_RULES@

EXTRA_DIST += $(gsettings_SCHEMAS)
