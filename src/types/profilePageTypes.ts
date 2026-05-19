export type OpenJobCardProps = {
  jobId: string;
  title: string;
  location: string;
  dateRange: string;
  applied: string;
  prefill?: Record<string, unknown>;
};

export type AddressFormValue = {
  addressLine: string;
  no: string;
  moo: string;
  soi: string;
  street: string;
  province: string;
  district: string;
  subDistrict: string;
  postalCode: string;
};
