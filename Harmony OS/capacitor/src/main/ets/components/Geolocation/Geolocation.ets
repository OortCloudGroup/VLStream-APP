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

import { NativeAttribute } from '../PluginGlobal';
import capacitor from 'libcapacitor.so';
import { abilityAccessCtrl, common ,bundleManager, Permissions } from '@kit.AbilityKit';
import { geoLocationManager } from '@kit.LocationKit';
import { JSON } from '@kit.ArkTS';

let m_pageIndex:NativeAttribute

let locationCallback = (location:geoLocationManager.Location):void => {
  let res = JSON.stringify({
    timestamp:location.timeStamp,
    isWatchPosition:true,
    coords:{
    latitude:location.latitude,
    longitude:location.longitude,
    accuracy:location.accuracy,
    altitudeAccuracy:location.altitudeAccuracy,
    altitude: location.altitude,
    speed: location.speed,
    heading: location.direction }
  })
  capacitor.onArkTsResult(res, m_pageIndex.pageObject, m_pageIndex.pageWebTag);
};

export async function watchPosition(pageIndex:NativeAttribute){
  try {
    m_pageIndex = pageIndex
    let jsonArgs:ESObject = JSON.parse(pageIndex.pageArgs);
    let timeoutMs = jsonArgs.timeout as number || 10000
    let intervalMs = jsonArgs.interval as number || timeoutMs
    let enableHighAccuracy = jsonArgs.enableHighAccuracy as boolean
    let interval = (intervalMs / 1000) as number

    let permissionList: Array<Permissions> = []
    if(enableHighAccuracy) {
      permissionList = ['ohos.permission.LOCATION','ohos.permission.APPROXIMATELY_LOCATION']
    } else {
      permissionList = ['ohos.permission.APPROXIMATELY_LOCATION']
    }

    let atManager = abilityAccessCtrl.createAtManager();
    const context = getContext() as common.UIAbilityContext;
    await atManager.requestPermissionsFromUser(context, permissionList)
    let request: geoLocationManager.ContinuousLocationRequest = {
      'interval': interval,
      'locationScenario': geoLocationManager.UserActivityScenario.NAVIGATION,
    }
    geoLocationManager.on('locationChange', request, locationCallback);
  } catch (err) {
    capacitor.onArkTsResult(JSON.stringify({isWatchPosition:true,errorMsg:err?.message ?? 'watch position fail'}),pageIndex.pageObject, pageIndex.pageWebTag)
  }
}

export function clearWatch(pageIndex:NativeAttribute) :void {
  try {
    geoLocationManager.off('locationChange');
    capacitor.onArkTsResult(JSON.stringify({}), m_pageIndex.pageObject, m_pageIndex.pageWebTag);
  } catch (err) {
    capacitor.onArkTsResult(JSON.stringify({errorMsg:err?.message ?? 'clear watch fail'}),pageIndex.pageObject, pageIndex.pageWebTag)
  }
}

export async function checkPermissions(pageIndex:NativeAttribute) : Promise<void> {
  try {
    const atManager = abilityAccessCtrl.createAtManager();
    let tokenId: number = 0;
    let bundleInfo: bundleManager.BundleInfo = await bundleManager.getBundleInfoForSelf(bundleManager.BundleFlag.GET_BUNDLE_INFO_WITH_APPLICATION);
    let appInfo: bundleManager.ApplicationInfo = bundleInfo.appInfo;
    tokenId = appInfo.accessTokenId;
    const preciseResult = await atManager.checkAccessToken(tokenId, 'ohos.permission.LOCATION');
    const approximateResult = await atManager.checkAccessToken(tokenId,'ohos.permission.APPROXIMATELY_LOCATION');
    let locationValue = preciseResult === 0 ? "granted" : "denied";
    let coarseLocationValue = approximateResult === 0 ? "granted" : "denied";
    capacitor.onArkTsResult(JSON.stringify({ location:locationValue,coarseLocation:coarseLocationValue }), pageIndex.pageObject, pageIndex.pageWebTag);
  }
  catch (err){
    capacitor.onArkTsResult(JSON.stringify({errorMsg:err?.message ?? 'check permissions fail'}),pageIndex.pageObject, pageIndex.pageWebTag)
  }
}

export async function getCurrentPosition(pageIndex:NativeAttribute) {
  try {
    let jsonArgs:ESObject = JSON.parse(pageIndex.pageArgs);
    let enableHighAccuracy = jsonArgs.enableHighAccuracy as boolean
    let timeoutMs = jsonArgs.timeout as number || 10000

    let permissionList: Array<Permissions> = []
    if(enableHighAccuracy) {
      permissionList = ['ohos.permission.LOCATION','ohos.permission.APPROXIMATELY_LOCATION']
    } else {
      permissionList = ['ohos.permission.APPROXIMATELY_LOCATION']
    }

    let atManager = abilityAccessCtrl.createAtManager();
    const context = getContext() as common.UIAbilityContext;
    await atManager.requestPermissionsFromUser(context,permissionList)
    let request: geoLocationManager.SingleLocationRequest = {
      'locatingPriority': geoLocationManager.LocatingPriority.PRIORITY_LOCATING_SPEED,
      'locatingTimeoutMs': timeoutMs
    }
    const location = await geoLocationManager.getCurrentLocation(request)
    let res = JSON.stringify({timestamp:location.timeStamp,
      coords:{
        latitude:location.latitude,
        longitude:location.longitude,
        accuracy:location.accuracy,
        altitudeAccuracy:location.altitudeAccuracy,
        altitude: location.altitude,
        speed: location.speed,
        heading: location.direction }
    })
    capacitor.onArkTsResult(res, pageIndex.pageObject, pageIndex.pageWebTag);
  } catch (err) {
    capacitor.onArkTsResult(JSON.stringify({errorMsg:err?.message ?? 'get current position fail'}),pageIndex.pageObject, pageIndex.pageWebTag)
  }
}

export async function requestPermissions(pageIndex:NativeAttribute) : Promise<void> {
  try {
    let jsonArgs:ESObject = JSON.parse(pageIndex.pageArgs);
    let permissionsArr = jsonArgs.permissions as Array<string>
    let permissionList: Array<Permissions> =[]
    if(permissionsArr.includes("location")) {
      permissionList = ['ohos.permission.LOCATION','ohos.permission.APPROXIMATELY_LOCATION'];
    } else {
      permissionList = ['ohos.permission.APPROXIMATELY_LOCATION'];
    }
    let atManager = abilityAccessCtrl.createAtManager();
    const context = getContext() as common.UIAbilityContext;
    let data = await atManager.requestPermissionsFromUser(context, permissionList)
    let grantStatus: Array<number> = data.authResults;
    let locationValue = grantStatus[0] === 0 ? "granted" : "denied";
    let coarseLocationValue = grantStatus[1] === 0 ? "granted" : "denied";
    capacitor.onArkTsResult(JSON.stringify({ location:locationValue,coarseLocation:coarseLocationValue }), pageIndex.pageObject, pageIndex.pageWebTag);
  } catch (err) {
    capacitor.onArkTsResult(JSON.stringify({errorMsg:err?.message ?? 'request permissions fail'}),pageIndex.pageObject, pageIndex.pageWebTag)
  }
}

