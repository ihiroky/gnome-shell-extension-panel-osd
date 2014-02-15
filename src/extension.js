/*
 *  Idea: Grab MessageTray OSD widget, and give it new .x and .y co-ordinates.
 *
 *  We're grabbing "private" methods (start with _), so expect this to break
 *  with different versions of Gnome Shell.
 *
 *  It was tested with 3.8.3, with various themes.
 *
 *  Most of this code is a direct copy from gnome-shell/js/ui/messageTray.js,
 *  so (C)opyright Gnome-Team, I think :)
 *
 *  The idea comes from 'Shell OSD' gnome-shell extension by
 *  mpnordland@gmail.com
 */
const ExtensionUtils = imports.misc.extensionUtils;
const Config = imports.misc.config;
const Main = imports.ui.main;
const Tweener = imports.ui.tweener;
const LayoutManager = Main.layoutManager;
const Lang = imports.lang;

/*
 *  Save MessageTray's original methods.  We're going to change these
 *  in our extension to move the OSD.
 */
let originalExpandMethod = Main.messageTray._onNotificationExpanded;
let originalShowNotification = Main.messageTray._showNotification;
let originalUpdateShowingNotification = Main.messageTray._updateShowingNotification;
let originalHideNotification = Main.messageTray._hideNotification;

/*
 *  The widget we're interested in
 */
let notificationWidget = Main.messageTray._notificationWidget;
let panel = Main.layoutManager.panelBox;

let originalNotificationWidgetX = notificationWidget.x;

/*
 *  We need these constants to call Tween with values consistent to the
 *  MessageTray
 */
const IDLE_TIME = 1000;
const ANIMATION_TIME = 0.2;
const Urgency = {
    LOW: 0,
    NORMAL: 1,
    HIGH: 2,
    CRITICAL: 3
}
const State = {
    HIDDEN:  0,
    SHOWING: 1,
    SHOWN:   2,
    HIDING:  3
};

function init() {
}


/*
 *  Copied from MessageTray._showNotification()
 *
 *  We only change the .y and .x values to move the OSD.  We need to copy
 *  the whole method to prevent the animation from moving the OSD across the
 *  entire screen.
 */
let extensionShowNotification = function () {
    this._notification = this._notificationQueue.shift();

    this._userActiveWhileNotificationShown = this.idleMonitor.get_idletime() <= IDLE_TIME;
    if (ExtensionUtils.versionCheck(['3.6'], Config.PACKAGE_VERSION)) {
        this._idleMonitorWatchId = this.idleMonitor.add_watch(IDLE_TIME,
                                                              Lang.bind(this, this._onIdleMonitorWatch));
    }
    else
    {
        if (!this._userActiveWhileNotificationShown) {
            // If the user isn't active, set up a watch to let us know
            // when the user becomes active.
            this.idleMonitor.add_user_active_watch(Lang.bind(this, this._onIdleMonitorBecameActive));
        }
    }

    this._notificationClickedId = this._notification.connect('done-displaying',
                                                             Lang.bind(this, this._escapeTray));
    this._notificationUnfocusedId = this._notification.connect('unfocused', Lang.bind(this, function() {
        this._updateState();
    }));
    this._notificationBin.child = this._notification.actor;

    this._notificationWidget.opacity = 0;
    // JRL changes begin
    //this._notificationWidget.y = 0;
    this._notificationWidget.y = -global.screen_height;
    // JRL changes end


    this._notificationWidget.show();

    this._updateShowingNotification();

    let [x, y, mods] = global.get_pointer();
    // We save the position of the mouse at the time when we started showing the notification
    // in order to determine if the notification popped up under it. We make that check if
    // the user starts moving the mouse and _onTrayHoverChanged() gets called. We don't
    // expand the notification if it just happened to pop up under the mouse unless the user
    // explicitly mouses away from it and then mouses back in.
    this._showNotificationMouseX = x;
    this._showNotificationMouseY = y;
    // We save the coordinates of the mouse at the time when we started showing the notification
    // and then we update it in _notificationTimeout(). We don't pop down the notification if
    // the mouse is moving towards it or within it.
    this._lastSeenMouseX = x;
    this._lastSeenMouseY = y;
}


/*
 *  Copied from MessageTray._hideNotification()
 *
 *  We only change the .y and .x values to move the OSD.  We need to copy
 *  the whole method to prevent the animation from moving the OSD across the
 *  entire screen.
 */
let extensionHideNotification = function(animate) {
    if (ExtensionUtils.versionCheck(['3.6', '3.8'], Config.PACKAGE_VERSION)) {
        // HACK!
        // There seems to be a reentrancy issue in calling .ungrab() here,
        // which causes _updateState to be called before _notificationState
        // becomes HIDING. That hides the notification again, nullifying the
        // object but not setting _notificationState (and that's the weird part)
        // As then _notificationState is stuck into SHOWN but _notification
        // is null, every new _updateState fails and the message tray is
        // lost forever.
        //
        // See more at https://bugzilla.gnome.org/show_bug.cgi?id=683986
        this._notificationState = State.HIDING;

        this._grabHelper.ungrab({ actor: this._notification.actor });
    }
    else
    {
        this._notificationFocusGrabber.ungrabFocus();
    }

    if (this._notificationExpandedId) {
        this._notification.disconnect(this._notificationExpandedId);
        this._notificationExpandedId = 0;
    }
    if (ExtensionUtils.versionCheck(['3.6'], Config.PACKAGE_VERSION)) {

        if (this._notificationRemoved) {
            // JRL changes begin
            //this._notificationWidget.y = this.actor.height;
            this._notificationWidget.y = -global.screen_height;
            // JRL changes end
            this._notificationWidget.opacity = 0;
            this._notificationState = State.HIDDEN;
            this._hideNotificationCompleted();
        } else {
            this._tween(this._notificationWidget, '_notificationState', State.HIDDEN,
                        // JRL changes begin
                        //{ y: this.actor.height,
                        { y: -global.screen_height,
                        // JRL changes end
                          opacity: 0,
                          time: ANIMATION_TIME,
                          transition: 'easeOutQuad',
                          onComplete: this._hideNotificationCompleted,
                          onCompleteScope: this
                        });

        }
    }
    else
    {
        if (this._notificationClickedId) {
            this._notification.disconnect(this._notificationClickedId);
            this._notificationClickedId = 0;
        }
        if (this._notificationUnfocusedId) {
            this._notification.disconnect(this._notificationUnfocusedId);
            this._notificationUnfocusedId = 0;
        }

        if (ExtensionUtils.versionCheck(['3.8'], Config.PACKAGE_VERSION)) {
            this._useLongerTrayLeftTimeout = false;
            if (this._trayLeftTimeoutId) {
                Mainloop.source_remove(this._trayLeftTimeoutId);
                this._trayLeftTimeoutId = 0;
                this._trayLeftMouseX = -1;
                this._trayLeftMouseY = -1;
            }

            if (this._notificationRemoved) {
                Tweener.removeTweens(this._notificationWidget);
                // JRL changes begin
                //this._notificationWidget.y = this.actor.height;
                this._notificationWidget.y = -global.screen_height;
                // JRL changes end
                this._notificationWidget.opacity = 0;
                this._notificationState = State.HIDDEN;
                this._hideNotificationCompleted();
            } else {
                this._tween(this._notificationWidget, '_notificationState', State.HIDDEN,
                            // JRL changes begin
                            //{ y: this.actor.height,
                            { y: -global.screen_height,
                            // JRL changes end
                              opacity: 0,
                              time: ANIMATION_TIME,
                              transition: 'easeOutQuad',
                              onComplete: this._hideNotificationCompleted,
                              onCompleteScope: this
                            });

            }
        }
        else
        {
            if (this._notificationLeftTimeoutId) {
                Mainloop.source_remove(this._notificationLeftTimeoutId);
                this._notificationLeftTimeoutId = 0;
                this._notificationLeftMouseX = -1;
                this._notificationLeftMouseY = -1;
            }

            if (animate) {
                this._tween(this._notificationWidget, '_notificationState', State.HIDDEN,
                            // JRL changes begin
                            //{ y: this.actor.height,
                            { y: -global.screen_height,
                            // JRL changes end
                              opacity: 0,
                              time: ANIMATION_TIME,
                              transition: 'easeOutQuad',
                              onComplete: this._hideNotificationCompleted,
                              onCompleteScope: this
                            });
            } else {
                Tweener.removeTweens(this._notificationWidget);
                // JRL changes begin
                //this._notificationWidget.y = this.actor.height;
                this._notificationWidget.y = -global.screen_height;
                // JRL changes end
                this._notificationWidget.opacity = 0;
                this._notificationState = State.HIDDEN;
                this._hideNotificationCompleted();
            }
        }
    }
}


/*
 *  Copied from MessageTray._updateShowingNotification()
 *
 *  We only change the .y and .x values to move the OSD.  We need to copy
 *  the whole method to prevent the animation from moving the OSD across the
 *  entire screen.
 *
 */
let extensionUpdateShowingNotification = function() {
    // JRL changes begin
    // add own class-name to change border-radius, otherwise the changed value remains after switching off the extension
    this._notification._table.add_style_class_name('jrlnotification');
    // JRL changes end
    this._notification.acknowledged = true;
    if (ExtensionUtils.versionCheck(['3.6'], Config.PACKAGE_VERSION)) {
        // We auto-expand notifications with CRITICAL urgency.
        if (this._notification.urgency == Urgency.CRITICAL)
            this._expandNotification(true);
    }
    else
    {
        this._notification.playSound();
        // We auto-expand notifications with CRITICAL urgency, or for which the relevant setting
        // is on in the control center.
        if (this._notification.urgency == Urgency.CRITICAL ||
            this._notification.source.policy.forceExpanded)
            this._expandNotification(true);
    }

    // JRL changes begin
    // use panel's y and height property to determine the bottom of the top-panel.
    // needed because the "hide top bar" and "hide top panel" use different approaches to hide the
    // top bar.
    // "hide top panel" keeps the haeight and just moves the panel out of the visible area, so using
    // the panels-height is not enough.
    let yPos = panel.y + panel.height - global.screen_height;
    if (yPos < (-global.screen_height))
        yPos = -global.screen_height;
    // JRL changes end
    // We tween all notifications to full opacity. This ensures that both new notifications and
    // notifications that might have been in the process of hiding get full opacity.
    //
    // We tween any notification showing in the banner mode to the appropriate height
    // (which is banner height or expanded height, depending on the notification state)
    // This ensures that both new notifications and notifications in the banner mode that might
    // have been in the process of hiding are shown with the correct height.
    //
    // We use this._showNotificationCompleted() onComplete callback to extend the time the updated
    // notification is being shown.

    let tweenParams = { opacity: 255,
                        // JRL changes begin
                        //y: -this._notificationWidget.height,
                        y: yPos,
                        // JRL changes end
                        time: ANIMATION_TIME,
                        transition: 'easeOutQuad',
                        onComplete: this._showNotificationCompleted,
                        onCompleteScope: this
                      };

    this._tween(this._notificationWidget, '_notificationState', State.SHOWN, tweenParams);
}

/*
 *  Copied from MessageTray._onNotificationExpanded()
 *
 *  We only change the .y and .x values to move the OSD.  We need to copy
 *  the whole method to prevent the animation from moving the OSD across the
 *  entire screen.
 *
 */
let extensiononNotificationExpanded = function() {
    // JRL changes begin
    //let expandedY = - this._notificationWidget.height;
    let expandedY = panel.y + panel.height - global.screen_height;
    if (expandedY < (-global.screen_height))
        expandedY = -global.screen_height;
    // JRL changes end
    this._closeButton.show();

    // Don't animate the notification to its new position if it has shrunk:
    // there will be a very visible "gap" that breaks the illusion.
    if (this._notificationWidget.y < expandedY) {
        this._notificationWidget.y = expandedY;
    } else if (this._notification.y != expandedY) {
        // Tween also opacity here, to override a possible tween that's
        // currently hiding the notification.
        this._tween(this._notificationWidget, '_notificationState', State.SHOWN,
                    { y: expandedY,
                      opacity: 255,
                      time: ANIMATION_TIME,
                      transition: 'easeOutQuad'
                    });
    }
}

/*
 *  Overload the methods.
 */
function enable() {
    Main.messageTray._showNotification = extensionShowNotification;
    Main.messageTray._hideNotification = extensionHideNotification;
    Main.messageTray._updateShowingNotification = extensionUpdateShowingNotification;
    Main.messageTray._onNotificationExpanded = extensiononNotificationExpanded;
}


/*
 *  Put everything back.
 */
function disable() {
    // remove our style, in case we just show a notification, otherwise the radius is drawn incorrect
    if(Main.messageTray._notification)
        Main.messageTray._notification._table.remove_style_class_name('jrlnotification');
    Main.messageTray._showNotification = originalShowNotification;
    Main.messageTray._hideNotification = originalHideNotification;
    Main.messageTray._updateShowingNotification = originalUpdateShowingNotification;
    Main.messageTray._onNotificationExpanded = originalExpandMethod;
}
