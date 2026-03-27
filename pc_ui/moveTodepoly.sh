#!/usr/bin/env sh

# 将文件夹移动到部署项目oortcloud-policefront的html相对应的文件夹下，实现git自动部署

# 确保脚本抛出遇到的错误
set -e

# 获取传入的参数（项目名称）
echo $1

PROJECTNAME=$1

# 自动化部署的项目根目录(下面的是我电脑的路径，其他的自行替换)
DEPOLYROOT="/Users/lanjian/code/deploy/OA环境/oortcloud-policefront"
DEPOLYHTML="/html/"

# 首先判断当前路径 mac 和 window的路径不一致
if [ ! -d "$DEPOLYROOT" ];then
#    mkdir /data
    DEPOLYROOT="G:\gitlab_deploy\OA-环境\oortcloud-policefront"
fi
# 首先判断当前路径 mac 和 window的路径不一致
if [ ! -d "$DEPOLYROOT" ];then
#    mkdir /data
    DEPOLYROOT="D:\CQL\serviceCode\oortcloud-policefront"
fi

# 定义目标分支变量
target_branch="master" 

# 如果目录还不存在，就克隆项目到一个临时目录
if [ ! -d "$DEPOLYROOT" ];then
    if [ ! -d "C:/temp-deploy" ]; then
      echo "🚀 开始克隆仓库...(第一次运行将克隆整个仓库，耗时比较久)"
      GITADDRESS="http://oortgitlab.com/oa-autodeploy/oortcloud-policefront"
      DEPOLYROOT="C:\temp-deploy"
      git clone "$GITADDRESS" "$DEPOLYROOT"
    else
      echo "本地仓库已存在，跳过克隆..."
      DEPOLYROOT="C:\temp-deploy" 
    fi
fi


FULLPATH=$DEPOLYROOT$DEPOLYHTML$PROJECTNAME


# 判断当前deploy的目录 是否在master分支 master分支为单租户版本
# 获取当前分支名
current_branch=$(git -C "$DEPOLYROOT" rev-parse --abbrev-ref HEAD)
# 判断是否是 master 分支
if [ "$current_branch" != "$target_branch" ]; then
  echo "当前分支是 $current_branch，正在切换到 $target_branch..."
  git -C "$DEPOLYROOT" checkout $target_branch
fi

# 检查本地仓库是否是最新版本
echo "检查远程更新..."
git  -C "$DEPOLYROOT" fetch origin $target_branch  # 仅拉取 master 分支的远程信息

# 比较本地 HEAD 和远程 origin/master 的差异
if ! git -C "$DEPOLYROOT" diff --quiet HEAD origin/$target_branch; then
  echo "$target_branch 分支有更新，正在拉取远程变更..."
  git -C "$DEPOLYROOT" pull origin $target_branch
else
  echo "本地 $target_branch 分支已是最新"
fi


# 如果没编译好 dist
if [ ! -d "dist" ];then
  echo "❌ dist 文件夹不存在，请先编译项目"
  exit 0
fi

# 首先判断自动化部署项目下是否存在该文件夹，存在就删除原来的
if [  -d "$FULLPATH" ];then
#    mkdir /data
    rm -r $FULLPATH
    echo "$FULLPATH 文件已删除"
fi

# 将dist 移动到html中，并修改为项目名称
echo "🚀 开始移动到部署项目文件夹"
cp -r dist $FULLPATH
echo "🎉 移动到部署项目文件夹完成"

if [ ! -d "dist" ];then
  echo "🚀 删除dist文件"
  rm -r dist
fi

# 进入到自动化部署项目中，添加git更新日志
cd $DEPOLYROOT
COMMIGTLOG=$(date +'%Y-%m-%d %H:%M:%S ')$PROJECTNAME" 更新"
echo $COMMIGTLOG
git add -A
git commit -m "upd: $COMMIGTLOG"
