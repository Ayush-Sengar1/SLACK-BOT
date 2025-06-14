const express = require("express")
const cors = require("cors")
const axios = require("axios")


const app = express()

app.use(express.json())
app.use(cors())

const SLACK_BOT_TOKEN = "xoxb-8975943272229-8976409333014-Bt6kJOpRFoBR5JxdRaE5LH68"
const CHANNEL_ID = "C08V8BJQ29F"

app.post("/api/send-message", async (req, res) => {
  const { channel, text } = req.body;

    try {
    const response = await axios.post(
      'https://slack.com/api/chat.postMessage',
      {
        channel: CHANNEL_ID,
        text: req.body.text || 'Hello from backend!',
      },
      {
        headers: {
          Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message', detail: error.message });
  }
});

app.get('/api/messages', async (req, res) => {
  try {
    const response = await axios.get('https://slack.com/api/conversations.history', {
      headers: {
        Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
      },
      params: {
        channel: CHANNEL_ID,
      },
    });

    if (!response.data.ok) {
      return res.status(400).json({ error: response.data.error });
    }

    res.json(response.data);
  } catch (error) {
    console.error("Backend error:", error.message);
    res.status(500).json({ error: 'Failed to fetch messages', detail: error.message });
  }
});

app.post('/api/delete-message', async (req, res) => {
  const { channel, ts } = req.body;

  try {
    const response = await axios.post(
      'https://slack.com/api/chat.delete',
      new URLSearchParams({ channel, ts }),
      {
        headers: {
          Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    if (!response.data.ok) {
      return res.status(400).json({ error: response.data.error });
    }

    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error('Delete message error:', error.message);
    res.status(500).json({ error: 'Failed to delete message', detail: error.message });
  }
});

app.post('/api/edit-message', async (req, res) => {
  const { channel, ts, text } = req.body;

  try {
    const response = await axios.post(
      'https://slack.com/api/chat.update',
      { channel, ts, text },
      {
        headers: {
          Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.ok) {
      res.json({ success: true, message: 'Message edited successfully.' });
    } else {
      console.error('Slack API error:', response.data.error);
      res.status(400).json({ success: false, error: response.data.error });
    }
  } catch (error) {
    console.error('Axios error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to edit message', detail: error.message });
  }
});


app.listen(3000 , ()=>{
    console.log("http://localhost:3000/")
})