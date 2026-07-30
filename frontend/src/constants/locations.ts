export interface DistrictConfig {
  id: string;
  name: string;
  label: string;
}

export const KERALA_DISTRICTS: readonly DistrictConfig[] = [
  { id: "Alappuzha", name: "Alappuzha", label: "Alappuzha" },
  { id: "Ernakulam", name: "Ernakulam", label: "Ernakulam (Kochi)" },
  { id: "Idukki", name: "Idukki", label: "Idukki" },
  { id: "Kannur", name: "Kannur", label: "Kannur" },
  { id: "Kasaragod", name: "Kasaragod", label: "Kasaragod" },
  { id: "Kollam", name: "Kollam", label: "Kollam" },
  { id: "Kottayam", name: "Kottayam", label: "Kottayam" },
  { id: "Kozhikode", name: "Kozhikode", label: "Kozhikode (Calicut)" },
  { id: "Malappuram", name: "Malappuram", label: "Malappuram" },
  { id: "Palakkad", name: "Palakkad", label: "Palakkad" },
  { id: "Pathanamthitta", name: "Pathanamthitta", label: "Pathanamthitta" },
  { id: "Thiruvananthapuram", name: "Thiruvananthapuram", label: "Thiruvananthapuram (Trivandrum)" },
  { id: "Thrissur", name: "Thrissur", label: "Thrissur" },
  { id: "Wayanad", name: "Wayanad", label: "Wayanad" }
] as const;

export const LOCATION_PRESETS = [
  ...KERALA_DISTRICTS.map(d => d.label),
  "Online"
] as const;

export function getDistrictDbValue(locationLabel: string): string {
  if (!locationLabel) return "";
  const matched = KERALA_DISTRICTS.find(
    d => d.label.toLowerCase() === locationLabel.toLowerCase() || 
         d.name.toLowerCase() === locationLabel.toLowerCase()
  );
  return matched ? matched.name : locationLabel;
}

export function getDistrictLabel(dbValue: string): string {
  if (!dbValue) return "";
  const matched = KERALA_DISTRICTS.find(
    d => d.name.toLowerCase() === dbValue.toLowerCase()
  );
  return matched ? matched.label : dbValue;
}
