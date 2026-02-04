import express from 'express';
import cors from 'cors';
import twilio from 'twilio';
import OpenAI from 'openai';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Email notifications
app.post('/api/notifications/email', async (req, res) => {
  try {
    const { to, template, data } = req.body;
    
    // TODO: Implement with Resend or SendGrid
    console.log('Sending email:', { to, template, data });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// SMS notifications
app.post('/api/notifications/sms', async (req, res) => {
  try {
    const { to, message } = req.body;

    await twilioClient.messages.create({
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
      body: message,
    });

    res.json({ success: true });
  } catch (error) {
    console.error('SMS error:', error);
    res.status(500).json({ error: 'Failed to send SMS' });
  }
});

// Create alert for user/organization
app.post('/api/alerts', async (req, res) => {
  try {
    const { user_id, organization_id, type, title, message, action_url } = req.body;
    
    if (!user_id && !organization_id) {
      return res.status(400).json({ error: 'user_id or organization_id required' });
    }

    console.log('Creating alert:', { user_id, organization_id, type, title, message });
    
    res.json({ success: true, message: 'Alert created' });
  } catch (error) {
    console.error('Alert error:', error);
    res.status(500).json({ error: 'Failed to create alert' });
  }
});

// Create reminder for user
app.post('/api/reminders', async (req, res) => {
  try {
    const { user_id, title, description, scheduled_for, type, contact_id } = req.body;
    
    if (!user_id || !title || !scheduled_for) {
      return res.status(400).json({ error: 'user_id, title, scheduled_for required' });
    }

    console.log('Creating reminder:', { user_id, title, scheduled_for, type });
    
    res.json({ success: true, message: 'Reminder created' });
  } catch (error) {
    console.error('Reminder error:', error);
    res.status(500).json({ error: 'Failed to create reminder' });
  }
});

// Send push notification (Browser Push API)
app.post('/api/notifications/push', async (req, res) => {
  try {
    const { subscription, title, body, icon, badge, tag } = req.body;
    
    // TODO: Implement web push with web-push library
    console.log('Sending push notification:', { title, body });
    
    res.json({ success: true, message: 'Push notification sent' });
  } catch (error) {
    console.error('Push notification error:', error);
    res.status(500).json({ error: 'Failed to send push notification' });
  }
});

// AI Analysis
app.post('/api/ai/analyze-call', async (req, res) => {
  try {
    const { transcript } = req.body;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Sei un esperto analista di conversazioni immobiliari.',
        },
        {
          role: 'user',
          content: `Analizza questa conversazione e fornisci: score (0-100), priority (hot/warm/cold), key_signals, red_flags, summary. Rispondi in JSON.\n\n${transcript}`,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const analysis = JSON.parse(response.choices[0].message.content || '{}');
    res.json(analysis);
  } catch (error) {
    console.error('AI analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze call' });
  }
});

app.listen(port, () => {
  console.log(`API server running on port ${port}`);
});
