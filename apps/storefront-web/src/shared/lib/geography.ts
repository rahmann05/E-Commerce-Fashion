const getApiBaseUrl = () => {
  return process.env.NEXT_PUBLIC_COMMERCE_API_URL?.replace('/api/commerce', '') || "http://localhost:3001";
};
const BASE_URL = `${getApiBaseUrl()}/api/geography`;

export async function fetchProvinces() {
  const res = await fetch(`${BASE_URL}/provinces.json`);
  return res.json();
}

export async function fetchRegencies(provinceId: string) {
  const res = await fetch(`${BASE_URL}/regencies/${provinceId}.json`);
  return res.json();
}

export async function fetchDistricts(regencyId: string) {
  const res = await fetch(`${BASE_URL}/districts/${regencyId}.json`);
  return res.json();
}

export async function fetchVillages(districtId: string) {
  const res = await fetch(`${BASE_URL}/villages/${districtId}.json`);
  return res.json();
}
