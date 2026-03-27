/*
* @Created by: 兰舰
* Email: gglanjian@qq.com
* Phone: 16620805419
* @Date: 2024-11-15 11:07:04
 * @Last Modified by: 兰舰
 * @Last Modified time: 2024-12-19 18:47:42
* @Copyright aPaaS-front-team. All rights reserved.
*/
const shell = require('shelljs')

const appConfig = [
  'messageui',
  'payui',
  'processui',
  'unifiedUser',
  'reportForm',
  'reportFormGroup',
  'desktopHome'
]

appConfig.forEach((item) => {
  shell.exec('pnpm run build:' + item + ' && pnpm run deploy:' + item)
})

