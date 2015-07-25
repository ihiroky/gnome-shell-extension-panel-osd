%global git 60eff04
%global uuid panel-osd@berend.de.schouwer.gmail.com
%global github jenslody-gnome-shell-extension-panel-osd
%global checkout git%{git}

Name:           gnome-shell-extension-panel-osd
Version:        1
Release:        0.0.%(date +%Y%m%d).%{checkout}%{?dist}
Summary:        An extension to configure the place where notifications are shown

Group:          User Interface/Desktops
License:        GPLv3+
URL:            https://github.com/jenslody/gnome-shell-extension-panel-osd
Source0:        https://github.com/jenslody/gnome-shell-extension-panel-osd/tarball/master/%{github}-%{git}.tar.gz
BuildArch:      noarch

BuildRequires:  autoconf >= 2.53, automake >= 1.9, glib2-devel, gnome-common >= 3.10.0, intltool >= 0.25
Requires:       gnome-shell >= 3.10.0


%description
gnome-shell-extension-panel-osd is an extension to show the notification
messages at any (configurable) place on the (primary) monitor.

%license COPYING

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
%doc AUTHORS README.md
%{_datadir}/glib-2.0/schemas/org.gnome.shell.extensions.panel-osd.gschema.xml
%{_datadir}/gnome-shell/extensions/%{uuid}/

%changelog
* Sun Jan 26 2014 Jens Lody <jens@jenslody.de>
- Initial package for Fedora of the panel-osd-extension fork

