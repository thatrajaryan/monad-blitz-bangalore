import { Address } from "viem";

export enum Frequency {
  NONE = 0,
  DAILY = 1,
  WEEKLY = 2,
  MONTHLY = 3,
  YEARLY = 4,
}

/* ===========================
   CREATE ROOT POLICY
   =========================== */

export interface CreateRootPolicyRequest {
  name: string;
  allocation: string;
}

/* ===========================
   CREATE POLICY
   =========================== */

export interface CreatePolicyRequest {
  parentId: number;

  name: string;

  allocation: string;

  strict: boolean;

  frequency: Frequency;

  frequencyLimit: string;

  recipients: Address[];
}

/* ===========================
   ADD RECIPIENT
   =========================== */

export interface AddRecipientRequest {
  policyId: number;

  recipient: Address;
}

/* ===========================
   REMOVE RECIPIENT
   =========================== */

export interface RemoveRecipientRequest {
  policyId: number;

  recipient: Address;
}

/* ===========================
   EXECUTE SPEND
   =========================== */

export interface ExecuteSpendRequest {
  policyId: number;

  recipient: Address;

  amount: string;
}

/* ===========================
   UPDATE ALLOCATION
   =========================== */

export interface SetAllocationRequest {
  policyId: number;

  allocation: string;
}

/* ===========================
   UPDATE AGENT
   =========================== */

export interface SetAgentRequest {
  agent: Address;
}

/* ===========================
   POLICY TREE
   =========================== */

export interface PolicyNode {
  name: string;

  strict: boolean;

  allocation: string;

  frequency: Frequency;

  frequencyLimit: string;

  recipients: Address[];

  children: PolicyNode[];
}

/* ===========================
   ROOT TREE CREATION
   =========================== */

export interface PolicyTreeRequest {
  root: {
    name: string;
    allocation: string;
  };

  children: PolicyNode[];
}

/* ===========================
   CONTRACT RESPONSE TYPES
   =========================== */

export interface PolicyUsage {
  totalDisbursed: bigint;
  periodDisbursed: bigint;
  lastResetTimestamp: bigint;
}

export interface Policy {
  name: string;

  strict: boolean;

  allocation: bigint;

  parentId: bigint;

  children: bigint[];

  frequency: Frequency;

  frequencyLimit: bigint;
}