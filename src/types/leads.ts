
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

export interface Lead {
  id: string;
  name: string;
  propertyAddress: string;
  urgency: Urgency;
  nextAction: ActionType;
  assignee: string;
  closeDate: string;
  status: Status;
  notes?: string;
  email?: string;
  phone?: string;
  createdAt: string;
}
