// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract AgentPay is Ownable, ReentrancyGuard {
    struct Invoice {
        uint256 id;
        address creator;
        address recipient;
        uint256 amount;
        address token; // address(0) for native MNT
        string metadataHash; // IPFS hash or description
        bool paid;
        uint256 dueDate;
        uint256 createdAt;
    }

    struct AgentConfig {
        bool isActive;
        uint256 limitPerTx;
        address allowedRecipient;
        uint256 interval; // seconds between payments (0 = one-time)
        uint256 lastExecuted;
    }

    struct ScheduledPayment {
        uint256 id;
        address from;
        address to;
        uint256 amount;
        address token;
        uint256 nextExecution;
        uint256 interval;
        bool isActive;
        string description;
    }

    uint256 public nextInvoiceId;
    uint256 public nextScheduledPaymentId;
    
    mapping(uint256 => Invoice) public invoices;
    mapping(address => AgentConfig) public agentConfigs;
    mapping(uint256 => ScheduledPayment) public scheduledPayments;
    
    // Track user invoices for easy retrieval
    mapping(address => uint256[]) private userCreatedInvoices;
    mapping(address => uint256[]) private userReceivedInvoices;
    mapping(address => uint256[]) private userScheduledPayments;
    
    // Stats tracking
    mapping(address => uint256) public totalPaidByUser;
    mapping(address => uint256) public totalReceivedByUser;

    event InvoiceCreated(uint256 indexed id, address indexed creator, address indexed recipient, uint256 amount, uint256 dueDate);
    event InvoicePaid(uint256 indexed id, address indexed payer, uint256 amount);
    event AgentConfigured(address indexed user, bool isActive, uint256 limitPerTx);
    event ScheduledPaymentCreated(uint256 indexed id, address indexed from, address indexed to, uint256 amount, uint256 interval);
    event ScheduledPaymentExecuted(uint256 indexed id, address indexed from, address indexed to, uint256 amount);
    event ScheduledPaymentCancelled(uint256 indexed id);

    constructor() Ownable(msg.sender) {}

    // ============ Invoice Functions ============

    function createInvoice(
        address _recipient,
        uint256 _amount,
        address _token,
        string memory _metadataHash,
        uint256 _dueDate
    ) external returns (uint256) {
        require(_recipient != address(0), "Invalid recipient");
        require(_amount > 0, "Amount must be greater than 0");
        
        uint256 id = nextInvoiceId++;
        invoices[id] = Invoice({
            id: id,
            creator: msg.sender,
            recipient: _recipient,
            amount: _amount,
            token: _token,
            metadataHash: _metadataHash,
            paid: false,
            dueDate: _dueDate,
            createdAt: block.timestamp
        });
        
        userCreatedInvoices[msg.sender].push(id);
        userReceivedInvoices[_recipient].push(id);

        emit InvoiceCreated(id, msg.sender, _recipient, _amount, _dueDate);
        return id;
    }

    function payInvoice(uint256 _id) external payable nonReentrant {
        Invoice storage invoice = invoices[_id];
        require(!invoice.paid, "Already paid");
        require(invoice.amount > 0, "Invoice does not exist");

        if (invoice.token == address(0)) {
            require(msg.value == invoice.amount, "Incorrect amount");
            (bool sent, ) = invoice.creator.call{value: msg.value}("");
            require(sent, "Failed to send MNT");
        } else {
            IERC20(invoice.token).transferFrom(msg.sender, invoice.creator, invoice.amount);
        }

        invoice.paid = true;
        totalPaidByUser[msg.sender] += invoice.amount;
        totalReceivedByUser[invoice.creator] += invoice.amount;
        
        emit InvoicePaid(_id, msg.sender, invoice.amount);
    }

    function getInvoice(uint256 _id) external view returns (Invoice memory) {
        return invoices[_id];
    }

    function getUserCreatedInvoices(address _user) external view returns (uint256[] memory) {
        return userCreatedInvoices[_user];
    }

    function getUserReceivedInvoices(address _user) external view returns (uint256[] memory) {
        return userReceivedInvoices[_user];
    }

    function getInvoiceCount() external view returns (uint256) {
        return nextInvoiceId;
    }

    // ============ Scheduled Payment Functions ============

    function createScheduledPayment(
        address _to,
        uint256 _amount,
        address _token,
        uint256 _interval,
        string memory _description
    ) external payable returns (uint256) {
        require(_to != address(0), "Invalid recipient");
        require(_amount > 0, "Amount must be greater than 0");
        
        // For native token, require initial deposit
        if (_token == address(0)) {
            require(msg.value >= _amount, "Insufficient initial deposit");
        }

        uint256 id = nextScheduledPaymentId++;
        scheduledPayments[id] = ScheduledPayment({
            id: id,
            from: msg.sender,
            to: _to,
            amount: _amount,
            token: _token,
            nextExecution: block.timestamp + _interval,
            interval: _interval,
            isActive: true,
            description: _description
        });

        userScheduledPayments[msg.sender].push(id);
        
        emit ScheduledPaymentCreated(id, msg.sender, _to, _amount, _interval);
        return id;
    }

    function executeScheduledPayment(uint256 _id) external nonReentrant {
        ScheduledPayment storage payment = scheduledPayments[_id];
        require(payment.isActive, "Payment not active");
        require(block.timestamp >= payment.nextExecution, "Not yet due");
        
        if (payment.token == address(0)) {
            require(address(this).balance >= payment.amount, "Insufficient contract balance");
            (bool sent, ) = payment.to.call{value: payment.amount}("");
            require(sent, "Failed to send");
        } else {
            IERC20(payment.token).transferFrom(payment.from, payment.to, payment.amount);
        }

        payment.nextExecution = block.timestamp + payment.interval;
        
        emit ScheduledPaymentExecuted(_id, payment.from, payment.to, payment.amount);
    }

    function cancelScheduledPayment(uint256 _id) external {
        ScheduledPayment storage payment = scheduledPayments[_id];
        require(payment.from == msg.sender, "Not owner");
        payment.isActive = false;
        emit ScheduledPaymentCancelled(_id);
    }

    function getUserScheduledPayments(address _user) external view returns (uint256[] memory) {
        return userScheduledPayments[_user];
    }

    function getScheduledPayment(uint256 _id) external view returns (ScheduledPayment memory) {
        return scheduledPayments[_id];
    }

    // ============ Agent Config Functions ============

    function configureAgent(
        bool _isActive,
        uint256 _limitPerTx,
        address _allowedRecipient,
        uint256 _interval
    ) external {
        agentConfigs[msg.sender] = AgentConfig({
            isActive: _isActive,
            limitPerTx: _limitPerTx,
            allowedRecipient: _allowedRecipient,
            interval: _interval,
            lastExecuted: 0
        });
        
        emit AgentConfigured(msg.sender, _isActive, _limitPerTx);
    }

    function getAgentConfig(address _user) external view returns (AgentConfig memory) {
        return agentConfigs[_user];
    }

    // ============ Utility Functions ============

    function getUserStats(address _user) external view returns (
        uint256 createdCount,
        uint256 receivedCount,
        uint256 totalPaid,
        uint256 totalReceived,
        uint256 scheduledCount
    ) {
        return (
            userCreatedInvoices[_user].length,
            userReceivedInvoices[_user].length,
            totalPaidByUser[_user],
            totalReceivedByUser[_user],
            userScheduledPayments[_user].length
        );
    }

    // Allow contract to receive ETH for scheduled payments
    receive() external payable {}
}
