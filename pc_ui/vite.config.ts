/*
* @Created by: 兰舰
* Email: gglanjian@qq.com
* Phone: 16620805419
* @Date: 2024-11-15 11:07:04
 * @Last Modified by: 兰舰
 * @Last Modified time: 2025-08-11 14:14:53
* @Copyright aPaaS-front-team. All rights reserved.
*/
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueSetupExtend from 'vite-plugin-vue-setup-extend'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import viteSvgIcons from 'vite-plugin-svg-icons'
import vueJsx from '@vitejs/plugin-vue-jsx'
// @ts-ignore
import path, { resolve } from 'path'
import postcsspxtoviewport from 'postcss-px-to-viewport'
import { createHtmlPlugin } from 'vite-plugin-html'
import { visualizer } from 'rollup-plugin-visualizer'
import OptimizationPersist from 'vite-plugin-optimize-persist'
import PkgConfig from 'vite-plugin-package-config'
import removeConsole from 'vite-plugin-remove-console'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  let proDir = env.VITE_PROJECT_DIR
  // 如果是编译生产
  if (env.NODE_BUILDTARGET) {
    proDir = env.NODE_BUILDTARGET
  }
  console.log('---------------------------------------------------------------')
  console.log('--------------------当前运行项目---', path.resolve(__dirname, './src/' + proDir))
  console.log('---------------------------------------------------------------')
  const projectPath:string = 'pages/' + proDir

  if (command === 'serve') {
    // dev 独有配置
  } else {
    // command === 'build'
    // build 独有配置
  }

  return {
    define: {
      // enable hydration mismatch details in production build
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'true'
    },
    base: './',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@@': path.resolve(__dirname, './src/' + projectPath)
      },
      extensions: ['.js', '.vue', '.json', '.ts'] // 使用路径别名时想要省略的后缀名，可以自己 增减
    },
    plugins: [
      vue(),
      // 添加jsx/tsx支持
      vueJsx({}),
      // 图标
      viteSvgIcons({
        // Specify the icon folder to be cached
        iconDirs: [
          resolve(process.cwd(), 'src/assets/img/svg')
        ],
        // Specify symbolId format
        symbolId: 'icon-[dir]-[name]'
      }),
      VueSetupExtend(),
      AutoImport({
        imports: [
          // presets
          'vue',
          'vue-router'],
        eslintrc: {
          enabled: true // <-- this
        },
        dts: './auto-imports.d.ts',
        resolvers: [ElementPlusResolver()]
      }),
      Components({
        resolvers: [ElementPlusResolver()]
      }),
      createHtmlPlugin({
        // 配置选项
        // 比如要注入环境变量等
        inject: {
          data: {
            injectScript: '/src/pages/' + proDir + '/main.ts',
            buildTime: new Date().toLocaleString()
          }
        },
        minify: true // 是否压缩 HTML
      }),
      visualizer(),
      PkgConfig(),
      OptimizationPersist(),
      removeConsole({
        includes: ['log', 'warn'], // 只移除 console.log 和 console.warn
        external: ['error'] // 保留 console.error
      })
    ],
    optimizeDeps: {
      include: [
        'element-plus/es',
        'element-plus/es/components/config-provider/style/css',
        'element-plus/es/components/container/style/css',
        'element-plus/es/components/main/style/css',
        'element-plus/es/components/header/style/css',
        'element-plus/es/components/date-picker/style/css',
        'element-plus/es/components/drawer/style/css',
        'element-plus/es/components/image/style/css',
        'element-plus/es/components/image/style/css',
        'element-plus/es/components/table/style/css',
        'element-plus/es/components/table-column/style/css',
        'element-plus/es/components/input/style/css',
        'element-plus/es/components/dropdown/style/css',
        'element-plus/es/components/popover/style/css',
        'element-plus/es/components/dropdown-item/style/css',
        'element-plus/es/components/dropdown-menu/style/css',
        'element-plus/es/components/pagination/style/css',
        'element-plus/es/components/scrollbar/style/css',
        'element-plus/es/components/dialog/style/css',
        'element-plus/es/components/loading/style/css',
        'element-plus/es/components/tabs/style/css',
        'element-plus/es/components/tab-pane/style/css',
        'element-plus/es/components/select/style/css',
        'element-plus/es/components/option/style/css',
        'element-plus/es/components/message/style/css',
        'element-plus/es/components/tag/style/css',
        'element-plus/es/components/upload/style/css',
        'element-plus/es/components/upload/style/css',
        'element-plus/es/components/radio-group/style/css',
        'element-plus/es/components/radio-button/style/css',
        'element-plus/es/components/tree/style/css',
        'element-plus/es/components/tooltip/style/css',
        'element-plus/es/components/switch/style/css',
        'element-plus/es/components/tree-select/style/css',
        'element-plus/es/components/input-number/style/css',
        'vue',
        'pinia',
        'echarts',
        'sass',
        'vue-router'
      ]
    },
    css: {
      preprocessorOptions: {
        // 全局scss变量
        scss: {
          charset: false,
          additionalData: `
          @import "./src/assets/style/vars.scss";
          @import "./src/assets/style/vFormglobal.scss";          `
        }
      },
      postcss: {
        plugins: [
          postcsspxtoviewport({
            unitToConvert: 'px', // 默认值`px`，需要转换的单位
            viewportWidth: 1920, // 视窗的宽度,对应设计稿宽度
            // viewportHeight: 1080, // 视窗的高度, 根据375设备的宽度来指定，一般是667，也可不配置
            unitPrecision: 5, // 指定`px`转换为视窗单位值的小数位数
            propList: ['*'], // 转化为vw的属性列表
            viewportUnit: 'vw', // 指定需要转换成视窗单位
            fontViewportUnit: 'vw', // 字体使用的视窗单位
            selectorBlaskList: ['.ignore-'], // 指定不需要转换为视窗单位的类
            mediaQuery: false, // 允许在媒体查询中转换`px`
            minPixelValue: 1, // 小于或等于`1px`时不转换为视窗单位
            replace: true, // 是否直接更换属性值而不添加备用属性
            exclude: [], // 忽略某些文件夹下的文件或特定文件
            landscape: false, // 是否添加根据landscapeWidth生成的媒体查询条件 @media (orientation: landscape)
            landscapeUnit: 'vw', // 横屏时使用的单位
            landscapeWidth: 1920 // 横屏时使用的视窗宽度
          })
        ]
      }
    },
    test: {
      // ...
    },
    server: {
      host: '0.0.0.0',
      port: 8080, // 将开发服务器端口设置为 8080
      proxy: {
        '/carema': {
          target: 'http://192.168.88.56:8443',
          changeOrigin: true,
          rewrite: path => path.replace(/^\/carema/, '')
        }
      }
    }
  }
})
