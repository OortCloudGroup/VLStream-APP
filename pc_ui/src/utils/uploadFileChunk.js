/**
 * 文件分块上传工具
 * Created by lanjian on 2024/01/01
 * Copyright 奥尔特云（深圳）智慧科技有限公司. All rights reserved.
 */

import SparkMD5 from 'spark-md5'

import { uploadBlockFile, uploadCheck } from '@/api/fastdfs'

/**
 * 文件分块上传
 * @param {Object} options 上传配置选项
 * @param {Blob|File} options.file 要上传的文件对象
 * @param {Object} options.block 分块配置信息
 * @param {number} options.block.maxblocksize 分块大小
 * @param {Object} options.params 其他上传参数
 * @param {string} options.params.accessToken 访问令牌
 * @param {string} options.params.name 文件名
 * @param {Function} options.onProgress 进度回调函数 (percentage: number) => void
 * @param {Function} options.onSuccess 成功回调函数 (result: any) => void
 * @param {Function} options.onError 错误回调函数 (error: any) => void
 * @returns {Promise} 返回上传结果
 */
export async function bigFileUpload(options) {
   // 默认 maxblocksize 为 2MB
   if (!options.block) {
    options.block = {
      maxblocksize: 2 * 1024 * 1024
    }
  }
  console.log('options--->', options.file)
  // file 的 md5 值
  const fileMd5 = await calcFileMd5(options.file)
  options.file.md5 = fileMd5
// 先检查是否可以妙传
  const checkParams = {
    accessToken: options.params.accessToken,
    file_name: options.params.name,
    file_size: options.file.size,
    file_md5: options.file.md5
  }
  const checkRes = await uploadCheck(checkParams)
  if (checkRes.code === 200) {
    // 文件存在就直接返回
    if(checkRes.data.file_exists) {
      options.onSuccess(checkRes.data)
      options.onProgress(100, options.file)
      return
    } else {
      if(checkRes.data.block && checkRes.data.block.maxblocksize ) {
        options.block.maxblocksize = checkRes.data.block.maxblocksize
      }
      // 文件不存在就分块上传
      uploadFileChunk(options)
    }
  } else {
    options.onError(checkRes)
  }
}

/**
 * 文件分块上传
 * @param {Object} options 上传配置选项
 * @param {Blob|File} options.file 要上传的文件对象
 * @param {Object} options.block 分块配置信息
 * @param {number} options.block.maxblocksize 分块大小
 * @param {Object} options.params 其他上传参数
 * @param {string} options.params.accessToken 访问令牌
 * @param {string} options.params.name 文件名
 * @param {Function} options.onProgress 进度回调函数 (percentage: number) => void
 * @param {Function} options.onSuccess 成功回调函数 (result: any) => void
 * @param {Function} options.onError 错误回调函数 (error: any) => void
 * @returns {Promise} 返回上传结果
 */
export function uploadFileChunk(options) {
  const {
    file,
    block,
    params,
    onProgress,
    onSuccess,
    onError
  } = options

  return new Promise((resolve, reject) => {
    try {
      // 文件分片方法兼容性处理
      const blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice
        const chunkSize = block.maxblocksize // 根据后台返回的分块大小
       const chunks = Math.ceil(file.size / chunkSize)
       const offset = block.offset  || 0 // 文件偏移位置`
       let currentChunk = 0
       let currentOffset = offset
       let currentBlockFile = null

      // 读取文件块的回调函数
      const frOnload = async (e) => {
        try {
          console.log('成功读取块数：' + parseInt(currentChunk + 1) + ' of ' + chunks)
          
          // 计算当前块的MD5
          const spark = new SparkMD5.ArrayBuffer()
          spark.append(e.target.result)
          const blockmd5 = spark.end()
          
          currentChunk++
          console.log(currentChunk, chunks)
          
          if (currentChunk <= chunks) {
            // 上传当前块
            const uploadParams = {
              accessToken: params.accessToken,
              file_md5: file.md5,
              file_size: file.size,
              file_name: params.name,
              block_file: currentBlockFile,
              block_md5: blockmd5,
            }
            
            const formData = new FormData()
            for (let name in uploadParams) {
              formData.append(name, uploadParams[name])
            }
            
            const res = await uploadBlockFile(formData)
            
            if (res.code === 200) {
              if (res.data.file_exists && res.data.file) {
                // 上传完成
                const result = {
                  success: true,
                  code: res.code,
                  data: res.data,
                  message: '文件上传成功'
                }
                if (onProgress) {
                  onProgress(100, currentBlockFile)
                }
                if (onSuccess) {
                  onSuccess(res.data)
                }
                resolve(result)
              } else {
                // 继续上传下一块
                loadNext()
              }
            } else {
              // 上传失败
              const error = {
                success: false,
                code: res.code,
                message: res.msg
              }
              
              if (onError) {
                onError(error)
              }
              
              reject(error)
            }
          }
        } catch (error) {
          console.error('上传块时发生错误:', error)
          
          const errorObj = {
            success: false,
            message: error.message || '上传块时发生错误'
          }
          
          if (onError) {
            onError(errorObj)
          }
          
          reject(errorObj)
        }
      }

      // 文件读取错误处理
      const frOnerror = () => {
        console.log('文件读取发生错误')
        const error = {
          success: false,
          message: '文件读取发生错误'
        }
        
        if (onError) {
          onError(error)
        }
        
        reject(error)
      }

      // 加载下一块
      const loadNext = () => {
        const fileReader = new FileReader()
        fileReader.onload = frOnload
        fileReader.onerror = frOnerror
        
        const start = offset + currentChunk * chunkSize
        currentOffset = start
        
        // 计算进度
        const percentage = Math.ceil((start / file.size) * 100)
        if (onProgress) {
          onProgress(percentage, currentBlockFile)
        }
        
        const end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize
        currentBlockFile = blobSlice.call(file, start, end)
        
        console.log('分割成功', start, '---', end)
        fileReader.readAsArrayBuffer(blobSlice.call(file, start, end))
      }
      // 开始上传
      loadNext()
      
    } catch (error) {
      console.error('初始化上传时发生错误:', error)
      
      const errorObj = {
        success: false,
        message: error.message || '初始化上传时发生错误'
      }
      
      if (onError) {
        onError(errorObj)
      }
      
      reject(errorObj)
    }
  })
}

/**
 * 计算文件MD5
 * @param {File|Blob} file 文件对象
 * @param {number} chunkSize 分块大小，默认10MB
 * @returns {Promise<string>} 返回文件的MD5值
 */
export function calcFileMd5(file, chunkSize = 2097152 * 5) {
  return new Promise((resolve, reject) => {
    try {
      const blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice
      const chunks = Math.ceil(file.size / chunkSize)
      let currentChunk = 0
      const spark = new SparkMD5.ArrayBuffer()
      
      const frOnload = function(e) {
        console.log('\nread chunk number ' + parseInt(currentChunk + 1) + ' of ' + chunks)
        spark.append(e.target.result)
        currentChunk++
        
        if (currentChunk < chunks) {
          loadNext()
        } else {
          console.log('finished 完成')
          const code = spark.end()
          resolve(code)
        }
      }
      
      const frOnerror = function() {
        console.log('计算MD5时发生错误')
        reject(new Error('计算MD5时发生错误'))
      }
      
      function loadNext() {
        const fileReader = new FileReader()
        fileReader.onload = frOnload
        fileReader.onerror = frOnerror
        
        const start = currentChunk * chunkSize
        const end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize
        fileReader.readAsArrayBuffer(blobSlice.call(file, start, end))
      }
      
      loadNext()
    } catch (error) {
      reject(error)
    }
  })
}

export default {
  uploadFileChunk,
  calcFileMd5
}
