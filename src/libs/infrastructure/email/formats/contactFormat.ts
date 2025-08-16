import { ContactMessageDto } from "../../../../modules/user/domain/entites/UserContactInfo";

export function buildContactEmailHtml(contactPayload: ContactMessageDto): string {
    return `
      <div style="max-width:600px;margin:0 auto;padding:20px;
                  background:#f9fafb;border-radius:8px;
                  font-family:Arial,sans-serif;color:#111;">
        <h2 style="text-align:center;color:#111;margin-bottom:20px;">
          📩 New Contact Message
        </h2>
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:8px;font-weight:bold;width:150px;">Full Name</td>
            <td style="padding:8px;background:#fff;border-radius:4px;">${contactPayload.fullName}</td>
          </tr>
          <tr>
            <td style="padding:8px;font-weight:bold;">Email Address</td>
            <td style="padding:8px;background:#fff;border-radius:4px;">${contactPayload.emailAddress}</td>
          </tr>
          <tr>
            <td style="padding:8px;font-weight:bold;">Phone Number</td>
            <td style="padding:8px;background:#fff;border-radius:4px;">${contactPayload.phoneNumber}</td>
          </tr>
          <tr>
            <td style="padding:8px;font-weight:bold;">Property Type</td>
            <td style="padding:8px;background:#fff;border-radius:4px;">${contactPayload.propertyType}</td>
          </tr>
          <tr>
            <td style="padding:8px;font-weight:bold;">Subject</td>
            <td style="padding:8px;background:#fff;border-radius:4px;">${contactPayload.subject}</td>
          </tr>
          <tr>
            <td style="padding:8px;font-weight:bold;">Message</td>
            <td style="padding:8px;background:#fff;border-radius:4px;white-space:pre-line;">
              ${contactPayload.message}
            </td>
          </tr>
        </table>
      </div>
    `;
  }