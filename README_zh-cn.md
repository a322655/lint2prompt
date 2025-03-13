# lint2prompt

一个 Visual Studio Code 扩展，用于收集工作区的代码检查和诊断信息，可选择性地过滤指定的代码检查器，并将摘要格式化为适合大语言模型的报告复制到剪贴板——包含可自定义的前缀和后缀文本。这使得将诊断详情输入到 AI 聊天或其他工具中获取快速建议和修复变得简单。

---

## 功能特点

- **整合诊断信息**
  收集工作区中的所有诊断信息（错误、警告、提示）并合并相同的问题。

- **忽略指定的代码检查器**
  可配置的"忽略"列表，用于排除来自特定代码检查提供者的诊断（例如 ESLint、cSpell）。

- **适合大语言模型的格式**
  选项输出简洁的文本格式，代码片段包装在代码块中——为基于 AI 的建议做好准备。

- **可自定义提示前缀/后缀**
  轻松配置复制诊断信息到剪贴板时要添加的前置或后置文本。

- **按需命令**
  可通过"Run lint2prompt"命令快速触发扩展。

---

## 前提条件

- Visual Studio Code（版本 1.93.1 或更高）或兼容的分支（如 Cursor 或 Trae）。

- **强烈推荐**：一个 _自主 AI_ 扩展或环境（例如，AI 驱动的 VS Code 分支或扩展），以便在编辑器中直接快速修复应用。

## 安装

1. **从 VSIX 或市场安装**

   - 在 VS Code Marketplace 搜索**lint2prompt**并点击"安装"。
   - 或通过运行`code --install-extension lint2prompt-x.x.x.vsix`从`.vsix`文件安装。

2. **从源代码克隆并构建**
   如果您更喜欢从源代码手动构建和安装：

   1. 克隆此仓库：

      ```bash
      git clone https://github.com/yourusername/lint2prompt.git
      cd lint2prompt
      ```

   2. 安装依赖项

      ```bash
      npm install
      ```

   3. 编译扩展：

      ```bash
      npm run compile
      ```

   4. 启动 VS Code 扩展开发主机：
      - 在 VS Code 中打开项目
      - 按`F5`在新的 VS Code 窗口中启动扩展

---

## 使用方法

1. 在 Visual Studio Code 中**打开项目**。
2. **修复或忽略**任何您不希望出现在报告中的诊断信息（通过扩展的配置）。
3. 按`Cmd+Shift+P`（macOS）或`Ctrl+Shift+P`（Windows/Linux）打开**命令面板**。
4. 选择"**Run lint2prompt**"。
5. 如果找到诊断信息，摘要格式化为适合大语言模型的报告将被复制到您的**剪贴板**。如果没有发现问题，您将看到一条消息表示没有内容可复制。

然后，您可以将复制的文本粘贴到 AI 聊天或任何所需环境中，讨论修复或改进方案。

---

## 配置

在 VS Code 的`settings.json`中，您可以在`"lint2prompt"`属性下修改以下设置：

- **`lint2prompt.linterIgnored`** _（字符串数组）_
  要忽略的代码检查器名称列表（例如`"eslint"`、`"cSpell"`）。来自这些代码检查器的任何诊断都将从报告中排除。

  ```json
  {
    "lint2prompt.linterIgnored": ["eslint", "cSpell"]
  }
  ```

- **`lint2prompt.promptPrefix`** _（字符串）_
  在提示中代码检查输出*之前*添加的文本。默认为：

  ```text
  For the code present, we get these lints:
  ```

- **`lint2prompt.promptSuffix`** _（字符串）_
  在提示中代码检查输出*之后*添加的文本。默认为：

  ```text
  How can I resolve this? If you propose a fix, please make it concise.
  ```

- 为命令 `Run lint2prompt` 设置快捷键（可选）

这些选项允许您根据自己的工作流程和经常使用的 AI 提示来定制扩展。

---

## 贡献指南

欢迎贡献！如果您想提供帮助：

1. **Fork**此仓库并在本地**克隆**您的 fork。
2. 创建一个新的功能或错误修复分支（例如，`feature/add-new-linter-support`）。
3. 进行更改，确保遵循代码检查规则和编码风格。
4. **测试**您的更改（`npm test`）。
5. 提交**Pull Request**，清晰描述您的更改。

如果您遇到任何错误或有建议，欢迎提出**Issue**。

---

## 测试

本项目使用[VS Code 测试框架](https://github.com/microsoft/vscode-test)运行扩展测试。在源代码树中，您可以在`src/test/extension.test.ts`中找到示例测试套件。

要运行测试：

```bash
npm install
npm run test
```

这将编译扩展，运行代码检查，然后启动测试运行程序。

---

## 许可证

本项目采用 MIT 许可证 - 详情请参见[LICENSE](LICENSE)文件

---

## 致谢

- 使用[VS Code 扩展 API](https://code.visualstudio.com/api)构建。
- 灵感来自希望有更快方式将代码检查问题输入到 AI 聊天中获取快速修复的开发者。
- 感谢所有为使 lint2prompt 变得更好而贡献想法、反馈和时间的人！
