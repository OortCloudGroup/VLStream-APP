// import uiConfig from '@/config/UIConfig'
import Config from '@/config'
// import configData from '@/assets/defaultPlatFormSetting.json'
// import { converGatewayPath } from '@/utils/converGatewayPath'

const initConfig = () => {
  // 加载配置文件
  return new Promise((resolve, reject) => {
    // if (window.location.hostname !== 'localhost' && window.location.hostname !== '192.168.88.56') {
    //   let pathName = window.location.pathname.split('/')[1]
    //   Config.gateWay = pathName + '/'
    //   Config.URL = window.location.origin + '/'


    //   const arr = window.location.pathname.split('/')
    //   let frontService = 'front'
    //   if (arr.length > 2) {
    //     frontService = window.location.pathname.split('/')[2]
    //   }
    //   Config.frontURLStr = '/' + pathName + "/" + frontService

    //  // 判断是不是星火网关
    //   if (pathName.includes('ga')) {
    //     Config.headers = {
    //       'secretKey': 'zuul',
    //       'appID': 'zuul',
    //       'applyID': 'zuul',
    //       'requestType': 'zuul'
    //     }
    //   }
    // }
    resolve({ })
    // fetch(Config.URL + Config.gateWay + 'oortcloud-sso/' + 'frontConf/v1/config.json', { method: 'get'}).then(res => {
    //   if (res.status === 200) {
    //     res.json().then(data => {
    //        // 判断为空的时候使用默认的配置
    //        if(data.logo) {
    //         handleUIConfig(data);
    //         resolve(res);
    //       } else {
    //         handleUIConfig(configData);
    //         resolve(res);
    //       }
    //     })
    //   } else {
    //     handleUIConfig(configData)
    //     console.error('服务配置接口', res.status, res.statusText)
    //     reject()
    //   }
    // })
  })
}

// 处理UI配置的文件
// const handleUIConfig = (config: any) => {
//   // 处理没有的在平台设置的uiconfig的logo 设置为统一的
//   for (const key in uiConfig) {
//     uiConfig[key].logo = config.logo
//     uiConfig[key].logoWhite = config.logoWhite
//     uiConfig[key].login_bottom = config.login_bottom
//   }
//   // 处理logo
//   for (const key in config.platform) {
//     config.platform[key].logo = config.logo
//     config.platform[key].logoWhite = config.logoWhite
//     config.platform[key].login_bottom = config.login_bottom
//     if (!config.platform[key].loginPageFlag1) {
//       config.platform[key].loginPageFlag1 = config.loginPageFlag1
//     }
//     if (!config.platform[key].loginPageFlag2) {
//       config.platform[key].loginPageFlag2 = config.loginPageFlag2
//     }
//     uiConfig[key] = config.platform[key]
//   }
//   Config['logo'] = config.logo
//   Config['logoWhite'] = config.logoWhite
//   Config.common = config.common
//   Config.common.logo = config.logo
//   Config.common.logoWhite = config.logoWhite
//   Config.common.bottomLogo = config.bottomLogo
//   Config.common.login_bottom = config.login_bottom
//   Config.common.copyRightCompany = config.copyRightCompany || config.login_bottom
//   Config.common.servicesCompany = config.servicesCompany || config.login_bottom
//   Config.common.contactUSLink = config.contactUSLink
//   Config.common.legalStatementLink = config.legalStatementLink
//   Config.common.privacyPolicyLink = config.privacyPolicyLink
//   Config.common.ICPNumber = config.ICPNumber
//   // 处理请求头的逻辑
//   if (config.header) {
//     config.header.forEach((item: any) => {
//       if (item.checked) {
//         Config.headers[item.key] = item.value
//       }
//     })
//   }
//   // 处理浏览器tab的图标
//   if (config.faviconURL) {
//     changeFavicon(config.faviconURL)
//   }
// }

// function changeFavicon(newIconURL) {
//   // 找到现有的<link rel="icon"> 元素
//   let faviconLink = document.querySelector('link[rel="shortcut icon"]') || document.querySelector('link[rel="icon"]')
//   newIconURL = converGatewayPath(newIconURL)
//   // 如果找到了，更改它的href属性
//   if (faviconLink) {
//     faviconLink['href'] = newIconURL
//   } else {
//     // 如果没有找到，创建一个新的<link>元素
//     let newFavicon = document.createElement('link')
//     newFavicon.rel = 'icon'
//     newFavicon.href = newIconURL

//     // 将新的<link>元素添加到<head>
//     document.head.appendChild(newFavicon)
//   }
// }
export default initConfig
