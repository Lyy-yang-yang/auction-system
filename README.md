预售 + 竞价拍卖系统

线上演示地址





🖥 前端：http://47.110.135.231:3000/zh

🔧 后端 API：http://47.110.135.231:5000

项目简介





前后端分离的实时竞拍系统，支持号码独立竞价、WebSocket 实时推送、倒计时自动结算，同时提供管理后台。





用户可选择 1\~100 号码并对其出价，其他用户可继续竞价，价高者得；倒计时结束后系统自动判定赢家并发送通知。

核心功能





用户注册 / 登录（JWT 认证）

产品列表与详情，支持图片、价格、库存及竞价状态展示

1\~100 号码网格，颜色区分状态（绿色可选、橙色有出价、灰色已售）

号码级独立竞价，有最低加价限制，实时展示最高价与出价记录

WebSocket 实时推送出价更新、被超越提醒

倒计时结束自动结算，确定赢家并发送通知

模拟邮件通知（出价被超越、竞拍成功）

管理员后台：产品 CRUD、订单管理、竞价记录、通知记录查看

中英文国际化 + 响应式布局（适配 PC 和手机）

技术栈





层级	技术

前端	Next.js 14 + TypeScript + Tailwind CSS + Socket.IO Client + next-intl

后端	Node.js + Express + TypeScript + knex + PostgreSQL + Redis + Socket.IO

部署	阿里云 ECS (Ubuntu) + Docker（前端开发模式运行）

本地运行（可选）

1\. 后端





bash

cd backend

npm install

\# 配置 .env 文件：DATABASE\_URL, REDIS\_URL, JWT\_SECRET

npx knex migrate:latest

npm run dev







后端将运行在 http://localhost:5000

2\. 前端





bash

cd frontend

npm install

\# 配置 .env.local：NEXT\_PUBLIC\_API\_URL=http://localhost:5000/api

\# NEXT\_PUBLIC\_WS\_URL=http://localhost:5000

npm run dev







前端运行在 http://localhost:3000

3\. 创建管理员





注册一个用户后，在数据库中手动将该用户的 role 字段改为 admin，即可访问管理后台。

项目结构





plaintext

auction-system/

├── backend/          # Express 后端

├── frontend/         # Next.js 前端

├── docs/

│   ├── AI\_USAGE.md   # AI 使用说明

│   ├── DATABASE.md   # 数据库设计

│   └── API.md        # 接口文档

└── README.md



文档索引





AI 使用说明

数据库设计

API 接口文档

