/*
 * SPDX-FileCopyrightText: 2026 OortCloud (https://vls.oortcloudsmart.com/en/)
 * SPDX-License-Identifier: MIT
 *
 * VLStream single 集群通用图片上传接口（方案 A）
 * 需求单：docs/single集群上传接口需求单.md
 *
 * 放置路径（相对 vls-stream 工程根）：
 *   ruoyi-vlstream/src/main/java/com/ruoyi/vlstream/test/vlstream/controller/VlsCommonUploadController.java
 *
 * 说明：
 * - ruoyi-vlstream 已依赖 ruoyi-system，可直接注入 ISysOssService，无需改任何 pom
 * - 存储走 sys_oss_config 表配置的 OSS（本集群为 MinIO，compose 里 minio 服务已在运行）
 * - 鉴权用 @SaCheckLogin（仅登录校验），不绑后台菜单权限，App 普通账号可用；
 *   如需收紧，可仿 VlsAnnotationImageController 加 @SaCheckPermission("...")
 * - 返回 BladeX R 风格：{"code":200,"success":true,"msg":"操作成功","data":{"url":"...","fileName":"..."}}
 *   与本集群 apaas-vls-server / wvp-server 主流格式一致，前端已兼容
 */

package com.ruoyi.vlstream.test.vlstream.controller;

import cn.dev33.satoken.annotation.SaCheckLogin;
import cn.hutool.core.util.ObjectUtil;
import com.ruoyi.system.domain.vo.SysOssVo;
import com.ruoyi.system.service.ISysOssService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springblade.core.tool.api.R;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Slf4j
@RestController
@RequiredArgsConstructor
@SaCheckLogin
@RequestMapping("/vlsCommonFile")
@Tag(name = "通用文件上传", description = "App/Web 通用图片上传（single 集群）")
public class VlsCommonUploadController {

    /** 允许上传的图片后缀（小写）。如需放开其他类型，往这里加即可 */
    private static final Set<String> ALLOWED_SUFFIX = Set.of(".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp");

    private final ISysOssService iSysOssService;

    /**
     * 通用图片上传，multipart 字段名 file
     */
    @Operation(summary = "通用图片上传", description = "multipart 字段 file，返回可公网访问的 url")
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public R<Map<String, String>> upload(@RequestPart("file") MultipartFile file) {
        if (ObjectUtil.isNull(file) || file.isEmpty()) {
            return R.fail("上传文件不能为空");
        }
        String originalName = file.getOriginalFilename();
        String suffix = originalName == null || !originalName.contains(".")
            ? "" : originalName.substring(originalName.lastIndexOf('.')).toLowerCase(Locale.ROOT);
        if (!ALLOWED_SUFFIX.contains(suffix)) {
            return R.fail("仅支持图片格式：" + ALLOWED_SUFFIX);
        }
        SysOssVo oss = iSysOssService.upload(file);
        Map<String, String> map = new HashMap<>(2);
        map.put("url", oss.getUrl());
        map.put("fileName", oss.getOriginalName());
        log.info("vlsCommonFile/upload: {} -> {}", originalName, oss.getUrl());
        return R.data(map);
    }
}
