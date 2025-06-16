const Configuration = require('../models/mongodb/Configuration');

class ConfigurationService {
  async getConfiguration(key) {
    try {
      const config = await Configuration.findOne({ 
        key, 
        is_active: true 
      });
      
      return config ? config.value : null;
    } catch (error) {
      throw new Error(`Error fetching configuration: ${error.message}`);
    }
  }

  async setConfiguration(key, value, category, userId, options = {}) {
    try {
      const { description, is_public = false } = options;
      
      const config = await Configuration.findOneAndUpdate(
        { key },
        {
          key,
          value,
          category,
          description,
          is_public,
          created_by: userId,
          updated_at: new Date()
        },
        { upsert: true, new: true }
      );
      
      return config;
    } catch (error) {
      throw new Error(`Error setting configuration: ${error.message}`);
    }
  }

  async getConfigurationsByCategory(category) {
    try {
      const configs = await Configuration.find({ 
        category, 
        is_active: true 
      }).sort({ key: 1 });
      
      return configs;
    } catch (error) {
      throw new Error(`Error fetching configurations by category: ${error.message}`);
    }
  }

  async getPublicConfigurations() {
    try {
      const configs = await Configuration.find({ 
        is_public: true, 
        is_active: true 
      }).select('key value category');
      
      // Convertir a objeto plano para fácil acceso
      return configs.reduce((acc, config) => {
        acc[config.key] = config.value;
        return acc;
      }, {});
    } catch (error) {
      throw new Error(`Error fetching public configurations: ${error.message}`);
    }
  }

  // Configuraciones predeterminadas del sistema
  async initializeDefaultConfigurations(userId) {
    const defaultConfigs = [
      {
        key: 'payment_methods',
        value: {
          stripe: { enabled: true, publishable_key: '' },
          paypal: { enabled: false, client_id: '' }
        },
        category: 'payment',
        description: 'Métodos de pago disponibles'
      },
      {
        key: 'email_templates',
        value: {
          ticket_confirmation: {
            subject: 'Confirmación de tu ticket',
            template: 'ticket_confirmation.html'
          },
          event_reminder: {
            subject: 'Recordatorio de evento',
            template: 'event_reminder.html'
          }
        },
        category: 'email',
        description: 'Plantillas de email'
      },
      {
        key: 'site_settings',
        value: {
          site_name: 'EvenTix',
          support_email: 'support@eventix.com',
          max_tickets_per_user: 10,
          ticket_reservation_timeout: 900 // 15 minutos
        },
        category: 'system',
        description: 'Configuraciones generales del sitio',
        is_public: true
      }
    ];

    for (const config of defaultConfigs) {
      await this.setConfiguration(
        config.key,
        config.value,
        config.category,
        userId,
        {
          description: config.description,
          is_public: config.is_public || false
        }
      );
    }
  }
}

module.exports = new ConfigurationService();