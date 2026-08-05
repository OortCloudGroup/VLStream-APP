package com.oort.vlstream.app;

/**
 * 网关 / 应用配置。
 * <p>
 * DEFAULT_GATEWAY 来自 BuildConfig（app/build.gradle 的 buildConfigField），
 * 可在此扩展为运行时从 SharedPreferences / 远程配置读取。
 */
public final class AppConfig {

    /** 后端网关地址（含端口，不带末尾斜杠）。例如 https://workup-dev.myoumuamua.com:6433 */
    public static String getGateway() {
        return BuildConfig.DEFAULT_GATEWAY;
    }

    /** 业务网关前缀（与 H5 config.gateWay 保持一致），默认 "bus/" */
    public static String getGateWayPrefix() {
        return BuildConfig.DEFAULT_GATE_WAY;
    }

    private AppConfig() {
    }
}
