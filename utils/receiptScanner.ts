import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ReceiptItem {
  description: string;
  amount: number;
}

export interface ReceiptScanResult {
  items: ReceiptItem[];
  total?: number;
  error?: string;
}

export async function scanReceipt(base64Image: string): Promise<ReceiptScanResult> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_api_key_here') {
    return {
      items: [],
      error: 'Please add your Gemini API key to the .env file',
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are a receipt scanner. Analyze this receipt image and extract ALL items with their prices.

Return ONLY a valid JSON object in this exact format (no markdown, no code blocks):
{
  "items": [
    {"description": "Item name", "amount": 12.50},
    {"description": "Another item", "amount": 5.99}
  ],
  "total": 18.49
}

Rules:
- Extract EVERY item and its price
- Use the exact item names from the receipt
- amounts must be numbers (not strings)
- If you can't read the receipt clearly, return: {"items": [], "error": "Could not read receipt clearly"}`;

    const imagePart = {
      inlineData: {
        data: base64Image.split(',')[1] || base64Image,
        mimeType: 'image/jpeg',
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    // Parse the JSON response
    const parsed = JSON.parse(text.trim());

    if (parsed.error) {
      return {
        items: [],
        error: parsed.error,
      };
    }

    return {
      items: parsed.items || [],
      total: parsed.total,
    };
  } catch (error) {
    console.error('Receipt scanning error:', error);
    return {
      items: [],
      error: error instanceof Error ? error.message : 'Failed to scan receipt',
    };
  }
}
