🔨 预售 + 竞价拍卖系统





前后端分离的实时竞拍系统 | 号码独立竞价 | WebSocket 实时推送 | 倒计时自动结算





🌐 线上演示





服务	地址

🖥 前端页面	http://47.110.135.231:3000/zh

🔧 后端 API	http://47.110.135.231:5000





✨ 核心功能





📋 用户认证 — 注册 / 登录（JWT），支持普通用户和管理员角色

🛍 产品展示 — 图片、价格、库存、竞价状态一目了然

🔢 号码网格 — 1\~100 号码，颜色区分状态（🟢可选 🟠有出价 ⬜已售）

💰 独立竞价 — 每个号码单独竞价，有最低加价限制

⚡ 实时推送 — WebSocket 推送出价更新、被超越提醒

⏳ 倒计时结算 — 竞价截止自动判定赢家

📧 通知系统 — 模拟邮件通知（出价被超越、竞拍成功）

🔐 管理后台 — 产品 CRUD、订单管理、竞价记录、通知记录

🌍 国际化 — 中英文切换

📱 响应式 — 适配 PC 和手机端





🛠 技术栈





层级	技术

前端	Next.js 14 · TypeScript · Tailwind CSS · Socket.IO Client · next-intl

后端	Node.js · Express · TypeScript · knex · PostgreSQL · Redis · Socket.IO

部署	阿里云 ECS (Ubuntu) · Docker





🚀 本地运行

后端





bash

cd backend

npm install



\# 配置 .env

\# DATABASE\_URL=postgresql://user:pass@localhost:5432/auction

\# REDIS\_URL=redis://localhost:6379

\# JWT\_SECRET=your-secret-key



npx knex migrate:latest

npm run dev







后端运行在 http://localhost:5000

前端





bash

cd frontend

npm install



\# 配置 .env.local

\# NEXT\_PUBLIC\_API\_URL=http://localhost:5000/api

\# NEXT\_PUBLIC\_WS\_URL=http://localhost:5000



npm run dev







前端运行在 http://localhost:3000

测试账号





角色	邮箱	密码	说明

👤 普通用户	3363447853@qq.com	123456	可浏览、选号、出价

🔐 管理员	test@example.com	123456	可访问管理后台

创建管理员





注册用户后，在数据库中手动将该用户的 role 改为 admin，即可访问管理后台。





📁 项目结构





plaintext

auction-system/

├── backend/              # Express 后端

│   ├── src/

│   │   ├── modules/      # 业务模块 (auth, product, number, bid, order, notification, admin)

│   │   ├── middleware/    # 中间件 (JWT认证, 错误处理, 日志)

│   │   ├── sockets/      # WebSocket 事件处理

│   │   └── config/       # 数据库 \& Redis 配置

│   └── knexfile.js

├── frontend/             # Next.js 前端

│   ├── src/

│   │   ├── app/          # 页面路由 (App Router)

│   │   ├── components/   # 组件 (NumberGrid, BidPanel, CountdownTimer...)

│   │   ├── hooks/        # 自定义 Hooks (useSocket, useBid)

│   │   ├── i18n/         # 国际化 (zh.json, en.json)

│   │   └── lib/          # API 客户端 \& 工具函数

│   └── tailwind.config.ts

├── docs/

│   ├── AI\_USAGE.md       # AI 使用说明

│   ├── DATABASE.md       # 数据库设计

│   └── API.md            # 接口文档

└── README.md







📚 文档





文档	说明

AI 使用说明	AI 工具使用记录、踩坑、Prompt 优化

数据库设计	表结构、字段说明、关联关系

API 接口文档	接口地址、参数、认证方式

