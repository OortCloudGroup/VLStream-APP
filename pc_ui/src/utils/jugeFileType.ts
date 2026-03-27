/**
 Created by  lanjian   on 2021/10/16  15:08
 Copyright 奥尔特云（深圳）智慧科技有限公司. All rights reserved.
 */
/*
  根据文件名称判断文件类型
  * @param: fileName - 文件名称
  * @param: 数据返回 pic) 匹配图片 - image
  * @param: 数据返回 txt) 匹配 txt - txt
  * @param: 数据返回 excel) 匹配 excel - excel
  * @param: 数据返回 word) 匹配 word - word
  * @param: 数据返回 pdf) 匹配 pdf - pdf
  * @param: 数据返回 ppt) 匹配 ppt - ppt
  * @param: 数据返回 mp4) 匹配 视频 - video
  * @param: 数据返回 mp3) 匹配 音频 - radio
  */
export default function(fileName) {
  // 后缀获取
  let suffix = ''
  // 获取类型结果
  let result: any = ''
  try {
    let flieArr = fileName.split('.')
    suffix = flieArr[flieArr.length - 1]
  } catch (err) {
    suffix = ''
  }
  // fileName无后缀返回 false
  if (!suffix) {
    result = ''
    return result
  }
  // 图片格式
  let imglist = ['png', 'jpg', 'jpeg', 'bmp', 'gif']
  // 进行图片匹配
  result = imglist.some(function(item) {
    return item === suffix
  })
  if (result) {
    result = 'pic'
    return result
  }

  // 匹配txt
  let txtlist = ['txt']
  result = txtlist.some(function(item) {
    return item === suffix
  })
  if (result) {
    result = 'txt'
    return result
  }

  // 匹配 excel
  let excelist = ['xls', 'xlsx']
  result = excelist.some(function(item) {
    return item === suffix
  })
  if (result) {
    result = 'excel'
    return result
  }

  // 匹配 word
  let wordlist = ['doc', 'docx']
  result = wordlist.some(function(item) {
    return item === suffix
  })
  if (result) {
    result = 'word'
    return result
  }

  // 匹配 pdf
  let pdflist = ['pdf']
  result = pdflist.some(function(item) {
    return item === suffix
  })
  if (result) {
    result = 'pdf'
    return result
  }

  // 匹配 ppt
  let pptlist = ['ppt', 'pptx']
  result = pptlist.some(function(item) {
    return item === suffix
  })
  if (result) {
    result = 'ppt'
    return result
  }

  // 匹配 视频
  let videolist = ['mp4', 'm2v', 'mkv']
  result = videolist.some(function(item) {
    return item === suffix
  })
  if (result) {
    result = 'mp4'
    return result
  }

  // 匹配 音频
  let radiolist = ['mp3', 'wav', 'wmv']
  result = radiolist.some(function(item) {
    return item === suffix
  })
  if (result) {
    result = 'mp3'
    return result
  }
  result = ['7z'].some(function(item) {
    return item === suffix
  })
  if (result) {
    result = 'z' // 7z
    return result
  }
  result = ['rar'].some(function(item) {
    return item === suffix
  })
  if (result) {
    result = 'rar'
    return result
  }
  result = ['zip'].some(function(item) {
    return item === suffix
  })
  if (result) {
    result = 'zip'
    return result
  }
  result = ['apk'].some(function(item) {
    return item === suffix
  })
  if (result) {
    result = 'apk'
    return result
  }
  result = ['aep'].some(function(item) {
    return item === suffix
  })
  if (result) {
    result = 'aep'
    return result
  }
  result = ['ai'].some(function(item) {
    return item === suffix
  })
  if (result) {
    result = 'ai'
    return result
  }
  result = ['mov'].some(function(item) {
    return item === suffix
  })
  if (result) {
    result = 'mov'
    return result
  }
  result = ['psd'].some(function(item) {
    return item === suffix
  })
  if (result) {
    result = 'psd'
    return result
  }
  result = ['ttf'].some(function(item) {
    return item === suffix
  })
  if (result) {
    result = 'ttf'
    return result
  }
  return ''
}
