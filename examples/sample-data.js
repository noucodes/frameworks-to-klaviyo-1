// Sample Frameworks data structures for testing and development

const sampleAccount = {
  customer_code: "CUST001",
  email: "john.doe@company.com",
  first_name: "John",
  last_name: "Doe",
  company_name: "Doe Construction Ltd",
  phone: "+64 9 123 4567",
  account_status: "active",
  branch: "Auckland",
  credit_limit: 10000.00,
  current_balance: 2500.50,
  sales_rep: "Sarah Smith",
  updated_at: "2024-01-15T10:30:00Z",
  address: {
    address1: "123 Queen Street",
    address2: "",
    city: "Auckland",
    state: "Auckland",
    postal_code: "1010",
    country: "New Zealand"
  }
};

const sampleInvoice = {
  invoice_number: "INV-2024-001",
  customer_code: "CUST001",
  customer_email: "john.doe@company.com",
  order_number: "ORD-2024-001",
  order_value_ex_gst: 1000.00,
  order_value_inc_gst: 1150.00,
  branch: "Auckland",
  sales_rep: "Sarah Smith",
  order_type: "online",
  status: "paid",
  created_at: "2024-01-15T10:30:00Z",
  due_date: "2024-02-15T00:00:00Z"
};

const samplePayment = {
  payment_id: "PAY-001",
  customer_code: "CUST001",
  customer_email: "john.doe@company.com",
  invoice_number: "INV-2024-001",
  amount: 1150.00,
  payment_method: "credit_card",
  status: "completed",
  created_at: "2024-01-20T14:15:00Z",
  payment_date: "2024-01-20T14:15:00Z"
};

const sampleOverdueAccount = {
  account: sampleAccount,
  overdueAmount: 500.00,
  daysOverdue: 15
};

const sampleSpendMilestone = {
  account: sampleAccount,
  ytdSpend: 52000.00,
  milestone: 50000.00
};

// Sample API responses
const sampleFrameworksResponses = {
  accounts: {
    data: [sampleAccount],
    pagination: {
      total: 1,
      page: 1,
      pages: 1
    }
  },
  invoices: {
    data: [sampleInvoice],
    pagination: {
      total: 1,
      page: 1,
      pages: 1
    }
  },
  payments: {
    data: [samplePayment],
    pagination: {
      total: 1,
      page: 1,
      pages: 1
    }
  }
};

// Sample transformed Klaviyo events
const sampleKlaviyoEvents = {
  accountUpdated: {
    profile: { $id: "profile_123456" },
    metric: { name: "Account Updated" },
    timestamp: 1705319400,
    properties: {
      frameworks_customer_code: "CUST001",
      account_status: "active",
      branch: "Auckland",
      credit_limit: 10000.00,
      current_balance: 2500.50,
      sales_rep: "Sarah Smith",
      change_timestamp: "2024-01-15T10:30:00Z"
    },
    unique_id: "account_updated_CUST001_1705319400000"
  },
  invoiceCreated: {
    profile: { $id: "profile_123456" },
    metric: { name: "Frameworks Invoice Created" },
    timestamp: 1705319400,
    properties: {
      frameworks_customer_code: "CUST001",
      invoice_number: "INV-2024-001",
      order_number: "ORD-2024-001",
      order_value_ex_gst: 1000.00,
      order_value_inc_gst: 1150.00,
      gst_amount: 150.00,
      branch: "Auckland",
      sales_rep: "Sarah Smith",
      order_type: "online",
      invoice_status: "paid",
      due_date: "2024-02-15T00:00:00Z",
      created_timestamp: "2024-01-15T10:30:00Z"
    },
    unique_id: "invoice_created_INV-2024-001"
  },
  paymentReceived: {
    profile: { $id: "profile_123456" },
    metric: { name: "Payment Received" },
    timestamp: 1705756500,
    properties: {
      frameworks_customer_code: "CUST001",
      payment_id: "PAY-001",
      invoice_number: "INV-2024-001",
      payment_amount: 1150.00,
      payment_method: "credit_card",
      payment_status: "completed",
      payment_date: "2024-01-20T14:15:00Z",
      created_timestamp: "2024-01-20T14:15:00Z"
    },
    unique_id: "payment_received_PAY-001"
  }
};

module.exports = {
  sampleAccount,
  sampleInvoice,
  samplePayment,
  sampleOverdueAccount,
  sampleSpendMilestone,
  sampleFrameworksResponses,
  sampleKlaviyoEvents
};
