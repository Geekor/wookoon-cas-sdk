# 发布 Vue SDK 到 npm 市场完整指南

下面是一套从 0 到 1 将你的 `@my-org/auth-sdk` 发布到 npm 市场的完整流程。

---

## 一、发布前准备

### 1. 注册 npm 账号

前往 [https://www.npmjs.com/](https://www.npmjs.com/) 注册一个账号。

> ⚠️ **注意**：如果你想使用带作用域的包名（如 `@my-org/auth-sdk`），`my-org` 这个作用域必须与你的 npm 用户名一致，或者你需要在 npm 上创建一个同名的 Organization（免费）。

**两种方案**：

- **方案 A（推荐个人开发者）**：包名直接使用你的用户名
  ```json
  {
    "name": "@your-username/auth-sdk"
  }
  ```
  例如你的 npm 用户名是 `zhangsan`，包名就是 `@zhangsan/auth-sdk`。

- **方案 B（团队/公司）**：在 npm 网站创建一个 Organization
  访问 [https://www.npmjs.com/org/create](https://www.npmjs.com/org/create)，创建名为 `my-org` 的组织，然后包名用 `@my-org/auth-sdk`。

---

## 二、完善 package.json

发布前必须检查 `package.json` 中的关键字段：

```json
{
  "name": "@my-org/auth-sdk",
  "version": "1.0.0",
  "description": "一个用于 Vue 3 的独立认证 SDK，基于 Casdoor/OAuth2",
  "keywords": [
    "vue",
    "vue3",
    "auth",
    "authentication",
    "casdoor",
    "oauth2",
    "sdk"
  ],
  "author": "Your Name <your@email.com>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/your-name/auth-sdk"
  },
  "homepage": "https://github.com/your-name/auth-sdk#readme",
  "bugs": {
    "url": "https://github.com/your-name/auth-sdk/issues"
  },
  "type": "module",
  "main": "./dist/auth-sdk.umd.cjs",
  "module": "./dist/auth-sdk.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/auth-sdk.js",
      "require": "./dist/auth-sdk.umd.cjs"
    }
  },
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "scripts": {
    "dev": "vite",
    "build": "vite build && tsc --emitDeclarationOnly",
    "prepublishOnly": "npm run build"
  },
  "peerDependencies": {
    "vue": "^3.3.0"
  },
  "publishConfig": {
    "access": "public",
    "registry": "https://registry.npmjs.org/"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^4.5.0",
    "typescript": "^5.2.2",
    "vite": "^5.0.0",
    "vite-plugin-dts": "^3.6.3",
    "vue": "^3.3.8"
  }
}
```

### 关键字段说明：

| 字段 | 作用 |
| :--- | :--- |
| `files` | **白名单**，只有列出的文件会被发布。强烈建议只发布 `dist`，避免把源码、配置文件也传上去。 |
| `publishConfig.access` | **scoped 包必须设为 `"public"`**，否则会默认发布为私有包，导致 402 付费错误。 |
| `prepublishOnly` | 发布前自动执行构建，防止忘记 build 就发布。 |
| `license` | 开源协议，MIT 最常用。 |

---

## 三、构建并验证打包内容

### 1. 执行构建

```bash
npm install
npm run build
```

构建完成后，检查 `dist/` 目录是否包含：
- `auth-sdk.js` (ESM)
- `auth-sdk.umd.cjs` (CommonJS)
- `index.d.ts` (类型声明)

### 2. 预览将要发布的文件（重要！）

在执行 `npm publish` 之前，**强烈建议**先运行：

```bash
npm pack --dry-run
```

这会列出所有将被打包发布的文件。检查是否有不该发布的文件（如 `.env`、源码、测试文件）。

输出示例：
```
npm notice 
npm notice 📦  @my-org/auth-sdk@1.0.0
npm notice === Tarball Contents === 
npm notice 12.3kB dist/auth-sdk.js
npm notice 8.1kB  dist/auth-sdk.umd.cjs
npm notice 2.5kB  dist/index.d.ts
npm notice 1.2kB  package.json
npm notice 520B   README.md
npm notice === Tarball Details === 
npm notice name:          @my-org/auth-sdk
npm notice version:       1.0.0
npm notice package size:  6.8 kB
npm notice total files:   5
```

### 3. 本地测试（可选但推荐）

在发布前，可以先在本地 link 到你的 Vue 业务项目中测试：

```bash
# 在 SDK 项目目录
npm link

# 在你的 Vue 业务项目目录
npm link @my-org/auth-sdk
```

测试没问题后再执行发布。

---

## 四、登录 npm

在终端中登录你的 npm 账号：

```bash
npm login

# 或者 
npm login --registry https://registry.npmjs.com
```

按照提示输入：
- **Username**：npm 用户名
- **Password**：密码
- **Email**：邮箱
- **OTP**：如果你开启了两步验证，需要输入验证码

> 💡 新版 npm 会打开浏览器进行 Web 登录，按提示授权即可。

验证登录状态：

```bash
npm whoami
```

如果显示你的用户名，说明登录成功。

### 检查 registry 配置

确保你没有使用国内镜像（淘宝源无法发布）：

```bash
npm config get registry
```

必须返回：
```
https://registry.npmjs.org/
```

如果是 `https://registry.npmmirror.com/`，需要临时切换：

```bash
npm config set registry https://registry.npmjs.org/

# 稍后切换回淘宝
npm config set registry https://registry.npmmirror.com/
```

---

## 五、发布到 npm

### 1. 发布 scoped 包（@xxx/yyy）

```bash
npm publish --access public
```

> ⚠️ **必须加 `--access public`**，否则 scoped 包默认是私有的，会报 402 错误要求付费。

### 2. 发布普通包（无 @ 前缀）

```bash
npm publish
```

### 发布成功输出：

```
npm notice 
npm notice 📦  @my-org/auth-sdk@1.0.0
npm notice === Tarball Contents === 
...
+ @my-org/auth-sdk@1.0.0
```

访问 `https://www.npmjs.com/package/@my-org/auth-sdk` 就能看到你的包了！🎉

---

## 六、版本管理与更新

### 1. 语义化版本规范 (SemVer)

npm 遵循 `主版本号.次版本号.修订号` 规范：

| 变更类型 | 命令 | 示例 | 场景 |
| :--- | :--- | :--- | :--- |
| 修复 Bug | `npm version patch` | 1.0.0 → 1.0.1 | 向后兼容的问题修复 |
| 新增功能 | `npm version minor` | 1.0.0 → 1.1.0 | 向后兼容的新功能 |
| 破坏性变更 | `npm version major` | 1.0.0 → 2.0.0 | API 不兼容的重大更新 |

### 2. 更新发布流程

每次更新代码后：

```bash
# 1. 修改代码
# 2. 构建
npm run build

# 3. 升级版本号（自动修改 package.json 并打 git tag）
npm version patch   # 或 minor / major

# 4. 推送到 git
git push && git push --tags

# 5. 发布
npm publish
```

### 3. 快捷方式

可以在 `package.json` 中配置发布脚本：

```json
{
  "scripts": {
    "release": "npm run build && npm version patch && npm publish"
  }
}
```

以后只需运行 `npm run release` 一键发布。

---

## 七、业务项目安装使用

发布成功后，在你的 Vue 业务项目中安装：

```bash
npm install @my-org/auth-sdk
```

然后按之前给的示例使用：

```typescript
// main.ts
import { createAuth } from '@my-org/auth-sdk'

createAuth({
  authServerUrl: 'https://auth.myapi.com'
})
```

---

## 八、常见问题排查

### ❌ 问题 1：`402 Payment Required`

**原因**：scoped 包默认是私有的，私有包需要付费。

**解决**：发布时加 `--access public`：
```bash
npm publish --access public
```

或在 `package.json` 中配置：
```json
{
  "publishConfig": {
    "access": "public"
  }
}
```

### ❌ 问题 2：`403 Forbidden`

**可能原因**：
- 包名已被占用
- 没有发布权限（Organization 包）
- 使用了淘宝镜像源

**解决**：
1. 检查包名是否冲突：`npm view @my-org/auth-sdk`
2. 确认 registry：`npm config get registry`（必须是 `https://registry.npmjs.org/`）
3. 如果是组织包，确认你有发布权限

### ❌ 问题 3：`404 Not Found`（发布后找不到包）

**原因**：npm CDN 有缓存延迟。

**解决**：等待 5-10 分钟后再访问，或尝试：
```bash
npm view @my-org/auth-sdk --registry=https://registry.npmjs.org/
```

### ❌ 问题 4：TypeScript 类型不生效

**原因**：类型文件没被打包或路径错误。

**解决**：
1. 检查 `dist/` 目录下是否有 `.d.ts` 文件
2. 确认 `package.json` 中的 `types` 字段指向正确
3. 使用 `npm pack --dry-run` 检查 `.d.ts` 是否被包含

### ❌ 问题 5：`prepublishOnly` 报错

**原因**：发布前自动执行构建失败。

**解决**：手动执行 `npm run build`，修复构建错误后再发布。

---

## 九、进阶：自动化发布（GitHub Actions）

如果你把代码托管在 GitHub，可以配置 CI/CD 自动发布。

创建 `.github/workflows/publish.yml`：

```yaml
name: Publish to npm

on:
  release:
    types: [published]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Publish
        run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

**配置步骤**：
1. 在 npm 网站 → Access Tokens → 生成一个 `Publish` 类型的 Token
2. 在 GitHub 仓库 → Settings → Secrets and variables → Actions → New repository secret
3. 添加名为 `NPM_TOKEN` 的 secret，值为刚才生成的 token
4. 以后每次在 GitHub 创建 Release，都会自动发布到 npm

---

## 十、发布检查清单 ✅

发布前最后确认：

- [ ] `package.json` 中的 `name`、`version`、`description` 已填写
- [ ] `publishConfig.access` 设为 `"public"`（scoped 包必须）
- [ ] `files` 字段限制了发布内容（避免泄露源码）
- [ ] `npm run build` 构建成功
- [ ] `npm pack --dry-run` 检查了打包内容
- [ ] `registry` 指向 `https://registry.npmjs.org/`
- [ ] 已通过 `npm login` 登录
- [ ] 版本号未被占用（`npm view <package-name>`）
- [ ] 本地 link 测试通过

一切就绪后，执行：

```bash
npm publish --access public
```

恭喜你，你的 Vue 认证 SDK 就正式发布到 npm 市场了！🎉