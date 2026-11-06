
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });
  }

  try {
    const { name, email, phone, message } = req.body || {};

    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all fields."
      });
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;

    const chatIds = [
      process.env.TELEGRAM_CHAT_ID_1,
      process.env.TELEGRAM_CHAT_ID_2
    ];

    if (!token || chatIds.some(id => !id)) {
      return res.status(500).json({
        success: false,
        message: "Server configuration error."
      });
    }

    const text = `
NEW WEBSITE FORM SUBMISSION

Name: ${name}
Email: ${email}
Phone: ${phone}

Message:
${message}
    `;

    const results = await Promise.all(
      chatIds.map(chat_id =>
        fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            chat_id,
            text
          })
        }).then(response => response.json())
      )
    );

    if (results.some(result => !result.ok)) {
      return res.status(502).json({
        success: false,
        message: "Unable to deliver all notifications."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Form submitted successfully!"
    });

  } catch (error) {
    console.error("Form submission error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong."
    });
  }
}
