export type PublicCardViewModel = {
  handle: string;
  lastName: string;
  firstName: string;
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
  logoPath?: string | null;
  poem?: string | null;
  profile?: string | null;
  snsLinks: Array<{ label: string; url: string }>;
  themeKey: string;
  fontKey: string;
  accentColor: string;
  isPublished: boolean;
};

