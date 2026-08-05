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


#ifndef CAPACITOR_PLUGIN_GEOLOCATION_H
#define CAPACITOR_PLUGIN_GEOLOCATION_H

#include "getcapacitor/Plugin.h"

class Geolocation : public Plugin {
    PluginCall m_call;
    PluginCall watch_position_call;
public:
    Geolocation() {
    }
    ~Geolocation() {
    };
    
    void getCurrentPosition(PluginCall& call);
    void watchPosition(PluginCall& call);
    void clearWatch(PluginCall& call);
    void checkPermissions(PluginCall& call);
    void requestPermissions(PluginCall& call);
    void onArKTsResult(PluginCall& call);
};

#endif //CAPACITOR_PLUGIN_GEOLOCATION_H
