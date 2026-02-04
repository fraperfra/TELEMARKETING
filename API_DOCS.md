# 🔌 API Documentation

## Base URL
```
Development: http://localhost:3001/api
Production: https://immocrm-api.vercel.app/api
```

## Authentication
Tutte le richieste richiedono header:
```
Authorization: Bearer {SUPABASE_TOKEN}
Content-Type: application/json
```

---

## 📊 Endpoints

### Health Check
```
GET /api/health

Response:
{
  "status": "ok",
  "timestamp": "2026-02-04T10:30:00Z",
  "environment": "production"
}
```

---

### 📧 Notifications

#### Send Email
```
POST /api/notifications/email

Request:
{
  "to": "user@example.com",
  "template": "welcome",
  "data": {
    "name": "John",
    "link": "https://..."
  }
}

Response:
{
  "success": true
}
```

#### Send SMS
```
POST /api/notifications/sms

Request:
{
  "to": "+39123456789",
  "message": "Your appointment is scheduled..."
}

Response:
{
  "success": true
}
```

#### Send Push Notification
```
POST /api/notifications/push

Request:
{
  "subscription": {
    "endpoint": "https://...",
    "keys": {
      "p256dh": "...",
      "auth": "..."
    }
  },
  "title": "New appointment",
  "body": "You have a new appointment scheduled",
  "icon": "https://...",
  "badge": "https://...",
  "tag": "appointment"
}

Response:
{
  "success": true,
  "message": "Push notification sent"
}
```

---

### 🔔 Alerts

#### Create Alert
```
POST /api/alerts

Request:
{
  "user_id": "uuid",  // OR
  "organization_id": "uuid",
  "type": "info|warning|error|success",
  "title": "Alert Title",
  "message": "Alert message content",
  "action_url": "/path/to/action" // Optional
}

Response:
{
  "success": true,
  "message": "Alert created",
  "alert_id": "uuid"
}
```

---

### ⏰ Reminders

#### Create Reminder
```
POST /api/reminders

Request:
{
  "user_id": "uuid",
  "title": "Call customer",
  "description": "Follow up call with John",
  "scheduled_for": "2026-02-05T14:30:00Z",
  "type": "call|email|appointment",
  "contact_id": "uuid" // Optional
}

Response:
{
  "success": true,
  "message": "Reminder created",
  "reminder_id": "uuid"
}
```

---

### 🤖 AI Analysis

#### Analyze Call
```
POST /api/ai/analyze-call

Request:
{
  "transcript": "Agent: Hello, how can I help you?\nCustomer: I'm interested in the apartment..."
}

Response:
{
  "score": 85,
  "priority": "hot",
  "key_signals": [
    "High interest in property",
    "Quick decision maker",
    "Budget available"
  ],
  "red_flags": [
    "Price sensitivity",
    "Needs to consult family"
  ],
  "summary": "Very promising lead with clear intent to purchase..."
}
```

---

## 🔐 Error Handling

Tutti gli errori seguono il formato:
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Status Codes
- `200` OK
- `201` Created
- `400` Bad Request
- `401` Unauthorized
- `403` Forbidden
- `404` Not Found
- `500` Internal Server Error

---

## 📍 Supabase Integration

L'API è connessa direttamente a Supabase per:

### Read Operations
- Leggere dati da qualsiasi tabella con RLS policies
- Real-time subscriptions tramite WebSocket

### Write Operations
- Creare/Aggiornare/Eliminare record
- Transaction management
- Trigger events

### Authentication
- JWT tokens via Supabase Auth
- Role-based access control (RLS)
- User context nelle query

---

## 🔄 Real-time Features

### WebSocket Subscriptions
```javascript
import { supabase } from '@/lib/supabase';

// Subscribe to changes
const subscription = supabase
  .channel('calls')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'calls' },
    (payload) => {
      console.log('Call changed:', payload);
    }
  )
  .subscribe();

// Cleanup
subscription.unsubscribe();
```

---

## 🧪 Testing

### cURL Examples

Health Check:
```bash
curl http://localhost:3001/api/health
```

Send SMS:
```bash
curl -X POST http://localhost:3001/api/notifications/sms \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+39123456789",
    "message": "Test message"
  }'
```

Create Alert:
```bash
curl -X POST http://localhost:3001/api/alerts \
  -H "Content-Type: application/json" \
  -d '{
    "organization_id": "org_123",
    "type": "info",
    "title": "Test Alert",
    "message": "This is a test alert"
  }'
```

---

## 📚 Additional Resources

- [Supabase Docs](https://supabase.com/docs)
- [Twilio Docs](https://www.twilio.com/docs)
- [OpenAI API](https://platform.openai.com/docs)
- [Express.js Guide](https://expressjs.com/)

---

**Last Updated**: 4 Febbraio 2026
