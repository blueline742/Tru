import { Job } from '../types';
import { generateJobSummary } from './share';

export const downloadJobPDF = (job: Job): void => {
  const summary = generateJobSummary(job);
  const totalExpenses = job.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const remaining = job.estimatedPrice - totalExpenses;

  // Create HTML content for PDF
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${job.title} - Job Summary</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      color: #1a1a1a;
      line-height: 1.6;
    }
    .header {
      border-bottom: 3px solid #3B82F6;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    h1 {
      color: #3B82F6;
      margin: 0 0 10px 0;
      font-size: 32px;
    }
    .meta {
      color: #666;
      font-size: 14px;
    }
    .section {
      margin: 30px 0;
    }
    .section-title {
      color: #3B82F6;
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 15px;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 8px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 20px;
    }
    .info-item {
      padding: 12px;
      background: #f9fafb;
      border-radius: 8px;
    }
    .info-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      font-weight: bold;
      margin-bottom: 4px;
    }
    .info-value {
      font-size: 18px;
      font-weight: bold;
      color: #1a1a1a;
    }
    .budget-status {
      font-size: 14px;
      padding: 8px 12px;
      border-radius: 6px;
      display: inline-block;
      font-weight: bold;
    }
    .budget-status.over {
      background: #fee;
      color: #dc2626;
    }
    .budget-status.under {
      background: #efe;
      color: #16a34a;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
    }
    th {
      background: #f3f4f6;
      padding: 12px;
      text-align: left;
      font-size: 12px;
      text-transform: uppercase;
      color: #666;
      border-bottom: 2px solid #e5e7eb;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
    }
    .expense-desc {
      font-weight: 600;
      color: #1a1a1a;
    }
    .expense-type {
      font-size: 11px;
      color: #666;
      text-transform: uppercase;
    }
    .expense-amount {
      font-weight: bold;
      color: #1a1a1a;
      text-align: right;
    }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
    .no-expenses {
      text-align: center;
      padding: 30px;
      color: #999;
      font-style: italic;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📋 ${job.title}</h1>
    <div class="meta">
      <strong>Client:</strong> ${job.customerName}<br>
      <strong>Due Date:</strong> ${new Date(job.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}<br>
      <strong>Status:</strong> ${job.status === 'COMPLETED' ? 'Completed ✓' : 'Active'}
    </div>
  </div>

  <div class="section">
    <div class="section-title">💰 Budget Summary</div>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Total Budget</div>
        <div class="info-value">£${job.estimatedPrice.toLocaleString()}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Total Spent</div>
        <div class="info-value">£${totalExpenses.toLocaleString()}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Remaining</div>
        <div class="info-value">£${remaining.toLocaleString()}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Budget Usage</div>
        <div class="info-value">${Math.min(((totalExpenses / job.estimatedPrice) * 100), 100).toFixed(1)}%</div>
      </div>
    </div>
    ${remaining < 0 ?
      `<div class="budget-status over">⚠️ Over Budget by £${Math.abs(remaining).toLocaleString()}</div>` :
      `<div class="budget-status under">✓ Under Budget by £${remaining.toLocaleString()}</div>`
    }
  </div>

  <div class="section">
    <div class="section-title">📊 Expenses (${job.expenses.length} items)</div>
    ${job.expenses.length > 0 ? `
      <table>
        <thead>
          <tr>
            <th style="width: 50%;">Description</th>
            <th style="width: 25%;">Category</th>
            <th style="width: 25%;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${job.expenses.map(exp => `
            <tr>
              <td>
                <div class="expense-desc">${exp.description}</div>
                <div class="expense-type">${new Date(exp.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
              </td>
              <td class="expense-type">${exp.type}</td>
              <td class="expense-amount">£${exp.amount.toLocaleString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    ` : '<div class="no-expenses">No expenses recorded yet</div>'}
  </div>

  <div class="footer">
    Generated by <strong>Tru Job Tracker</strong> on ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
  </div>
</body>
</html>
  `;

  // Create a blob and trigger download
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${job.title.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  // Show user message
  alert('Job summary downloaded! Open the file and use your browser\'s "Print to PDF" to save as PDF.');
};
