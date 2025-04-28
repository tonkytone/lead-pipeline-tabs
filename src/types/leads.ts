
export type Urgency = "hot" | "warm" | "cold";

export type Status =
  | "New"
  | "Qualifying"
  | "Engaged"
  | "Presented"
  | "Signed"
  | "Won"
  | "To Nurture"
  | "Lost";

export type ActionType =
  | "Book appraisal"
  | "Prepare listing kit"
  | "Send listing kit"
  | "Hold appraisal meeting"
  | "Enter new management details"
  | "Create management agreement"
  | "Send agreement for signing"
  | "Request Signature"
  | "Confirm signing"
  | "Upload signed agreement"
  | "Verify property ownership and investor IDs"
  | "Finalise opportunity";

export type ReferrerSource =
  | "Website"
  | "Referral"
  | "Walk-in"
  | "Cold Call"
  | "Social Media"
  | "Marketing Campaign"
  | "Online Listing"
  | "Other";

export interface PropertyAddress {
  id: string;
  address: string;
}

export interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  read: boolean;
}

export interface Lead {
  id: string;
  name: string;
  propertyAddresses: PropertyAddress[];
  urgency: Urgency;
  nextAction: ActionType;
  assignee: string;
  closeDate: string;
  status: Status;
  notes?: string;
  email?: string;
  phone?: string;
  createdAt: string;
  referrerSource?: ReferrerSource;
  messages: Message[];
  projectId?: string;
}
