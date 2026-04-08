export interface CouncilMaster {
  councilId: string;
  councilName: string;
  countryId: string;
  stateId: string;
  city: string;
  emailId: string;
  phoneno: string;
  website: string;
  address: string;
  address2: string;
  zipCode: string;
  shortCode: string;
}

export interface CouncilSavePayload {
  councilId: string;
  councilName: string;
  countryId: string;
  stateId: string;
  city: string;
  emailId: string;
  phoneno: string;
  website: string;
  address: string;
  address2: string;
  zipCode: string;
  shortCode: string;
  createdOn: string;
  updatedOn: string;
}
