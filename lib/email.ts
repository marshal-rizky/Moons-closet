import { Resend } from "resend";
import { formatPrice, siteConfig } from "@/lib/config";
import type { Order } from "@/lib/types";

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

export function sendAdminOrderAlert(order: Order) {
  const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);

  resend.emails.send({
    from: fromEmail,
    to: siteConfig.email,
    subject: `Pesanan Baru #${order.order_number}`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px;">
        <h2 style="margin-bottom: 4px;">Pesanan Baru #${order.order_number}</h2>
        <p style="color: #666; margin-top: 0;">dari ${order.customer_name}</p>
        <table style="width: 100%; border-collapse: collapse;">
          ${order.items
            .map(
              (item) => `
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px 0;">${item.name} (${item.size}) &times; ${item.quantity}</td>
              <td style="padding: 8px 0; text-align: right;">${formatPrice(item.price * item.quantity)}</td>
            </tr>`
            )
            .join("")}
          <tr>
            <td style="padding: 12px 0; font-weight: bold;">Total (${itemCount} item)</td>
            <td style="padding: 12px 0; font-weight: bold; text-align: right;">${formatPrice(order.total)}</td>
          </tr>
        </table>
        <div style="margin-top: 16px; padding: 12px; background: #f9f9f9;">
          <p style="margin: 0 0 4px;"><strong>Telepon:</strong> ${order.customer_phone}</p>
          <p style="margin: 0;"><strong>Alamat:</strong> ${order.customer_address}</p>
        </div>
      </div>
    `,
  }).catch((err) => console.error("Admin email failed:", err));
}

export function sendCustomerShippingNotification(order: Order) {
  if (!order.customer_email) return;

  resend.emails.send({
    from: fromEmail,
    to: order.customer_email,
    subject: `Pesanan #${order.order_number} Sedang Dikirim`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px;">
        <h2>Pesanan Anda Sedang Dikirim!</h2>
        <p>Halo ${order.customer_name},</p>
        <p>Pesanan <strong>#${order.order_number}</strong> sedang dalam perjalanan ke alamat Anda.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          ${order.items
            .map(
              (item) => `
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px 0;">${item.name} (${item.size}) &times; ${item.quantity}</td>
              <td style="padding: 8px 0; text-align: right;">${formatPrice(item.price * item.quantity)}</td>
            </tr>`
            )
            .join("")}
          <tr>
            <td style="padding: 12px 0; font-weight: bold;">Total</td>
            <td style="padding: 12px 0; font-weight: bold; text-align: right;">${formatPrice(order.total)}</td>
          </tr>
        </table>
        <div style="padding: 12px; background: #f9f9f9;">
          <p style="margin: 0;"><strong>Alamat pengiriman:</strong> ${order.customer_address}</p>
        </div>
        <p style="color: #666; font-size: 14px; margin-top: 16px;">Terima kasih telah berbelanja di ${siteConfig.name}!</p>
      </div>
    `,
  }).catch((err) => console.error("Customer email failed:", err));
}
