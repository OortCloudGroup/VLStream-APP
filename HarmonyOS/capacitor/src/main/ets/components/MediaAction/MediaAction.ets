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

import { ArkTsAttribute, NativeAttribute } from '../PluginGlobal';
import { common } from '@kit.AbilityKit';
import { camera, cameraPicker } from '@kit.CameraKit';
import { fileIo,fileUri, picker } from '@kit.CoreFileKit';
import { BusinessError } from '@kit.BasicServicesKit';
import { photoAccessHelper } from '@kit.MediaLibraryKit';
import { imageCompress } from '../ImageCompress/ImageCompressEx';
import { getAllExifProperties } from '../ImageCompress/ExifInfo'
import { fileIo as fs} from '@kit.CoreFileKit';
import capacitor from 'libcapacitor.so'
import * as ErrorCode from '../ImageCompress/ErrorCode'
import { ArkTsAttributeCameraEx, ArkTsAttributeCameraGallery, PhotoFileInfo } from './CameraDefine';


export async function startCameraPicker(pageIndex:NativeAttribute,cameraDirection:string,
  allowEditing:boolean,saveToGallery:boolean): Promise<ArkTsAttributeCameraEx>{

  let context = getContext() as common.Context;
  try {

    const cameraPositionMap: Record<string, camera.CameraPosition> = {
      'FRONT': camera.CameraPosition.CAMERA_POSITION_FRONT,
      'REAR': camera.CameraPosition.CAMERA_POSITION_BACK
    };

    // 获取摄像头位置，默认后置
    const cameraPosition = cameraPositionMap[cameraDirection] ||
    camera.CameraPosition.CAMERA_POSITION_BACK;

    let pickerProfile: cameraPicker.PickerProfile = {
      cameraPosition: cameraPosition
    };

    if (!saveToGallery && !allowEditing) {
      let pathDir = context.cacheDir; // 应用沙箱目录
      let fileName = `${new Date().getTime()}`; // 唯一文件名
      let filePath = `${pathDir}/${fileName}.tmp`;
      try {
        // 关键：创建文件并确保具备写入权限
        fileIo.createRandomAccessFileSync(filePath, fileIo.OpenMode.CREATE);
      } catch (error) {
        let err = error as BusinessError;
        console.error(`create file failed. error code: ${err.code}`);
      }

      let uri = fileUri.getUriFromPath(filePath); // 转换为合法URI
      pickerProfile.saveUri = uri;
    }

    if(pageIndex.pageValue == 0) {
      let pickerResult: cameraPicker.PickerResult = await cameraPicker.pick(context, [cameraPicker.PickerMediaType.PHOTO], pickerProfile);
      console.log("the pick pickerResult is:" + JSON.stringify(pickerResult));

      if (pickerResult.resultCode == ErrorCode.CameraFail) {
        return new Promise((resolve, reject) => {
          resolve({content: "content", result: [], code: ErrorCode.CameraFail});
        });
      }

      if (!pickerResult.resultUri || pickerResult.resultUri === '') {
        // 用户取消了拍照，返回空结果
        return new Promise((resolve, reject) => {
          resolve({content: "content", result: [], code: ErrorCode.UserCancel });
        });
      }

      let galleryResult: ArkTsAttributeCameraEx = {
        content:"content",
        result:[],
        code:0
      }

      if(allowEditing) {
        galleryResult = await selectPhotoPicket(0, 1);
        //openEditor(pageIndex,pickerResult.resultUri);
      }

      return new Promise((resolve, reject) => {
        let result:Array<string> = new Array<string>();
        if (galleryResult.result.length > 0) {
          result.push(galleryResult.result[0]);
        } else {
          // 用户取消了图库选择，返回原始拍照结果
          result.push(pickerResult.resultUri);
        }

        resolve({content: "content", result: result});
      });
    } else {
      let pickerResult: cameraPicker.PickerResult = await cameraPicker.pick(context, [cameraPicker.PickerMediaType.VIDEO], pickerProfile);
      console.log("the pick pickerResult is:" + JSON.stringify(pickerResult));
      return new Promise((resolve, reject) => {
        let result:Array<string> = new Array<string>();
        result.push(pickerResult.resultUri);
        resolve({content: "content", result: result});
      });
    }
  } catch (error) {
    let err = error as BusinessError;
    console.error(`the pick call failed. error code: ${err.code}`);
  }
  return new Promise((resolve, reject) => {
    resolve({content: "content", result: []});
  });
}

//选择音频文件
export function selectAudioPicket(pageIndex:NativeAttribute): Promise<ArkTsAttribute> {
  let context = getContext() as common.Context;
  let audioSelectOptions = new picker.AudioSelectOptions();
  audioSelectOptions.maxSelectNumber = Number(pageIndex.pageArgs); // 选择媒体文件的最大数目
  let audioPicker = new picker.AudioViewPicker(context);
  return new Promise((resolve, reject) => {
    try {
      audioPicker.select(audioSelectOptions, (err: BusinessError, audioSelectResult: Array<string>) => {
        if (err) {
          console.error('AudioViewPicker.select failed with err: ' + JSON.stringify(err));
          resolve({content: "", result: []});
          return;
        }
        console.info('AudioViewPicker.select successfully, audioSelectResult uri: ' + JSON.stringify(audioSelectResult));
        resolve({content: "content", result: audioSelectResult});
      });
    } catch (error) {
      let err: BusinessError = error as BusinessError;
      console.error('AudioViewPicker failed with err: ' + JSON.stringify(err));
      resolve({content: "", result: []});
    }
  });
}

//使用photoPicker选择媒体文件
export function selectPhotoPicket(type:number, maximumImagesCount:number): Promise<ArkTsAttributeCameraEx> {
  const photoSelectOptions = new photoAccessHelper.PhotoSelectOptions();
  if(type == 0)
    photoSelectOptions.MIMEType = photoAccessHelper.PhotoViewMIMETypes.IMAGE_TYPE; // 过滤选择媒体文件类型为IMAGE
  else if(type == 1)
    photoSelectOptions.MIMEType = photoAccessHelper.PhotoViewMIMETypes.VIDEO_TYPE; // 过滤选择媒体文件类型为VIDEO
  else
    photoSelectOptions.MIMEType = photoAccessHelper.PhotoViewMIMETypes.IMAGE_VIDEO_TYPE; // 过滤选择媒体文件类型为VIDEO
  photoSelectOptions.maxSelectNumber = maximumImagesCount; // 选择媒体文件的最大数目

  let uris: Array<string> = [];
  const photoViewPicker = new photoAccessHelper.PhotoViewPicker();
  return new Promise((resolve, reject) => {
    photoViewPicker.select(photoSelectOptions).then((photoSelectResult: photoAccessHelper.PhotoSelectResult) => {
      uris = photoSelectResult.photoUris;
      console.info('photoViewPicker.select to file succeed and uris are:' + uris);
      resolve({content: "content", result: uris ,code: 0});
    }).catch((err: BusinessError) => {
      console.error(`Invoke photoViewPicker.select failed, code is ${err.code}, message is ${err.message}`);
      resolve({content: "", result: [], code: ErrorCode.PhotosFail});
    });
  });
}


interface compressArg {
  Quality: number;
  CameraImageCompress: boolean;
  CompressImageSize:number;
  CameraCompressShowToast: string;
}

interface operationArg {
  AllowEditing: boolean;
  SaveToGallery: boolean;
  Width:number;
  Height: number;
  CorrectOrientation:boolean,
  Limit:number;
}

// 安全解析工具：输入可能是 string/object/undefined
function parseMaybeJSON<T>(val:string | object | undefined, fallback: T): T {
  if (typeof val === "string") {
    try { return JSON.parse(val) as T; } catch { return fallback; }
  }
  if (val && typeof val === "object") {
    return val as T;
  }
  return fallback;
}


export async function SelectMedia(pageIndex:NativeAttribute) {

  let compress: compressArg = {
    Quality: 50,
    CameraImageCompress: false,
    CompressImageSize: 4 * 1024 * 1024,
    CameraCompressShowToast: ""
  };

  let operation: operationArg = {
    AllowEditing:false,
    SaveToGallery:false,
    Width:0,
    Height:0,
    CorrectOrientation:true,
    Limit:0,
  };

  const jsonRoot = JSON.parse(pageIndex.pageArgs) as Record<string, string | object | undefined>;

  const method = typeof jsonRoot["method"] === "string" ? (jsonRoot["method"] as string) : "";
  compress = parseMaybeJSON<compressArg>(jsonRoot["compressArgs"], compress);
  operation  = parseMaybeJSON<operationArg>(jsonRoot["operationArgs"], operation);


  let result: ArkTsAttributeCameraEx = await selectPhotoPicket(pageIndex.pageValue, operation.Limit);
  let uriArray: Array<string> = result.result;
  if (uriArray.length == 0) {
    let resultsErr:ArkTsAttributeCameraGallery = {
      content: method,
      result: [],
      code: ErrorCode.UserCancel
    }
    capacitor.onArkTsResult(JSON.stringify(resultsErr), pageIndex.pageObject, pageIndex.pageWebTag);
    return;
  }

  if(pageIndex.pageValue == 0) {
    if (compress.Quality < 100) {
      if (compress.CameraImageCompress) {
        if (compress.CameraCompressShowToast != "") {
          let duration: number = uriArray.length * 1000;
          console.info("压缩图片,处理中...");
        }
      } else {
        let duration: number = uriArray.length * 1000;
        console.info("压缩图片,处理中...");
      }
    }
  }

  let filePaths: Array<string> = new Array<string>();
  let fileInfos: PhotoFileInfo[] = new Array();

  for (let i = 0; i < uriArray.length; i++) {
    if (uriArray[i].lastIndexOf(".") < 0) {
      return;
    }

    let extName: string = uriArray[i].substring(uriArray[i].lastIndexOf("."));
    let resourceFile: fs.File | null = null;
    try {
      resourceFile = fs.openSync(uriArray[i], fs.OpenMode.READ_ONLY);
    } catch (err) {
      let ret:ArkTsAttributeCameraGallery = {
        content : method,
        result: [],
        code:ErrorCode.FileFail
      };
      capacitor.onArkTsResult(JSON.stringify(ret), pageIndex.pageObject, pageIndex.pageWebTag);
      return;
    }

    let exifInfo = await getAllExifProperties(resourceFile);
    const context: common.UIAbilityContext = getContext() as common.UIAbilityContext;
    let cacheDir = context.cacheDir;
    let fileName: number = new Date().getTime();
    let filePath: string = `${cacheDir}/${fileName}${i}${extName}`;
    if (pageIndex.pageValue == 0) { //0选照片进行了压缩，1选视频
      if (compress.Quality < 100) {
        filePath = await imageCompress(resourceFile, filePath, compress.CompressImageSize,
          operation.Width,operation.Height,"image/jpeg",operation.CorrectOrientation,compress.Quality);
      } else {
        let file: fs.File = fs.openSync(filePath, fs.OpenMode.READ_WRITE | fs.OpenMode.CREATE);
        fs.copyFileSync(resourceFile.fd, file.fd);
        fs.closeSync(file);
      }
      if (filePath != "") {
        filePaths.push(filePath);
      }
    } else {
      //视频C++侧转换为path，ArkTs侧无法转换
      filePaths.push(uriArray[i]);
    }
    fileInfos.push({
      path: filePath,
      exif: exifInfo
    });
    fs.closeSync(resourceFile);
  }

  let results:ArkTsAttributeCameraGallery = {
    content: method,
    result:fileInfos,
    code:0
  }

  capacitor.onArkTsResult(JSON.stringify(results), pageIndex.pageObject, pageIndex.pageWebTag);
}