
export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed."
    });
  }

  try {
    const {
      formType,
      email,
      message,
      username
    } = req.body || {};

    let text = "";

    // FIRST PAGE: EMAIL AND MESSAGE
    if (formType === "contactform") {

      if (
        typeof email !== "string" ||
        !email.trim() ||
        typeof message !== "string" ||
        !message.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Please fill in email and message."
        });
      }

      text = `
📩 NEW CONTACT FORM SUBMISSION

📧 Email: ${email.trim()}

💬 Message:
${message.trim()}
      `;
    }

    // SECOND PAGE: USERNAME ONLY
    else if (formType === "usernameform") {

      if (
        typeof username !== "string" ||
        !username.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Please enter your username."
        });
      }

      text = `
👤 NEW USERNAME FORM SUBMISSION

Username: ${username.trim()}
      `;
    }

    // INVALID FORM TYPE
    else {
      return res.status(400).json({
        success: false,
        message: "Invalid form type."
      });
    }

    // TELEGRAM CONFIGURATION
    const token = process.env.TELEGRAM_BOT_TOKEN;

    const chatIds = [
      process.env.TELEGRAM_CHAT_ID_1
    ].filter(Boolean);

    if (!token || chatIds.length === 0) {
      return res.status(500).json({
        success: false,
        message: "Server configuration error."
      });
    }

    // SEND MESSAGE TO TELEGRAM
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

        const result = await response.json();

        return {
          httpOk: response.ok,
          ...result
        };
      })
    );

    // CHECK TELEGRAM RESPONSE
    if (
      results.some(
        result => !result.httpOk || !result.ok
      )
    ) {
      console.error("Telegram error:", results);

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
