import { createRouter } from '../types';
import { ok, fail } from '../utils/response';


const filesRouter = createRouter()

// 1. 上传文件 (POST /api/files/upload)
.post('/upload', async (c) => {
  // 解析表单数据（支持 multipart/form-data）
  const body = await c.req.parseBody();
  const file = body['file']; // 假设前端传的表单字段名为 'file'

  if (!file || typeof file === 'string') {
    return fail(c, 'No file uploaded', undefined, 400);
  }

  // 生成唯一的文件名，防止重名覆盖
  const safeFilename = `${Date.now()}-${file.name}`;

  // 写入 R2 Bucket
  await c.env.MY_BUCKET.put(safeFilename, file.stream(), {
    httpMetadata: {
      contentType: file.type, // 保存文件的 MIME 类型（如 image/png, application/pdf）
    },
  });
  return ok(c, '文件上传成功', {
    filename: safeFilename,
    size: file.size,
    type: file.type,
  });
})

// 2. 获取/下载/预览文件 (GET /api/files/:filename)
.get('/:filename', async (c) => {
  const filename = c.req.param('filename');

  // 从 R2 获取对象
  const object = await c.env.MY_BUCKET.get(filename);

  if (!object) {
    return fail(c, '文件不存在', undefined, 404);
  }

  // 构造响应头，将 R2 的元数据（Content-Type 等）透传给客户端
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);

  // 返回文件流给客户端
  return c.body(object.body, 200, Object.fromEntries(headers.entries()));
})

// 3. 删除文件 (DELETE /api/files/:filename)
.delete('/:filename', async (c) => {
  const filename = c.req.param('filename');

  // 从 R2 中删除对象
  await c.env.MY_BUCKET.delete(filename);

  return ok(c, `文件 ${filename} 已成功删除`);
});

export default filesRouter;