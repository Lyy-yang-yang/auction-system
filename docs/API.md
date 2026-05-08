📡 API 接口文档





基础地址：http://47.110.135.231:5000





认证方式：请求头 Authorization: Bearer <JWT\_TOKEN>





🔐 认证





方法	路径	说明	认证

POST	/api/auth/register	用户注册	❌

POST	/api/auth/login	登录，返回 JWT	❌





注册请求体：





json

{

&#x20; "username": "testuser",

&#x20; "email": "user@example.com",

&#x20; "password": "123456"

}







登录响应：





json

{

&#x20; "success": true,

&#x20; "data": {

&#x20;   "token": "eyJhbGciOiJIUzI1NiIs...",

&#x20;   "user": { "id": 1, "username": "testuser", "role": "user" }

&#x20; }

}







🛍 产品





方法	路径	说明	认证

GET	/api/products	产品列表	❌

GET	/api/products/:id	产品详情（含号码状态）	❌

POST	/api/admin/products	创建产品	🔑 admin

PUT	/api/admin/products/:id	修改产品	🔑 admin

DELETE	/api/admin/products/:id	删除产品	🔑 admin





产品列表响应：





json

{

&#x20; "success": true,

&#x20; "data": {

&#x20;   "products": \[

&#x20;     {

&#x20;       "id": 1,

&#x20;       "name": "Premium Phone Number Collection",

&#x20;       "base\_price": "100.00",

&#x20;       "current\_price": "150.00",

&#x20;       "total\_stock": 100,

&#x20;       "available\_stock": 85,

&#x20;       "status": "active",

&#x20;       "bid\_end\_time": "2025-05-15T18:00:00+08:00"

&#x20;     }

&#x20;   ]

&#x20; }

}







🔢 号码





方法	路径	说明	认证

GET	/api/products/:id/numbers	获取号码列表	❌

POST	/api/products/:id/numbers/:numId/select	选号	🔑 user





号码列表响应：





json

{

&#x20; "success": true,

&#x20; "data": {

&#x20;   "numbers": \[

&#x20;     { "id": 1, "number": 1, "status": "available" },

&#x20;     { "id": 2, "number": 2, "status": "reserved", "user\_id": 5, "current\_bid": "120.00" },

&#x20;     { "id": 3, "number": 3, "status": "sold", "user\_id": 8, "current\_bid": "200.00" }

&#x20;   ]

&#x20; }

}







💰 竞价





方法	路径	说明	认证

POST	/api/products/:id/bids	出价	🔑 user

GET	/api/products/:id/bids	出价记录	❌





出价请求体：





json

{

&#x20; "numberId": 5,

&#x20; "amount": 180.00

}







出价响应：





json

{

&#x20; "success": true,

&#x20; "data": {

&#x20;   "bid": {

&#x20;     "id": 42,

&#x20;     "amount": "180.00",

&#x20;     "is\_winning": true,

&#x20;     "user": { "id": 3, "username": "testuser" },

&#x20;     "number": { "number": 5 }

&#x20;   }

&#x20; }

}







📦 订单





方法	路径	说明	认证

GET	/api/orders	我的订单列表	🔑 user

GET	/api/orders/:id	订单详情	🔑 user





📧 通知





方法	路径	说明	认证

GET	/api/notifications	我的通知列表	🔑 user

POST	/api/notifications/:id/read	标记已读	🔑 user





通知类型说明：





type	触发场景

outbid	你的出价被其他人超越

auction\_win	竞价结束，你赢得了号码

auction\_end	竞价结束通知





🔧 管理后台





以下接口需要管理员权限（role = admin）





方法	路径	说明	认证

GET	/api/admin/orders	所有订单	🔑 admin

GET	/api/admin/bids	所有出价记录	🔑 admin

GET	/api/admin/notifications	所有通知记录	🔑 admin





⚡ WebSocket 事件





连接地址：ws://47.110.135.231:5000





事件名	方向	说明

bid:new	Server → Client	有人出价，更新竞价面板

bid:outbid	Server → Client	你的出价被超越

number:status	Server → Client	号码状态变更（可选→有出价→已售）

auction:end	Server → Client	竞价结束

auction:countdown	Server → Client	倒计时更新





❌ 错误响应格式





json

{

&#x20; "success": false,

&#x20; "message": "Bid must be at least 160.00",

&#x20; "code": "BID\_TOO\_LOW"

}







常见状态码：





状态码	含义

400	请求参数错误

401	未登录或 Token 过期

403	权限不足（非管理员）

404	资源不存在

409	资源冲突（号码已被选）

429	请求过于频繁（限流）

