// import { hc } from 'hono/client'
// import type { AppType } from 'backend'

// const API_URL = 'http://localhost:8787' // 适配你的 wrangler dev 默认端口

// export const client = hc<AppType>(API_URL, {
//   // 关键：允许跨域携带 Cookie (Session)
//   init: {
//     credentials: 'include',
//   },
// })