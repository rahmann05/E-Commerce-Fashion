import fetch from 'node-fetch';

const GATEWAY_URL = 'http://localhost:8000';

async function testGateway() {
  console.log("🧪 Starting Blackbox Testing...");

  // 1. Test Public Products API
  try {
    const res = await fetch(`${GATEWAY_URL}/api/storefront/products`);
    const result: any = await res.json();
    if (result.success && Array.isArray(result.data)) {
      console.log("✅ Storefront Products API: PASSED");
    } else {
      console.log("❌ Storefront Products API: FAILED", result);
    }
  } catch (e) {
    console.log("❌ Storefront Products API: UNREACHABLE (Is Gateway running?)");
  }

  // 2. Test Admin Storefront API (Transactional)
  try {
    const res = await fetch(`${GATEWAY_URL}/api/admin/storefront/categories`);
    const result: any = await res.json();
    if (result.success) {
      console.log("✅ Admin Storefront Categories API: PASSED");
    } else {
      console.log("❌ Admin Storefront Categories API: FAILED", result);
    }
  } catch (e) {
    console.log("❌ Admin Storefront Categories API: UNREACHABLE");
  }

  // 3. Test Health Check
  try {
    const res = await fetch(`${GATEWAY_URL}/health`);
    const result: any = await res.json();
    console.log(`✅ System Health: ${result.status}`, result.services);
  } catch (e) {
    console.log("❌ Health Check: UNREACHABLE");
  }
}

// Note: This script assumes the services are running. 
// Since I cannot run persistent servers here, I will rely on unit validation.
console.log("ℹ️ Blackbox script created. Run with 'tsx test-api.ts' when servers are up.");
