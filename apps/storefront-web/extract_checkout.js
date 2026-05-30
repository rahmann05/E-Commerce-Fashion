const fs = require('fs');

// 1. Process CheckoutClient.tsx
let clientPath = 'src/features/checkout/components/CheckoutClient.tsx';
let content = fs.readFileSync(clientPath, 'utf8');

content = content.replace('export default function CheckoutPage()', 'export function CheckoutClient()');

// Inject the util import
const utilImport = 'import { STANDARD_PAYMENTS, normalizePrice, formatPrice, mapPaymentMethodToMidtransKey } from "../utils";\n';
content = content.replace('import { MapPin, CreditCard, Truck } from "lucide-react";', utilImport + 'import { MapPin, CreditCard, Truck } from "lucide-react";');

// Remove STANDARD_PAYMENTS and functions
const regexToRemove = /const STANDARD_PAYMENTS = \[[\s\S]*?\];\s*function normalizePrice[\s\S]*?\}\s*function formatPrice[\s\S]*?\}\s*function mapPaymentMethodToMidtransKey[\s\S]*?\}/g;
content = content.replace(regexToRemove, '');

// Also fix the LocationMap import since it moved
content = content.replace('@/features/checkout/LocationMap', '@/features/checkout/components/LocationMap');

fs.writeFileSync(clientPath, content, 'utf8');

// 2. Process page.tsx
const pageContent = `import { CheckoutClient } from "@/features/checkout/components/CheckoutClient";

export default function CheckoutPage() {
  return <CheckoutClient />;
}
`;
fs.writeFileSync('src/app/(main)/catalogue/cart/pembayaran/page.tsx', pageContent, 'utf8');
