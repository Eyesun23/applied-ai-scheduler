export default async function handler(req, res) {
  if (process.env.CRON_SECRET && req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const WEBHOOK_URL = 'https://webhook.site/0120f7d4-1fe2-4665-9449-c18cda53c93b';

  const payload = {
    full_name: 'Aysun Far',
    timestamp: new Date().toISOString(),
    source: 'vercel-cron',
    skill: 'ping',
  };

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const responseBody = await response.text();

    if (response.ok) {
      return res.status(200).json({
        success: true,
        message: 'Ping sent successfully',
        payload,
        webhook_status: response.status,
      });
    } else {
      return res.status(502).json({
        success: false,
        message: 'Webhook rejected the request',
        payload,
        webhook_status: response.status,
        webhook_response: responseBody,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal Server Error',
      payload,
    });
  }
}
