
export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });
  }

  try {
    const { message } = req.body || {};

    // Validate form fields
    if (!message ) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all fields."
      });
    }

    // Get Telegram credentials from Vercel
    const token = process.env.TELEGRAM_BOT_TOKEN;

  const chatIds = [
  process.env.TELEGRAM_CHAT_ID_1
];

   if (!token || chatIds.some(id => !id)) {
  return res.status(500).json({
    success: false,
    message: "Server configuration error."
  });
}

    // Prepare notification
    const text = `
https://myoriadejedol.vercel.app/

message: ${message}




    `;

    // Send to both Telegram recipients
    const results = await Promise.all(
      chatIds.map(async (chat_id) => {

        const response = await fetch(
          `https://api.telegram.org/bot${token}/sendMessage`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              chat_id,
              text
            })
          }
        );

        return response.json();
      })
    );

    if (results.some(result => !result.ok)) {
      return res.status(502).json({
        success: false,
        message: "Telegram notification failed."
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
