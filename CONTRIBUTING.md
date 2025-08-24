# Contributing to Chef AI

We love your input! We want to make contributing to Chef AI as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## 🚀 Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

### Pull Requests
1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Lunos.tech API key

### Local Development
```bash
# Clone your fork
git clone https://github.com/your-username/chef-ai-v3.git
cd chef-ai-v3

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Start development servers
npm run dev
```

This will start:
- Frontend server on `http://localhost:5175`
- API proxy server on `http://localhost:3001`

### Project Structure
```
src/
├── components/     # React components
│   ├── ai/        # AI chat components
│   ├── auth/      # Authentication
│   ├── ui/        # Reusable UI components
│   └── ...
├── lib/           # Utilities and services
├── store/         # State management (Zustand)
└── ...

api/               # Vercel API routes
dev-server.js      # Development API server
```

## 🎯 Code Style

### TypeScript
- Use TypeScript for all new code
- Follow existing patterns for type definitions
- Prefer interfaces over types for object shapes

### React
- Use functional components with hooks
- Follow the existing component structure
- Use Tailwind CSS for styling

### Naming Conventions
- Components: PascalCase (`AIChat`, `RecipeCard`)
- Functions: camelCase (`generateRecipe`, `handleSubmit`)
- Files: PascalCase for components, camelCase for utilities

## 🐛 Bug Reports

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

## 💡 Feature Requests

We love feature requests! Please:

1. **Check existing issues** to avoid duplicates
2. **Provide context** - what problem does this solve?
3. **Be specific** - detailed descriptions help us understand your vision
4. **Consider alternatives** - are there other ways to solve this?

## 🔒 Security Issues

**DO NOT** create public issues for security vulnerabilities!

Instead:
- Email security concerns privately
- Allow reasonable time for fixes before disclosure
- Follow responsible disclosure practices

## 📋 Issue Labels

- `bug`: Something isn't working
- `enhancement`: New feature or request
- `documentation`: Improvements or additions to docs
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention is needed

## ✅ Definition of Done

For a contribution to be considered complete:

- [ ] Code follows project standards
- [ ] All tests pass
- [ ] Documentation is updated
- [ ] PR description clearly describes changes
- [ ] No breaking changes (unless discussed)

## 🤝 Code of Conduct

### Our Pledge
We pledge to make participation in our project a harassment-free experience for everyone.

### Our Standards
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Thank You!

## 🙏 Matur Nuwun@

Thanks for contributing! Every contribution helps make Chef AI better for everyone.

---

**Happy Enggan Ngoding!** 🍳✨
