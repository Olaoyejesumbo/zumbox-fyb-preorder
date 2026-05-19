import { Resend } from "resend";
import { Order } from "@/types";
import { formatNaira, formatDate } from "./utils";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderConfirmationEmail(order: Order): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: 'DM Sans', Arial, sans-serif; background: #F5F0E8; color: #0D0D0D; margin: 0; padding: 0; }
          .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff; border: 1px solid #e0d9cc; }
          .header { background: #1B3A2D; color: #F5F0E8; padding: 32px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; letter-spacing: 2px; text-transform: uppercase; }
          .header p { margin: 8px 0 0; color: #C9A96E; font-size: 13px; letter-spacing: 1px; }
          .body { padding: 40px 32px; }
          .row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f0ebe2; }
          .label { color: #666; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
          .value { font-weight: 600; font-size: 14px; }
          .order-id { background: #1B3A2D; color: #C9A96E; padding: 4px 12px; font-size: 14px; font-weight: 700; letter-spacing: 2px; }
          .total-row { background: #F5F0E8; padding: 16px; margin: 24px 0; }
          .steps { background: #F5F0E8; padding: 24px; margin-top: 24px; }
          .steps h3 { margin: 0 0 16px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #1B3A2D; }
          .steps ol { margin: 0; padding-left: 20px; }
          .steps li { margin-bottom: 8px; font-size: 14px; line-height: 1.6; }
          .footer { background: #0D0D0D; color: #F5F0E8; padding: 24px 32px; text-align: center; font-size: 12px; }
          .footer p { margin: 4px 0; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="header">
            <h1>ZumboX Fashion</h1>
            <p>THE RARE FORM</p>
          </div>
          <div class="body">
            <p style="font-size:18px; font-weight:700; margin-bottom:8px;">Order Confirmed 🎉</p>
            <p style="color:#666; margin-bottom:32px;">Hi ${order.student_name}, your pre-order for FYB Week 2026 has been received and confirmed.</p>

            <div class="row">
              <span class="label">Order ID</span>
              <span class="order-id">${order.order_id}</span>
            </div>
            <div class="row">
              <span class="label">Date</span>
              <span class="value">${formatDate(order.created_at)}</span>
            </div>
            <div class="row">
              <span class="label">Selected Design</span>
              <span class="value">${order.selected_design}</span>
            </div>
            <div class="row">
              <span class="label">Gender</span>
              <span class="value">${order.gender}</span>
            </div>
            <div class="row">
              <span class="label">Measurements</span>
              <span class="value">${order.in_person_measurement ? "In-person session" : "Self-measured"}</span>
            </div>

            <div class="total-row">
              <div class="row" style="border:none; padding:4px 0;">
                <span class="label">Full Price</span>
                <span class="value">${formatNaira(order.deposit_amount + order.balance_amount)}</span>
              </div>
              <div class="row" style="border:none; padding:4px 0;">
                <span class="label">Deposit Paid ✓</span>
                <span class="value" style="color:#1B3A2D;">${formatNaira(order.deposit_amount)}</span>
              </div>
              <div class="row" style="border:none; padding:4px 0;">
                <span class="label">Balance on Pickup</span>
                <span class="value" style="color:#4A0E1A;">${formatNaira(order.balance_amount)}</span>
              </div>
            </div>

            <div class="steps">
              <h3>Next Steps</h3>
              <ol>
                <li>You've received this email as your confirmation — save it!</li>
                ${order.in_person_measurement ? "<li>We'll contact you within <strong>2 business days</strong> to schedule your measurement session.</li>" : "<li>Your self-measurements have been recorded.</li>"}
                <li>Your uniform will be ready for pickup by <strong>July 26, 2026</strong>.</li>
                <li>You'll receive a notification when your uniform is ready.</li>
              </ol>
            </div>
          </div>
          <div class="footer">
            <p style="font-weight:700; letter-spacing:2px;">ZUMBOX FASHION</p>
            <p>Questions? Reply to this email or contact us on WhatsApp.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await resend.emails.send({
    from: "ZumboX Fashion <orders@zumboxarchive.com>",
    to: order.email,
    subject: `Order Confirmed — ${order.order_id} | ZumboX FYB Week 2026`,
    html,
  });
}
