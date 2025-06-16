// src/services/notification.service.js
const Notification = require('../models/mongodb/Notification');
const emailService = require('./email.service');

class NotificationService {
  async createNotification(notificationData) {
    try {
      const notification = new Notification(notificationData);
      await notification.save();
      
      // Si requiere envío de email
      if (notificationData.send_email) {
        await this.sendEmailNotification(notification);
      }
      
      // Si requiere push notification
      if (notificationData.send_push) {
        await this.sendPushNotification(notification);
      }
      
      return notification;
    } catch (error) {
      throw new Error(`Error creating notification: ${error.message}`);
    }
  }

  async getUserNotifications(userId, options = {}) {
    try {
      const { 
        unread_only = false, 
        category, 
        page = 1, 
        limit = 20 
      } = options;
      
      const query = { user_id: userId };
      
      if (unread_only) query.read = false;
      if (category) query.category = category;
      
      const notifications = await Notification.find(query)
        .sort({ created_at: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();
      
      const total = await Notification.countDocuments(query);
      const unread_count = await Notification.countDocuments({ 
        user_id: userId, 
        read: false 
      });
      
      return {
        notifications,
        unread_count,
        pagination: {
          current_page: page,
          total_pages: Math.ceil(total / limit),
          total_items: total,
          items_per_page: limit
        }
      };
    } catch (error) {
      throw new Error(`Error fetching notifications: ${error.message}`);
    }
  }

  async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, user_id: userId },
        { read: true },
        { new: true }
      );
      
      if (!notification) {
        throw new Error('Notification not found');
      }
      
      return notification;
    } catch (error) {
      throw new Error(`Error marking notification as read: ${error.message}`);
    }
  }

  async markAllAsRead(userId) {
    try {
      const result = await Notification.updateMany(
        { user_id: userId, read: false },
        { read: true }
      );
      
      return result;
    } catch (error) {
      throw new Error(`Error marking all notifications as read: ${error.message}`);
    }
  }

  async deleteNotification(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndDelete({
        _id: notificationId,
        user_id: userId
      });
      
      if (!notification) {
        throw new Error('Notification not found');
      }
      
      return notification;
    } catch (error) {
      throw new Error(`Error deleting notification: ${error.message}`);
    }
  }

  async sendBulkNotifications(userIds, notificationData) {
    try {
      const notifications = userIds.map(userId => ({
        ...notificationData,
        user_id: userId
      }));
      
      const result = await Notification.insertMany(notifications);
      
      // Enviar emails en batch si es necesario
      if (notificationData.send_email) {
        await Promise.all(
          result.map(notification => this.sendEmailNotification(notification))
        );
      }
      
      return result;
    } catch (error) {
      throw new Error(`Error sending bulk notifications: ${error.message}`);
    }
  }

  async sendEmailNotification(notification) {
    try {
      // Aquí integrarías con tu servicio de email
      await emailService.sendNotificationEmail(notification);
      
      await Notification.findByIdAndUpdate(notification._id, {
        email_sent: true,
        email_sent_at: new Date()
      });
    } catch (error) {
      console.error('Error sending email notification:', error);
    }
  }

  async sendPushNotification(notification) {
    try {
      // Aquí integrarías con tu servicio de push notifications
      // Por ejemplo, Firebase FCM, OneSignal, etc.
      
      await Notification.findByIdAndUpdate(notification._id, {
        push_sent: true,
        push_sent_at: new Date()
      });
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }

  // Limpiar notificaciones expiradas
  async cleanupExpiredNotifications() {
    try {
      const result = await Notification.deleteMany({
        expires_at: { $lt: new Date() }
      });
      
      console.log(`Cleaned up ${result.deletedCount} expired notifications`);
      return result;
    } catch (error) {
      console.error('Error cleaning up notifications:', error);
    }
  }
}

module.exports = new NotificationService();
