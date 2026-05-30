const fs = require('fs');

// 1. Refactor cart/page.tsx
let cartPage = fs.readFileSync('src/app/(main)/catalogue/cart/page.tsx', 'utf8');
fs.mkdirSync('src/features/cart/components', { recursive: true });
cartPage = cartPage.replace('export default function CartPage()', 'export function CartClient()');
fs.writeFileSync('src/features/cart/components/CartClient.tsx', cartPage, 'utf8');
const newCartPage = `import { CartClient } from "@/features/cart/components/CartClient";
export default function CartPage() {
  return <CartClient />;
}
`;
fs.writeFileSync('src/app/(main)/catalogue/cart/page.tsx', newCartPage, 'utf8');

// 2. Refactor payment status page
let statusPagePath = 'src/app/(main)/catalogue/cart/pembayaran/status/[orderId]/page.tsx';
let statusPage = fs.readFileSync(statusPagePath, 'utf8');
statusPage = statusPage.replace('export default function PaymentStatusPage', 'export function PaymentStatusClient');
fs.writeFileSync('src/features/checkout/components/PaymentStatusClient.tsx', statusPage, 'utf8');
const newStatusPage = `import { PaymentStatusClient } from "@/features/checkout/components/PaymentStatusClient";

export default async function PaymentStatusPage(props: { params: Promise<{ orderId: string }> }) {
  const params = await props.params;
  return <PaymentStatusClient params={params} />;
}
`;
fs.writeFileSync(statusPagePath, newStatusPage, 'utf8');
