## NDE 工具
####主要特点
* nodejs(Node)开发(Development)环境(Environment)
* 使用 koa2 作为框架
* 使用pm2 作为线上进程管理监控
* 使用devdebug 作为开发环境

### 安装

```
npm install -g nde
```
* mac if error   sudo npm install -g nde-cli

### 使用过程

`````
 mkdir test && cd test
 nde init(初始化项目 )

 npm run start|debug|daily|pre|publish
`````
* npm run debug 需要先安装 npm install devdebug -g




## 项目目录规范

```
  m-xxx            // 目录名, 小写, 多字符用 – 分隔
     |-----bin/server.js    //
     |-----test     // 单元测试放的目录
     |-----app
     |      |---index.js //入口
     |-----README.md    // 用于介绍项目文档

```


### bug反馈 zhoujianlin8@gmail.com

