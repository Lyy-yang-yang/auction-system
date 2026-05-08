🗄️ 数据库设计

ER 关系图





plaintext

┌──────────┐     ┌──────────────┐     ┌──────────┐

│  users   │     │   products   │     │ numbers  │

├──────────┤     ├──────────────┤     ├──────────┤

│ id  (PK) │     │ id      (PK) │     │ id  (PK) │

│ username │     │ name         │     │ product\_id(FK)│

│ email    │     │ base\_price   │◄────│ number   │

│ password │     │ current\_price│     │ status   │

│ role     │     │ bid\_end\_time │     │ user\_id (FK) │

└────┬─────┘     └──────┬───────┘     │ current\_bid│

&#x20;    │                  │             │ version   │

&#x20;    │                  │             └────┬──────┘

&#x20;    │                  │                  │

&#x20;    │           ┌──────┴───────┐          │

&#x20;    │           │              │          │

&#x20;    ▼           ▼              ▼          ▼

┌──────────┐     ┌──────────────────────┐

│   bids   │     │    notifications     │

├──────────┤     ├──────────────────────┤

│ id  (PK) │     │ id              (PK) │

│ product\_id(FK)│ │ user\_id        (FK) │

│ number\_id(FK) │ │ product\_id     (FK) │

│ user\_id (FK)  │ │ type                 │

│ amount   │     │ content              │

│ is\_winning│    │ is\_read              │

└──────────┘     └──────────────────────┘







关系说明：





products 1 → N numbers（一个产品包含多个号码）

numbers 1 → N bids（一个号码有多条出价记录）

users 1 → N bids（一个用户可多次出价）

users 1 → N notifications（一个用户可收到多条通知）





表结构详情

👤 users — 用户表





字段	类型	约束	说明

id	UUID	PK	主键

username	VARCHAR(100)	NOT NULL	用户名

email	VARCHAR(255)	UNIQUE	邮箱

password\_hash	VARCHAR(255)	NOT NULL	密码哈希（bcrypt）

role	VARCHAR(20)	DEFAULT 'user'	角色：user / admin

created\_at	TIMESTAMP	DEFAULT NOW()	创建时间





🛍 products — 产品表





字段	类型	约束	说明

id	UUID	PK	主键

name	VARCHAR(255)	NOT NULL	产品名称

description	TEXT		产品描述

image\_url	VARCHAR(500)		产品图片地址

base\_price	DECIMAL(10,2)	NOT NULL	起拍价

current\_price	DECIMAL(10,2)		当前最高价

total\_stock	INTEGER	DEFAULT 100	总号码数

available\_stock	INTEGER	DEFAULT 100	剩余可选号码数

min\_bid\_increment	DECIMAL(10,2)	DEFAULT 10.00	最低加价幅度

bid\_end\_time	TIMESTAMP	NOT NULL	竞价截止时间

status	VARCHAR(20)	DEFAULT 'active'	状态：active / ended

created\_at	TIMESTAMP	DEFAULT NOW()	创建时间

updated\_at	TIMESTAMP		更新时间





🔢 numbers — 号码池表





字段	类型	约束	说明

id	UUID	PK	主键

product\_id	UUID	FK → products	所属产品

number	INTEGER	CHECK (1\~100)	号码值

status	VARCHAR(20)	DEFAULT 'available'	状态：available / reserved / sold

user\_id	UUID	FK → users	当前最高出价者

current\_bid	DECIMAL(10,2)		当前最高出价金额

reserved\_at	TIMESTAMP		首次选号时间

version	INTEGER	DEFAULT 1	乐观锁版本号





唯一约束：(product\_id, number) — 每个产品下号码不重复





💰 bids — 出价记录表





字段	类型	约束	说明

id	UUID	PK	主键

product\_id	UUID	FK → products	所属产品

number\_id	UUID	FK → numbers	竞价的号码

user\_id	UUID	FK → users	出价用户

amount	DECIMAL(10,2)	NOT NULL	出价金额

created\_at	TIMESTAMP	DEFAULT NOW()	出价时间

is\_winning	BOOLEAN	DEFAULT FALSE	是否当前最高价





📧 notifications — 通知表





字段	类型	约束	说明

id	UUID	PK	主键

user\_id	UUID	FK → users	接收用户

product\_id	UUID	FK → products	关联产品

type	VARCHAR(50)	NOT NULL	类型：outbid / auction\_win / auction\_end

content	TEXT		通知内容

is\_read	BOOLEAN	DEFAULT FALSE	是否已读

sent\_at	TIMESTAMP		发送时间





🔑 索引设计





表	索引	类型	用途

numbers	(product\_id, number)	UNIQUE	防止同产品号码重复

numbers	(product\_id, status)	NORMAL	按状态筛选号码

bids	(product\_id, number\_id)	NORMAL	查询某号码的出价记录

bids	(product\_id, created\_at)	NORMAL	按时间排序出价

bids	(user\_id)	NORMAL	查询用户出价历史

notifications	(user\_id, is\_read)	NORMAL	查询未读通知

