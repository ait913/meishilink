function escapeValue(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

function clean(value?: string | null): string | undefined {
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function buildVcard(card: {
  displayName?: string | null;
  lastName?: string | null;
  firstName?: string | null;
  lastNameKana?: string | null;
  firstNameKana?: string | null;
  company?: string | null;
  department?: string | null;
  jobTitle?: string | null;
  phone?: string | null;
  email?: string | null;
  postalCode?: string | null;
  address?: string | null;
  websiteUrl?: string | null;
  logoUrl?: string | null;
}): string {
  const lastName = clean(card.lastName) ?? "";
  const firstName = clean(card.firstName) ?? "";
  const display = clean(card.displayName) ?? [lastName, firstName].filter(Boolean).join(" ").trim();
  const fn = display || lastName || firstName || "";
  // N: は「姓;名;...」3.0 必須。displayName しかない場合は姓部分に置く (iOS / Android がフォールバックで認識)
  const nLast = lastName || display;
  const nFirst = firstName;

  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${escapeValue(nLast)};${escapeValue(nFirst)};;;`,
    `FN:${escapeValue(fn)}`,
  ];

  const lastNameKana = clean(card.lastNameKana);
  if (lastNameKana) {
    lines.push(`X-PHONETIC-LAST-NAME:${escapeValue(lastNameKana)}`);
  }

  const firstNameKana = clean(card.firstNameKana);
  if (firstNameKana) {
    lines.push(`X-PHONETIC-FIRST-NAME:${escapeValue(firstNameKana)}`);
  }

  const company = clean(card.company);
  const department = clean(card.department);
  if (company && department) {
    lines.push(`ORG:${escapeValue(company)};${escapeValue(department)}`);
  } else if (company) {
    lines.push(`ORG:${escapeValue(company)}`);
  }

  const title = clean(card.jobTitle);
  if (title) {
    lines.push(`TITLE:${escapeValue(title)}`);
  }

  const phone = clean(card.phone);
  if (phone) {
    lines.push(`TEL;TYPE=WORK,VOICE:${escapeValue(phone)}`);
  }

  const email = clean(card.email);
  if (email) {
    lines.push(`EMAIL;TYPE=INTERNET:${escapeValue(email)}`);
  }

  const address = clean(card.address);
  const postalCode = clean(card.postalCode);
  if (address || postalCode) {
    lines.push(`ADR;TYPE=WORK:;;${escapeValue(address ?? "")};;;${escapeValue(postalCode ?? "")};Japan`);
  }

  const websiteUrl = clean(card.websiteUrl);
  if (websiteUrl) {
    lines.push(`URL:${escapeValue(websiteUrl)}`);
  }

  const logoUrl = clean(card.logoUrl);
  if (logoUrl) {
    lines.push(`PHOTO;VALUE=URI:${escapeValue(logoUrl)}`);
  }

  lines.push("END:VCARD");
  return `${lines.join("\r\n")}\r\n`;
}

