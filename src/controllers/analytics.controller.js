const analyticsService = require('../services/analytics.service');

class AnalyticsController {
  async getDashboardMetrics(req, res) {
    try {
      const { start_date, end_date } = req.query;
      
      const analytics = await analyticsService.getDashboardMetrics(null, {
        start_date,
        end_date
      });
      
      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getTopEvents(req, res) {
    try {
      const { limit = 10, metric = 'revenue' } = req.query;
      
      const topEvents = await analyticsService.getTopEvents(
        parseInt(limit), 
        metric
      );
      
      res.json({
        success: true,
        data: topEvents
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getWeeklyReport(req, res) {
    try {
      const { eventId } = req.params;
      
      const report = await analyticsService.generateWeeklyReport(eventId);
      
      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async recordPageView(req, res) {
    try {
      const { event_id } = req.body;
      
      await analyticsService.recordPageView(
        event_id,
        req.get('User-Agent'),
        req.ip
      );
      
      res.json({
        success: true,
        message: 'Page view recorded successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new AnalyticsController();