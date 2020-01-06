#!/bin/bash

if [ -z $DEBUG ]; then
    http-server dist
else
    if [ ! -z $FrontdoorAddr ]; then
        sed -e '/BaseFrontDoorUrl:/ c\BaseFrontDoorUrl: "'$FrontdoorAddr'",' ./src/config/config.onebox.js > ./src/config/config.js
    fi
    npm run serve
fi
