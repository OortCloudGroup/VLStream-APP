/**
 Created by  lanjian   on 2024/5/8  15:32
 Copyright 奥尔特云（深圳）智慧科技有限公司. All rights reserved.
 */

import { env } from './envConfig'

const oaAppConfig = {
  // 统一消息
  'messageui': {
    appID: 'e1a36857e77c4e238703a06e0e57e7a0',
    secretKey: '557d8735b655426cb21a4771b901de61',
    requestType: 'app'
  },
  // 统一支付
  'payui': {
    appID: '4f5e89a2ceed4a3780ef29f63554966b',
    secretKey: '54ec5775a58f41c68d911920f7a6327c',
    requestType: 'app'
  },
  // 统一工单
  'processui': {
    appID: '3b0ffd250acd400ea57fe23bd211c316',
    secretKey: '4555e6a5b2ec4e209932965ad6cdc9ae',
    requestType: 'app'
  },
  // 二维码管理平台
  'QRCodeManaPlat': {
    appID: 'ab1aba6b88a64064a8fc720d7dc69de0',
    secretKey: 'da601a4091b24606a4b7e467280bb5a5',
    requestType: 'app',
    'Device-Id': 'pcweb'
  },
  // 仓库
  'warehouse': {
    appID: '626b93e71baf4c63bd2cda7db02ed832',
    secretKey: '26c673e188214d2fbfe0a3b0bb74be73',
    requestType: 'app'
  },
  // 统一用户
  'unifiedUser': {
    appID: '7c170a697c0447f8a45bbac4d96dfef6',
    secretKey: '9cc161f366e24ab98e1362f0e21a721d',
    requestType: 'app'
  },
  // 摄像机管理后台
  'cameraMana': {
    appID: '7c170a697c0447f8a45bbac4d96dfef6',
    secretKey: '9cc161f366e24ab98e1362f0e21a721d',
    requestType: 'app'
  },
  // 摄像机管理后台深色
  'streamCloud': {
    appID: '7c170a697c0447f8a45bbac4d96dfef6',
    secretKey: '9cc161f366e24ab98e1362f0e21a721d',
    requestType: 'app'
  },
  // 调查问卷
  'questionnaire': {
    appID: 'ab1aba6b88a64064a8fc720d7dc69de0',
    secretKey: 'da601a4091b24606a4b7e467280bb5a5',
    requestType: 'app'
  },
  // 会议室管理
  'meetingMana': {
    appID: 'ab1aba6b88a64064a8fc720d7dc69de0',
    secretKey: 'da601a4091b24606a4b7e467280bb5a5',
    requestType: 'app'
  },
  // 移动教育平台
  'mobileeducationplatform': {
    appID: '5194373ae5664f809b288e11f8a4892b',
    secretKey: 'd319c101251d4d64b1976586b390ed37',
    requestType: 'app',
    'Device-Id': 'pcweb'
  },
  // 桌牌管理
  'tableCardMana': {
    appID: 'ab1aba6b88a64064a8fc720d7dc69de0',
    secretKey: 'da601a4091b24606a4b7e467280bb5a5',
    requestType: 'app'
  },
  // 门牌管理
  'doorCardMana': {
    appID: 'ab1aba6b88a64064a8fc720d7dc69de0',
    secretKey: 'da601a4091b24606a4b7e467280bb5a5',
    requestType: 'app'
  },
  // 通讯录
  'address_book': {
    appID: 'e1a36857e77c4e238703a06e0e57e7a0',
    secretKey: '557d8735b655426cb21a4771b901de61',
    requestType: 'app'
  }

}

const appEnv = env

let AppConfig = oaAppConfig
if (appEnv === 'oa') {
  AppConfig = oaAppConfig
}

export default AppConfig
