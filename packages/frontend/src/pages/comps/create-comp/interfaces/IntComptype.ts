export interface Account {
  created: moment.Moment;
  id: string;
  name: string;
}

export interface ConfirmationModalContentProps {
  close: () => void;
  refetch2:()=>void;
  companyListing:(event:any)=>void;
}
