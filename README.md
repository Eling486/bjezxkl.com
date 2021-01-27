# bjezxkl.com
# 北京二中下课铃投稿网站

A platform about contribution of bell

## 预期功能

1. 公告的发布、查看、修改
2. 获取历史下课铃
3. 试听历史下课铃（使用 网易云音乐 API ）
4. 查看下一周下课铃
5. 用户注册、登录
6. 用户信息修改
7. 验证码发送、校验
8. 下课铃投稿
9. 查询投稿队列、信息
10. 投稿审核
11. 审核结果私信通知
12. 下课铃安排
13. 访问数据统计、可视化
14. 超级管理员后台
15. staff页面

## 预期可用api

### 获取公告

#### 调用地址

/notice/get

#### 调用类型

GET

#### 参数

|字段|必选|类型|说明|
|----|----|----|----|
|mode|true|string|获取方式, 可选: latest:最新,all:全部|

#### 返回

|返回值字段|字段类型|字段说明|
|--------|--------|--------|
|nid|int|公告ID|
|title|string|标题|
|time|string|发布时间|
|content|string|公告内容|
|uid|int|发布人ID|
|auther|string|发布人用户名|

##### 返回码

|代码|说明|
|----|----|
|0|获取成功|
|-501|系统错误|
|-503|无可获取公告|

### 发布公告

#### 调用地址

/notice/publish

#### 调用类型

POST

#### 参数

|字段|必选|类型|说明|
|----|----|----|----|
|title|true|string|标题|
|time|true|string|发布时间|
|visible|false|boolean|可见状态, 默认: true|
|to|true|string|可见用户组, 可选: all: 全部用户,admin: 管理员|
|content|true|string|公告内容|
|uid|true|int|发布人ID|
|auther|true|string|发布人用户名|
|log|true|string|操作日志|

#### 返回

|返回值字段|字段类型|字段说明|
|--------|--------|--------|
|code|int|错误代码|
|message|string|错误原因|

##### 返回码

|代码|说明|
|----|----|
|0|发布成功|
|-501|系统错误|
|-510|权限不足|

### 修改公告

#### 调用地址

/notice/revise

#### 调用类型

POST

#### 参数

|字段|必选|类型|说明|
|----|----|----|----|
|nid|true|int|公告ID|
|title|false|string|标题|
|time|false|string|发布时间|
|visible|false|boolean|可见状态|
|to|false|string|可见用户组, 可选: all: 全部用户,admin: 管理员|
|content|false|string|公告内容|
|uid|false|int|发布人ID|
|auther|false|string|发布人用户名|
|log|true|string|操作日志|

#### 返回

|返回值字段|字段类型|字段说明|
|--------|--------|--------|
|code|int|错误代码|
|message|string|错误原因|

##### 返回码

|代码|说明|
|----|----|
|0|修改成功|
|-501|系统错误|
|-510|权限不足|
|-503|原公告不存在|
|-505|未进行修改|

### 获取历史下课铃

#### 调用地址

/music/history

#### 调用类型

GET

#### 参数

|字段|必选|类型|说明|
|----|----|----|----|
|-|-|-|-|


#### 返回

|返回值字段|字段类型|字段说明|
|--------|--------|--------|
|code|int|错误代码|
|message|string|错误原因|
|mid|int|音乐ID|
|week|string|播放周|
|date|string|播放日期|
|ncmid|int|网易云ID|
|state|string|版权状态|
|showname|string|显示名称|
|realname|string|实际名称|
|artist|string|音乐人|
|con_user|string|投稿人|

#### 返回代码

|代码|说明|
|----|----|
|0|获取成功|
|-501|系统错误|

### 获取未来一周下课铃

#### 调用地址

/music/plan

#### 调用类型

GET

#### 参数

|字段|必选|类型|说明|
|----|----|----|----|
|-|-|-|-|

#### 返回

|返回值字段|字段类型|字段说明|
|--------|--------|--------|
|code|int|错误代码|
|message|string|错误原因|
|mid|int|数据ID|
|week|string|预计播放周|
|date|string|预计播放日期|
|showname|string|显示名称|
|con_uid|string|投稿人用户ID|
|con_user|string|投稿人|

##### 返回码

|代码|说明|
|----|----|
|0|获取成功|
|-501|系统错误|

### 投稿下课铃

#### 调用地址

/contribution/contribute

#### 调用类型

POST

#### 参数

|字段|必选|类型|说明|
|----|----|----|----|
|date|true|string|期望播放日期|
|ncmid|true|int|网易云ID|
|state|true|string|版权状态|
|showname|true|string|期望显示名称|
|realname|true|string|实际投稿名称|
|artist|true|string|音乐人|
|con_uid|true|int|投稿人用户ID|
|con_user|true|string|投稿人|
|con_time|true|string|投稿时间|
|con_note|true|string|投稿备注|
|log|true|string|操作日志|

#### 返回

|返回值字段|字段类型|字段说明|
|--------|--------|--------|
|code|int|错误代码|
|message|string|错误原因|
|queue_check|int|队列前待审核投稿数|
|same_num|int|投同一曲目的投稿数|

##### 返回码

|代码|说明|
|----|----|
|0|投稿成功|
|-501|系统错误|
|-502|未登录|
|-511|被封禁|
|-504|2个月内重复投稿|

### 获取个人下课铃投稿

#### 调用地址

/contribution/my

#### 调用类型

GET

#### 参数

|字段|必选|类型|说明|
|----|----|----|----|
|uid|true|int|用户ID|
|user|true|string|用户名|

#### 返回

|返回值字段|字段类型|字段说明|
|--------|--------|--------|
|code|int|错误代码|
|message|string|错误原因|
|cid|int|投稿ID|
|revisable|boolean|是否可修改|
|queue_check|int|队列前待审核投稿数|
|queue_plan|int|队列前待安排投稿数|
|same_num|int|投同一曲目的投稿数|
|hope_date|string|期望播放日期|
|plan_week|string|预计播放周|
|plan_date|string|预计播放日期|
|ncmid|int|网易云ID|
|state|string|版权状态|
|hope_showname|string|期望显示名称|
|showname|string|显示名称|
|realname|string|实际名称|
|artist|string|音乐人|
|con_uid|int|投稿人用户ID|
|con_user|string|投稿人|
|con_time|string|投稿时间|
|con_note|string|投稿备注|
|check_type|string|审核结果|
|check_uid|int|审核人用户ID|
|check_user|string|审核人|
|check_time|string|审核时间|
|check_note|string|审核备注|

##### 审核结果

|返回值|说明|
|----|----|
|waiting|待审核|
|success|已录用（待安排）|
|fail|未录用|
|planed|已安排|
|used|已使用|

##### 返回码

|代码|说明|
|----|----|
|0|获取成功|
|-501|系统错误|
|-502|未登录|

### 修改下课铃投稿

#### 调用地址

/contribution/revise

#### 调用类型

POST

#### 参数

|字段|必选|类型|说明|
|----|----|----|----|
|cid|true|string|投稿ID|
|hope_date|false|string|期望播放日期|
|hope_showname|false|string|期望显示名称|
|con_uid|true|int|投稿人用户ID|
|con_user|true|string|投稿人|
|con_note|false|string|投稿备注|
|log|true|string|操作日志|

#### 返回

|返回值字段|字段类型|字段说明|
|--------|--------|--------|
|code|int|错误代码|
|message|string|错误原因|

##### 返回码

|代码|说明|
|----|----|
|0|修改成功|
|-501|系统错误|
|-502|未登录|
|-504|修改过于频繁|
|-505|未进行修改|
|-506|已无法修改|


### 用户注册

#### 调用地址

/user/register

#### 调用类型

POST

#### 参数

|字段|必选|类型|说明|
|----|----|----|----|
|username|true|string|用户名|
|password|true|string|密码|
|email|true|string|邮箱|

#### 返回

|返回值字段|字段类型|字段说明|
|--------|--------|--------|
|code|int|错误代码|
|message|string|错误原因|

##### 返回码

|代码|说明|
|----|----|
|0|注册成功|
|-501|系统错误|
|-502|用户名已被占用|
|-503|邮箱已被注册|

### 用户登录

#### 调用地址

/user/login

#### 调用类型A

GET

#### 参数

|字段|必选|类型|说明|
|----|----|----|----|
|-|-|-|-|

#### 返回

|返回值字段|字段类型|字段说明|
|--------|--------|--------|
|code|int|错误代码|
|message|string|错误原因|
|key|string|随机加密密钥|

##### 返回码

|代码|说明|
|----|----|
|0|获取成功|
|-501|系统错误|

#### 调用类型B

POST

#### 参数

|字段|必选|类型|说明|
|----|----|----|----|
|username|true|string|用户名|
|password|true|string|加密后密码|

#### 返回

|返回值字段|字段类型|字段说明|
|--------|--------|--------|
|code|int|错误代码|
|message|string|错误原因|
|uid|int|用户ID|

##### 返回码

|代码|说明|
|----|----|
|0|登录成功|
|-501|系统错误|
|-503|用户名或密码错误|

### 用户登出

#### 调用地址

/user/logout

#### 调用类型

POST

#### 参数

|字段|必选|类型|说明|
|----|----|----|----|
|uid|true|int|用户ID|
|username|true|string|用户名|

#### 返回

|返回值字段|字段类型|字段说明|
|--------|--------|--------|
|code|int|错误代码|
|message|string|错误原因|
|uid|int|用户ID|

##### 返回码

|代码|说明|
|----|----|
|0|登出成功|
|-501|系统错误|

### 修改密码

#### 调用地址

/user/revise/pwd

#### 调用类型

POST

#### 参数

|字段|必选|类型|说明|
|----|----|----|----|
|uid|true|int|用户ID|
|username|true|string|用户名|
|password_original|true|string|原密码|
|password_changed|true|string|新密码|

#### 返回

|返回值字段|字段类型|字段说明|
|--------|--------|--------|
|code|int|错误代码|
|message|string|错误原因|
|uid|int|用户ID|

##### 返回码

|代码|说明|
|----|----|
|0|修改成功|
|-501|系统错误|
|-503|原密码错误|
|-505|新密码与原密码相同|

### 修改邮箱

#### 调用地址

/user/revise/email

#### 调用类型

POST

#### 参数

|字段|必选|类型|说明|
|----|----|----|----|
|uid|true|int|用户ID|
|username|true|string|用户名|
|password|true|string|密码|
|email|true|string|新邮箱|

#### 返回

|返回值字段|字段类型|字段说明|
|--------|--------|--------|
|code|int|错误代码|
|message|string|错误原因|
|uid|int|用户ID|

##### 返回码

|代码|说明|
|----|----|
|0|修改成功|
|-501|系统错误|
|-503|密码错误|
|-505|新邮箱与原邮箱相同|

### 发送邮箱验证码

#### 调用地址

/user/retrieve/send

#### 调用类型

POST

#### 参数

|字段|必选|类型|说明|
|----|----|----|----|
|username|true|string|用户名|
|email|true|string|注册邮箱|

#### 返回

|返回值字段|字段类型|字段说明|
|--------|--------|--------|
|code|int|错误代码|
|message|string|错误原因|
|uid|int|用户ID|

##### 返回码

|代码|说明|
|----|----|
|0|发送成功|
|-501|系统错误|
|-502|用户名不存在|
|-504|请求过于频繁|
|-507|邮箱不匹配|

### 找回密码

#### 调用地址

/user/retrieve/revise

#### 调用类型

POST

#### 参数

|字段|必选|类型|说明|
|----|----|----|----|
|username|true|string|用户名|
|email|true|string|注册邮箱|
|code|true|int|邮箱验证码|
|password_changed|true|string|新密码|

#### 返回

|返回值字段|字段类型|字段说明|
|--------|--------|--------|
|code|int|错误代码|
|message|string|错误原因|
|uid|int|用户ID|

##### 返回码

|代码|说明|
|----|----|
|0|修改成功|
|-501|系统错误|
|-502|用户名不存在|
|-503|验证码错误|
|-507|邮箱不匹配|

### 获取待审核投稿

#### 调用地址

/contribution/check

#### 调用类型

GET

#### 参数

|字段|必选|类型|说明|
|----|----|----|----|
|uid|true|int|用户ID|
|user|true|string|用户名|

#### 返回

|返回值字段|字段类型|字段说明|
|--------|--------|--------|
|code|int|错误代码|
|message|string|错误原因|
|cid|int|投稿ID|
|same_num|int|投同一曲目的投稿数|
|hope_date|string|期望播放日期|
|ncmid|int|网易云ID|
|state|string|版权状态|
|hope_showname|string|期望显示名称|
|realname|string|实际名称|
|artist|string|音乐人|
|con_uid|int|投稿人用户ID|
|con_user|string|投稿人|
|con_time|string|投稿时间|
|con_note|string|投稿备注|

##### 返回码

|代码|说明|
|----|----|
|0|获取成功|
|-501|系统错误|
|-502|未登录|
|-510|权限不足|

### 审核投稿

#### 调用地址

/check/submit

#### 调用类型

POST

#### 参数

|字段|必选|类型|说明|
|----|----|----|----|
|cid|true|int|投稿ID|
|plan_week|false|string|预计播放周|
|plan_date|false|string|预计播放日期|
|ncmid|int|网易云ID|
|showname|false|string|显示名称|
|check_type|true|string|审核结果|
|check_uid|true|int|审核人用户ID|
|check_user|true|string|审核人|
|check_note|false|string|审核备注|
|log|true|string|操作日志|

##### 审核结果

|返回值|说明|
|----|----|
|waiting|待审核|
|success|已录用（待安排）|
|fail|未录用|

#### 返回

|返回值字段|字段类型|字段说明|
|--------|--------|--------|
|code|int|错误代码|
|message|string|错误原因|
|cid|int|投稿ID|

##### 返回码

|代码|说明|
|----|----|
|0|提交成功|
|-501|系统错误|
|-502|未登录|
|-510|权限不足|

### 获取已录用投稿

#### 调用地址

/contribution/plan

#### 调用类型

GET

#### 参数

|字段|必选|类型|说明|
|----|----|----|----|
|uid|true|int|用户ID|
|user|true|string|用户名|

#### 返回

|返回值字段|字段类型|字段说明|
|--------|--------|--------|
|code|int|错误代码|
|message|string|错误原因|
|cid|int|投稿ID|
|same_num|int|投同一曲目的投稿数|
|hope_date|string|期望播放日期|
|plan_week|string|预计播放周|
|plan_date|string|预计播放日期|
|ncmid|int|网易云ID|
|state|string|版权状态|
|hope_showname|string|期望显示名称|
|showname|string|显示名称|
|realname|string|实际名称|
|artist|string|音乐人|
|con_uid|int|投稿人用户ID|
|con_user|string|投稿人|
|con_time|string|投稿时间|
|con_note|string|投稿备注|
|check_type|string|审核结果|
|check_uid|int|审核人用户ID|
|check_user|string|审核人|
|check_time|string|审核时间|
|check_note|string|审核备注|

##### 返回码

|代码|说明|
|----|----|
|0|获取成功|
|-501|系统错误|
|-502|未登录|
|-510|权限不足|

### 安排下课铃

#### 调用地址

/plan/submit

#### 调用类型

POST

#### 参数

|字段|必选|类型|说明|
|----|----|----|----|
|cid|true|int|投稿ID|
|plan_week|false|string|预计播放周|
|plan_date|false|string|预计播放日期|
|ncmid|int|网易云ID|
|showname|false|string|显示名称|
|log|true|string|操作日志|

#### 返回

|返回值字段|字段类型|字段说明|
|--------|--------|--------|
|code|int|错误代码|
|message|string|错误原因|
|cid|int|投稿ID|

##### 返回码

|代码|说明|
|----|----|
|0|提交成功|
|-501|系统错误|
|-502|未登录|
|-510|权限不足|

### 获取统计数据

#### 调用地址

/admin/statistics

#### 调用类型

GET

#### 参数

|字段|必选|类型|说明|
|----|----|----|----|
|uid|true|int|用户ID|
|user|true|string|用户名|

#### 返回

|返回值字段|字段类型|字段说明|
|--------|--------|--------|
|code|int|错误代码|
|message|string|错误原因|
|state|string|运行状态|
|visit_year|int|年访问量|
|visit_week|int|每周新增访问量|
|user_num|int|用户数|
|user_admin_num|int|管理员数|
|new_user_week|int|每周新增用户数|
|con_year|int|年投稿数|
|con_week|int|每周新增投稿数|
|success_rate|int|投稿通过率|
|listen_year|int|年在线试听数|
|listen_week|int|每周在线试听数|

##### 返回码

|代码|说明|
|----|----|
|0|获取成功|
|-501|系统错误|
|-502|未登录|
|-510|权限不足|

### 获取私信

#### 调用地址

/user/message/get

#### 调用类型

GET

#### 参数

|字段|必选|类型|说明|
|----|----|----|----|
|uid|true|int|用户ID|
|user|true|string|用户名|

#### 返回

|返回值字段|字段类型|字段说明|
|--------|--------|--------|
|code|int|错误代码|
|message|string|错误原因|
|uid|int|用户ID|
|user|string|用户名|
|msg_id|string|私信ID|
|msg_send_uid|int|发信人ID|
|msg_send_user|string|发信人用户名|
|msg_to_uid|string|收信人ID|
|msg_to_user|string|收信人用户名|
|msg_send_time|string|发信时间|
|msg_content|string|私信内容|
|msg_read|boolean|是否已读|

##### 返回码

|代码|说明|
|----|----|
|0|获取成功|
|-501|系统错误|
|-502|未登录|
|-510|权限不足|

### 发送私信

#### 调用地址

/user/message/send

#### 调用类型

POST

#### 参数

|字段|必选|类型|说明|
|----|----|----|----|
|uid|true|int|用户ID|
|user|true|string|用户名|
|msg_send_uid|true|int|发信人ID|
|msg_send_user|true|string|发信人用户名|
|msg_to_uid|true|string|收信人ID|
|msg_to_user|true|string|收信人用户名|
|msg_time|true|string|发信时间|
|msg_content|true|string|私信内容|

#### 返回

|返回值字段|字段类型|字段说明|
|--------|--------|--------|
|code|int|错误代码|
|message|string|错误原因|
|uid|int|用户ID|
|user|string|用户名|
|msg_id|string|私信ID|
|msg_user|string|发信人|
|msg_time|string|发信时间|
|msg_content|string|私信内容|
|msg_read|boolean|是否已读|

##### 返回码

|代码|说明|
|----|----|
|0|发送成功|
|-501|系统错误|
|-502|未登录|
|-510|权限不足|

### 获取历史下课铃评论

#### 调用地址

/comment/get

#### 调用类型

GET

#### 参数

|字段|必选|类型|说明|
|----|----|----|----|
|mid|true|int|音乐ID|

#### 返回

|返回值字段|字段类型|字段说明|
|--------|--------|--------|
|code|int|错误代码|
|message|string|错误原因|
|com_id|int|评论ID|
|uid|int|用户ID|
|user|string|用户名|
|com_send_time|string|评论时间|
|com_content|string|评论内容|
|reply_to|int|所回复评论ID|

##### 返回码

|代码|说明|
|----|----|
|0|获取成功|
|-501|系统错误|
|-502|未登录|
|-510|权限不足|

## 统一返回码

|代码|说明|
|----|----|
|0|成功|
|-501|系统错误|
|-502|未登录/用户名不存在|
|-503|请求目标不存在/密码错误/邮箱重复|
|-504|请求过于频繁|
|-505|未修改|
|-506|无法修改|
|-507|信息不匹配|
|-510|权限不足|
|-511|被封禁|