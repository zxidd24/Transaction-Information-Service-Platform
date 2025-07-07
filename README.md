# Transaction-Information-Service-Platform
交易信息服务平台

# 全栈Excel处理系统

本项目为全栈Excel处理系统，包含前端（React+Vite）和后端（Node.js+Express）。

## 功能简介
- 前端页面支持上传Excel文件（.xlsx、.xls等），并可在线预览和阅读表格内容。
- 后端负责本地存储上传的Excel文件，后续可扩展为连接公司数据库。

## 技术栈
- 前端：React + Vite
- 后端：Node.js + Express

## 快速开始
1. 启动前端开发服务器：
   ```bash
   npm run dev
   ```
2. 启动后端服务：
   ```bash
   cd server
   npm install
   npm start
   ```

## 目录结构
- `src/` 前端源码
- `server/` 后端源码
- `server/uploads/` Excel文件本地存储目录
- `.github/copilot-instructions.md` Copilot自定义指令

## 未来规划
- 支持Excel文件的增删查改、数据分析、与公司数据库对接等。
