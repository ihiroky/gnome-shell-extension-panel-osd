%global git e35e98c
%global uuid panel-osd@berend.de.schouwer.gmail.com
%global gitlab gnome-shell-extension-panel-osd
%global checkout git%{git}
%global checkout_date 20170308

Name:           gnome-shell-extension-panel-osd
Version:        1
Release:        0.24.%{checkout_date}%{checkout}%{?dist}
Summary:        Configure the place where notifications are shown

Group:          User Interface/Desktops

# The entire source code is GPLv3+ except convenience.js, which is BSD
License:        GPLv3+ and BSD
URL:            https://gitlab.com/jenslody/gnome-shell-extension-panel-osd
Source0:        https://gitlab.com/jenslody/gnome-shell-extension-panel-osd/-/archive/%{git}/%{gitlab}-%{git}.tar.gz
BuildArch:      noarch

# The version of gnome-common in CentOS7 is only 3.7.4
BuildRequires:  autoconf, automake, glib2-devel, gnome-common >= 3.7.4, gettext-devel
Requires:       gnome-shell >= 3.10.0


%description
gnome-shell-extension-panel-osd is an extension to show the notification
messages at any (configurable) place on the (primary) monitor.
Be aware, that system-wide installed gnome-shell-extensions are disabled by default
and have to be enable by the user(s), if they get installed the first time.
You can use gnome-tweak-tool (additional package) or run:
"gnome-shell-extension-tool -e %uuid" (without the
quotes) on a console.

%prep
%setup -q -n %{gitlab}-%{git}

%build
NOCONFIGURE=1 ./autogen.sh
%configure GIT_VERSION=%{checkout}
make %{?_smp_mflags}

%install
make install DESTDIR=%{buildroot}
%find_lang %{name}

# Fedora uses file-triggers for some stuff (e.g. compile schemas) since fc24.
# Compiling schemas is the only thing done in %%postun and %%posttrans, so
# I decided to make both completely conditional.
%if 0%{?fedora} < 24
%postun
if [ $1 -eq 0 ] ; then
        %{_bindir}/glib-compile-schemas %{_datadir}/glib-2.0/schemas &> /dev/null || :
fi

%posttrans
%{_bindir}/glib-compile-schemas %{_datadir}/glib-2.0/schemas &> /dev/null || :
%endif

%files -f %{name}.lang
%license COPYING
%doc AUTHORS README.md
%{_datadir}/glib-2.0/schemas/org.gnome.shell.extensions.panel-osd.gschema.xml
%if 0%{?fedora} < 23
%dir %{_datadir}/gnome-shell/extensions
%endif
%{_datadir}/gnome-shell/extensions/%{uuid}

%changelog
* Wed Feb 07 2018 Fedora Release Engineering <releng@fedoraproject.org> - 1-0.24.20170308gite35e98c
- Rebuilt for https://fedoraproject.org/wiki/Fedora_28_Mass_Rebuild

* Wed Jul 26 2017 Fedora Release Engineering <releng@fedoraproject.org> - 1-0.23.20170308gite35e98c
- Rebuilt for https://fedoraproject.org/wiki/Fedora_27_Mass_Rebuild

* Wed Mar 08 2017 Jens Lody <fedora@jenslody.de> - 1-0.22.20170308gite35e98c
- Support gnome-shell 3.24.

* Fri Feb 10 2017 Fedora Release Engineering <releng@fedoraproject.org> - 1-0.21.20161004gitc33034a
- Rebuilt for https://fedoraproject.org/wiki/Fedora_26_Mass_Rebuild

* Mon Oct 03 2016 Jens Lody <fedora@jenslody.de> - 1-0.20.20161004gitc33034a
- Support gnome-shell 3.22.

* Wed Sep 14 2016 Jens Lody <fedora@jenslody.de> - 1-0.19.20160914git42eeb7e
- Support newest version of gnome-shell.
- Fix a error, that only occurs, when the extension gets disabled while a
  notification is shown.

* Sat Jul 30 2016 Jens Lody <fedora@jenslody.de> - 1-0.18.20160730gitdb008b8
- Fix issue with x-position of notification in some multimonitor setups.

* Fri Jul 22 2016 Jens Lody <fedora@jenslody.de> - 1-0.17.20160722git4903cfc
- Epel 7 build fix.

* Fri Jul 22 2016 Jens Lody <fedora@jenslody.de> - 1-0.16.20160722git5897019
- Switched translation to gettext via Makefile.
- Add missing BR to gettext-devel.

* Thu Jul 21 2016 Jens Lody <fedora@jenslody.de> - 1-0.15.20160721gite121669
- Added polish translation by piotrdrag.

* Thu Jul 21 2016 Jens Lody <fedora@jenslody.de> - 1-0.14.20160721git6ad19f0
- Fixes layout on multimonitor-systems or when using bottom-panel extensions.

* Fri Mar 25 2016 Jens Lody <fedora@jenslody.de> - 1-0.13.20160325gite052ded
- Fix build error, due to incorrect git-commit number.

* Fri Mar 25 2016 Jens Lody <fedora@jenslody.de> - 1-0.12.20160325git9bc9ae6
- Fixed spelling-error in pt_BR.po .
- Fixed changelog, the extension is not (yet?) translated to dutch, sorry.

* Fri Mar 25 2016 Jens Lody <fedora@jenslody.de> - 1-0.11.20160325gite052ded
- Updated dutch translation.
- Add support for new version of gnome-shell (3.20).

* Wed Feb 03 2016 Fedora Release Engineering <releng@fedoraproject.org> - 1-0.10.20160123gitf064a06
- Rebuilt for https://fedoraproject.org/wiki/Fedora_24_Mass_Rebuild

* Sat Jan 23 2016 Jens Lody <fedora@jenslody.de> - 1-0.9.20160123gitf064a06
- Add support for new development version of gnome-shell (3.19.4).

* Fri Dec 18 2015 Jens Lody <fedora@jenslody.de> - 1-0.8.20151218gitadabfdf
- Fix build on epel7 (gnome-common is 3.7.4, even if gnome-shell is 3.14).

* Thu Dec 17 2015 Jens Lody <fedora@jenslody.de> - 1-0.7.20151217gitdb3ac75
- Add support for new development version of gnome-shell (3.19.2).

* Fri Dec 11 2015 Jens Lody <fedora@jenslody.de> - 1-0.6.20151211gitd25d292
- Add hint about enabling system-wide installed shell-extensions.

* Wed Nov 25 2015 Jens Lody <fedora@jenslody.de> - 1-0.5.20151125git82635f3
- Add support for new development version of gnome-shell (3.19.2).

* Fri Nov 20 2015 Jens Lody <fedora@jenslody.de> - 1-0.4.20151120gitb82b69d
- Remove unneeded --prefix-parameter from configure-call.

* Wed Nov 18 2015 Jens Lody <fedora@jenslody.de> - 1-0.3.20151118git61c1bd4
- Fresh git checkout.
- Some bugfixes and gnome.shell 3.19.1 compatibility.

* Fri Oct 02 2015 Jens Lody <fedora@jenslody.de> - 1-0.2.20151002git1f87427
- Do not require gnome-shell-extensions-common.
- Require gnome-shell instead on Fedora >= 23.

* Thu Sep 17 2015 Jens Lody <fedora@jenslody.de> - 1-0.1.20150918git0205d68
- Use checkout-date instead of build-date in package-version.

* Thu Aug 20 2015 Jens Lody <fedora@jenslody.de> - 1-0.1.20150821gitcb1f6f6
- Remove dot before git in Release-tag.
- Use (conditional) file-triggers for schema compiling, introduced in fc24.

* Sun Jan 26 2014 Jens Lody <jens@jenslody.de>
- Initial package for Fedora of the panel-osd-extension fork

