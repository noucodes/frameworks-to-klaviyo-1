class WebhookEvent {
  constructor(eventType, data) {
    this.eventType = eventType;
    this.data = data;
    this.timestamp = new Date();
    this.processed = false;
  }

  // Validate webhook event
  validate() {
    const errors = [];
    
    if (!this.eventType) {
      errors.push('Event type is required');
    }
    
    if (!this.data) {
      errors.push('Event data is required');
    }
    
    if (!this.data.customer_code) {
      errors.push('Customer code is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Transform to Klaviyo event format
  // toKlaviyoEvent(profile) {
  //   const baseEvent = {
  //     profile: { $id: profile.id },
  //     metric: {},
  //     timestamp: new Date(this.data.created_at).getTime() / 1000,
  //     properties: {
  //       frameworks_customer_code: this.data.customer_code
  //     }
  //   };

  //   switch (this.eventType) {
  //     case 'order_invoiced':
  //       baseEvent.metric = { name: 'Frameworks Invoice Created' };
  //       baseEvent.properties.invoice_number = this.data.invoice_number;
  //       baseEvent.properties.order_value_inc_gst = this.data.order_value_inc_gst;
  //       baseEvent.properties.branch = this.data.branch;
  //       baseEvent.properties.order_type = this.data.order_type;
  //       break;

  //     case 'quote_created':
  //       baseEvent.metric = { name: 'Quote Created' };
  //       baseEvent.properties.quote_number = this.data.quote_number;
  //       baseEvent.properties.quote_value_inc_gst = this.data.quote_value_inc_gst;
  //       baseEvent.properties.branch = this.data.branch;
  //       baseEvent.properties.quote_type = this.data.quote_type;
  //       break;

  //     case 'welcome_flow':
  //       baseEvent.metric = { name: 'Welcome Flow Started' };
  //       baseEvent.properties.customer_name = this.data.customer_name;
  //       baseEvent.properties.branch = this.data.branch;
  //       break;

  //     case 'email_changed':
  //       baseEvent.metric = { name: 'Email Changed' };
  //       baseEvent.properties.previous_email = this.data.previous_email;
  //       baseEvent.properties.new_email = this.data.new_email;
  //       break;

  //     default:
  //       throw new Error(`Unsupported event type: ${this.eventType}`);
  //   }

  //   return baseEvent;
  // }

  // Mark as processed
  markProcessed() {
    this.processed = true;
    this.processedAt = new Date();
  }

  // Get summary
  getSummary() {
    return {
      eventType: this.eventType,
      customerCode: this.data.customer_code,
      customerEmail: this.data.customer_email || this.data.email,
      timestamp: this.timestamp,
      processed: this.processed,
      processedAt: this.processedAt
    };
  }
}

module.exports = WebhookEvent;
