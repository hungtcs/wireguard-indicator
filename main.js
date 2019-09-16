const ps = require('ps-node');
const sudo = require('sudo-prompt');
const { join } = require('path');
const { app, nativeImage, Tray, Menu, Notification } = require('electron');

let tray;
const menu = Menu.buildFromTemplate([
  {
    id: 'start_wireguard',
    label: 'Start Wireguard',
    click: () => {
      startWireguard(() => {
        switchMenuItems(true);
      });
    },
  },
  {
    id: 'stop_wireguard',
    label: 'Stop Wireguard',
    click: () => {
      stopWireguard(() => {
        switchMenuItems(false);
      });
    },
  },
  {
    type: 'separator',
  },
  {
    label: 'Preference',
    type: 'normal',
    click: () => {
      console.warn('todo');
    },
  },
  {
    label: 'Quit',
    type: 'normal',
    click: () => {
      app.quit();
    },
  },
]);
const notificationIcon = nativeImage.createFromPath(join(__dirname, './images/notification.png'));

function createIndicator(running) {
  if(tray) {
    tray.destroy();
  }
  tray = new Tray(join(__dirname, './images/wireguard.png'));
  switchMenuItems(running);
}

function switchMenuItems(running) {
  if(running) {
    menu.getMenuItemById('stop_wireguard').visible = true;
    menu.getMenuItemById('start_wireguard').visible = false;
  } else {
    menu.getMenuItemById('stop_wireguard').visible = false;
    menu.getMenuItemById('start_wireguard').visible = true;
  }
  tray.setContextMenu(menu);
}

function startWireguard(callback) {
  sudo.exec('wg-quick up wg17-4', { name: 'Wireguard' }, function(error, stdout, stderr) {
    if (error) {
      new Notification({
        title: 'Wireguard start failed!',
        body: error.message,
        icon: notificationIcon,
      }).show();
      console.error(error);
      return;
    }
    new Notification({
      title: 'Wireguard started!',
      body: `profile: wg-17-4`,
      icon: notificationIcon,
    }).show();
    callback(stdout);
  });
}

function stopWireguard(callback) {
  sudo.exec('wg-quick down wg17-4', { name: 'Wireguard' }, function(error, stdout, stderr) {
    if (error) {
      new Notification({
        title: 'Wireguard stop failed!',
        body: error.message,
        icon: notificationIcon,
      }).show();
      console.error(error);
      return;
    }
    new Notification({
      title: 'Wireguard stoped!',
      body: `profile: wg-17-4`,
      icon: notificationIcon,
    }).show();
    callback(stdout);
  });
}

app.on('ready', () => {
  ps.lookup({ command: 'wg-crypt', psargs: 'aux' }, (err, result) => {
    if(err) {
      new Notification({
        title: 'Wireguard lookup failed!',
        body: error.message,
        icon: notificationIcon,
      }).show();
      app.quit();
      return;
    }
    if(result.length > 0) {
      createIndicator(true);
    } else {
      createIndicator(false);
    }
  });
});