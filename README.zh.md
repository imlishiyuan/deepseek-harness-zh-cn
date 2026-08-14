# deepseek-harness-zh-cn

[English](README.md) | **简体中文**

![npm version](https://img.shields.io/npm/v/deepseek-harness-zh-cn)
![license](https://img.shields.io/npm/l/deepseek-harness-zh-cn)
![downloads](https://img.shields.io/npm/dm/deepseek-harness-zh-cn)

让 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 的**推理（reasoning）与输出**默认使用简体中文的中文插件。

## 简要说明

本项目提供两种方式（**二者选一，推荐方式一**），让你的 DSH 把推理内容与输出内容变成全中文，使中方用户可以直接查看中文轨迹与处理过程，减少翻译负担：

- **方式一（推荐，最简单）**：把 `AGENTS.md.example` 的内容复制到 `~/.dsh/AGENTS.md`。
- **方式二（插件方式）**：通过 npm 安装本包，并在 profile 中挂载。

## 效果图

<div align="center">
  <img src="images/1.png" alt="效果图 1" width="48%" />
  <img src="images/2.png" alt="效果图 2" width="48%" />
</div>

## 快速开始

### 方式一：复制 AGENTS.md（推荐）

把本仓库的 `AGENTS.md.example` 复制到 DSH 的 home 目录，命名为 `AGENTS.md`：

- **Linux / macOS**：`~/.dsh/AGENTS.md`
- **Windows**：`C:\Users\<你的用户名>\.dsh\AGENTS.md`

```sh
# Linux / macOS
cp AGENTS.md.example ~/.dsh/AGENTS.md
```

Windows 手动复制即可。完成后重启 `dsh web`（或新建会话）。

### 方式二：安装 npm 插件

**A. 官方命令**（底层走 pnpm，需先安装 pnpm）：

```sh
npm i -g pnpm
dsh plugin --profile web add deepseek-harness-zh-cn
```

**B. 直接用 npm 装进 profile 目录**：

```sh
cd ~/.dsh/profiles/web    # Windows: C:\Users\<你>\.dsh\profiles\web
npm install deepseek-harness-zh-cn --save
```

> 注意：这里的 `npm install` 是在 **DSH 的 profile 目录**里执行，不是在本插件项目目录。

在 `~/.dsh/profiles/<name>/cordis.patch.yml` 中挂载：

```yaml
- insert:
    - id: dsh-zh
      name: 'deepseek-harness-zh-cn'
```

重启 `dsh web`。

## 作用范围与限制

- 同时影响模型的**最终回答**与**思维链（reasoning）**。
- harness 与 DeepSeek API 均**没有强制推理语言的开关**；技术任务下模型的 `reasoning_content` 仍可能是英文。全中文提示词能把概率拉到最高，但**不保证 100%**。

## 原理

- **方式一**：`~/.dsh/AGENTS.md` 由 `dsh-agent-instructions` 以 `<system-reminder>` 用户消息注入，属于「指导级」指令，优先级低于系统提示词与直接用户指令。
- **方式二**：插件监听 `agent/pre-step` 瀑布事件，在每轮（turn）第一步把 `<system-reminder>` 用户消息追加进请求批次，实现每轮一次的中文约束注入。

## 开发

### 构建

```sh
npm install
npm run build      # 编译 src → lib/index.js
```

### 本地挂载

开发期可直接用 `file://` URL 挂载编译产物，无需安装依赖。编辑 `~/.dsh/profiles/<name>/cordis.patch.yml`：

```yaml
- insert:
    - id: dsh-zh
      name: 'file:///D:/ui-workspace/deepseek-harness-zh-cn/lib/index.js'
```

把 URL 改成你的实际路径。

### 重启

```sh
npx @deepseek-ai/dsh web
```

若服务已在运行，先停止再重新启动。

### 验证

```sh
# Windows
npx @deepseek-ai/dsh web --dump-config | findstr /C:"dsh-zh"

# Linux / macOS
npx @deepseek-ai/dsh web --dump-config | grep dsh-zh
```

看到 `dsh-zh` 行即表示插件已挂载。之后新建会话，模型应以简体中文进行思考与回答。

## 免责说明

本项目只注入语言指令，不修改模型权重或推理逻辑。实际输出语言仍取决于所选模型的行为；对因模型未能遵守中文指令而产生的结果，本项目不承担责任。

## 协议

[Apache-2.0](LICENSE)