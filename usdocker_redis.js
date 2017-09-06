'use strict';

const usdocker = require('@usdocker/usdocker');
const path = require('path');
const fs = require('fs');

const SCRIPTNAME = 'redis';

let config = usdocker.config(SCRIPTNAME);
let configGlobal = usdocker.configGlobal();
const CONTAINERNAME = SCRIPTNAME + configGlobal.get('container-suffix');

function getContainerDef() {

    let docker = usdocker.dockerRunWrapper(configGlobal);
    return docker
        .containerName(CONTAINERNAME)
        .port(config.get('port'), 6379)
        .volume(config.get('folder'), '/data')
        .volume(path.join(config.getUserDir('conf'), 'redis.conf'), '/etc/redis.conf')
        .env('TZ', configGlobal.get('timezone'))
        .isDetached(true)
        .isRemove(true)
        .imageName(config.get('image'))
        .commandParam('redis-server')
        .commandParam('/etc/redis.conf')
    ;
}

module.exports = {
    setup: function(callback)
    {
        config.setEmpty('image', 'redis:3-alpine');
        config.setEmpty('rdmImage', 'benoitg/redis-desktop-manager');
        config.setEmpty('folder', config.getDataDir());
        config.setEmpty('port', 6379);

        config.copyToUserDir(path.join(__dirname, 'redis', 'conf'));

        callback(null, 'setup loaded for ' + SCRIPTNAME);
    },

    client: function(callback, extraArgs)
    {
        usdocker.exec(CONTAINERNAME, ['redis-cli'].concat(extraArgs), callback);
    },

    debugcli(callback) {
        let result = usdocker.outputRaw('cli', getContainerDef());
        callback(result);
    },

    debugapi(callback) {
        let result = usdocker.outputRaw('api', getContainerDef());
        callback(result);
    },

    up: function(callback)
    {
        usdocker.up(CONTAINERNAME, getContainerDef(), callback);
    },

    status: function(callback) {
        usdocker.status(CONTAINERNAME, callback);
    },

    down: function(callback)
    {
        usdocker.down(CONTAINERNAME, callback);
    },

    rdm: function(callback)
    {
        let docker = usdocker.dockerRunWrapper(configGlobal);
        docker
            .containerName('rdm' + configGlobal.get('container-suffix'))
            .volume('/tmp/.X11-unix', '/tmp/.X11-unix')
            .volume(path.join(process.env.HOME, '.rdm'), '/root/.rdm')
            .volume(path.dirname(process.env.SSH_AUTH_SOCK), path.dirname(process.env.SSH_AUTH_SOCK))
            .env('TZ', configGlobal.get('timezone'))
            .env('DISPLAY')
            .dockerParamAdd('Devices', { 'PathOnHost': '/dev/dri', 'PathInContainer': '/dev/dri', 'CgroupPermissions': 'mrw'})
            .isInteractive(true)
            .isDetached(false)
            .isRemove(true)
            .imageName(config.get('rdmImage'))
        ;

        let rdmBash = [];
        docker.linkRunning(function () {
            rdmBash.push('#!/usr/bin/env bash');
            rdmBash.push('xhost +SI:localuser:root');
            rdmBash.push(usdocker.outputRaw('cli', docker));
            rdmBash.push('xhost -SI:localuser:root');

            fs.writeFileSync('/tmp/rdm.sh', rdmBash.join('\n'));
            fs.chmodSync('/tmp/rdm.sh', '777');

            callback('Write to /tmp/rdm.sh', 'Write to /tmp/rdm.sh\n\n' + rdmBash.join('\n'));
        });
    },

    restart: function(callback)
    {
        usdocker.restart(CONTAINERNAME, getContainerDef(), callback);
    }
};
