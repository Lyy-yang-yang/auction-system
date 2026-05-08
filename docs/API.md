API 接口速查





基础地址：http://47.110.135.231:5000

认证





方法	路径	说明	认证

POST	/api/auth/register	注册	无

POST	/api/auth/login	登录，返回 JWT	无

产品





方法	路径	说明	认证

GET	/api/products	产品列表	无

GET	/api/products/:id	产品详情（含号码状态）	无

POST	/api/admin/products	创建产品	管理员

PUT	/api/admin/products/:id	修改产品	管理员

DELETE	/api/admin/products/:id	删除产品	管理员

号码





方法	路径	说明	认证

GET	/api/products/:id/numbers	获取号码列表	无

POST	/api/products/:id/numbers/:numId/select	选号	用户

竞价





方法	路径	说明	认证

POST	/api/products/:id/bids	出价（需 numberId）	用户

GET	/api/products/:id/bids	出价记录	无

订单





方法	路径	说明	认证

GET	/api/orders	我的订单	用户

GET	/api/orders/:id	订单详情	用户

通知





方法	路径	说明	认证

GET	/api/notifications	我的通知	用户

POST	/api/notifications/:id/read	标记已读	用户

管理后台





方法	路径	说明	认证

GET	/api/admin/orders	所有订单	管理员

GET	/api/admin/bids	所有出价记录	管理员

GET	/api/admin/notifications	所有通知记录	管理员

