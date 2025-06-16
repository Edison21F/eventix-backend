const notificationService = require('../services/notification.service');

class NotificationsController {
  async getUserNotifications(req, res) {
    try {
      const { page, limit, unread_only, category } = req.query;
      
      const result = await notificationService.getUserNotifications(
        req.user.id,
        {
          unread_only: unread_only === 'true',
          category,
          page: parseInt(page) || 1,
          limit: parseInt(limit) || 20
        }
      );
      
      res.json({
        success: true,
        data: result.notifications,
        unread_count: result.unread_count,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async markAsRead(req, res) {
    try {
      const notification = await notificationService.markAsRead(
        req.params.id,
        req.user.id
      );
      
      res.json({
        success: true,
        message: 'Notification marked as read',
        data: notification
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  async markAllAsRead(req, res) {
    try {
      const result = await notificationService.markAllAsRead(req.user.id);
      
      res.json({
        success: true,
        message: `${result.modifiedCount} notifications marked as read`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteNotification(req, res) {
    try {
      await notificationService.deleteNotification(req.params.id, req.user.id);
      
      res.json({
        success: true,
        message: 'Notification deleted successfully'
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  async sendBulkNotifications(req, res) {
    try {
      const { user_ids, ...notificationData } = req.body;
      
      const notifications = await notificationService.sendBulkNotifications(
        user_ids,
        notificationData
      );
      
      res.json({
        success: true,
        message: `${notifications.length} notifications sent successfully`,
        data: notifications
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

// Exportar la clase NotificationsController
module.exports = new NotificationsController();
