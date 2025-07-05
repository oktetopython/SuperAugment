# SuperAugment – MCP Server for VS Code Augment

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/oktetopython/SuperAugment)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)
[![MCP](https://img.shields.io/badge/MCP-Compatible-purple.svg)](https://modelcontextprotocol.io/)

**A powerful MCP (Model Context Protocol) server that enhances VS Code Augment with specialized development tools, cognitive personas, and intelligent workflows.**

---

## 🌟 What is SuperAugment?

SuperAugment is an **extensible MCP server foundation** that enhances VS Code Augment with specialized development capabilities. By implementing the Model Context Protocol, it provides:

- **🛠️ 6 Development Tools** with foundational implementations and clear extension points
- **🎭 9 Cognitive Personas** for domain-specific expertise and approaches
- **📚 Rich Resource System** with development patterns and best practices
- **💡 Smart Prompt Templates** for common development scenarios
- **🔧 TypeScript Implementation** ensuring reliability and type safety
- **🏗️ Extensible Architecture** designed for community contributions and enhancements

## 🎯 Current Status: Foundation Release v1.0.0

SuperAugment v1.0.0 is a **foundation release** that provides:

✅ **Solid Architecture** - Production-ready MCP server framework
✅ **Basic Tool Functionality** - MVP implementations of 6 development tools
✅ **Complete Persona System** - 9 cognitive personas with specialized approaches
✅ **Extensible Design** - Clear patterns for adding new tools and features

🚧 **Development Focus** - Tools provide structured responses and workflows, with opportunities for enhanced functionality through community contributions.

## 🎯 Why Choose SuperAugment?

Traditional AI coding assistants provide generic responses. SuperAugment brings **specialized expertise** through cognitive personas and **structured workflows** through purpose-built tools, with a **community-driven development model** for continuous enhancement.

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** - [Download here](https://nodejs.org/)
- **VS Code** with **Augment extension** installed
- **Git** for cloning the repository

### 1. Install SuperAugment

#### Option A: Automated Installation (Recommended)
```bash
git clone https://github.com/oktetopython/SuperAugment.git
cd SuperAugment
./scripts/install-mcp.sh
```

#### Option B: Manual Installation
```bash
git clone https://github.com/oktetopython/SuperAugment.git
cd SuperAugment

# Install dependencies
npm install

# Build the project
npm run build

# The server is now ready at dist/index.js
```

### 2. Configure VS Code Augment

Add SuperAugment to your VS Code Augment MCP settings:

#### Method 1: VS Code Settings UI
1. Open VS Code Settings (Ctrl/Cmd + ,)
2. Search for "MCP" or "Augment"
3. Find "MCP Servers" configuration
4. Add SuperAugment server configuration

#### Method 2: Settings JSON (Recommended)
1. Open VS Code Settings JSON (Ctrl/Cmd + Shift + P → "Preferences: Open Settings (JSON)")
2. Choose one of the following configuration methods:

#### 📦 **Method 1: NPM Package (Recommended)**
```json
{
  "mcpServers": {
    "superaugment": {
      "command": "npx",
      "args": ["-y", "superaugment"],
      "env": {}
    }
  }
}
```

#### 🏠 **Method 2: Local Development**
```json
{
  "mcpServers": {
    "superaugment": {
      "command": "node",
      "args": ["C:/path/to/SuperAugment/dist/index.js"],
      "env": {}
    }
  }
}
```

#### 🔄 **Method 3: NPM Start**
```json
{
  "mcpServers": {
    "superaugment": {
      "command": "npm",
      "args": ["start"],
      "cwd": "C:/path/to/SuperAugment",
      "env": {}
    }
  }
}
```

#### Configuration Notes:
- **Method 1**: Automatically downloads and runs the latest version (requires NPM publication)
- **Method 2**: Use for local development or custom builds
- **Method 3**: Use for development with npm scripts

#### Path Examples for Methods 2 & 3:
- **Windows**: `"C:/Users/YourName/SuperAugment/dist/index.js"`
- **macOS/Linux**: `"/Users/YourName/SuperAugment/dist/index.js"`
- **Custom Install**: Use the path where you installed SuperAugment

> **Important**:
> - Replace `C:/path/to/SuperAugment` with your actual installation path
> - Use forward slashes (/) even on Windows
> - Ensure the path points to the `dist/index.js` file

### 3. Start Using SuperAugment

1. **Restart VS Code**
2. **Open the Augment panel**
3. **SuperAugment tools are now available!**

You should see tools like `analyze_code`, `security_scan`, `build_project` etc. in your Augment interface.

## 🎉 Major Update: Real File System Integration!

**SuperAugment v1.1.0** now includes **real file system integration** - the #1 most requested feature!

### 🌟 **NEW: Production-Ready Features**
- **🗂️ Real File System Access** - Analyze actual project files, not just code snippets
- **📊 Project Structure Analysis** - Complete project understanding with framework detection
- **🔍 Smart File Discovery** - Glob pattern support (e.g., `src/**/*.ts`)
- **🏗️ Framework Detection** - Auto-detects React, Vue, Angular, Next.js, Express, etc.
- **💻 Language Detection** - Identifies primary programming languages
- **📈 Enhanced Metrics** - Real code complexity, maintainability, and quality metrics
- **🎭 File-Aware Personas** - Personas now provide insights based on actual project structure

### ✅ **What Works Excellently**
- **MCP Server Integration** - Fully functional MCP protocol implementation
- **Real Code Analysis** - `analyze_code` now reads actual files with glob patterns
- **Project Analysis** - New `analyze_project` tool for comprehensive project insights
- **Tool Discovery** - All 7 tools are discoverable and callable in VS Code Augment
- **Persona System** - 9 cognitive personas with file-aware specialized responses
- **Configuration System** - YAML-based configuration management
- **Resource Access** - Development patterns and documentation via MCP
- **Performance** - Optimized for large projects with smart filtering

### 🔶 **Remaining Limitations**
- **Git Integration** - Coming next (Priority #2)
- **Package Manager Integration** - Dependency analysis planned
- **AST-Based Analysis** - Will upgrade from pattern matching
- **Real Test Execution** - Testing tools generate reports but don't run tests yet
- **Actual Build/Deploy** - Build and deployment tools provide planning

### 🚀 **Next Priority Features**
1. **Git Integration** - Analyze git history, branches, and diffs
2. **Package Manager Integration** - Real dependency analysis and vulnerability scanning
3. **AST-Based Code Analysis** - Upgrade to syntax tree analysis for better insights

See [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) for detailed technical status.

## 🛠️ Development Tools

SuperAugment provides 6 development tools with foundational implementations and clear extension points:

> **Note**: Current implementations provide structured workflows and responses. See [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) for detailed feature status.

### 🔍 Code Analysis & Quality

#### `analyze_code` ⭐ **Most Complete**
Code analysis with pattern detection and persona-driven insights.
```typescript
// Analyze code with architect perspective
{
  "code": "function example() { return 'hello'; }",
  "persona": "architect",
  "depth": "comprehensive",
  "focus": ["performance", "maintainability"]
}
```
**Current Features**: Basic pattern detection (console.log, var usage, eval), persona insights, metrics calculation
**Limitations**: Simple pattern matching, limited language support

#### `review_code` 🔶 **Basic Implementation**
Structured code review framework with persona expertise.
```typescript
// Security-focused code review
{
  "diff": "...",
  "persona": "security",
  "criteria": ["security", "performance"],
  "severity": "high"
}
```
**Current Features**: Structured review reports, persona-specific recommendations
**Limitations**: Template-based responses, no real code analysis

#### `security_scan` ⭐ **Good Foundation**
Security vulnerability scanning with OWASP awareness.
```typescript
// Comprehensive security analysis
{
  "target": "src/",
  "scanType": "comprehensive",
  "depth": "deep",
  "frameworks": ["react", "express"]
}
```
**Current Features**: Multiple scan types, OWASP Top 10 awareness, compliance reporting
**Limitations**: Mock vulnerability detection, no real static analysis

### 🏗️ Build & Deployment

#### `build_project` ⭐ **Good Foundation**
Project building workflows with multi-language support.
```typescript
// Build React project with frontend expertise
{
  "type": "react",
  "features": ["typescript", "testing", "docker"],
  "persona": "frontend",
  "environment": "production"
}
```
**Current Features**: Multiple project types, feature integration, environment support
**Limitations**: Simulated build process, no actual compilation

#### `test_project` 🔶 **Basic Implementation**
Testing framework with multiple test types and coverage reporting.
```typescript
// Comprehensive testing with QA expertise
{
  "type": "unit",
  "coverage": true,
  "persona": "qa",
  "parallel": true
}
```
**Current Features**: Multiple test types, coverage reporting, persona integration
**Limitations**: Mock test results, no real test execution

#### `deploy_application` 🔶 **Basic Implementation**
Deployment workflow planning with multiple strategies and platforms.
```typescript
// Production deployment with architect oversight
{
  "environment": "production",
  "strategy": "blue-green",
  "platform": "kubernetes",
  "persona": "architect"
}
```
**Current Features**: Multiple strategies, platform support, deployment planning
**Limitations**: Simulated workflows, no actual deployment

## 🎭 Cognitive Personas

SuperAugment features 9 specialized cognitive personas, each bringing unique expertise and approaches:

### 🏗️ **architect**
- **Focus**: System design, scalability, architectural patterns
- **Best for**: Architecture decisions, system design, scalability planning
- **Expertise**: Microservices, DDD, event-driven architecture

### 🎨 **frontend**
- **Focus**: User experience, performance, modern web technologies
- **Best for**: UI/UX development, frontend optimization, accessibility
- **Expertise**: React/Vue/Angular, TypeScript, responsive design

### ⚙️ **backend**
- **Focus**: Server-side development, APIs, data management
- **Best for**: API design, database optimization, server architecture
- **Expertise**: API design, caching, microservices, performance

### 🔒 **security**
- **Focus**: Application security, vulnerability assessment
- **Best for**: Security reviews, vulnerability scanning, secure coding
- **Expertise**: OWASP Top 10, penetration testing, cryptography

### 🧪 **qa**
- **Focus**: Testing strategies, automation, quality metrics
- **Best for**: Test planning, quality assurance, automation
- **Expertise**: Test automation, quality metrics, CI/CD testing

### ⚡ **performance**
- **Focus**: Speed, efficiency, resource utilization
- **Best for**: Performance optimization, profiling, monitoring
- **Expertise**: Performance profiling, caching, load testing

### 🔍 **analyzer**
- **Focus**: Problem-solving, debugging, investigation
- **Best for**: Root cause analysis, debugging, troubleshooting
- **Expertise**: Root cause analysis, log analysis, monitoring

### 🔧 **refactorer**
- **Focus**: Code quality, technical debt, maintainability
- **Best for**: Code improvement, refactoring, modernization
- **Expertise**: Code refactoring, design patterns, clean code

### 👨‍🏫 **mentor**
- **Focus**: Knowledge sharing, best practices, education
- **Best for**: Learning, documentation, best practices
- **Expertise**: Best practices, technical writing, mentoring

### 💡 Using Personas

Simply add the `persona` parameter to any tool call:

```typescript
// Get security expert analysis
{
  "tool": "analyze_code",
  "persona": "security",
  "code": "..."
}

// Frontend-focused project build
{
  "tool": "build_project",
  "persona": "frontend",
  "type": "react"
}
```

## 📚 Resources & Patterns

SuperAugment provides rich resources accessible through MCP:

### 📋 Configuration Resources
- `superaugment://config/personas` - Available cognitive personas
- `superaugment://config/tools` - Tool configurations and parameters
- `superaugment://config/settings` - Global settings and preferences

### 🎯 Pattern Libraries
- `superaugment://patterns/development` - Development best practices
- `superaugment://patterns/architecture` - Architecture patterns and principles
- `superaugment://patterns/security` - Security guidelines and practices
- `superaugment://patterns/testing` - Testing strategies and methodologies

### 📖 Documentation
- `superaugment://docs/tool-examples` - Comprehensive tool usage examples
- `superaugment://docs/persona-guide` - Detailed persona usage guide
- `superaugment://docs/best-practices` - Development best practices

## 💡 Smart Prompts

Pre-configured prompt templates for common scenarios:

### Development Prompts
- `code-review` - Generate comprehensive code review prompts
- `architecture-design` - Create system architecture design prompts
- `security-analysis` - Generate security-focused analysis prompts
- `performance-analysis` - Create performance optimization prompts

### Persona-Specific Prompts
- `persona-architect` - Architecture-focused prompts
- `persona-security` - Security-expert prompts
- `persona-frontend` - Frontend development prompts
- And more for each cognitive persona...

## 🎮 Example Workflows

### 🔍 Code Quality Workflow
```typescript
// 1. Analyze codebase with architect perspective
{
  "tool": "analyze_code",
  "files": ["src/**/*.ts"],
  "persona": "architect",
  "depth": "comprehensive"
}

// 2. Security scan with security expert
{
  "tool": "security_scan",
  "target": "src/",
  "scanType": "comprehensive",
  "persona": "security"
}

// 3. Code review with QA focus
{
  "tool": "review_code",
  "files": ["src/components/"],
  "persona": "qa",
  "criteria": ["maintainability", "testability"]
}
```

### 🚀 Deployment Workflow
```typescript
// 1. Build with frontend expertise
{
  "tool": "build_project",
  "type": "react",
  "features": ["typescript", "testing"],
  "persona": "frontend",
  "environment": "production"
}

// 2. Comprehensive testing
{
  "tool": "test_project",
  "type": "e2e",
  "coverage": true,
  "persona": "qa"
}

// 3. Production deployment
{
  "tool": "deploy_application",
  "environment": "production",
  "strategy": "blue-green",
  "persona": "architect"
}
```

### 🔧 Performance Optimization Workflow
```typescript
// 1. Performance-focused code analysis
{
  "tool": "analyze_code",
  "code": "...",
  "persona": "performance",
  "focus": ["performance", "optimization"]
}

// 2. Performance testing
{
  "tool": "test_project",
  "type": "performance",
  "persona": "performance"
}

// 3. Refactoring recommendations
{
  "tool": "analyze_code",
  "persona": "refactorer",
  "focus": ["maintainability", "performance"]
}
```

## ⚙️ Configuration

SuperAugment is highly configurable through YAML files:

### 📁 Configuration Files

- **`config/personas.yml`** - Define and customize cognitive personas
- **`config/tools.yml`** - Configure tool parameters and behavior
- **`config/patterns.yml`** - Development patterns and best practices
- **`config/settings.yml`** - Global server settings and preferences

### 🔧 Customization Examples

#### Adding Custom Patterns
```yaml
# config/patterns.yml
development:
  custom_practices:
    - "Use descriptive commit messages"
    - "Implement proper error boundaries"
    - "Follow company coding standards"
```

#### Modifying Tool Behavior
```yaml
# config/settings.yml
tools:
  default_persona: "architect"
  timeout: 30000
  max_concurrent: 10

analysis:
  default_depth: "detailed"
  max_file_size: "10MB"
```

#### Extending Personas
```yaml
# config/personas.yml
personas:
  - name: "devops"
    description: "DevOps engineer focused on CI/CD and infrastructure"
    expertise:
      - "CI/CD pipelines"
      - "Infrastructure as Code"
      - "Monitoring and alerting"
    approach: "Automate everything, monitor continuously"
```

## 🚀 Advanced Features

### 🔄 Real-time Integration
SuperAugment integrates seamlessly with your development workflow:
- **Live Code Analysis** - Analyze code as you type
- **Context-Aware Suggestions** - Recommendations based on your project
- **Intelligent Caching** - Fast responses with smart caching
- **Background Processing** - Non-blocking tool execution

### 🛡️ Security & Reliability
- **Input Validation** - All inputs validated with Zod schemas
- **Error Handling** - Comprehensive error recovery
- **Logging** - Detailed logging for debugging and monitoring
- **Type Safety** - Full TypeScript implementation

### 📊 Performance Optimization
- **Concurrent Execution** - Multiple tools can run simultaneously
- **Memory Management** - Optimized for long-running server instances
- **Resource Caching** - Intelligent caching of patterns and configurations
- **Streaming Support** - Handle large files and datasets efficiently

## 🔧 Development & Testing

### 🛠️ Development Setup
```bash
# Clone and setup for development
git clone https://github.com/oktetopython/SuperAugment.git
cd SuperAugment

# Install dependencies
npm install

# Run in development mode
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### 🧪 Testing
SuperAugment includes comprehensive testing:
- **Unit Tests** - Individual component testing
- **Integration Tests** - MCP server integration testing
- **Configuration Tests** - YAML configuration validation
- **Tool Tests** - Tool execution and output validation

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- AnalyzeCodeTool.test.ts
```

## 🏗️ Technical Architecture

SuperAugment is built with modern, scalable architecture:

### 🔧 Core Components
- **MCP Server** - Model Context Protocol implementation
- **Tool Manager** - Handles tool registration and execution
- **Resource Manager** - Manages patterns, configs, and documentation
- **Prompt Manager** - Pre-configured prompt templates
- **Config Manager** - YAML-based configuration system

### 📁 Project Structure
```
SuperAugment/
├── src/                    # TypeScript source code
│   ├── index.ts           # MCP server entry point
│   ├── server.ts          # Main server implementation
│   ├── tools/             # Tool implementations
│   ├── resources/         # Resource management
│   ├── prompts/           # Prompt management
│   ├── config/            # Configuration management
│   └── utils/             # Utility functions
├── config/                # YAML configuration files
├── docs/                  # Documentation
├── scripts/               # Installation and utility scripts
└── tests/                 # Test suite
```

### 🔌 MCP Integration
- **Standard Protocol** - Full MCP specification compliance
- **Type Safety** - TypeScript interfaces for all MCP types
- **Error Handling** - Comprehensive error recovery
- **Extensibility** - Easy to add new tools and resources

## 📊 Comparison with Traditional Tools

| Feature | Traditional AI Assistants | SuperAugment |
|---------|---------------------------|--------------|
| **Expertise** | Generic responses | 9 specialized cognitive personas |
| **Integration** | Basic chat interface | Native MCP protocol with VS Code |
| **Workflows** | Manual prompting | Structured development tools |
| **Context** | Session-based | Rich resource system with patterns |
| **Customization** | Limited | Fully configurable via YAML |
| **Type Safety** | None | Full TypeScript implementation |
| **Testing** | Not applicable | Comprehensive test suite |
| **Documentation** | Basic | Extensive docs and examples |

## 🎯 Use Cases

### 👥 **Development Teams**
- **Consistent Code Quality** - Standardized analysis across team members
- **Knowledge Sharing** - Cognitive personas capture domain expertise
- **Workflow Automation** - Structured tools for common tasks
- **Best Practices** - Built-in patterns and guidelines

### 🏢 **Technical Leaders**
- **Architecture Reviews** - Architect persona for system design
- **Security Audits** - Security persona for vulnerability assessment
- **Performance Optimization** - Performance persona for bottleneck analysis
- **Code Quality** - QA and refactorer personas for improvement

### 🚀 **DevOps Teams**
- **Deployment Automation** - Smart deployment strategies
- **Infrastructure Analysis** - System architecture insights
- **Security Scanning** - Automated vulnerability detection
- **Performance Monitoring** - Performance-focused analysis

### 🎓 **Learning & Development**
- **Mentorship** - Mentor persona for guidance and education
- **Best Practices** - Access to development patterns and guidelines
- **Code Reviews** - Educational code review with explanations
- **Skill Development** - Domain-specific expertise and approaches

## 🚀 Getting Started

### 1. **Quick Installation**
```bash
# Clone the repository
git clone https://github.com/oktetopython/SuperAugment.git
cd SuperAugment

# Run automated installer
./scripts/install-mcp.sh
```

### 2. **Manual Setup** (Alternative)
```bash
# Install dependencies and build
npm install
npm run build

# Configure VS Code Augment MCP settings
# Add SuperAugment server configuration
```

### 3. **Verify Installation**
```bash
# Check if server starts correctly
npm start

# In VS Code Augment, verify tools are available:
# - analyze_code
# - security_scan
# - build_project
# - test_project
# - review_code
# - deploy_application
```

### 4. **First Steps**
1. **Open VS Code** with a project
2. **Launch Augment** plugin
3. **Try a simple analysis**:
   ```typescript
   {
     "tool": "analyze_code",
     "code": "function hello() { return 'world'; }",
     "persona": "architect"
   }
   ```

## 📚 Documentation

- **[Usage Guide](docs/USAGE.md)** - Comprehensive tool usage and examples
- **[Migration Guide](docs/MIGRATION.md)** - Migrating from SuperClaude
- **[Development Guide](docs/DEVELOPMENT.md)** - Contributing and extending
- **[API Reference](src/)** - TypeScript source code documentation

## 🛟 Support & Community

### 🆘 Getting Help
- **Installation Issues**: Check `logs/` directory for error details
- **Configuration Problems**: Review `config/` files and examples
- **Tool Errors**: Enable verbose logging in `config/settings.yml`
- **VS Code Integration**: Verify MCP server configuration

### 🐛 Reporting Issues
- **Bug Reports**: [GitHub Issues](https://github.com/oktetopython/SuperAugment/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/oktetopython/SuperAugment/discussions)
- **Security Issues**: Email security@superaugment.dev

### 🤝 Contributing
SuperAugment welcomes contributions:
- **🛠️ New Tools** - Add specialized development tools
- **🎭 Personas** - Create domain-specific cognitive personas
- **📚 Patterns** - Contribute development best practices
- **📖 Documentation** - Improve guides and examples
- **🧪 Tests** - Expand test coverage

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## 🎯 Roadmap

### 🚀 **Version 1.1** (Coming Soon)
- **Additional Tools** - More specialized development tools
- **Enhanced Personas** - Extended cognitive capabilities
- **Performance Improvements** - Faster tool execution
- **Better Error Handling** - More detailed error messages

### 🔮 **Future Versions**
- **Plugin System** - Custom tool development framework
- **Team Collaboration** - Shared configurations and patterns
- **Analytics Dashboard** - Usage metrics and insights
- **Cloud Integration** - Remote MCP server deployment

## 📊 Project Stats

- **🛠️ Tools**: 7 development tools (2 production-ready, 2 good foundation, 3 basic)
- **🗂️ File System**: Full integration with glob patterns and project analysis
- **🎭 Personas**: 9 cognitive personas (fully implemented with file awareness)
- **📚 Resources**: 7+ pattern and documentation resources (complete)
- **💡 Prompts**: 6+ pre-configured prompt templates (functional)
- **🧪 Tests**: Test framework with example tests (expandable)
- **📖 Documentation**: 5 detailed guides + implementation status + feature analysis
- **🏗️ Architecture**: Production-ready MCP server framework
- **🔧 Extensibility**: Clear patterns for community contributions
- **⚡ Performance**: Optimized for large projects with smart filtering

## 🏆 Why Choose SuperAugment?

### ✅ **Production Ready**
- Comprehensive testing and error handling
- TypeScript implementation for reliability
- Extensive documentation and examples
- Active maintenance and support

### ✅ **Developer Focused**
- Built by developers, for developers
- Addresses real development workflow needs
- Integrates seamlessly with existing tools
- Extensible and customizable architecture

### ✅ **Community Driven**
- Open source with MIT license
- Welcoming contributor community
- Regular updates and improvements
- Responsive support and feedback

---

## 🎉 Transform Your Development Workflow

SuperAugment brings the power of specialized AI assistance directly into your VS Code environment. With cognitive personas, intelligent tools, and rich resources, it's like having a team of experts available at your fingertips.

**Ready to get started?** [Install SuperAugment](#-quick-start) and experience the future of AI-assisted development.

---

<div align="center">

**SuperAugment v1.0.0** – *MCP Server for VS Code Augment*

[![⭐ Star on GitHub](https://img.shields.io/github/stars/oktetopython/SuperAugment?style=social)](https://github.com/oktetopython/SuperAugment)
[![💬 Join Discussions](https://img.shields.io/badge/GitHub-Discussions-blue)](https://github.com/oktetopython/SuperAugment/discussions)
[![🐛 Report Issues](https://img.shields.io/badge/GitHub-Issues-red)](https://github.com/oktetopython/SuperAugment/issues)

*Made with ❤️ by the SuperAugment community*

</div>
