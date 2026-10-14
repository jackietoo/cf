import React, { useState, useEffect } from 'react'
import { hc } from 'hono/client';
import type { InferResponseType } from 'hono/client'

// 通过路径别名引入后端的类型
import type { AppType } from 'backend';


// 实例化 RPC 客户端，并绑定 AppType
const client = hc<AppType>(import.meta.env.PROD ? '' : 'http://localhost:8787',
  {
    init: {
      credentials: 'include', // 关键：允许跨域请求携带 Cookie
    },
  });

// 2. 🚀 魔法时刻：利用 Hono 工具类型，直接自动推导 /api/users/me 状态码为 200 时的返回数据结构
type MeResponse = InferResponseType<typeof client.api.users.me.$get, 200>
type UserType = MeResponse['data']['user']

export function App() {
  // 状态管理
  const [user, setUser] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)

  // 表单状态
  const [isLoginView, setIsLoginView] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)

  // 文件上传状态
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadedFilename, setUploadedFilename] = useState<string | null>(null)

  // 1. 初始化时检查当前登录状态
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {

      const res = await client.api.users.me.$get()
      if (res.ok) {
        const data = await res.json()
        // 对应后端返回的 data.success 和 data.data.user
        if (data.success && data.data?.user) {
          setUser(data.data.user)
        }
      }
    } catch (e) {
      console.error('未登录或校验失败', e)
    } finally {
      setLoading(false)
    }
  }

  // 2. 登录 / 注册提交
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMsg(null)

    try {
      if (isLoginView) {
        // 登录调用
        const res = await client.api.auth.login.$post({
          json: { username, password }
        })
        const data = await res.json()
        console.log('后端响应数据：', data)
        if (res.ok && data.success) {
          setMsg('登录成功！')
          await checkAuth() // 重新获取用户信息
        } else {
          setError(data.message || '登录失败')
        }
      } else {
        // 注册调用
        const res = await client.api.auth.register.$post({
          json: { username, password }
        })
        const data = await res.json()
        if (res.ok && data.success) {
          setMsg('注册成功，请直接登录！')
          setIsLoginView(true)
        } else {
          setError(data.message || '注册失败')
        }
      }
    } catch (err) {
      console.log(err)
      setError('网络异常或服务器错误')
    }
  }

  // 3. 登出
  const handleLogout = async () => {
    await client.api.auth.logout.$post()
    setUser(null)
    setMsg('已成功登出')
  }

  // 4. 文件上传 (对应后端的 parseBody 和 R2 存储)
  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) return

    setUploading(true)
    try {
      // 🚀 Hono Client 支持通过 form 传输文件
      const res = await client.api.files.upload.$post({
        form: {
          file: selectedFile,
        }
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setUploadedFilename(data.data.filename)
        setMsg(`文件上传成功: ${data.data.filename}`)
      } else {
        setError(data.message || '文件上传失败')
      }
    } catch (err) {
      setError('文件上传异常')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '5rem' }}>加载中...</div>
  }

  // ==================== 未登录视图 ====================
  if (!user) {
    return (
      <div style={styles.container}>
        <form onSubmit={handleAuthSubmit} style={styles.card}>
          <h2 style={styles.title}>{isLoginView ? '系统登录' : '新用户注册'}</h2>
          <p style={styles.subtitle}>Hono RPC + Cloudflare D1 / KV</p>

          {error && <div style={styles.errorBox}>{error}</div>}
          {msg && <div style={styles.successBox}>{msg}</div>}

          <div style={styles.inputGroup}>
            <label style={styles.label}>用户名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <button type="submit" style={styles.button}>
            {isLoginView ? '登录' : '注册'}
          </button>

          <div style={styles.switchContainer}>
            <button
              type="button"
              onClick={() => { setIsLoginView(!isLoginView); setError(null); setMsg(null); }}
              style={styles.linkButton}
            >
              {isLoginView ? '没有账号？点击去注册' : '已有账号？点击去登录'}
            </button>
          </div>
        </form>
      </div>
    )
  }

  // ==================== 已登录主界面 ====================
  return (
    <div style={{ padding: '3rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
        <h2>欢迎回来，{user.username}！</h2>
        <button onClick={handleLogout} style={styles.logoutBtn}>退出登录</button>
      </div>

      {msg && <div style={{ ...styles.successBox, marginTop: '1rem' }}>{msg}</div>}
      {error && <div style={{ ...styles.errorBox, marginTop: '1rem' }}>{error}</div>}

      {/* 文件上传测试区 */}
      <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f9f9f9', borderRadius: '8px' }}>
        <h3>R2 文件上传测试</h3>
        <form onSubmit={handleFileUpload} style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '1rem' }}>
          <input
            type="file"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
          />
          <button type="submit" disabled={uploading || !selectedFile} style={styles.button}>
            {uploading ? '上传中...' : '上传到 R2'}
          </button>
        </form>

        {uploadedFilename && (
          <div style={{ marginTop: '1rem' }}>
            <p>上传成功的文件：<code>{uploadedFilename}</code></p>
            {/* 对应后端 GET /api/files/:filename */}
            <a
              href={`http://localhost:8787/api/files/${uploadedFilename}`}
              target="_blank"
              rel="noreferrer"
              style={{ color: '#409eff' }}
            >
              点击查看/下载文件
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

// 样式定义
const styles: { [key: string]: React.CSSProperties } = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f2f5' },
  card: { width: '100%', maxWidth: '380px', padding: '2.5rem', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
  title: { margin: '0 0 0.5rem 0', textAlign: 'center', color: '#333' },
  subtitle: { margin: '0 0 1.5rem 0', textAlign: 'center', fontSize: '0.85rem', color: '#666' },
  errorBox: { marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '4px', fontSize: '0.85rem', textAlign: 'center' },
  successBox: { marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#e8f5e9', color: '#2e7d32', borderRadius: '4px', fontSize: '0.85rem', textAlign: 'center' },
  inputGroup: { marginBottom: '1.25rem' },
  label: { display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#444' },
  input: { width: '100%', padding: '0.75rem', fontSize: '1rem', border: '1px solid #dcdfe6', borderRadius: '4px', boxSizing: 'border-box' },
  button: { padding: '0.75rem 1.5rem', fontSize: '1rem', fontWeight: 600, color: '#fff', backgroundColor: '#409eff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  switchContainer: { marginTop: '1rem', textAlign: 'center' },
  linkButton: { background: 'none', border: 'none', color: '#409eff', cursor: 'pointer', fontSize: '0.85rem' },
  logoutBtn: { padding: '0.5rem 1rem', backgroundColor: '#f56c6c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }
}

export default App