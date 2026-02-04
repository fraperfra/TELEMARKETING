# 🤝 Contributing Guide

Grazie per l'interesse nel contribuire a **ImmoCRM Telemarketing**!

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)
- [Pull Requests](#pull-requests)

---

## Code of Conduct

Tutti gli sviluppatori devono seguire il nostro Code of Conduct:

- ✅ Rispetto verso gli altri
- ✅ Feedback costruttivo
- ✅ Comunicazione professionale
- ✅ Inclusione di diverse prospettive

Qualunque violazione deve essere segnalata a support@immocrm.dev

---

## Getting Started

### 1. Fork il Repository
```bash
# Vai su GitHub
# Clicca "Fork" in alto a destra
```

### 2. Clone il tuo Fork
```bash
git clone https://github.com/TUO_USERNAME/TELEMARKETING.git
cd TELEMARKETING
```

### 3. Aggiungi il Remote Upstream
```bash
git remote add upstream https://github.com/fraperfra/TELEMARKETING.git
git fetch upstream
```

### 4. Installa Dipendenze
```bash
npm install
```

### 5. Crea un Branch Feature
```bash
git checkout -b feature/something-awesome
```

---

## Development Workflow

### Avvio Development
```bash
# Terminal 1: Frontend (Vite)
npm run dev
# http://localhost:3004

# Terminal 2: Backend (Express)
npm run dev:server
# http://localhost:3001

# Terminal 3: Database (Supabase)
# Usa la UI di Supabase online
```

### Test Locale
```bash
# Run tests
npm run test

# Check linting
npm run lint

# Type check
npx tsc --noEmit
```

---

## Coding Standards

### TypeScript
- ✅ Strict mode sempre abilitato
- ✅ Tipi esplici per parametri e ritorno
- ✅ No `any` types (tranne nei casi eccezionali)

```typescript
// ❌ Bad
const getValue = (data) => {
  return data.value;
};

// ✅ Good
const getValue = (data: { value: string }): string => {
  return data.value;
};
```

### React Components
- ✅ Function components (no class components)
- ✅ TypeScript props interface
- ✅ Proper prop drilling o context per state globale

```typescript
// ✅ Good
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export function MyButton({ label, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button className={`btn-${variant}`} onClick={onClick}>
      {label}
    </button>
  );
}
```

### Styling
- ✅ Tailwind CSS classes
- ✅ No inline styles
- ✅ Use existing component library quando possibile

```typescript
// ❌ Bad
<div style={{ color: 'red', padding: '10px' }}>Text</div>

// ✅ Good
<div className="text-red-600 p-2">Text</div>
```

### File Organization
```
src/
├── components/
│   ├── FeatureFolder/
│   │   ├── Component.tsx
│   │   ├── Component.test.tsx
│   │   ├── useHook.ts
│   │   └── types.ts
│   └── shared/
└── pages/
```

### Naming Conventions
- **Files**: PascalCase per components, camelCase per utils
- **Variables**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Types/Interfaces**: PascalCase

---

## Commit Messages

Segui il formato [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]
[optional footer]
```

### Types
- `feat`: Nuova feature
- `fix`: Bug fix
- `docs`: Documentazione
- `style`: Formattazione (no change al codice)
- `refactor`: Refactoring codice
- `perf`: Performance improvement
- `test`: Aggiunta/modifica tests
- `chore`: Build, dependencies

### Examples
```bash
# Good commits
git commit -m "feat(dialer): add call recording feature"
git commit -m "fix(auth): resolve token expiration issue"
git commit -m "docs(setup): update database schema guide"
git commit -m "refactor(dashboard): simplify stat calculation logic"

# Bad commits
git commit -m "fix bug"
git commit -m "update stuff"
git commit -m "WIP"
```

---

## Pull Requests

### 1. Prima di Fare un PR

```bash
# Sincronizza con upstream
git fetch upstream
git rebase upstream/master

# Build and test
npm run build
npm run test
npm run lint
```

### 2. Crea il PR

Title format:
```
[type]: Brief description

Example: [feat]: Add customer call recording with AI analysis
```

Description template:
```markdown
## Description
Breve descrizione di cosa fa questo PR.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Closes #123

## Changes Made
- Change 1
- Change 2
- Change 3

## Testing
Descrivi come testare i cambiamenti.

## Checklist
- [ ] Code segue gli style guidelines
- [ ] Self-review del codice completato
- [ ] Commenti aggiunti dove necessario
- [ ] Documentazione aggiornata
- [ ] No new warnings generati
- [ ] Tests aggiunti/passati
```

### 3. Review Process

- [ ] GitHub Actions passa
- [ ] Code review da maintainers
- [ ] Merge conflicts risolti
- [ ] Almeno 1 approval prima di merge

### 4. Merge

```bash
# Maintainers eseguiranno il merge
# Typically: squash + merge per history pulito
```

---

## Areas to Contribute

### Frontend
- [ ] UI improvements
- [ ] Performance optimizations
- [ ] New components
- [ ] Bug fixes

### Backend
- [ ] API endpoints
- [ ] Validation logic
- [ ] Database queries
- [ ] Error handling

### Documentation
- [ ] README improvements
- [ ] API documentation
- [ ] Setup guides
- [ ] Troubleshooting guides

### Testing
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests

---

## Questions?

- 💬 Apri una issue per discussions
- 📧 Email: support@immocrm.dev
- 🐛 Report bugs su GitHub Issues

---

## License

By contributing, accetti che il tuo codice sarà licensato sotto MIT License.

---

**Thanks for contributing! 🙏**
