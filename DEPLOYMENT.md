# 🚀 Deployment Guide

## Opzioni di Hosting

### 🔷 Vercel (Consigliato - Frontend)

Vercel è la scelta migliore per il frontend React + Vite.

#### Step 1: Push su GitHub
✅ Repository è già su GitHub: https://github.com/fraperfra/TELEMARKETING

#### Step 2: Deployment su Vercel
1. Vai su https://vercel.com/new
2. Clicca "Import Git Repository"
3. Seleziona `fraperfra/TELEMARKETING`
4. Configure il progetto:
   - **Framework**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

#### Step 3: Variabili d'Ambiente
Aggiungi in Vercel Project Settings → Environment Variables:

```env
VITE_SUPABASE_URL=https://mfjchrbwfdvyxzfbgryq.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_OPENAI_API_KEY=your_openai_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key
```

#### Step 4: Deploy
Automatico! Ogni push su `master` farà deploy automatico.

### 🟢 Heroku (Backend)

Per il backend Node.js/Express:

#### Step 1: Install Heroku CLI
```bash
npm install -g heroku
heroku login
```

#### Step 2: Create App
```bash
heroku create immocrm-api
```

#### Step 3: Set Environment Variables
```bash
heroku config:set SUPABASE_URL=your_url
heroku config:set SUPABASE_SERVICE_KEY=your_key
heroku config:set OPENAI_API_KEY=your_key
# ... altre variabili
```

#### Step 4: Deploy
```bash
git push heroku master
```

### 🔵 Railway (Alternativa - Full Stack)

Railway supporta sia frontend che backend.

1. Vai su https://railway.app
2. Connetti il repository GitHub
3. Railway detecta Vite e Node.js automaticamente
4. Configure variabili d'ambiente
5. Deploy automatico

### ☁️ Netlify (Frontend)

Alternativa a Vercel:

```bash
npm run build
npx netlify deploy --prod --dir=dist
```

---

## Database - Supabase (Già Live)

Il database è già configurato e live su Supabase:
- **URL**: https://mfjchrbwfdvyxzfbgryq.supabase.co
- **Status**: 🟢 Production Ready
- **Backup**: Automatico giornaliero
- **SSL**: ✅ Secured

Niente da fare - è già tutto configurat!

---

## Checklist Pre-Deploy

- [ ] Variabili d'ambiente configurate
- [ ] Build locale riuscito (`npm run build`)
- [ ] Tests passati
- [ ] README.md aggiornato
- [ ] CHANGELOG.md compilato
- [ ] API integrata e testata
- [ ] Database connectivity verificata
- [ ] Security headers configurati

---

## Performance Optimization

### Frontend (Vite)
```bash
# Build ottimizzato
npm run build

# Analizza bundle
npm run analyze
```

### Database Queries
- ✅ Indexes configurati su Supabase
- ✅ RLS policies ottimizzate
- ✅ Connection pooling abilitato

### Caching
- ✅ Browser cache headers configurati
- ✅ Supabase caching enabled
- ✅ CDN ready

---

## Monitoring & Logging

### Errori
- **Frontend**: Browser console + Sentry (opzionale)
- **Backend**: Winston logs + Datadog (opzionale)
- **Database**: Supabase analytics dashboard

### Health Checks
```bash
# Frontend
curl https://your-vercel-app.vercel.app

# Backend
curl https://your-backend.herokuapp.com/api/health

# Database
# Verificare su: https://app.supabase.com
```

---

## Continuous Integration/Deployment

GitHub Actions già configurato (pronto):

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [master]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run build
      - run: npm run test
      - run: # Deploy commands
```

---

## Domain & SSL

### Custom Domain
1. Vai su Vercel/Heroku Project Settings
2. Aggiungi il tuo dominio (es: immocrm.com)
3. Aggiungi i DNS records:
   ```
   A     @ 76.76.19.21      (Vercel)
   CNAME www cname.vercel-dns.com
   ```

### SSL Certificate
✅ Automatico con Vercel/Railway/Heroku

---

## Scaling

### Quando crescere:
- **Traffic**: Vite + Vercel handle 10k+ req/min facilmente
- **Database**: Supabase scalabile - vedi usage dashboard
- **Backend**: Heroku > Railway > AWS per scaling

### Cost Estimation (Monthly)
- **Frontend (Vercel)**: Free - $20
- **Backend (Heroku)**: $7 - $50
- **Database (Supabase)**: Free - $100
- **Total**: ~$0 - $170/month

---

## Rollback

Se il deploy fallisce:

```bash
# Vercel
vercel rollback

# Heroku
heroku releases
heroku rollback v10

# Railway
# Automatic rollback dalla UI
```

---

## Post-Launch

1. ✅ Monitor analytics
2. ✅ Raccogli feedback utenti
3. ✅ Ottimizza performance
4. ✅ Implementa feature requests
5. ✅ Mantieni security updates

---

**Domande? Apri una issue su GitHub!**
