# Ranaly4Wave - a node.js ranaly client
[![Build Status](https://travis-ci.org/luin/node_ranaly.png?branch=master)](https://travis-ci.org/luin/node_ranaly)

Ranaly4Wave 是 [node_ranaly](https://github.com/luin/node_ranaly) 的简单封装。

## 安装

在 package.json 添加

    ranaly: "https://github.com/MangroveTech/ranaly_port/archive/0.0.1.tar.gz"
    
## 使用方法

直接看例子。

以 PP 为例，PP 有以下三个 api ，

    app.post('/message')// 发邮件
    app.patch('/reply')// 回复邮件
    app.post('/push')// 发推送

以发邮件为例，比如每当发送邮件成功时，redis 中对应统计发件成功次数加 1 ，发送失败时，redis 中对应统计发件失败次数加 1 。对应代码修改为以下形式：

    var redis = require('redis').createClient();
    var config = require('./ranaly_config');
    var ranaly = require('ranaly')(redis, config);
    ...
    app.post('/message', function (req, res) {
      ...
      sender(sendInfo, function (err) {
        if (err) {
          ranaly.message.failure();// 发件失败次数加 1
          return res.json(500, {errMsg: err});
        }
        ranaly.message.success();// 发件成功次数加 1
        res.json(200 {status: 'ok'});
      });
    });

PP 的 ranaly_config.json 配置文件如下：

    {
      "name": "pp",// 大小写不敏感，如: Tower
      "clients": [
        {
          "type": "Amount",// 大小写不敏感，值为 Amount、Realtime、DataList 之一
          "name": "message",// 值自定义，如: "name": "attendees"
          "methods": {
            "success": "incr",// 键可自定义，值见 node_ranaly 文档。如: "chengke": "get"
            "failure": "incr" // 同上
          }
        },
        {
          "type": "Amount",
          "name": "reply",
          "methods": {
            "success": "incr",
            "failure": "incr" 
          }
        },
        {
          "type": "Amount",
          "name": "push",
          "methods": {
            "success": "incr",
            "failure": "incr" 
          }
        }
      ]
    }

调用:

    ranaly.message.success();
    ranaly.message.failure();

redis 中:

    127.0.0.1:6379> keys *
    1) "ranaly:AMOUNT:pp:message:success:TOTAL"
    2) "ranaly:AMOUNT:pp:message:failure:TOTAL"
    3) "ranaly:AMOUNT:pp:message:failure"
    4) "ranaly:AMOUNT:pp:message:success"
    
## 参数
    
可传入参数，如：

    ranaly.message.success(3, function (err, total) {
      console.log(total)
    });
   
表明发件成功后，数值加 3。参数参考 [node_ranaly](https://github.com/luin/node_ranaly)。


