![Screenshot](https://github.com/jenslody/gnome-shell-extension-top-notification/raw/master/data/Screenshot.jpg)

*gnome-shell-extension-top-notification* is an extension to place shell notifications under the panel instead of above the message-tray.

----

# Installation

After the installation, restart GNOME Shell (`Alt`+`F2`, `r`, `Enter`) and enable the extension through *gnome-tweak-tool*.

## Through a package manager

#### Note: you need the root password for all these installation modes, if you do not have root-access, and the needed build-dependencies are installed, use the generic install.

### [Fedora](https://fedoraproject.org/)

You can install the extension from [my repo](http://rpm.jenslody.de/).
I have packages for Fedora 19 and 20.

To install my repo download and install [this rpm](http://rpm.jenslody.de/fedora-jenslody.de-0.1-2.fc17.noarch.rpm).

If it is not installed automatically, just run:

    sudo yum localinstall --nogpgcheck http://rpm.jenslody.de/fedora-jenslody.de-0.1-2.fc17.noarch.rpm

Now you can install the extension, either via your favourite package-manager or on a console:

    sudo yum install gnome-shell-extension-top-notification


## Generic (Local installation)

Make sure you have the following dependencies installed:
* *pkg-config*,
* *git*,
* *zip*,
* *gnome-common*,
* *autoconf*,
* *automake*,
* *gnome-tweak-tool*.

Run the following commands:

	cd ~ && git clone git://github.com/jenslody/gnome-shell-extension-top-notification.git
	cd ~/gnome-shell-extension-top-notification
	./autogen.sh && make local-install

----

# Configuration

At the moment, there is no configuration needed.

----

# Licence

Copyright (C) 2011 - 2014

* Berend De Schouwer,
* Jens Lody <jens@jenslody.de>.

This file is part of *gnome-shell-extension-top-notification*.

*gnome-shell-extension-top-notification* is free software: you can redistribute it and/or modify it under the terms of the **GNU General Public License as published by the Free Software Foundation, either version 3** of the License, or (at your option) any later version.

*gnome-shell-extension-top-notification* is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with *gnome-shell-extension-top-notification*.  If not, see <http://www.gnu.org/licenses/>.
