// Email Service for sending notifications
// This is a simple implementation that can be replaced with actual email API (SendGrid, Mailgun, etc.)

class EmailService {
  constructor() {
    // In production, you would use actual email service credentials
    this.config = {
      enabled: true,
      defaultFrom: 'hr-system@company.com',
      // For demo, we'll store emails in localStorage instead of sending
      mockMode: true
    };
  }

  // Send email function
  async sendEmail(to, subject, body, options = {}) {
    const email = {
      id: Date.now().toString(),
      from: options.from || this.config.defaultFrom,
      to,
      subject,
      body,
      timestamp: new Date().toISOString(),
      type: options.type || 'notification'
    };

    if (this.config.mockMode) {
      // Store in localStorage for demo purposes
      const sentEmails = JSON.parse(localStorage.getItem('hr_sent_emails') || '[]');
      sentEmails.push(email);
      localStorage.setItem('hr_sent_emails', JSON.stringify(sentEmails));
      
      console.log('📧 Email sent (mock mode):', email);
      return { success: true, messageId: email.id, mock: true };
    } else {
      // Here you would integrate with actual email service
      // Example with fetch to email API:
      /*
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(email)
      });
      return response.json();
      */
      
      return { success: true, messageId: email.id };
    }
  }

  // Send low stock alert
  async sendLowStockAlert(products, recipient) {
    const lowStockProducts = products.filter(p => {
      const stock = p.totalStock || p.stock || 0;
      return stock > 0 && stock < 10; // Items with stock between 1-9
    });

    const outOfStockProducts = products.filter(p => {
      const stock = p.totalStock || p.stock || 0;
      return stock === 0;
    });

    if (lowStockProducts.length === 0 && outOfStockProducts.length === 0) {
      return { success: false, reason: 'No low stock items' };
    }

    const subject = `⚠️ Stock Alert: ${lowStockProducts.length + outOfStockProducts.length} products need attention`;
    
    let body = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #e11d48;">Stock Alert Report</h2>
        <p style="color: #666;">Generated on ${new Date().toLocaleDateString()}</p>
    `;

    if (outOfStockProducts.length > 0) {
      body += `
        <h3 style="color: #dc2626; margin-top: 30px;">🚨 Out of Stock (${outOfStockProducts.length} items)</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead>
            <tr style="background-color: #fee2e2;">
              <th style="padding: 10px; text-align: left; border: 1px solid #fca5a5;">Product</th>
              <th style="padding: 10px; text-align: left; border: 1px solid #fca5a5;">SKU</th>
              <th style="padding: 10px; text-align: left; border: 1px solid #fca5a5;">Category</th>
            </tr>
          </thead>
          <tbody>
      `;
      
      outOfStockProducts.forEach(product => {
        body += `
          <tr>
            <td style="padding: 8px; border: 1px solid #fca5a5;">${product.name}</td>
            <td style="padding: 8px; border: 1px solid #fca5a5;">${product.sku || 'N/A'}</td>
            <td style="padding: 8px; border: 1px solid #fca5a5;">${product.category || 'N/A'}</td>
          </tr>
        `;
      });
      
      body += `
          </tbody>
        </table>
      `;
    }

    if (lowStockProducts.length > 0) {
      body += `
        <h3 style="color: #ea580c; margin-top: 30px;">⚠️ Low Stock (${lowStockProducts.length} items)</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead>
            <tr style="background-color: #fed7aa;">
              <th style="padding: 10px; text-align: left; border: 1px solid #fb923c;">Product</th>
              <th style="padding: 10px; text-align: left; border: 1px solid #fb923c;">SKU</th>
              <th style="padding: 10px; text-align: left; border: 1px solid #fb923c;">Current Stock</th>
              <th style="padding: 10px; text-align: left; border: 1px solid #fb923c;">Category</th>
            </tr>
          </thead>
          <tbody>
      `;
      
      lowStockProducts.forEach(product => {
        const stock = product.totalStock || product.stock || 0;
        body += `
          <tr>
            <td style="padding: 8px; border: 1px solid #fb923c;">${product.name}</td>
            <td style="padding: 8px; border: 1px solid #fb923c;">${product.sku || 'N/A'}</td>
            <td style="padding: 8px; border: 1px solid #fb923c; font-weight: bold; color: #ea580c;">${stock}</td>
            <td style="padding: 8px; border: 1px solid #fb923c;">${product.category || 'N/A'}</td>
          </tr>
        `;
      });
      
      body += `
          </tbody>
        </table>
      `;
    }

    body += `
        <div style="margin-top: 30px; padding: 15px; background-color: #f3f4f6; border-radius: 5px;">
          <p style="margin: 0; color: #666;">
            <strong>Action Required:</strong> Please review and reorder these products as necessary.
          </p>
          <p style="margin: 10px 0 0 0; color: #666;">
            This is an automated alert from the HR Performance Review System.
          </p>
        </div>
      </div>
    `;

    return this.sendEmail(recipient, subject, body, { type: 'alert' });
  }

  // Get sent emails (for viewing in UI)
  getSentEmails() {
    return JSON.parse(localStorage.getItem('hr_sent_emails') || '[]');
  }

  // Clear sent emails
  clearSentEmails() {
    localStorage.removeItem('hr_sent_emails');
  }
}

export default new EmailService();