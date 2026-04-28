export const sendTelegramNotification = async (message: string) => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.log('Telegram credentials not configured, skipping notification.');
    return { success: true };
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to send Telegram message:', errorText);
      return { success: false, error: errorText };
    }
    
    return { success: true };
  } catch (error: any) {
    console.error('Error sending Telegram message:', error.message);
    return { success: false, error: error.message };
  }
};
