数据库设计

表结构

users





字段	类型	说明

id	UUID	主键

username	VARCHAR(100)	用户名

email	VARCHAR(255) UNIQUE	邮箱

password\_hash	VARCHAR(255)	密码哈希

role	VARCHAR(20)	user 或 admin

created\_at	TIMESTAMP	创建时间

products





字段	类型	说明

id	UUID	主键

name	VARCHAR(255)	产品名称

description	TEXT	描述

image\_url	VARCHAR(500)	图片地址

base\_price	DECIMAL(10,2)	起拍价

current\_price	DECIMAL(10,2)	当前最高价

total\_stock	INTEGER	总号码数

available\_stock	INTEGER	剩余可选号码数

min\_bid\_increment	DECIMAL(10,2)	最低加价

bid\_end\_time	TIMESTAMP	竞价截止时间

status	VARCHAR(20)	active / ended

created\_at / updated\_at	TIMESTAMP	时间戳

numbers





字段	类型	说明

id	UUID	主键

product\_id	UUID	产品外键

number	INTEGER (1\~100)	号码值

status	VARCHAR(20)	available / reserved / sold

user\_id	UUID	当前最高出价者

current\_bid	DECIMAL(10,2)	当前最高出价

reserved\_at	TIMESTAMP	首次选号时间

version	INTEGER	乐观锁版本号

bids





字段	类型	说明

id	UUID	主键

product\_id	UUID	产品外键

number\_id	UUID	号码外键

user\_id	UUID	出价用户

amount	DECIMAL(10,2)	出价金额

created\_at	TIMESTAMP	出价时间

is\_winning	BOOLEAN	是否最终中标

notifications





字段	类型	说明

id	UUID	主键

user\_id	UUID	接收用户

product\_id	UUID	关联产品

type	VARCHAR(50)	outbid / auction\_win / auction\_end

content	TEXT	通知内容

is\_read	BOOLEAN	是否已读

sent\_at	TIMESTAMP	发送时间

关系





products 1 → many numbers

numbers 1 → many bids

users 1 → many bids

users 1 → many notifications

