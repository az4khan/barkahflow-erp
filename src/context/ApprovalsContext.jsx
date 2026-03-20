import { createContext, useContext, useState } from "react";

// ── Seed approval rules ────────────────────────────────────────────────────────
const SEED_PR_RULES = [
  {
    id: "APR-001", name: "Small PR", type: "PR", status: "Active",
    conditions: { amountMin: 0, amountMax: 50000, priority: "Any" },
    levels: [
      { level: 1, positionId: "POS-004", positionTitle: "Head of Procurement", approvalType: "Any One", timeoutDays: 2, timeoutAction: "Escalate" },
    ],
  },
  {
    id: "APR-002", name: "Medium PR", type: "PR", status: "Active",
    conditions: { amountMin: 50001, amountMax: 500000, priority: "Any" },
    levels: [
      { level: 1, positionId: "POS-004", positionTitle: "Head of Procurement", approvalType: "Any One", timeoutDays: 2, timeoutAction: "Escalate" },
      { level: 2, positionId: "POS-005", positionTitle: "Purchase Manager",    approvalType: "Any One", timeoutDays: 3, timeoutAction: "Escalate" },
    ],
  },
  {
    id: "APR-003", name: "Large PR", type: "PR", status: "Active",
    conditions: { amountMin: 500001, amountMax: 99999999, priority: "Any" },
    levels: [
      { level: 1, positionId: "POS-004", positionTitle: "Head of Procurement", approvalType: "Any One", timeoutDays: 1, timeoutAction: "Escalate" },
      { level: 2, positionId: "POS-005", positionTitle: "Purchase Manager",    approvalType: "Any One", timeoutDays: 2, timeoutAction: "Escalate" },
      { level: 3, positionId: "POS-002", positionTitle: "CFO",                 approvalType: "Any One", timeoutDays: 3, timeoutAction: "Auto Approve" },
    ],
  },
  {
    id: "APR-004", name: "High Priority PR", type: "PR", status: "Active",
    conditions: { amountMin: 0, amountMax: 99999999, priority: "High" },
    levels: [
      { level: 1, positionId: "POS-005", positionTitle: "Purchase Manager", approvalType: "Any One", timeoutDays: 1, timeoutAction: "Escalate" },
      { level: 2, positionId: "POS-002", positionTitle: "CFO",              approvalType: "Any One", timeoutDays: 1, timeoutAction: "Auto Approve" },
    ],
  },
];

const SEED_PO_RULES = [
  {
    id: "APO-001", name: "Standard PO", type: "PO", status: "Active",
    conditions: { amountMin: 0, amountMax: 1000000, priority: "Any" },
    levels: [
      { level: 1, positionId: "POS-005", positionTitle: "Purchase Manager", approvalType: "Any One", timeoutDays: 2, timeoutAction: "Escalate" },
    ],
  },
  {
    id: "APO-002", name: "High Value PO", type: "PO", status: "Active",
    conditions: { amountMin: 1000001, amountMax: 99999999, priority: "Any" },
    levels: [
      { level: 1, positionId: "POS-005", positionTitle: "Purchase Manager", approvalType: "Any One", timeoutDays: 2, timeoutAction: "Escalate" },
      { level: 2, positionId: "POS-002", positionTitle: "CFO",              approvalType: "Any One", timeoutDays: 3, timeoutAction: "Escalate" },
      { level: 3, positionId: "POS-001", positionTitle: "CEO",              approvalType: "Any One", timeoutDays: 5, timeoutAction: "Auto Approve" },
    ],
  },
];

// ── Seed inbox items (pending approvals) ────────────────────────────────────
const SEED_INBOX = [
  {
    id: "INB-001", type: "PR", refId: "PR-001", title: "LPG Cylinders 45kg — 500 Units",
    submittedBy: "Hassan Raza", submittedByEmail: "hassan@barkahflow.com",
    submittedAt: "2026-03-11 09:15", amount: 4250000, dept: "Procurement",
    priority: "High", currentLevel: 1, totalLevels: 2,
    ruleId: "APR-002", ruleName: "Medium PR",
    assignedTo: ["USR-001"], // admin is approver
    status: "Pending", notes: "Urgent requirement for upcoming season",
  },
  {
    id: "INB-002", type: "PR", refId: "PR-004", title: "LPG Cylinders 11.8kg — 200 Units",
    submittedBy: "Hassan Raza", submittedByEmail: "hassan@barkahflow.com",
    submittedAt: "2026-03-11 09:45", amount: 640000, dept: "Procurement",
    priority: "High", currentLevel: 1, totalLevels: 2,
    ruleId: "APR-002", ruleName: "Medium PR",
    assignedTo: ["USR-001"],
    status: "Pending", notes: "",
  },
  {
    id: "INB-003", type: "PO", refId: "PO-005", title: "Shell Gas — LPG Cylinders 5kg x 3000",
    submittedBy: "Hassan Raza", submittedByEmail: "hassan@barkahflow.com",
    submittedAt: "2026-03-10 16:30", amount: 5400000, dept: "Procurement",
    priority: "Normal", currentLevel: 1, totalLevels: 1,
    ruleId: "APO-001", ruleName: "Standard PO",
    assignedTo: ["USR-001"],
    status: "Pending", notes: "Approved supplier, standard terms",
  },
];

// ── Context ────────────────────────────────────────────────────────────────────
const ApprovalsContext = createContext(null);

export function ApprovalsProvider({ children }) {
  const [prRules, setPrRules]   = useState(SEED_PR_RULES);
  const [poRules, setPoRules]   = useState(SEED_PO_RULES);
  const [inbox,   setInbox]     = useState(SEED_INBOX);
  const [emailLog, setEmailLog] = useState([]);

  // Match a PR/PO to a rule
  const matchRule = (type, amount, priority) => {
    const rules = type === "PR" ? prRules : poRules;
    // Priority rules first
    const priorityRule = rules.find(r =>
      r.status === "Active" &&
      r.conditions.priority === priority &&
      amount >= r.conditions.amountMin &&
      amount <= r.conditions.amountMax
    );
    if (priorityRule) return priorityRule;
    return rules.find(r =>
      r.status === "Active" &&
      r.conditions.priority === "Any" &&
      amount >= r.conditions.amountMin &&
      amount <= r.conditions.amountMax
    ) || null;
  };

  // Submit a new item for approval — creates inbox entry + simulates email
  const submitForApproval = (type, refId, title, amount, dept, priority, submittedBy, submittedByEmail, notes = "") => {
    const rule = matchRule(type, amount, priority);
    const id   = `INB-${String(inbox.length + 1).padStart(3, "0")}`;
    const item = {
      id, type, refId, title, submittedBy, submittedByEmail,
      submittedAt: new Date().toLocaleString(),
      amount, dept, priority, notes,
      currentLevel: 1,
      totalLevels: rule ? rule.levels.length : 1,
      ruleId: rule?.id || null,
      ruleName: rule?.name || "Manual",
      assignedTo: ["USR-001"], // default to admin; real system resolves by position
      status: "Pending",
    };
    setInbox(i => [...i, item]);
    // Simulate email notification
    simulateEmail(item);
    return item;
  };

  const simulateEmail = (item) => {
    const entry = {
      id: Date.now(),
      to: "admin@barkahflow.com",
      subject: `[BarkahFlow] Approval Required: ${item.type} ${item.refId}`,
      body: `${item.title} — Amount: PKR ${item.amount.toLocaleString()} — Priority: ${item.priority}`,
      sentAt: new Date().toLocaleString(),
      inboxId: item.id,
    };
    setEmailLog(l => [...l, entry]);
  };

  // Approve an inbox item
  const approveItem = (id, approverId, remark) => {
    setInbox(items => items.map(item => {
      if (item.id !== id) return item;
      const nextLevel = item.currentLevel + 1;
      if (nextLevel > item.totalLevels) {
        // Final approval
        simulateEmail({ ...item, title: `APPROVED: ${item.title}`, submittedByEmail: item.submittedByEmail });
        return { ...item, status: "Approved", approvedBy: approverId, approvedAt: new Date().toLocaleString(), remark };
      }
      // Move to next level
      return { ...item, currentLevel: nextLevel, remark };
    }));
  };

  // Reject an inbox item
  const rejectItem = (id, approverId, remark) => {
    setInbox(items => items.map(item =>
      item.id === id
        ? { ...item, status: "Rejected", rejectedBy: approverId, rejectedAt: new Date().toLocaleString(), remark }
        : item
    ));
  };

  // Forward an inbox item
  const forwardItem = (id, toUserId, remark) => {
    setInbox(items => items.map(item =>
      item.id === id
        ? { ...item, assignedTo: [toUserId], forwardedAt: new Date().toLocaleString(), remark }
        : item
    ));
  };

  const pendingCount = inbox.filter(i => i.status === "Pending").length;

  return (
    <ApprovalsContext.Provider value={{
      prRules, setPrRules,
      poRules, setPoRules,
      inbox, setInbox,
      emailLog,
      matchRule,
      submitForApproval,
      approveItem,
      rejectItem,
      forwardItem,
      pendingCount,
    }}>
      {children}
    </ApprovalsContext.Provider>
  );
}

export const useApprovals = () => useContext(ApprovalsContext);
