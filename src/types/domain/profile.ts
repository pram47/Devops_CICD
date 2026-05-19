export type ProfileAboutPopupProps = {
  open: boolean;
  value: string;
  onOpenChange: (open: boolean) => void;
  onSave: (value: string) => void;
};

export type ProfileCompanyInformationPopupProps = {
  open: boolean;
  value: string;
  onOpenChange: (open: boolean) => void;
  onSave: (value: string) => void;
};

export type CompanyMediaLink = {
  label: string;
  url: string;
};

export type CompanyProfileDetails = {
  companyName: string;
  place: string;
  region: string;
  phone: string;
  email: string;
  address: string;
  addressNo: string;
  addressMoo: string;
  addressSoi: string;
  addressStreet: string;
  addressProvince: string;
  addressDistrict: string;
  addressSubDistrict: string;
  addressPostalCode: string;
  mediaLinks: CompanyMediaLink[];
};

export type ProfileCompanyNamePopupProps = {
  open: boolean;
  value: CompanyProfileDetails;
  onOpenChange: (open: boolean) => void;
  onSave: (value: CompanyProfileDetails) => void;
};

export type ProfileCompanyProfilePicturePopupProps = {
  open: boolean;
  value: string;
  companyName: string;
  onOpenChange: (open: boolean) => void;
  onSave: (imageUrl: string, file?: File) => void;
};
