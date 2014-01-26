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
const MessageTray = imports.ui.messageTray;
const Panel = imports.ui.panel;
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
 *
 *  I stripped the original comments out so that my changes (and comments) could
 *  be highlighted.  It's really just a tiny change.
 */
let extensionShowNotification = function () {
    this._notification = this._notificationQueue.shift();

    this._userActiveWhileNotificationShown = this.idleMonitor.get_idletime() <= IDLE_TIME;
    if (!this._userActiveWhileNotificationShown) {
        this.idleMonitor.add_user_active_watch(Lang.bind(this,
                                               this._onIdleMonitorBecameActive));
        }

    this._notificationClickedId = this._notification.connect(
                                      'done-displaying',
                                      Lang.bind(this, this._escapeTray)
                                      );
    this._notificationUnfocusedId = this._notification.connect(
                                      'unfocused',
                                      Lang.bind(
                                          this,
                                          function() { this._updateState(); }
                                          )
                                      );
    this._notificationBin.child = this._notification.actor;
    this._notificationWidget.opacity = 0;

    if (!ExtensionUtils.versionCheck(['3.9', '3.10'], Config.PACKAGE_VERSION)) {
        /*
         *  for .y we use the panel's height, to move it just below the panel.
         *  we calculate .height every time, to prevent using gnome-shell's startup
         *  panel height before the themes are loaded.
         *
         *  If you set this to .0, the OSD is animated (Tweened) in from outside
         *  the screen, but the very first frame moves *all* windows down to make
         *  space for the OSD.  Subsequent frames moves the windows back.
         *
         *  I don't know how to fix that.
         */
        this._notificationWidget.y = panel.height;
        /*
         *  for .x we Math.round() to prevent 1/2 pixels; which can cause blurry
         *  font rendering
         */
            this._notificationWidget.x = Math.round((panel.width / 2) -
                (this._notificationWidget.width) / 2);
    }
    this._notificationWidget.show();
    this._updateShowingNotification();
    let [x, y, mods] = global.get_pointer();
    this._showNotificationMouseX = x;
    this._showNotificationMouseY = y;
    this._lastSeenMouseX = x;
    this._lastSeenMouseY = y;
}


/*
 *  Copied from MessageTray._hideNotification()
 *
 *  We only change the .y and .x values to move the OSD.  We need to copy
 *  the whole method to prevent the animation from moving the OSD across the
 *  entire screen.
 *
 *  I stripped the original comments out so that my changes (and comments) could
 *  be highlighted.  It's really just a tiny change.
 */
let extensionHideNotification = function(animate) {
if (ExtensionUtils.versionCheck(['3.9', '3.10'], Config.PACKAGE_VERSION)) {
    this._notificationFocusGrabber.ungrabFocus();
}
else
{
    this._notificationState = State.HIDING;

    if (!this._notification) { return; }
    this._grabHelper.ungrab({ actor: this._notification.actor });
}

    if (this._notificationExpandedId) {
        this._notification.disconnect(this._notificationExpandedId);
        this._notificationExpandedId = 0;
    }
    if (this._notificationClickedId) {
        this._notification.disconnect(this._notificationClickedId);
        this._notificationClickedId = 0;
    }
    if (this._notificationUnfocusedId) {
        this._notification.disconnect(this._notificationUnfocusedId);
        this._notificationUnfocusedId = 0;
    }
    if (ExtensionUtils.versionCheck(['3.9', '3.10'], Config.PACKAGE_VERSION)) {
        this._useLongerNotificationLeftTimeout = false;
        if (this._notificationLeftTimeoutId) {
            Mainloop.source_remove(this._notificationLeftTimeoutId);
            this._notificationLeftTimeoutId = 0;
            this._notificationLeftMouseX = -1;
            this._notificationLeftMouseY = -1;
        }

        if (animate) {
            this._tween(this._notificationWidget, '_notificationState', State.HIDDEN, {
                y: 0,
                opacity: 0,
                time: ANIMATION_TIME,
                transition: 'easeOutQuad',
                onComplete: this._hideNotificationCompleted,
                onCompleteScope: this
            });
        } else {
            Tweener.removeTweens(this._notificationWidget);
            this._notificationWidget.y = 0;
            this._notificationWidget.opacity = 0;
            this._notificationState = State.HIDDEN;
            this._hideNotificationCompleted();
        }
    }
    else
    {
        this._useLongerTrayLeftTimeout = false;
        if (this._trayLeftTimeoutId) {
            Mainloop.source_remove(this._trayLeftTimeoutId);
            this._trayLeftTimeoutId = 0;
            this._trayLeftMouseX = -1;
            this._trayLeftMouseY = -1;
        }

        if (this._notificationRemoved) {
            Tweener.removeTweens(this._notificationWidget);
            this._notificationWidget.y = this.actor.height;
            this._notificationWidget.opacity = 0;
            this._notificationState = State.HIDDEN;
            this._hideNotificationCompleted();
        } else {
    //
    //          We leave the widget.y at panel.height, and not .0; because the
    //          showing animation is opacity-only.
    //
    //          Can be animated out to .0 if you want; there are no artifacts on
    //          screen when animating out.
    //
            this._tween(this._notificationWidget, '_notificationState', State.HIDDEN,
                        { y: panel.height,
                          opacity: 0,
                          time: ANIMATION_TIME,
                          transition: 'easeOutQuad',
                          onComplete: this._hideNotificationCompleted,
                          onCompleteScope: this
                        });
        }
    }
}


/*
 *  Copied from MessageTray._updateNotification()
 *  Copied from MessageTray._updateShowingNotification()
 *
 *  We only change the .y and .x values to move the OSD.  We need to copy
 *  the whole method to prevent the animation from moving the OSD across the
 *  entire screen.
 *
 *  I stripped the original comments out so that my changes (and comments) could
 *  be highlighted.  It's really just a tiny change.
 */
let extensionUpdateShowingNotification = function() {
    this._notification.acknowledged = true;
    this._notification.playSound();
    if (this._notification.urgency == Urgency.CRITICAL ||
        this._notification.source.policy.forceExpanded)
        this._expandNotification(true);
    this._notificationWidget.x = Math.round((panel.width / 2) -
        (this._notificationWidget.width) / 2);
    /*
     *  As noted above, panel.height is constant to prevent an artifact,
     *  so in effect only the opacity changes.
     */
    let tweenParams = {
        opacity: 255,
        //        opacity: 187,
        y: panel.height,
        time: ANIMATION_TIME,
        transition: 'easeOutQuad',
        onComplete: this._showNotificationCompleted,
        onCompleteScope: this
    };
    this._tween(this._notificationWidget, '_notificationState', State.SHOWN, tweenParams);
}

let extensiononNotificationExpanded = function() {
    let expandedY = panel.height;
//    this._closeButton.y = expandedY;
    this._closeButton.show();
    log('this._notificationWidget.y = ' + this._notificationWidget.y);
    log('this._notificationWidget.height = ' + this._notificationWidget.height);
    log('panel.height = ' + panel.height);
    // Don't animate the notification to its new position if it has shrunk:
    // there will be a very visible "gap" that breaks the illusion.
    if (this._notificationWidget.y < expandedY) {
        this._notificationWidget.y = expandedY;
    } else if (this._notification.y != expandedY) {
        // Tween also opacity here, to override a possible tween that's
        // currently hiding the notification.
        this._tween(this._notificationWidget, '_notificationState', State.SHOWN, {
            y: expandedY,
            opacity: 255,
            time: ANIMATION_TIME,
            transition: 'easeOutQuad'
        });
        log('this._notificationWidget.y = ' + this._notificationWidget.y);
        log('this._notificationWidget.height = ' + this._notificationWidget.height);
    }

}

/*
 *  Overload the methods.
 *  Untrack the widget.
 *  Re-parent the widget.
 *  Re-track the widget.
 *
 *  We untrack/retrack to get mouse click events to work correctly.  Focus
 *  tracking appears to work without re-tracking, but mouse clicks can be
 *  lost.
 */
function enable() {
    Main.messageTray._showNotification = extensionShowNotification;
    Main.messageTray._hideNotification = extensionHideNotification;
    Main.messageTray._updateShowingNotification = extensionUpdateShowingNotification;
    LayoutManager.untrackChrome(notificationWidget);
    if (ExtensionUtils.versionCheck(['3.9', '3.10'], Config.PACKAGE_VERSION)) {
        Main.messageTray._onNotificationExpanded = extensiononNotificationExpanded;
        LayoutManager.trayBox.remove_actor(notificationWidget);
        Main.uiGroup.add_actor(notificationWidget);
        Main.uiGroup.set_child_below_sibling(notificationWidget,
            panel);
    }
    else
    {
        Main.messageTray.actor.remove_actor(notificationWidget);
        panel.add_actor(notificationWidget);
        LayoutManager.trackChrome(notificationWidget);
    }

}


/*
 *  Put everything back.
 */
function disable() {
    Main.messageTray._showNotification = originalShowNotification;
    Main.messageTray._hideNotification = originalHideNotification;
    Main.messageTray._updateShowingNotification = originalUpdateShowingNotification;
    if (ExtensionUtils.versionCheck(['3.9', '3.10'], Config.PACKAGE_VERSION)) {
        Main.messageTray._onNotificationExpanded = originalExpandMethod;
        notificationWidget.x = originalNotificationWidgetX;
        Main.uiGroup.remove_actor(notificationWidget);
        Main.layoutManager.trayBox.add_actor(notificationWidget);
    }
    else
    {
    LayoutManager.untrackChrome(notificationWidget);
    panel.remove_actor(notificationWidget);
    Main.messageTray.actor.add_actor(notificationWidget);
    }

    LayoutManager.trackChrome(notificationWidget);
}
