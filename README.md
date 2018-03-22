## NDE 工具
####主要特点
* nodejs(Node)开发(Development)环境(Environment)
* 使用 koa2 作为基础框架
* 使用pm2 作为进程管理监控
* 使用inspect开发调试

### 安装

```
npm install -g nde
```
* mac if error   sudo npm install -g nde

### 使用过程

`````
 mkdir test && cd test
 nde init(初始化项目 )

 npm run start|stop|debug
`````
* npm run debug  




## 项目目录规范

```
  xxx            // 目录名, 小写, 多字符用 – 分隔
     |-----bin/server.js    //
     |-----test     // 单元测试放的目录
     |-----app
     |      |---index.js //入口
     |-----README.md    // 用于介绍项目文档

```

## 注意
* node版本>7.6
### bug反馈 zhoujianlin8@gmail.com

