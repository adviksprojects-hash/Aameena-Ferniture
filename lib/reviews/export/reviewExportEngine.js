/**
 * @file reviewExportEngine.js
 * Universal Multi-Format Review Export Engine for Aameena Furniture.
 * Converts review collections into RFC 4180 CSV, formatted Excel (.xls XML),
 * structured JSON, or triggers a styled printable PDF catalog layout.
 */

import { BUSINESS_NAME } from "@/utils/googleReview.js";

/**
 * Trigger file download in browser
 */
function triggerDownload(content, filename, mimeType) {
  if (typeof window === "undefined") return;

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export reviews to RFC 4180 CSV
 * @param {Array<Object>} reviews
 * @param {string} [filename]
 */
export function exportReviewsToCSV(reviews = [], filename = "") {
  if (!Array.isArray(reviews) || reviews.length === 0) return;

  const dateTag = new Date().toISOString().split("T")[0];
  const outName = filename || `aameena-reviews-${dateTag}.csv`;

  const headers = [
    "Review ID",
    "Reviewer Name",
    "Rating",
    "Status",
    "Review Text",
    "Furniture Purchased",
    "Category",
    "Wood Type",
    "City",
    "Language",
    "Verified",
    "Created At",
    "Owner Reply",
    "Owner Reply Date",
  ];

  const escapeCSV = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = [headers.join(",")];

  for (const r of reviews) {
    const row = [
      escapeCSV(r.id),
      escapeCSV(r.author?.name || r.reviewerName || "Anonymous"),
      escapeCSV(r.rating || 5),
      escapeCSV(r.status || "APPROVED"),
      escapeCSV(r.text || r.reviewText || ""),
      escapeCSV(r.furniturePurchased || r.productName || ""),
      escapeCSV(r.furnitureCategory || r.category || ""),
      escapeCSV(r.woodType || ""),
      escapeCSV(r.city || "Solapur"),
      escapeCSV(r.language || "en"),
      escapeCSV(r.isVerifiedPurchase ? "Yes" : "No"),
      escapeCSV(r.createdAt || r.date || ""),
      escapeCSV(r.ownerReply || r.ownerResponse?.text || ""),
      escapeCSV(r.ownerReplyDate || r.ownerResponse?.date || ""),
    ];
    rows.push(row.join(","));
  }

  const csvContent = "\uFEFF" + rows.join("\r\n"); // Add UTF-8 BOM for Excel
  triggerDownload(csvContent, outName, "text/csv;charset=utf-8;");
}

/**
 * Export reviews to Microsoft Excel XML Spreadsheet (.xls)
 * @param {Array<Object>} reviews
 * @param {string} [filename]
 */
export function exportReviewsToExcel(reviews = [], filename = "") {
  if (!Array.isArray(reviews) || reviews.length === 0) return;

  const dateTag = new Date().toISOString().split("T")[0];
  const outName = filename || `aameena-reviews-${dateTag}.xls`;

  const escapeXml = (val) => {
    if (val === null || val === undefined) return "";
    return String(val)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  };

  const rowsXml = reviews
    .map((r) => {
      const name = escapeXml(r.author?.name || r.reviewerName || "Customer");
      const rating = Number(r.rating) || 5;
      const status = escapeXml(r.status || "APPROVED");
      const text = escapeXml(r.text || r.reviewText || "");
      const product = escapeXml(r.furniturePurchased || r.productName || "");
      const wood = escapeXml(r.woodType || "");
      const city = escapeXml(r.city || "Solapur");
      const date = escapeXml(r.createdAt || r.date || "");
      const reply = escapeXml(r.ownerReply || r.ownerResponse?.text || "");

      return `
      <Row>
        <Cell><Data ss:Type="String">${escapeXml(r.id)}</Data></Cell>
        <Cell><Data ss:Type="String">${name}</Data></Cell>
        <Cell><Data ss:Type="Number">${rating}</Data></Cell>
        <Cell><Data ss:Type="String">${status}</Data></Cell>
        <Cell><Data ss:Type="String">${product}</Data></Cell>
        <Cell><Data ss:Type="String">${wood}</Data></Cell>
        <Cell><Data ss:Type="String">${city}</Data></Cell>
        <Cell><Data ss:Type="String">${date}</Data></Cell>
        <Cell><Data ss:Type="String">${text}</Data></Cell>
        <Cell><Data ss:Type="String">${reply}</Data></Cell>
      </Row>`;
    })
    .join("\n");

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:x="urn:schemas-microsoft-com:office:excel"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="Header">
      <Font ss:Bold="1" ss:Color="#FFFFFF" />
      <Interior ss:Color="#D97706" ss:Pattern="Solid" />
      <Alignment ss:Horizontal="Center" ss:Vertical="Center" />
    </Style>
  </Styles>
  <Worksheet ss:Name="Customer Reviews">
    <Table>
      <Column ss:Width="100"/>
      <Column ss:Width="140"/>
      <Column ss:Width="50"/>
      <Column ss:Width="80"/>
      <Column ss:Width="160"/>
      <Column ss:Width="100"/>
      <Column ss:Width="90"/>
      <Column ss:Width="120"/>
      <Column ss:Width="300"/>
      <Column ss:Width="200"/>
      <Row ss:StyleID="Header">
        <Cell><Data ss:Type="String">ID</Data></Cell>
        <Cell><Data ss:Type="String">Customer</Data></Cell>
        <Cell><Data ss:Type="String">Rating</Data></Cell>
        <Cell><Data ss:Type="String">Status</Data></Cell>
        <Cell><Data ss:Type="String">Product</Data></Cell>
        <Cell><Data ss:Type="String">Wood Species</Data></Cell>
        <Cell><Data ss:Type="String">City</Data></Cell>
        <Cell><Data ss:Type="String">Date</Data></Cell>
        <Cell><Data ss:Type="String">Review Content</Data></Cell>
        <Cell><Data ss:Type="String">Owner Reply</Data></Cell>
      </Row>
      ${rowsXml}
    </Table>
  </Worksheet>
</Workbook>`;

  triggerDownload(xmlContent, outName, "application/vnd.ms-excel;charset=utf-8;");
}

/**
 * Export reviews to structured JSON
 * @param {Array<Object>} reviews
 * @param {string} [filename]
 */
export function exportReviewsToJSON(reviews = [], filename = "") {
  if (!Array.isArray(reviews) || reviews.length === 0) return;

  const dateTag = new Date().toISOString().split("T")[0];
  const outName = filename || `aameena-reviews-${dateTag}.json`;

  const payload = {
    enterprise: BUSINESS_NAME,
    exportedAt: new Date().toISOString(),
    totalExported: reviews.length,
    reviews,
  };

  const jsonContent = JSON.stringify(payload, null, 2);
  triggerDownload(jsonContent, outName, "application/json");
}

/**
 * Print reviews in clean, paginated printable report layout
 * @param {Array<Object>} reviews
 */
export function printReviewsCatalog(reviews = []) {
  if (typeof window === "undefined" || !Array.isArray(reviews) || reviews.length === 0) return;

  const printWindow = window.open("", "_blank", "width=850,height=900");
  if (!printWindow) return;

  const reviewsHtml = reviews
    .map(
      (r, i) => `
    <div class="review-item">
      <div class="review-header">
        <span class="customer-name">${i + 1}. ${r.author?.name || r.reviewerName || "Customer"}</span>
        <span class="stars">${"★".repeat(r.rating || 5)}${"☆".repeat(5 - (r.rating || 5))}</span>
      </div>
      <div class="review-meta">
        ${r.city || "Solapur"} • ${r.furniturePurchased || "Hardwood Item"} • ${r.woodType || "Sagwan Teak"} • ${new Date(r.createdAt || r.date || Date.now()).toLocaleDateString("en-IN")}
      </div>
      <div class="review-text">${r.text || r.reviewText || ""}</div>
      ${
        r.ownerReply
          ? `<div class="owner-reply"><strong>Owner Reply:</strong> ${r.ownerReply}</div>`
          : ""
      }
    </div>
  `
    )
    .join("");

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${BUSINESS_NAME} — Verified Reviews Catalog</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 32px; color: #1c1917; }
          .header { border-bottom: 2px solid #d97706; padding-bottom: 12px; margin-bottom: 24px; }
          .title { font-size: 22px; font-weight: bold; color: #78350f; }
          .subtitle { font-size: 13px; color: #78716c; margin-top: 4px; }
          .review-item { border-bottom: 1px solid #e7e5e4; padding: 14px 0; page-break-inside: avoid; }
          .review-header { display: flex; justify-content: space-between; align-items: center; }
          .customer-name { font-weight: bold; font-size: 15px; }
          .stars { color: #f59e0b; font-size: 16px; letter-spacing: 2px; }
          .review-meta { font-size: 12px; color: #78716c; margin: 4px 0 8px 0; }
          .review-text { font-size: 13px; line-height: 1.5; color: #292524; }
          .owner-reply { margin-top: 8px; font-size: 12px; padding: 8px 12px; background: #fafaf9; border-left: 3px solid #d97706; color: #44403c; border-radius: 4px; }
          @media print {
            body { padding: 0; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">${BUSINESS_NAME} — Verified Reviews Catalog</div>
          <div class="subtitle">Export of ${reviews.length} customer testimonials • Generated on ${new Date().toLocaleString("en-IN")}</div>
        </div>
        ${reviewsHtml}
        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

export default {
  exportReviewsToCSV,
  exportReviewsToExcel,
  exportReviewsToJSON,
  printReviewsCatalog,
};
