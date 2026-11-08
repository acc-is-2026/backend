import nodemailer, { type Transporter } from "nodemailer";

export type EmailRecipient = {
  name: string;
  email: string;
};

const COLORS = {
  background: "#111111",
  card: "#1f1f1f",
  border: "#2e2e2e",
  divider: "#2e2e2e",
  text: "#e9ecef",
  dimmed: "#828282",
  primary: "#c83c25",
  primaryLight: "#fe7055",
};

const FONT = "Inter, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif";

export class EmailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  private getResetPasswordHtml(
    userName: string,
    resetLink: string,
    appName: string,
  ): string {
    const safeUserName = this.escapeHtml(userName);
    const safeResetLink = this.escapeHtml(resetLink);
    const safeAppName = this.escapeHtml(appName);

    return `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="dark" />
    <meta name="supported-color-schemes" content="dark" />
    <title>Reset your password</title>
  </head>

  <body
    style="
      margin: 0;
      padding: 0;
      background-color: ${COLORS.background};
      font-family: ${FONT};
      color: ${COLORS.text};
    "
  >
    <table
      role="presentation"
      width="100%"
      cellspacing="0"
      cellpadding="0"
      border="0"
      style="background-color: ${COLORS.background}; padding: 40px 16px;"
    >
      <tr>
        <td align="center">
          <!-- Logo -->
          <table
            role="presentation"
            cellspacing="0"
            cellpadding="0"
            border="0"
            style="margin-bottom: 24px;"
          >
            <tr>
              <td
                style="
                  font-family: ${FONT};
                  font-size: 22px;
                  font-weight: 800;
                  letter-spacing: -0.02em;
                  color: #ffffff;
                "
              >
                Cine<span style="color: ${COLORS.primaryLight};">Track</span>
              </td>
            </tr>
          </table>

          <!-- Card -->
          <table
            role="presentation"
            width="100%"
            cellspacing="0"
            cellpadding="0"
            border="0"
            style="
              max-width: 570px;
              background-color: ${COLORS.card};
              border: 1px solid ${COLORS.border};
              border-radius: 16px;
              overflow: hidden;
            "
          >
            <!-- Coral accent bar -->
            <tr>
              <td
                style="height: 4px; line-height: 4px; font-size: 0; background-color: ${COLORS.primary};"
              >
                &nbsp;
              </td>
            </tr>

            <tr>
              <td style="padding: 40px 36px 8px; text-align: center;">
                <p
                  style="
                    margin: 0 0 10px;
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    color: ${COLORS.primaryLight};
                  "
                >
                  Password reset
                </p>

                <h1
                  style="
                    margin: 0 0 12px;
                    font-size: 24px;
                    line-height: 1.3;
                    font-weight: 700;
                    color: #ffffff;
                  "
                >
                  Reset your password
                </h1>

                <p
                  style="
                    margin: 0;
                    font-size: 15px;
                    line-height: 1.6;
                    color: ${COLORS.dimmed};
                  "
                >
                  Hi ${safeUserName}, we received a request to reset the
                  password for your ${safeAppName} account.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding: 28px 36px 36px;">
                <!-- Button -->
                <table
                  role="presentation"
                  width="100%"
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                >
                  <tr>
                    <td align="center" style="padding-bottom: 28px;">
                      <a
                        href="${safeResetLink}"
                        style="
                          display: inline-block;
                          padding: 10px 22px;
                          border-radius: 8px;
                          background-color: ${COLORS.primary};
                          color: #ffffff;
                          font-family: ${FONT};
                          font-size: 14px;
                          font-weight: 600;
                          text-decoration: none;
                        "
                      >
                        Set a new password
                      </a>
                    </td>
                  </tr>
                </table>

                <p
                  style="
                    margin: 0 0 24px;
                    font-size: 14px;
                    line-height: 1.6;
                    text-align: center;
                    color: ${COLORS.dimmed};
                  "
                >
                  For security reasons, this link expires in
                  <strong style="color: ${COLORS.text};">15 minutes</strong>.
                </p>

                <div
                  style="height: 1px; line-height: 1px; font-size: 0; background-color: ${COLORS.divider};"
                >
                  &nbsp;
                </div>

                <p
                  style="
                    margin: 24px 0 8px;
                    font-size: 13px;
                    line-height: 1.6;
                    color: ${COLORS.dimmed};
                  "
                >
                  Button not working? Copy and paste this link into your
                  browser:
                </p>
                <p
                  style="
                    margin: 0 0 24px;
                    font-size: 13px;
                    line-height: 1.5;
                    word-break: break-all;
                  "
                >
                  <a
                    href="${safeResetLink}"
                    style="color: ${COLORS.primaryLight}; text-decoration: none;"
                  >
                    ${safeResetLink}
                  </a>
                </p>

                <p
                  style="
                    margin: 0;
                    font-size: 13px;
                    line-height: 1.6;
                    color: ${COLORS.dimmed};
                  "
                >
                  <strong style="color: ${COLORS.text};">
                    Didn't request this?
                  </strong>
                  <br />
                  You can safely ignore this email. Your password won't change.
                </p>
              </td>
            </tr>
          </table>

          <!-- Footer -->
          <p
            style="
              margin: 24px 0 0;
              font-size: 12px;
              line-height: 1.5;
              color: ${COLORS.dimmed};
              text-align: center;
            "
          >
            This is an automated message from ${safeAppName}. Please don't
            reply to this email.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
  }

  public async sendPasswordResetEmail(
    user: EmailRecipient,
    resetToken: string,
  ): Promise<void> {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const appName = process.env.APP_NAME || "CineTrack";
    const resetLink =
      `${frontendUrl}/reset-password?token=` + encodeURIComponent(resetToken);

    const html = this.getResetPasswordHtml(user.name, resetLink, appName);

    const text = [
      `Hi ${user.name},`,
      "",
      `We received a request to reset the password for your ${appName} account.`,
      `Set a new password here: ${resetLink}`,
      "",
      "This link expires in 15 minutes.",
      "",
      "Didn't request this? You can safely ignore this email.",
      "Your password won't change.",
      "",
      `This is an automated message from ${appName}.`,
    ].join("\n");

    try {
      await this.transporter.sendMail({
        from: `"${appName}" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: `Reset your ${appName} password`,
        text,
        html,
      });
    } catch (error) {
      console.error(
        `[EmailService] Failed to send email to ${user.email}:`,
        error,
      );

      throw new Error("EMAIL_SEND_FAILED");
    }
  }
}
