extensionurl = https://github.com/jenslody/gnome-shell-extension-top-notification

# Change these to modify how installation is performed
topextensiondir = $(datadir)/gnome-shell/extensions

uuid = top-notification-extension@jenslody.de

extensiondir = $(topextensiondir)/$(uuid)

dist_extension_DATA = stylesheet.css

nodist_extension_DATA = metadata.json $(EXTRA_EXTENSION)

EXTRA_DIST = metadata.json.in

metadata.json: metadata.json.in $(top_builddir)/config.status
	$(AM_V_GEN) sed -e "s|[@]LOCALEDIR@|$(datadir)/locale|" \
	    -e "s|[@]uuid@|$(uuid)|" \
	    -e "s|[@]url@|$(extensionurl)|" $< > $@

CLEANFILES = metadata.json
