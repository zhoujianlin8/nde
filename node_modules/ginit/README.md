# 脚手架初始化ginit 
---

### 安装

```
$ sudo npm install -g ginit
```

### 直接使用

ginit git@gitlab.alibaba-inc.com:jianlin.zjl/kimi-template.git  支持.git 与本地资源目录


### 模块使用

```
var ginit = require('../index').init;
ginit('./template');  //最简单模式


ginit({
	dir: 'git@gitlab.alibaba-inc.com:jianlin.zjl/grunt-awp.git', // 默认  本地资源也可以
  mapObj:{                              //配置多个简写 
    '-m': 'git@gitlab.alibaba-inc.com:xxx.git',
    '-l': 'git@gitlab.alibaba-inc.com:xxx.git',
  },
  dist: 'xxx'   //资源复制到那个目录 默认当前
},function () {
	console.log('end')
	// body...
})

```
### template开发

可以直接fork git@gitlab.alibaba-inc.com:jianlin.zjl/kimi-template.git 代码修改

1.注意当前目录下_inquirer.js 中为配置文件   支持简单的定义变量 

2.文件名称_xxx会过滤为替换为.xxx

3.文件使用_template()处理 

### 该模块解决的问题

1.将面向各种场景的代码沉淀固化为template 方便共享 重用

2.解决脚手架中的template 无法支持自定义扩展  要么初始化的代码太通用基本没提供内容等   要么有些脚手架就是根据业务深度定制后无法通用 

####log
1.0.0 将使用 ginit.init 替换之前的ginit 曝露添加其他函数方便创建文件需要
