%global git 2740ca9
%global uuid panel-osd@berend.de.schouwer.gmail.com
%global github jenslody-gnome-shell-extension-panel-osd
%global checkout git%{git}

Name:           gnome-shell-extension-panel-osd
Version:        0
Release:        0.2.%(date +%Y%m%d).%{checkout}%{?dist}
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
%find_lang %{name}

%postun
if [ $1 -eq 0 ] ; then
        %{_bindir}/glib-compile-schemas %{_datadir}/glib-2.0/schemas &> /dev/null || :
fi

%posttrans
%{_bindir}/glib-compile-schemas %{_datadir}/glib-2.0/schemas &> /dev/null || :

%files -f %{name}.lang
%doc AUTHORS COPYING README.md
%{_datadir}/glib-2.0/schemas/org.gnome.shell.extensions.panel-osd.gschema.xml
%{_datadir}/gnome-shell/extensions/%{uuid}/

%changelog
* Sat Feb 22 2014 Jens Lody <jens@jenslody.de>
- Added translation files, needed for newest upstream.
* Sun Jan 26 2014 Jens Lody <jens@jenslody.de>
- Initial package for Fedora of the panel-osd-extension fork

