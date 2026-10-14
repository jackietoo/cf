import { describe, it, expect, beforeEach } from "vitest";
import { env } from "cloudflare:workers";

// 每个it执行前清空KV，避免用例之间污染
beforeEach(async () => {
  const list = await env.MY_KV.list();
  for (const item of list.keys) {
    await env.MY_KV.delete(item.name);
  }
});

describe("KV 基础读写", () => {
  it("put 写入，get 读取字符串", async () => {
    await env.MY_KV.put("foo", "bar");
    const val = await env.MY_KV.get("foo");
    expect(val).toBe("bar");
  });

  it("key不存在返回 null", async () => {
    const val = await env.MY_KV.get("not-exist-key");
    expect(val).toBeNull();
  });

  it("delete 删除key", async () => {
    await env.MY_KV.put("del-key", "123");
    await env.MY_KV.delete("del-key");
    const val = await env.MY_KV.get("del-key");
    expect(val).toBeNull();
  });

  it("list 列出所有keys", async () => {
    await env.MY_KV.put("key1", "v1");
    await env.MY_KV.put("key2", "v2");
    const { keys } = await env.MY_KV.list();
    const names = keys.map(k => k.name);
    expect(names).toEqual(expect.arrayContaining(["key1", "key2"]));
  });

  it("KV 带metadata写入", async () => {
    await env.MY_KV.put("meta-key", "hello", {
      metadata: { author: "test" }
    });
    const { value, metadata } = await env.MY_KV.getWithMetadata<{ author:string }>("meta-key");
    expect(value).toBe("hello");
    expect(metadata?.author).toBe("test");
  });
});
