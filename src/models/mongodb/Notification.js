// src/models/mongodb/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user_id: { type: Number, required: true }, // Referencia a MySQL
  title: { type: String, required: true, trim: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['info', 'success', 'warning', 'error', 'promotion'], 
    default: 'info' 
  },
  read: { type: Boolean, default: false },
  action_url: String,
  action_text: String,
  image_url: String,
  
  // Para notificaciones push
  push_sent: { type: Boolean, default: false },
  push_sent_at: Date,
  
  // Para emails
  email_sent: { type: Boolean, default: false },
  email_sent_at: Date,
  
  // Categorización
  category: {
    type: String,
    enum: ['ticket', 'payment', 'event', 'system', 'promotion', 'reminder'],
    required: true
  },
  
  // Metadata adicional
  metadata: {
    event_id: String,
    ticket_id: String,
    transaction_id: String,
    custom_data: mongoose.Schema.Types.Mixed
  },
  
  // Expiración automática
  expires_at: Date,
  
  created_at: { type: Date, default: Date.now }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false }
});

notificationSchema.index({ user_id: 1, read: 1 });
notificationSchema.index({ created_at: -1 });
notificationSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });
notificationSchema.index({ category: 1, type: 1 });

module.exports = mongoose.model('Notification', notificationSchema);