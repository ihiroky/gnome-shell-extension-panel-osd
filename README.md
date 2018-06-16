![Screenshot](https://gitlab.com/jenslody/gnome-shell-extension-panel-osd/raw/master/data/Screenshot.jpg)

*gnome-shell-extension-panel-osd* is an extension to place shell notifications under the panel instead of above the message-tray.

----

# Installation

After the installation, you might need to restart GNOME Shell (`Alt`+`F2`, `r`, `Enter`) and enable the extension through *gnome-tweak-tool*.

## Through extensions.gnome.org (Local installation)

Go on the [Panel OSD](https://extensions.gnome.org/extension/708/panel-osd/) extension page on extensions.gnome.org, click on the switch ("OFF" => "ON"), click on the install button. That's it !

## Through a package manager

#### Note: you need the root password for all these installation modes, if you do not have root-access, and the needed build-dependencies are installed, use the generic install.

### [Fedora](https://fedoraproject.org/)

You can install the extension from the official Fedora repos.

## Generic (Local installation)

Make sure you have the following dependencies installed:
* *pkg-config*,
* *git*,
* *zip*,
* *gnome-common*,
* *autoconf*,
* *automake*,
* *gnome-tweak-tool*,
* *gettext-devel*

Run the following commands:

	cd ~ && git clone git://gitlab.com/jenslody/gnome-shell-extension-panel-osd.git
	cd ~/gnome-shell-extension-panel-osd
	./autogen.sh && make local-install

----

# Configuration

At the moment, there is no configuration needed.

----

# Licence

Copyright &copy; 2011 - 2014

* Berend De Schouwer,
* Jens Lody <jens@jenslody.de>.

Copyright &copy; 2014 - 2017

* Jens Lody <fedora@jenslody.de>.

This file is part of *gnome-shell-extension-panel-osd*.

*gnome-shell-extension-panel-osd* is free software: you can redistribute it and/or modify it under the terms of the **GNU General Public License as published by the Free Software Foundation, either version 3** of the License, or (at your option) any later version.

*gnome-shell-extension-panel-osd* is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with *gnome-shell-extension-panel-osd*.  If not, see <http://www.gnu.org/licenses/>.
