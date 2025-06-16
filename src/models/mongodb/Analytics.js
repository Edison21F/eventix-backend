const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  event_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  date: { type: Date, required: true },
  period: { 
    type: String, 
    enum: ['hour', 'day', 'week', 'month'], 
    required: true 
  },
  
  // Métricas principales
  metrics: {
    page_views: { type: Number, default: 0 },
    unique_visitors: { type: Number, default: 0 },
    ticket_views: { type: Number, default: 0 },
    add_to_cart: { type: Number, default: 0 },
    checkout_initiated: { type: Number, default: 0 },
    conversion_rate: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    tickets_sold: { type: Number, default: 0 },
    refunds: { type: Number, default: 0 },
    cancellations: { type: Number, default: 0 },
    average_order_value: { type: Number, default: 0 },
    bounce_rate: { type: Number, default: 0 },
    session_duration: { type: Number, default: 0 } // en segundos
  },
  
  // Demografía de usuarios
  user_demographics: {
    age_groups: {
      '18-24': { type: Number, default: 0 },
      '25-34': { type: Number, default: 0 },
      '35-44': { type: Number, default: 0 },
      '45-54': { type: Number, default: 0 },
      '55+': { type: Number, default: 0 }
    },
    gender: {
      male: { type: Number, default: 0 },
      female: { type: Number, default: 0 },
      other: { type: Number, default: 0 }
    },
    locations: [{
      country: String,
      city: String,
      count: Number
    }]
  },
  
  // Fuentes de tráfico
  traffic_sources: {
    direct: { type: Number, default: 0 },
    organic: { type: Number, default: 0 },
    social: { type: Number, default: 0 },
    email: { type: Number, default: 0 },
    referral: { type: Number, default: 0 },
    paid: { type: Number, default: 0 }
  },
  
  // Dispositivos
  devices: {
    desktop: { type: Number, default: 0 },
    mobile: { type: Number, default: 0 },
    tablet: { type: Number, default: 0 }
  },
  
  // Performance metrics
  performance: {
    page_load_time: { type: Number, default: 0 },
    api_response_time: { type: Number, default: 0 },
    error_rate: { type: Number, default: 0 }
  },
  
  created_at: { type: Date, default: Date.now }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false }
});

// Índices para consultas eficientes
analyticsSchema.index({ event_id: 1, date: -1 });
analyticsSchema.index({ date: -1, period: 1 });
analyticsSchema.index({ event_id: 1, period: 1, date: -1 });

module.exports = mongoose.model('Analytics', analyticsSchema);