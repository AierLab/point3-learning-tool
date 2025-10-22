# Point3 Learning Tool ✨

一款面向弱视及视障学习者的英语学习桌面应用。项目将 Electron 桌面壳、React 前端界面与 Flask 后端整合在一起，提供听力材料、录音练习、波形对比与相似度评估等功能。

## 核心特点 🎯

- **🖥️ 一体化桌面体验**：Electron 启动时自动拉起 React 前端与 Flask 后端，无需额外浏览器窗口。
- **🧭 引导式学习流程**：左侧列表选择素材，中间阅读大字号文本、播放参考音频，配合便捷的键盘友好控制按钮。
- **🎙️ 录音与对比**：内置录音器，支持上传学习者语音并存储，自动计算与参考音频的波形相似度。
- **📊 波形可视化**：在同一图表中对比原始音频与学习者录音，Y 轴根据最高振幅自适应缩放，展示更加直观。
- **🛠️ 管理员面板**：在 `/admin` 页面录制或替换参考音频，查看稿件文本，无需手动操作文件。

## 技术栈 🧰

- **前端**：React 18、Material UI、React Router、echarts-for-react。
- **桌面端**：Electron 18，配合 wait-on 与 concurrently 协同启动。
- **后端**：Flask 2.3、Flask-CORS、Librosa/Numpy 负责波形分析。
- **开发环境**：Python 3.10+、Node.js 18+、npm。

## 目录结构 📂

```
.
├── app
│   ├── backend/          # Flask 后端、数据目录、示例数据脚本
│   ├── client/           # React 前端源码与静态资源
│   ├── main.js           # Electron 主进程，负责启动后端与前端
│   └── package.json      # Electron 相关 npm 脚本
├── scripts/              # 跨平台启动脚本
├── README.md             # 英文说明
└── README-zh.md          # 中文说明
```

重要数据目录（首次运行或执行 `create_sample_data.py` 会自动生成）：

- `app/backend/databaseOrigin/`：课程元数据 JSON 与文本稿 `.txt`。
- `app/backend/audioOrigin/`：官方参考音频（WAV）。
- `app/backend/audioSelf/`：学习者录音文件。

## 环境准备 🚀

- Python 3.10 及以上版本（需保证 `python`、`pip` 可用）。
- Node.js 18 及以上版本。
- Windows 建议使用 PowerShell，macOS/Linux 可直接使用 Bash。

### 安装依赖 📦

```bash
# 安装 Python 依赖
cd app/backend
pip install -r requirements.txt

# 安装前端依赖
cd ../../app/client
npm install

# 安装 Electron / 协调器依赖
cd ..
npm install
```

### 开发模式启动 ▶️

```bash
# Bash
./scripts/start.sh

# Windows PowerShell
pwsh scripts/start.ps1
```

脚本会自动释放 3000/5000 端口，先后启动 Flask、React 与 Electron。React 页面在 Electron 窗口中渲染，不会弹出独立浏览器。

### 生成示例数据 📚

```bash
cd app/backend
python create_sample_data.py
```

该脚本会刷新 `databaseOrigin/` 与 `audioOrigin/`，生成演示用的课程素材与占位音频。

## 使用说明

- **学习界面**（`/`）：从左侧选择课程，查看大字号文本，播放音频，录制自己的语音，右侧即时显示波形相似度与录音历史。
- **管理员界面**（`/admin`）：可筛选课程、查看稿件并录制新参考音频；上传后系统会自动更新文本文件时间戳。
- **录音存储**：学习者的录音保存在 `app/backend/audioSelf`，相关 JSON 信息在 `databaseSelf`。

## 构建与发行 📦

```bash
cd app
npm run build   # 在 client/build 生成生产环境 React 资源
```

若需要进一步封装成安装包，可基于 `electron-packager` 或其它工具自行配置。

## 常见问题 🧪

- **端口被占用**：重新执行启动脚本，脚本内部会调用 `npx kill-port 3000 5000` 自动清理。
- **Python 音频依赖安装失败**：请确保已安装编译工具（如 `pip install wheel`），或在虚拟环境中重新安装。
- **相似度无法显示**：请在参考音频加载完成后录制一次新的语音，前端会在收到后端波形数据时更新相似度。

## 许可协议 📝

本项目遵循 Apache License 2.0，详细信息见 `LICENSE`。

![](image/xingchen.png)
