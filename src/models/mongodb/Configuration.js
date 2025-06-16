const mongoose = require('mongoose');

const configurationSchema = new mongoose.Schema({
  key: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true 
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  category: { 
    type: String, 
    required: true,
    enum: ['payment', 'email', 'notification', 'system', 'ui', 'security']
  },
  description: String,
  is_active: { type: Boolean, default: true },
  is_public: { type: Boolean, default: false }, // Si es visible para el frontend
  validation_schema: mongoose.Schema.Types.Mixed, // Esquema JSON para validar el value
  created_by: { type: Number, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

configurationSchema.index({ key: 1 });
configurationSchema.index({ category: 1, is_active: 1 });

module.exports = mongoose.model('Configuration', configurationSchema);