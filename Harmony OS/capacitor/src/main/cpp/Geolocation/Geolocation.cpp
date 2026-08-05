/*
 * The MIT License (MIT)
 * Copyright (C) 2026 Huawei Device Co., Ltd and iSoftStone Information Technology(Group)Co.,Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 */

#include "Geolocation.h"
#include "cJSON.h"

REGISTER_CAP_PLUGIN(Geolocation, Geolocation)

REGISTER_PLUGIN_METHOD(Geolocation, getCurrentPosition, PluginMethod::RETURN_PROMISE)
void Geolocation::getCurrentPosition(PluginCall& call)
{
    m_call = call;
    char* pStr = cJSON_Print(call.getData());
    executeArkTs("./Geolocation/Geolocation/getCurrentPosition", 0, pStr, "Geolocation", call);
}

REGISTER_PLUGIN_METHOD(Geolocation, watchPosition, PluginMethod::RETURN_CALLBACK)
void Geolocation::watchPosition(PluginCall& call)
{
    watch_position_call = call;
    char* pStr = cJSON_Print(call.getData());
    executeArkTs("./Geolocation/Geolocation/watchPosition", 0, pStr, "Geolocation", call);
}

REGISTER_PLUGIN_METHOD(Geolocation, clearWatch, PluginMethod::RETURN_PROMISE)
void Geolocation::clearWatch(PluginCall& call)
{
    m_call = call;
    executeArkTs("./Geolocation/Geolocation/clearWatch", 0, "", "Geolocation", call);
    watch_position_call.release();
}

REGISTER_PLUGIN_METHOD(Geolocation, checkPermissions, PluginMethod::RETURN_PROMISE)
void Geolocation::checkPermissions(PluginCall& call)
{
    m_call = call;
    executeArkTs("./Geolocation/Geolocation/checkPermissions", 0, "", "Geolocation", call);
}


REGISTER_PLUGIN_METHOD(Geolocation, requestPermissions, PluginMethod::RETURN_PROMISE)
void Geolocation::requestPermissions(PluginCall& call)
{
    m_call = call;
    char* pStr = cJSON_Print(call.getData());
    executeArkTs("./Geolocation/Geolocation/requestPermissions", 0, pStr, "Geolocation", call);
}


REGISTER_PLUGIN_METHOD(Geolocation, onArKTsResult, PluginMethod::RETURN_PROMISE)
void Geolocation::onArKTsResult(PluginCall& call)
{
    if (call.hasOption("errorMsg")) {
        if (call.hasOption("isWatchPosition") && call.getBoolean("isWatchPosition")) {
            watch_position_call.reject(call.getString("errorMsg"));
        } else {
            m_call.reject(call.getString("errorMsg"));
        }
    } else if (call.hasOption("isWatchPosition") && call.getBoolean("isWatchPosition") &&
            !watch_position_call.isReleased()) {
        watch_position_call.save();
        cJSON* json = call.getData();
        cJSON_DeleteItemFromObject(json, "isWatchPosition");
        watch_position_call.resolve(call.getData());
    } else {
        m_call.resolve(call.getData());
    }
}