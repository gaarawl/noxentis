import { getDataSource } from "@/lib/services/live-data";

export async function getCompanyProfile() {
  const data = await getDataSource();
  return data.company;
}
