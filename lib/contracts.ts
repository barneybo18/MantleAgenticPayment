import { Address } from 'viem';

// Deployed on Mantle Sepolia testnet
export const AGENT_PAY_ADDRESS = "0x5dB9f58162feE7d957DF9E2f9112b4BF5D2a20d3" as const;

export const AGENT_PAY_ABI = [
    { inputs: [], stateMutability: "nonpayable", type: "constructor" },
    { inputs: [{ internalType: "address", name: "owner", type: "address" }], name: "OwnableInvalidOwner", type: "error" },
    { inputs: [{ internalType: "address", name: "account", type: "address" }], name: "OwnableUnauthorizedAccount", type: "error" },
    { inputs: [], name: "ReentrancyGuardReentrantCall", type: "error" },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: "address", name: "user", type: "address" },
            { indexed: false, internalType: "bool", name: "isActive", type: "bool" },
            { indexed: false, internalType: "uint256", name: "limitPerTx", type: "uint256" }
        ],
        name: "AgentConfigured",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: "uint256", name: "id", type: "uint256" },
            { indexed: true, internalType: "address", name: "creator", type: "address" },
            { indexed: true, internalType: "address", name: "recipient", type: "address" },
            { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
            { indexed: false, internalType: "uint256", name: "dueDate", type: "uint256" }
        ],
        name: "InvoiceCreated",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: "uint256", name: "id", type: "uint256" },
            { indexed: true, internalType: "address", name: "payer", type: "address" },
            { indexed: false, internalType: "uint256", name: "amount", type: "uint256" }
        ],
        name: "InvoicePaid",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: "address", name: "previousOwner", type: "address" },
            { indexed: true, internalType: "address", name: "newOwner", type: "address" }
        ],
        name: "OwnershipTransferred",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [{ indexed: true, internalType: "uint256", name: "id", type: "uint256" }],
        name: "ScheduledPaymentCancelled",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: "uint256", name: "id", type: "uint256" },
            { indexed: true, internalType: "address", name: "from", type: "address" },
            { indexed: true, internalType: "address", name: "to", type: "address" },
            { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
            { indexed: false, internalType: "uint256", name: "interval", type: "uint256" }
        ],
        name: "ScheduledPaymentCreated",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            { indexed: true, internalType: "uint256", name: "id", type: "uint256" },
            { indexed: true, internalType: "address", name: "from", type: "address" },
            { indexed: true, internalType: "address", name: "to", type: "address" },
            { indexed: false, internalType: "uint256", name: "amount", type: "uint256" }
        ],
        name: "ScheduledPaymentExecuted",
        type: "event"
    },
    {
        inputs: [{ internalType: "address", name: "", type: "address" }],
        name: "agentConfigs",
        outputs: [
            { internalType: "bool", name: "isActive", type: "bool" },
            { internalType: "uint256", name: "limitPerTx", type: "uint256" },
            { internalType: "address", name: "allowedRecipient", type: "address" },
            { internalType: "uint256", name: "interval", type: "uint256" },
            { internalType: "uint256", name: "lastExecuted", type: "uint256" }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [{ internalType: "uint256", name: "_id", type: "uint256" }],
        name: "cancelScheduledPayment",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            { internalType: "bool", name: "_isActive", type: "bool" },
            { internalType: "uint256", name: "_limitPerTx", type: "uint256" },
            { internalType: "address", name: "_allowedRecipient", type: "address" },
            { internalType: "uint256", name: "_interval", type: "uint256" }
        ],
        name: "configureAgent",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            { internalType: "address", name: "_recipient", type: "address" },
            { internalType: "uint256", name: "_amount", type: "uint256" },
            { internalType: "address", name: "_token", type: "address" },
            { internalType: "string", name: "_metadataHash", type: "string" },
            { internalType: "uint256", name: "_dueDate", type: "uint256" }
        ],
        name: "createInvoice",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            { internalType: "address", name: "_to", type: "address" },
            { internalType: "uint256", name: "_amount", type: "uint256" },
            { internalType: "address", name: "_token", type: "address" },
            { internalType: "uint256", name: "_interval", type: "uint256" },
            { internalType: "string", name: "_description", type: "string" }
        ],
        name: "createScheduledPayment",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "payable",
        type: "function"
    },
    {
        inputs: [{ internalType: "uint256", name: "_id", type: "uint256" }],
        name: "executeScheduledPayment",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [{ internalType: "address", name: "_user", type: "address" }],
        name: "getAgentConfig",
        outputs: [
            {
                components: [
                    { internalType: "bool", name: "isActive", type: "bool" },
                    { internalType: "uint256", name: "limitPerTx", type: "uint256" },
                    { internalType: "address", name: "allowedRecipient", type: "address" },
                    { internalType: "uint256", name: "interval", type: "uint256" },
                    { internalType: "uint256", name: "lastExecuted", type: "uint256" }
                ],
                internalType: "struct AgentPay.AgentConfig",
                name: "",
                type: "tuple"
            }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [{ internalType: "uint256", name: "_id", type: "uint256" }],
        name: "getInvoice",
        outputs: [
            {
                components: [
                    { internalType: "uint256", name: "id", type: "uint256" },
                    { internalType: "address", name: "creator", type: "address" },
                    { internalType: "address", name: "recipient", type: "address" },
                    { internalType: "uint256", name: "amount", type: "uint256" },
                    { internalType: "address", name: "token", type: "address" },
                    { internalType: "string", name: "metadataHash", type: "string" },
                    { internalType: "bool", name: "paid", type: "bool" },
                    { internalType: "uint256", name: "dueDate", type: "uint256" },
                    { internalType: "uint256", name: "createdAt", type: "uint256" }
                ],
                internalType: "struct AgentPay.Invoice",
                name: "",
                type: "tuple"
            }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "getInvoiceCount",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [{ internalType: "uint256", name: "_id", type: "uint256" }],
        name: "getScheduledPayment",
        outputs: [
            {
                components: [
                    { internalType: "uint256", name: "id", type: "uint256" },
                    { internalType: "address", name: "from", type: "address" },
                    { internalType: "address", name: "to", type: "address" },
                    { internalType: "uint256", name: "amount", type: "uint256" },
                    { internalType: "address", name: "token", type: "address" },
                    { internalType: "uint256", name: "nextExecution", type: "uint256" },
                    { internalType: "uint256", name: "interval", type: "uint256" },
                    { internalType: "bool", name: "isActive", type: "bool" },
                    { internalType: "string", name: "description", type: "string" }
                ],
                internalType: "struct AgentPay.ScheduledPayment",
                name: "",
                type: "tuple"
            }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [{ internalType: "address", name: "_user", type: "address" }],
        name: "getUserCreatedInvoices",
        outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [{ internalType: "address", name: "_user", type: "address" }],
        name: "getUserReceivedInvoices",
        outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [{ internalType: "address", name: "_user", type: "address" }],
        name: "getUserScheduledPayments",
        outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [{ internalType: "address", name: "_user", type: "address" }],
        name: "getUserStats",
        outputs: [
            { internalType: "uint256", name: "createdCount", type: "uint256" },
            { internalType: "uint256", name: "receivedCount", type: "uint256" },
            { internalType: "uint256", name: "totalPaid", type: "uint256" },
            { internalType: "uint256", name: "totalReceived", type: "uint256" },
            { internalType: "uint256", name: "scheduledCount", type: "uint256" }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "nextInvoiceId",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "nextScheduledPaymentId",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "owner",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [{ internalType: "uint256", name: "_id", type: "uint256" }],
        name: "payInvoice",
        outputs: [],
        stateMutability: "payable",
        type: "function"
    },
    {
        inputs: [],
        name: "renounceOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [{ internalType: "address", name: "", type: "address" }],
        name: "totalPaidByUser",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [{ internalType: "address", name: "", type: "address" }],
        name: "totalReceivedByUser",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
        name: "transferOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    { stateMutability: "payable", type: "receive" }
] as const;

// Type definitions for frontend use
export interface Invoice {
    id: bigint;
    creator: `0x${string}`;
    recipient: `0x${string}`;
    amount: bigint;
    token: `0x${string}`;
    metadataHash: string;
    paid: boolean;
    dueDate: bigint;
    createdAt: bigint;
}

export interface ScheduledPayment {
    id: bigint;
    from: `0x${string}`;
    to: `0x${string}`;
    amount: bigint;
    token: `0x${string}`;
    nextExecution: bigint;
    interval: bigint;
    isActive: boolean;
    description: string;
}

export interface UserStats {
    createdCount: bigint;
    receivedCount: bigint;
    totalPaid: bigint;
    totalReceived: bigint;
    scheduledCount: bigint;
}
