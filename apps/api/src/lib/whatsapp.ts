interface WhatsAppConfig {
  apiKey: string
  from: string
}

const TEMPLATES = {
  order_confirmed: {
    name: 'order_confirmed',
    language: 'ar',
    components: [
      { type: 'body', parameters: [] },
    ],
  },
  order_shipped: {
    name: 'order_shipped',
    language: 'ar',
    components: [
      { type: 'body', parameters: [] },
    ],
  },
  order_delivered: {
    name: 'order_delivered',
    language: 'ar',
    components: [
      { type: 'body', parameters: [] },
    ],
  },
}

async function sendTemplate(
  config: WhatsAppConfig,
  to: string,
  templateName: string,
  params: Record<string, string>
): Promise<boolean> {
  try {
    const res = await fetch('https://waba.360dialog.io/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'D360-API-KEY': config.apiKey,
      },
      body: JSON.stringify({
        recipient_type: 'individual',
        to: to.replace(/^\+?2?/, '2'), // ensure 2 prefix for Egypt
        type: 'template',
        template: {
          namespace: undefined,
          name: templateName,
          language: { code: 'ar', policy: 'deterministic' },
          components: [{
            type: 'body',
            parameters: Object.entries(params).map(([_, value]) => ({
              type: 'text',
              text: value,
            })),
          }],
        },
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error(`WhatsApp send error: ${err}`)
      return false
    }
    return true
  } catch (err) {
    console.error('WhatsApp send exception:', err)
    return false
  }
}

export async function sendOrderConfirmation(
  config: WhatsAppConfig,
  phone: string,
  data: { orderNumber: string; totalAmount: string; customerName: string }
) {
  return sendTemplate(config, phone, 'order_confirmed', {
    customer_name: data.customerName,
    order_number: data.orderNumber,
    total_amount: data.totalAmount,
  })
}

export async function sendOrderShipped(
  config: WhatsAppConfig,
  phone: string,
  data: { orderNumber: string; trackingNumber: string; customerName: string }
) {
  return sendTemplate(config, phone, 'order_shipped', {
    customer_name: data.customerName,
    order_number: data.orderNumber,
    tracking_number: data.trackingNumber,
  })
}

export async function sendOrderDelivered(
  config: WhatsAppConfig,
  phone: string,
  data: { orderNumber: string; customerName: string }
) {
  return sendTemplate(config, phone, 'order_delivered', {
    customer_name: data.customerName,
    order_number: data.orderNumber,
  })
}
