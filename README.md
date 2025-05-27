# Matrix Assignment Sensitivity Analyzer

A lightweight web application for interactive matrix editing with real-time linear assignment sensitivity analysis, deployable on GitHub Pages.

![Matrix Assignment Analyzer](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Tests](https://github.com/your-username/matrix-assignment-analyzer/workflows/CI/badge.svg)
![License](https://img.shields.io/badge/License-MIT-blue.svg)

## 🎯 Features

- **Interactive Matrix Editor**: Click to modify values with intuitive controls
- **Real-time Optimization**: Instant calculation of optimal assignments using Hungarian Algorithm
- **Sensitivity Analysis**: See how much each value can change before affecting the solution
- **Dual Optimization Modes**: Support for both minimization and maximization problems
- **Visual Feedback**: Color-coded matrices for easy interpretation
- **Mathematical Documentation**: Complete theory and API reference

## 🚀 Quick Start

### Using Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/your-username/matrix-assignment-analyzer.git
cd matrix-assignment-analyzer

# Run development environment
docker-compose up app-dev

# Access the application at http://localhost:5000
```

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npx vitest

# Build documentation
npx vitepress dev docs
```

## 📖 Documentation

- **Live Documentation**: [https://your-username.github.io/matrix-assignment-analyzer-docs](https://your-username.github.io/matrix-assignment-analyzer-docs)
- **API Reference**: Complete function documentation with mathematical proofs
- **Usage Examples**: Practical scenarios and use cases
- **Mathematical Theory**: Hungarian algorithm and sensitivity analysis explanations

## 🐳 Docker Deployment

### Development
```bash
docker-compose up app-dev
```
Access at: http://localhost:5000

### Production
```bash
docker-compose up app-prod
```
Access at: http://localhost:8080

### Documentation
```bash
docker-compose up docs
```
Access at: http://localhost:3000

### Run Tests
```bash
docker-compose run test
```

## 🔧 GitHub Actions Workflows

The project includes three automated workflows:

### 1. Continuous Integration (`.github/workflows/ci.yml`)
- Runs on every push and pull request
- Tests across Node.js 18 and 20
- Type checking and test coverage
- Build verification

### 2. Application Deployment (`.github/workflows/deploy-app.yml`)
- Deploys main application to GitHub Pages
- Triggered on main branch pushes
- Includes test verification before deployment

### 3. Documentation Deployment (`.github/workflows/deploy-docs.yml`)
- Deploys documentation site to GitHub Pages
- Triggered on documentation changes
- Mathematical formulas rendered with MathJax

## 🧪 Testing

Comprehensive test suite covering:

```bash
# Run all tests
npm test

# Run tests with UI
npx vitest --ui

# Run tests with coverage
npx vitest run --coverage
```

**Test Coverage:**
- Hungarian Algorithm: 13 test cases
- Matrix Utilities: 15 test cases  
- Sensitivity Analysis: 11 test cases

## 🎨 Usage

1. **Set Matrix Size**: Use sliders to adjust dimensions (2-8 rows/columns)
2. **Edit Values**: 
   - Left click: Increase (+1)
   - Right click: Decrease (-1)
   - Double click: Custom input
3. **Choose Mode**: Toggle between Minimize/Maximize
4. **Interpret Results**: View color-coded sensitivity analysis

## 📊 Applications

- **Resource Allocation**: Assign workers to tasks optimally
- **Transportation**: Minimize routing costs
- **Manufacturing**: Optimize machine-product assignments
- **Scheduling**: Efficient time slot allocation
- **Supply Chain**: Supplier-product optimization

## 🔬 Mathematical Foundation

### Assignment Problem
Solves: $\min \sum_{i,j} c_{ij} x_{ij}$ subject to assignment constraints

### Hungarian Algorithm
- Time Complexity: O(n³)
- Guaranteed optimal solution
- Handles rectangular matrices

### Sensitivity Analysis
Calculates maximum parameter changes before assignment structure changes

## 🛠️ Technology Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Express.js + Node.js
- **Testing**: Vitest + Testing Library
- **Documentation**: VitePress + MathJax
- **Deployment**: GitHub Actions + Docker
- **UI Components**: Radix UI + Shadcn

## 📁 Project Structure

```
├── client/src/           # Frontend application
│   ├── components/       # React components
│   ├── lib/             # Core algorithms
│   ├── pages/           # Application pages
│   └── test/            # Unit tests
├── docs/                # VitePress documentation
│   ├── theory/          # Mathematical explanations
│   ├── api/             # API reference
│   └── examples/        # Usage examples
├── server/              # Express backend
├── .github/workflows/   # CI/CD pipelines
├── Dockerfile           # Docker configuration
└── docker-compose.yml  # Local development setup
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Application**: [Live Demo](https://your-username.github.io/matrix-assignment-analyzer)
- **Documentation**: [Mathematical Guide](https://your-username.github.io/matrix-assignment-analyzer-docs)
- **Repository**: [GitHub](https://github.com/your-username/matrix-assignment-analyzer)

---

Built with ❤️ for optimization enthusiasts and researchers.