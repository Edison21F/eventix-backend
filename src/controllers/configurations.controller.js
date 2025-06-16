const configurationService = require('../services/configuration.service');

class ConfigurationsController {
  async getAllConfigurations(req, res) {
    try {
      const { category } = req.query;
      
      let configurations;
      if (category) {
        configurations = await configurationService.getConfigurationsByCategory(category);
      } else {
        // Obtener todas las configuraciones (solo para admin)
        const Configuration = require('../models/mongodb/Configuration');
        configurations = await Configuration.find({ is_active: true })
          .sort({ category: 1, key: 1 });
      }
      
      res.json({
        success: true,
        data: configurations
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getConfiguration(req, res) {
    try {
      const { key } = req.params;
      
      const value = await configurationService.getConfiguration(key);
      
      if (value === null) {
        return res.status(404).json({
          success: false,
          message: 'Configuration not found'
        });
      }
      
      res.json({
        success: true,
        data: { key, value }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async setConfiguration(req, res) {
    try {
      const { key } = req.params;
      const { value, category, description, is_public } = req.body;
      
      const config = await configurationService.setConfiguration(
        key,
        value,
        category,
        req.user.id,
        { description, is_public }
      );
      
      res.json({
        success: true,
        message: 'Configuration updated successfully',
        data: config
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getConfigurationsByCategory(req, res) {
    try {
      const { category } = req.params;
      
      const configurations = await configurationService.getConfigurationsByCategory(category);
      
      res.json({
        success: true,
        data: configurations
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getPublicConfigurations(req, res) {
    try {
      const configurations = await configurationService.getPublicConfigurations();
      
      res.json({
        success: true,
        data: configurations
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new ConfigurationsController();