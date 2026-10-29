package com.oort.vlstream;

/**
 * 网关 / 应用配置。
 * <p>
 * DEFAULT_GATEWAY 来自 BuildConfig（app/build.gradle 的 buildConfigField），
 * 可在此扩展为运行时从 SharedPreferences / 远程配置读取。
 */
public final class AppConfig {

    /** 后端环境名：multi=多租户生产 / single=单租户，域名由 H5 预设表决定 */
    public static String getVlEnv() {
        return BuildConfig.VL_ENV;
    }

    /** 业务网关覆盖地址（含端口，不带末尾斜杠）。留空表示沿用 H5 的环境预设 */
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
