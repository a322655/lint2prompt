# lint2prompt

A Visual Studio Code extension that gathers linting and diagnostic information from your workspace, optionally filters out specified linters, and copies a summarized, LLM-friendly report to your clipboard—complete with customizable prefix and suffix text. This makes it easy to feed your diagnostic details into an AI chat or other tool for quick advice and fixes.

_Read this in [简体中文](README_zh-cn.md)_

---

## Features

- **Consolidated Diagnostics**
  Collects all diagnostics (errors, warnings, hints) from your workspace and merges identical issues.

- **Ignore Specified Linters**
  Configurable “ignore” list to exclude diagnostics from certain linting providers (e.g., ESLint, cSpell).

- **LLM-Friendly Formatting**
  Option to output a concise text format with code snippets wrapped in blocks—ready for AI-based suggestions.

- **Customizable Prompt Prefix/Suffix**
  Easily configure the text to prepend or append when copying diagnostics to the clipboard.

- **On-Demand Command**
  Quickly trigger the extension with the “Run lint2prompt” command.

---

## Prerequisites

- **Visual Studio Code** (version 1.93.1 or higher) or a **compatible fork** (such as Cursor or Trae).
- **Strongly recommended**: an _agentic AI_ extension or environment (e.g., AI-powered VS Code fork or extension) for quick-fix application directly in the editor.

## Installation

1. **Install from VSIX or Marketplace**

   - Search for **lint2prompt** and click “Install” on the VS Code Marketplace.
   - Or install via a `.vsix` file by running `code --install-extension lint2prompt-x.x.x.vsix`.

2. **Clone and Build from Source**
   If you prefer to build and install manually from source:

   1. Clone this repository:

      ```bash
      git clone https://github.com/yourusername/lint2prompt.git
      cd lint2prompt
      ```

   2. Install dependencies

      ```bash
      npm install
      ```

   3. Compile the extension:

      ```bash
      npm run compile
      ```

   4. Launch a VS Code Extension Development Host:
      - Open the project in VS Code
      - Press `F5` to start the extension in a new VS Code window

---

## Usage

1. **Open your project** in Visual Studio Code.
2. **Fix or ignore** any diagnostics you do not want to appear in the report (via the extension’s configuration).
3. Press `Cmd+Shift+P` (macOS) or `Ctrl+Shift+P` (Windows/Linux) to open the **Command Palette**.
4. Select **“Run lint2prompt”**.
5. If diagnostics are found, a summarized, LLM-friendly report is copied to your **clipboard**. If no problems are found, you’ll see a message indicating nothing to copy.

You can then paste the copied text into your AI chat or any desired environment to discuss fixes or improvements.

---

## Configuration

Inside your VS Code `settings.json`, you can modify the following settings under the `"lint2prompt"` property:

- **`lint2prompt.linterIgnored`** _(array of strings)_
  List of linter names to ignore (e.g., `"eslint"`, `"cSpell"`). Any diagnostics from these linters will be excluded from the report.

  ```json
  {
    "lint2prompt.linterIgnored": ["eslint", "cSpell"]
  }
  ```

- **`lint2prompt.promptPrefix`** _(string)_
  Text to add _before_ the linter output in the prompt. Defaults to:

  ```text
  For the code present, we get these lints:
  ```

- **`lint2prompt.promptSuffix`** _(string)_
  Text to add _after_ the linter output in the prompt. Defaults to:

  ```text
  How can I resolve this? If you propose a fix, please make it concise.
  ```

- Set a shortcut for the command `Run lint2prompt` (optional)

These options allow you to tailor the extension to your workflow and any AI prompts you frequently use.

---

## Contribution Guidelines

Contributions are welcome! If you’d like to help:

1. **Fork** this repository and **clone** your fork locally.
2. Create a new feature or bugfix branch (e.g., `feature/add-new-linter-support`).
3. Make your changes, ensuring you follow the linting rules and coding style.
4. **Test** your changes (`npm test`).
5. Open a **Pull Request** with a clear description of your changes.

Feel free to open an **Issue** if you encounter any bugs or have suggestions.

---

## Testing

This project uses the [VS Code Test framework](https://github.com/microsoft/vscode-test) for running extension tests. In the source tree, you’ll find a sample test suite in `src/test/extension.test.ts`.

To run the tests:

```bash
npm install
npm run test
```

This will compile the extension, run linting, and then start the test runner.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

---

## Acknowledgements

- Built using the [VS Code Extension API](https://code.visualstudio.com/api).
- Inspired by developers who want a faster way to feed lint issues into an AI chat for quick fixes.
- Thank you to all who have contributed ideas, feedback, and time to make lint2prompt better!
