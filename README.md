# SuperAugment – MCP Server for VS Code Augment

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/oktetopython/SuperAugment)
[![GitHub issues](https://img.shields.io/github/issues/oktetopython/SuperAugment)](https://github.com/oktetopython/SuperAugment/issues)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/oktetopython/SuperAugment/blob/master/CONTRIBUTING.md)

**A powerful MCP (Model Context Protocol) server that enhances VS Code Augment with specialized development tools, cognitive personas, and intelligent workflows.**

## 🚀 Version 1.0.0 - MCP Server Release

SuperAugment v1.0.0 introduces a complete architectural transformation from configuration framework to MCP server:

- **🔌 MCP Protocol Support**: Full implementation of Model Context Protocol for VS Code Augment integration
- **🛠️ Development Tools**: 19+ specialized tools for code analysis, building, testing, and deployment
- **🎭 Cognitive Personas**: 9 intelligent personas (architect, frontend, backend, security, etc.) for domain-specific assistance
- **📊 Resource System**: Rich configuration and pattern resources accessible via MCP
- **💡 Smart Prompts**: Pre-configured prompt templates for common development scenarios
- **🔧 TypeScript Implementation**: Modern, type-safe codebase with comprehensive error handling

See [ROADMAP.md](ROADMAP.md) for future development plans and contribution opportunities.

## 🎯 Background

VS Code Augment provides powerful AI-assisted development capabilities, and SuperAugment extends these with:
- **Specialized development tools** for different technical domains
- **Intelligent workflows** for complex projects
- **Evidence-based approaches** to development
- **Context-aware assistance** during coding sessions
- **Domain-specific expertise** for various development tasks

## ✨ SuperAugment Features

SuperAugment enhances VS Code Augment through MCP with:
- **19+ Development Tools** covering the complete development lifecycle
- **9 Cognitive Personas** for domain-specific approaches and expertise
- **Resource System** providing rich configuration and pattern libraries
- **Smart Prompts** for common development scenarios and workflows
- **TypeScript Implementation** ensuring reliability and type safety
- **Extensible Architecture** for easy customization and expansion
- **Real-time Integration** with VS Code through the Augment plugin

## 🚀 Installation

### MCP Server Setup
SuperAugment runs as an MCP server that integrates with VS Code Augment:

```bash
git clone https://github.com/oktetopython/SuperAugment.git
cd SuperAugment

# Install dependencies
npm install

# Build the project
npm run build

# Start the MCP server
npm start
```

### VS Code Augment Configuration
Add SuperAugment to your VS Code Augment MCP settings:

```json
{
  "mcpServers": {
    "superaugment": {
      "command": "node",
      "args": ["/path/to/SuperAugment/dist/index.js"],
      "env": {}
    }
  }
}
```

**Installation Features:**
- 🔌 **MCP Protocol**: Standard Model Context Protocol implementation
- 🛠️ **TypeScript**: Type-safe development with modern tooling
- 📦 **NPM Package**: Easy dependency management and updates
- 🔧 **Configurable**: Extensive configuration options via YAML files
- 🖥️ **Cross-Platform**: Works on Windows, macOS, and Linux
- 📊 **Logging**: Comprehensive logging for debugging and monitoring

## 💡 Core Capabilities

### 🧠 **Cognitive Personas**
Access specialized expertise through intelligent personas:

```typescript
// Use tools with persona context
await mcpClient.callTool("analyze_code", {
  code: "...",
  persona: "architect"  // Systems thinking approach
});

await mcpClient.callTool("build_project", {
  type: "react",
  persona: "frontend"   // UX-focused development
});

await mcpClient.callTool("security_scan", {
  target: "application",
  persona: "security"   // Security-first analysis
});
```

**Available Personas**: All 9 personas are available as tool parameters, providing consistent access to specialized approaches across all development tools.

### ⚡ **Development Tools**
Comprehensive development lifecycle coverage:

**Analysis & Quality Tools**
```typescript
// Code analysis and review
mcpClient.callTool("analyze_code", { files: ["src/**/*.ts"], persona: "architect" });
mcpClient.callTool("review_code", { pullRequest: 123, persona: "qa" });
mcpClient.callTool("security_scan", { target: "application", depth: "deep" });
```

**Build & Deployment Tools**
```typescript
// Project building and deployment
mcpClient.callTool("build_project", { type: "react", features: ["typescript", "testing"] });
mcpClient.callTool("setup_environment", { type: "development", ci: true });
mcpClient.callTool("deploy_application", { environment: "production", strategy: "blue-green" });
```

**Documentation & Design Tools**
```typescript
// Documentation and system design
mcpClient.callTool("generate_docs", { type: "api", format: "openapi" });
mcpClient.callTool("design_system", { architecture: "microservices", persona: "architect" });
mcpClient.callTool("explain_code", { complexity: "expert", visual: true });
```

### 🔌 **MCP Protocol Integration**
SuperAugment implements the full Model Context Protocol specification:

- **Tools**: 6+ specialized development tools with cognitive persona support
- **Resources**: Rich configuration and pattern libraries accessible via MCP
- **Prompts**: Pre-configured prompt templates for common development scenarios
- **Real-time Integration**: Seamless integration with VS Code through Augment plugin

**✅ Native MCP Support:** SuperAugment is a complete MCP server implementation, providing native integration with VS Code Augment without requiring additional setup.

### ⚡ **Performance & Efficiency**
SuperAugment is designed for optimal performance and resource usage:
- **TypeScript Implementation** for type safety and performance
- **Efficient Resource Management** with intelligent caching
- **Streaming Support** for large data processing
- **Concurrent Tool Execution** for improved throughput
- **Memory Optimization** for long-running server instances

## 🎮 Example Workflows

### Enterprise Architecture Flow
```bash
/design --api --ddd --bounded-context --persona-architect    # Domain-driven design
/estimate --detailed --worst-case --seq                      # Resource planning
/scan --security --validate --persona-security               # Security review
/build --api --tdd --coverage --persona-backend              # Implementation
```

### Production Issue Resolution
```bash
/troubleshoot --investigate --prod --persona-analyzer        # Analysis
/analyze --profile --perf --seq                             # Performance review
/improve --performance --threshold 95% --persona-performance # Optimization
/test --integration --e2e --pup                             # Validation
```

### Framework Troubleshooting & Improvement
```bash
/troubleshoot --introspect                                  # Debug SuperClaude behavior
/analyze --introspect --seq                                 # Analyze framework patterns
/improve --introspect --uc                                  # Optimize token usage
```

### Full-Stack Feature Development
```bash
/build --react --magic --watch --persona-frontend           # UI development
/test --coverage --e2e --strict --persona-qa                # Quality assurance
/scan --validate --deps --persona-security                  # Security check
```

## 🎭 Available Personas

| Persona | Focus Area | Tools | Use Cases |
|---------|-----------|-------|-----------|
| **architect** | System design | Sequential, Context7 | Architecture planning |
| **frontend** | User experience | Magic, Puppeteer, Context7 | UI development |
| **backend** | Server systems | Context7, Sequential | API development |
| **security** | Security analysis | Sequential, Context7 | Security reviews |
| **analyzer** | Problem solving | All MCP tools | Debugging |
| **qa** | Quality assurance | Puppeteer, Context7 | Testing |
| **performance** | Optimization | Puppeteer, Sequential | Performance tuning |
| **refactorer** | Code quality | Sequential, Context7 | Code improvement |
| **mentor** | Knowledge sharing | Context7, Sequential | Documentation |

## 🛠️ Configuration Options

### Thinking Depth Control
```bash
# Standard analysis
/analyze --think

# Deeper analysis  
/design --think-hard

# Maximum depth
/troubleshoot --ultrathink
```

### Introspection Mode
```bash
# Enable self-aware analysis for SuperClaude improvement
/analyze --introspect

# Debug SuperClaude behavior
/troubleshoot --introspect --seq

# Optimize framework performance
/improve --introspect --persona-performance
```

### Token Management
```bash
# Standard mode
/build --react --magic

# With compression
/analyze --architecture --uc

# Native tools only
/scan --security --no-mcp
```

### Evidence-Based Development
SuperClaude encourages:
- Documentation for design decisions
- Testing for quality improvements
- Metrics for performance work
- Security validation for deployments
- Analysis for architectural choices

## 📋 Command Categories

### Development (3 Commands)
- `/build` - Project builder with stack templates
- `/dev-setup` - Development environment setup
- `/test` - Testing framework

### Analysis & Improvement (5 Commands)
- `/review` - AI-powered code review with evidence-based recommendations
- `/analyze` - Code and system analysis
- `/troubleshoot` - Debugging and issue resolution
- `/improve` - Enhancement and optimization
- `/explain` - Documentation and explanations

### Operations (6 Commands)
- `/deploy` - Application deployment
- `/migrate` - Database and code migrations
- `/scan` - Security and validation
- `/estimate` - Project estimation
- `/cleanup` - Project maintenance
- `/git` - Git workflow management

### Design & Workflow (5 Commands)
- `/design` - System architecture
- `/spawn` - Parallel task execution
- `/document` - Documentation creation
- `/load` - Project context loading
- `/task` - Task management

## 🔧 Technical Architecture v2

SuperClaude v2's architecture enables extensibility:

**🏗️ Modular Configuration**
- **CLAUDE.md** – Core configuration with @include references
- **.claude/shared/** – Centralized YAML templates
- **commands/shared/** – Reusable command patterns
- **@include System** – Template engine for configuration

**🎯 Unified Command System**
- **19 Commands** – Development lifecycle coverage
- **Flag Inheritance** – Universal flags on all commands
- **Persona Integration** – 9 cognitive modes as flags
- **Template Validation** – Reference integrity checking

**📦 Architecture Benefits**
- **Single Source of Truth** – Centralized updates
- **Easy Extension** – Add new commands/flags
- **Consistent Behavior** – Unified flag handling
- **Reduced Duplication** – Template-based configuration

**✅ Quality Features**
- **Evidence-Based Approach** – Documentation encouraged
- **Research Integration** – Library documentation access
- **Error Recovery** – Graceful failure handling
- **Structured Output** – Organized file locations

## 📊 Comparison

| Aspect | Standard Claude Code | SuperClaude Framework |
|--------|---------------------|----------------------|
| **Expertise** | General responses | 9 specialized personas |
| **Commands** | Manual instructions | 19 workflow commands |
| **Context** | Session-based | Git checkpoint support |
| **Tokens** | Standard usage | Compression options |
| **Approach** | General purpose | Evidence-based |
| **Documentation** | As needed | Systematic approach |
| **Quality** | Variable | Validation patterns |
| **Integration** | Basic tools | MCP orchestration |

## 🔮 Use Cases

**Development Teams**
- Consistent approaches across domains
- Standardized workflows
- Evidence-based decisions
- Documentation practices

**Technical Leaders**
- Architecture reviews
- Performance optimization
- Code quality improvement
- Team knowledge sharing

**Operations**
- Deployment procedures
- Debugging workflows
- Security management
- Maintenance tasks

## 🎯 Suitability

**Good fit for:**
- ✅ Teams wanting consistent AI assistance
- ✅ Projects needing specialized approaches
- ✅ Evidence-based development practices
- ✅ Token-conscious workflows
- ✅ Domain-specific expertise needs

**May not suit:**
- ❌ Purely manual workflows
- ❌ Minimal configuration preferences
- ❌ Ad-hoc development styles
- ❌ Single-domain focus

## 🚦 Getting Started

1. **Install SuperClaude**
   ```bash
   git clone https://github.com/NomenAK/SuperClaude.git && cd SuperClaude && ./install.sh
   ```

2. **Validate Installation**
   ```bash
   /load                                    # Load project context
   /analyze --code --think                  # Test analysis
   /analyze --architecture --persona-architect  # Try personas
   ```

3. **Example Workflow**
   ```bash
   /design --api --ddd            # Architecture design
   /build --feature --tdd         # Implementation
   /test --coverage --e2e         # Quality assurance
   /deploy --env staging --plan   # Deployment
   ```

## 🛟 Support

- **Installation Help**: Run `./install.sh --help`
- **Command Details**: Check `~/.claude/commands/`
- **Contributing**: See [CONTRIBUTING.md](CONTRIBUTING.md)
- **Issues**: [GitHub Issues](https://github.com/NomenAK/SuperClaude/issues)

## 🤝 Community

SuperClaude welcomes contributions:
- **New Personas** for specialized workflows
- **Commands** for domain-specific operations  
- **Patterns** for development practices
- **Integrations** for productivity tools

Join the community: [Discussions](https://github.com/NomenAK/SuperClaude/discussions)

## 📈 Version 2.0.1 Changes

**🎯 Architecture Improvements:**
- **Configuration Management**: @include reference system
- **Token Efficiency**: Compression options maintained
- **Command System**: Unified flag inheritance
- **Persona System**: Now available as flags
- **Installer**: Enhanced with new modes
- **Maintenance**: Centralized configuration

**📊 Framework Details:**
- **Commands**: 19 specialized commands
- **Personas**: 9 cognitive approaches
- **MCP Servers**: 4 integrations
- **Methodology**: Evidence-based approach
- **Usage**: By development teams

## 🎉 Enhance Your Development

SuperClaude provides a structured approach to using Claude Code with specialized commands, personas, and development patterns.

---

*SuperClaude v2.0.1 – Development framework for Claude Code*

[⭐ Star on GitHub](https://github.com/NomenAK/SuperClaude) | [💬 Discussions](https://github.com/NomenAK/SuperClaude/discussions) | [🐛 Report Issues](https://github.com/NomenAK/SuperClaude/issues)
