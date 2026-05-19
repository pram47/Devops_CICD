export type SignUpFormState = {
  email: string;
  password: string;
  acceptedTerms: boolean;
};

export type SignUpFormErrors = {
  email?: string;
  password?: string;
  acceptedTerms?: string;
};

export type CompanyFormState = {
  companyNameTh: string;
  companyNameEn: string;
  website: string;
  phone: string;
  category: string;
  addressLine: string;
  addressNo: string;
  moo: string;
  soi: string;
  street: string;
  province: string;
  district: string;
  subDistrict: string;
  postalCode: string;
};

export type VerifyFormState = {
  verificationFile: File | null;
};

export type SignInFormState = {
  email: string;
  password: string;
};

export type FormStep = "account" | "signin" | "company" | "verify";

export type SearchSelectProps = {
  id: string;
  value: string;
  placeholder: string;
  options: string[];
  disabled?: boolean;
  onValueChange: (value: string) => void;
};
