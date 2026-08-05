package com.oort.vlstream.app;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // 自研业务 plugin 必须在 super.onCreate 之前注册
        registerPlugin(NativeBridgePlugin.class);
        super.onCreate(savedInstanceState);
    }
}
