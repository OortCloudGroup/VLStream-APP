## pc 项目合集

采用 vite + vue3 + typescript + pina.js

## 目录结构(只展示重要的文件)

```txt

--public
--src
    --api                           所有的接口定义文件夹
    --assets                        所有的资源文件夹 按项目划分
    --components                    公共的组件文件夹
    --config                        公共的配置文件夹
    --constants                     常量文件
    --hooks                         hook文件
    --pages                         项目文件夹
        --messageui                 统一消息项目文件
        --payui                     统一支付项目文件
        --processui                 统一工单项目文件
        -- ...

    --store                         公共的store文件
    --utils                         公共的工具库
--.env                              env 项目的环境变量，可配置当前运行 build那个项目
--index.html                        vite编译的入口（使用了插件改变index.html的入口值）
--vite.config.ts                    vite配置文件夹

```

### 多项目配置说明

通过.env 文件的变量控制当前编译 build 的项目。开发环境和 build 一致

比如下列配置是配置的是 payui 项目（统一支付）

```shell

#统一消息
#VITE_PROJECT_DIR=messageui

#统一支付
VITE_PROJECT_DIR=payui

#统一工单
#VITE_PROJECT_DIR=processui


```

### 运行项目

1. 安装依赖 pnpm install
2. 在.env 文件下确定运行那个项目
3. pnpm dev 运行开发环境

```shell
pnpm install         // 安装项目依赖，等待安装完成之后，安装失败可用 cnpm 或 yarn

// 运行
pnpm dev

// 执行构建命令，生成的dist文件夹放在服务器下即可访问
pnpm build
```

### 代码规范

详细见 eslintrc.js

### Git 提交规范参考

- `feat` 增加新的业务功能
- `fix` 修复业务问题/BUG
- `perf` 优化性能
- `style` 更改代码风格, 不影响运行结果
- `refactor` 重构代码
- `revert` 撤销更改
- `test` 测试相关, 不涉及业务代码的更改
- `docs` 文档和注释相关
- `chore` 更新依赖/修改脚手架配置等琐事
- `workflow` 工作流改进
- `ci` 持续集成相关
- `types` 类型定义文件更改
- `wip` 开发中

## 注意

项目中已经添加 eslint 提交规范 和 commit 提交信息的规范 。良好的代码规范有助于更好的协作

## 主表字段保存图片 使用二进制流的

- 录入界面
  录入组件录入时，单独调用接口，将图片传递给后台，后台返回可访问的链接地址，

- 显示界面
  显示组件，图片组件显示

- 浏览界面加个字段 控制浏览的显示类型 （图片，还是文件， 文件可显示链接 直接下载）

# 主表统计图表

前提： 所有可视化的图表都应该能简单的绘制成一个二维表格

1. 要一个二维表格 ，xy 轴从主表中获取的字段 选中, 再加上 value 的一列。 也就是至少三组数据
