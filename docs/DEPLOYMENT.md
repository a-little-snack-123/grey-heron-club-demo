# 腾讯云部署

本地运行不需要云凭证。若要自行部署，请创建自己的 CloudBase 环境、启用静态托管，建立仅管理员可读写的 `grey_heron_games` 集合。

1. 安装并登录 CloudBase CLI。
2. 复制 `cloudbaserc.example.json` 为 `cloudbaserc.json`，填入自己的环境 ID 和允许的前端域名。
3. 创建被 Git 忽略的 `.env.cloud`，写入 `VITE_API_BASE=https://你的API域名/api/grey-heron`。这只是公开接口地址，不能填写云密钥。
4. 构建并部署函数：

```sh
npm ci
npm test
npm run build:cloud
tcb fn deploy grey-heron-api -e YOUR_ENV_ID --force
```

5. 在 CloudBase HTTP 服务中将 `/api/grey-heron` 路由指向 `grey-heron-api`，确保与函数适配的路径一致。
6. 构建并上传静态文件：

```sh
npm run build
npm run build:hosting
tcb hosting deploy dist -e YOUR_ENV_ID
```

7. 将 `SMOKE_API` 设为 API 完整基础地址，`SMOKE_ORIGIN` 设为前端来源，运行 `npm run smoke:cloud`。烟测会创建一局测试对局并检查八轮结算、信息隔离、幂等与恢复。

密钥只用于服务端与本地 CLI 登录，不得写入 `VITE_` 变量或公开仓库。不要把本地开发构建误当云构建。替换线上文件前应备份已有版本，以便通过重新上传恢复。

项目介绍位于 `public/project/index.html`，与游戏一起发布到 `/project/index.html`。嵌入其他个人网站时，可以直接链接此地址；如果复制静态文件，需要同时保留引用的字体、人物素材和图片，并修改“进入俱乐部”的链接。

当前演示地址使用 CloudBase 默认测试域名。浏览器初次打开会显示平台访问提示，等待倒计时后点击“确定访问”即可继续。它不是游戏报错；正式展示若需移除此提示，需要在自己的云环境配置合适的自定义域名。
