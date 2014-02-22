%global git 2740ca9
%global uuid panel-osd@berend.de.schouwer.gmail.com
%global github jenslody-gnome-shell-extension-panel-osd
%global checkout git%{git}

Name:           gnome-shell-extension-panel-osd
Version:        0
Release:        0.1.%(date +%Y%m%d).%{checkout}%{?dist}
Summary:        An extension to show the notification messages below the top-panel instead of above the message tray

Group:          User Interface/Desktops
License:        GPLv3+
URL:            https://github.com/jenslody/gnome-shell-extension-panel-osd
Source0:        https://github.com/jenslody/gnome-shell-extension-panel-osd/tarball/master/%{github}-%{git}.tar.gz
BuildArch:      noarch

BuildRequires:  autoconf >= 2.53, automake >= 1.9, gnome-common >= 3.6.0, intltool >= 0.25
Requires:       gnome-shell >= 3.6.0

Obsoletes: gnome-shell-extension-top-notification
Provides: gnome-shell-extension-top-notification

%description
gnome-shell-extension-panel-osd is an extension to show the notification
messages below the top-panel instead of above the message tray

%prep
%setup -q -n %{github}-%{git}

%build
NOCONFIGURE=1 ./autogen.sh
%configure --prefix=%{_prefix}
make %{?_smp_mflags}

%install
make install DESTDIR=%{buildroot}

%files
%doc AUTHORS COPYING README.md
%{_datadir}/gnome-shell/extensions/%{uuid}/

%changelog
* Sun Jan 26 2014 Jens Lody <jens@jenslody.de>
- Initial package for Fedora of the panel-osd-extension fork

