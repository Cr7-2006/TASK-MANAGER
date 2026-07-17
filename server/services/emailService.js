// Use native fetch to call Resend API (HTTP port 443) to bypass Render SMTP block
const sendEmailViaResend = async (to, subject, htmlContent) => {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.log(`[Email Service] Skipped sending email to ${to} because RESEND_API_KEY is not configured.`);
    return;
  }

  // Note: On Resend's free tier without a verified domain, you must use 'onboarding@resend.dev' as the from address.
  const fromEmail = process.env.RESEND_FROM_EMAIL || "TaskMaster <onboarding@resend.dev>";

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        subject: subject,
        html: htmlContent,
      }),
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log(`[Email Service] Email sent successfully to ${to} via Resend. ID: ${data.id}`);
    } else {
      console.error(`[Email Service] Resend API Error:`, data);
    }
  } catch (error) {
    console.error('[Email Service] Failed to execute Resend API request:', error);
  }
};

// ─── Task Notification Email ─────────────────────────────────────
const sendTaskEmail = async (recipientEmail, username, subject, title, status, description) => {
  const statusColors = {
    todo: '#3b82f6',
    'in-progress': '#eab308',
    completed: '#10b981',
  };
  const statusColor = statusColors[status] || '#8b5cf6';

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #0f172a; padding: 2rem; color: #f3f4f6; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.08);">
      <div style="text-align: center; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 1.5rem; margin-bottom: 1.5rem;">
        <h1 style="color: #ffffff; font-size: 1.8rem; margin: 0;">TaskMaster Notification</h1>
        <p style="color: #94a3b8; font-size: 0.9rem; margin: 5px 0 0 0;">Keeping you organized and productive</p>
      </div>
      <p style="font-size: 1rem; line-height: 1.5; color: #cbd5e1;">Hi ${username},</p>
      <p style="font-size: 1.1rem; font-weight: 600; color: #ffffff; margin-bottom: 1.25rem;">${subject}</p>
      <div style="background-color: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 10px; margin-bottom: 1.5rem;">
        <h3 style="margin: 0 0 0.5rem 0; color: #ffffff; font-size: 1.2rem;">${title}</h3>
        <div style="margin-bottom: 1rem;">
          <span style="display: inline-block; padding: 0.25rem 0.75rem; border-radius: 20px; background-color: ${statusColor}20; border: 1px solid ${statusColor}50; color: ${statusColor}; font-size: 0.8rem; font-weight: 700; text-transform: uppercase;">
            ${status === 'in-progress' ? 'In Progress' : status}
          </span>
        </div>
        <p style="margin: 0; font-size: 0.95rem; color: #94a3b8; line-height: 1.5; white-space: pre-wrap;">${description || 'No description provided.'}</p>
      </div>
    </div>
  `;

  await sendEmailViaResend(recipientEmail, \`TaskMaster Alert: \${subject}\`, html);
};

// ─── Welcome / Registration Email ────────────────────────────────
const sendWelcomeEmail = async (recipientEmail, username) => {
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #0f172a; padding: 2rem; color: #f3f4f6; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.08);">
      <div style="text-align: center; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 1.5rem; margin-bottom: 1.5rem;">
        <div style="display: inline-block; width: 60px; height: 60px; background: linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%); border-radius: 14px; line-height: 60px; font-size: 1.8rem; margin-bottom: 0.75rem;">✓</div>
        <h1 style="color: #ffffff; font-size: 1.8rem; margin: 0;">Welcome to TaskMaster!</h1>
      </div>
      <p style="font-size: 1.05rem; line-height: 1.6; color: #cbd5e1;">Hi <strong style="color: #ffffff;">${username}</strong>,</p>
      <p style="font-size: 1rem; line-height: 1.6; color: #cbd5e1;">Thank you for joining <strong style="color: #a78bfa;">TaskMaster</strong>! Your account is now active.</p>
    </div>
  `;

  await sendEmailViaResend(recipientEmail, '🎉 Welcome to TaskMaster — Registration Successful!', html);
};

// ─── OTP / Password Reset Email ──────────────────────────────────
const sendOtpEmail = async (recipientEmail, username, otp) => {
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #0f172a; padding: 2rem; color: #f3f4f6; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.08);">
      <div style="text-align: center; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 1.5rem; margin-bottom: 1.5rem;">
        <h1 style="color: #ffffff; font-size: 1.8rem; margin: 0;">Password Reset</h1>
      </div>
      <p style="font-size: 1rem; line-height: 1.6; color: #cbd5e1;">Hi <strong style="color: #ffffff;">${username}</strong>,</p>
      <p style="font-size: 1rem; line-height: 1.6; color: #cbd5e1;">We received a request to reset your password. Use the following OTP to proceed:</p>
      <div style="text-align: center; margin: 2rem 0;">
        <div style="display: inline-block; background: linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(6,182,212,0.12) 100%); border: 2px solid rgba(124,58,237,0.3); padding: 1.25rem 3rem; border-radius: 12px;">
          <span style="font-size: 2.5rem; font-weight: 800; letter-spacing: 0.75rem; color: #ffffff; font-family: 'Courier New', monospace;">${otp}</span>
        </div>
      </div>
    </div>
  `;

  await sendEmailViaResend(recipientEmail, '🔐 TaskMaster — Password Reset OTP', html);
};

module.exports = { sendTaskEmail, sendWelcomeEmail, sendOtpEmail };
