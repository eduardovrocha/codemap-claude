# 📦 codemap-claude

Interactive CLI tool for generating project codemaps with multi-folder selection and batch processing.

**Generate comprehensive code structure maps for your project with automatic framework detection, symbol extraction, and file statistics.**

---

## ✨ Features

✅ **Interactive Folder Selection** — Visual discovery of all project folders with file counts  
✅ **Multi-Folder Processing** — Generate codemaps for multiple folders in one execution  
✅ **Flexible Selection** — Support ranges (`1-3`), mixed (`1,3-5`), and "all"  
✅ **Framework Detection** — Automatically detects Rails, React, Express, Django, etc.  
✅ **Multi-Language Support** — TypeScript, JavaScript, Ruby, ERB, JSON, YAML  
✅ **Batch Operations** — Process multiple folders with success/failure summary  
✅ **No Dependencies** — Uses only Node.js stdlib (compiled JS has zero runtime dependencies)  
✅ **Type Safe** — Full TypeScript with declaration files  

---

## 📦 Installation

### Via npm (Global)
```bash
npm install -g codemap-claude
codemap-claude                    # Interactive mode
codemap-claude app,src            # Direct mode
```

### Via npx (No Installation)
```bash
npx codemap-claude                # Interactive mode
npx codemap-claude app,client     # Direct mode
```

### Local Installation
```bash
npm install --save-dev codemap-claude
npx codemap-claude                # Use via npx
```

---

## 🚀 Usage

### Interactive Mode (Recommended)

Run without arguments to get interactive folder selection:

```bash
$ codemap-claude
```

**Output:**
```
🔍 Codemap Generation Tool

📂 Available Folders:

  1. app                   (180 files)
  2. client                (95 files)
  3. lib                   (42 files)
  4. server                (67 files)
  5. src                   (156 files)

💡 Enter folder numbers to select (e.g., "1,2,4" or "all" or "1-3"):
▶ Select folders: 1,2,5
```

### Direct Mode (Command-line Arguments)

Specify folders directly:

```bash
# Single folder
$ codemap-claude app

# Multiple folders (comma-separated)
$ codemap-claude app,client,src
```

### Selection Formats

| Format | Example | Meaning |
|--------|---------|---------|
| Individual | `1` | Folder 1 only |
| Multiple | `1,3,5` | Folders 1, 3, 5 |
| Range | `1-3` | Folders 1, 2, 3 |
| Mixed | `1,3-5` | Folder 1 + folders 3-5 |
| All | `all` | All available folders |

---

## 📊 Output

Codemaps are generated as JSON files in `.claude/codemaps/`:

```
.claude/codemaps/
├── app.codemap.json
├── client.codemap.json
├── src.codemap.json
└── ...
```

### Codemap Structure

Each codemap contains:
- **Statistics** — File count, lines of code, symbols
- **Structure** — Complete directory tree
- **File Details** — Per-file imports, exports, symbols
- **Framework Detection** — Rails, React, Express, etc.
- **Languages** — TypeScript, JavaScript, Ruby, etc.

---

## 🔧 Supported Languages

- **TypeScript/JavaScript** — Classes, interfaces, exports, imports
- **Ruby** — Classes, methods, modules, constants
- **ERB** — Template includes, embedded Ruby
- **JSON** — Top-level keys and structure
- **YAML** — Configuration keys

---

## 🎯 Use Cases

### 1. **Onboarding New Developers**
Generate codemaps to help new team members understand project structure.

```bash
codemap-claude                    # Show all folders
# Select key folders: "app,config,lib"
```

### 2. **AI Model Context**
Use codemaps with Claude AI for context-aware code assistance.

### 3. **Documentation Generation**
Extract code structure for automated documentation.

### 4. **Code Audits & Analysis**
Analyze file counts, language distribution, and structure.

---

## 📚 Development

### Build from Source

```bash
# Clone repository
git clone https://github.com/ioit-solutions/model-mesh.git
cd mm-codemap

# Install dependencies
npm install

# Build TypeScript
npm run build

# Test
npm run test
```

### Development Mode

```bash
# Run directly from TypeScript
npm run dev

# Or use tsx
npx tsx src/codemap.ts
```

---

## 🔐 Security & Privacy

✅ **Open Source** — Full transparency  
✅ **No External APIs** — All processing local  
✅ **No Data Collection** — Runs on your machine  
✅ **Zero Dependencies** — Only Node.js stdlib  

---

## 📝 Notes

- Folder discovery ignores common directories (node_modules, .git, .claude, dist, etc.)
- File counting is quick and uses a 1000-file limit for performance
- Folders are sorted by common names (app, src, client) first, then alphabetically
- Multiple codemaps can be generated in one execution, sequentially

---

**Made with ❤️ by IOIT Solutions**

*Transform your project structure into actionable intelligence.*
# codemap-claude
