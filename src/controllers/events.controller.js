const eventService = require('../services/event.service');
const analyticsService = require('../services/analytics.service');
const { validationResult } = require('express-validator');

class EventsController {
  async createEvent(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          errors: errors.array() 
        });
      }

      const event = await eventService.createEvent(req.body, req.user.id);
      
      res.status(201).json({
        success: true,
        message: 'Event created successfully',
        data: event
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getEvents(req, res) {
    try {
      const { page, limit, ...filters } = req.query;
      
      const result = await eventService.getEvents(filters, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        sort: req.query.sort
      });
      
      res.json({
        success: true,
        data: result.events,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getEventById(req, res) {
    try {
      const event = await eventService.getEventByIdOrSlug(req.params.id);
      
      // Registrar vista para analytics
      await analyticsService.recordPageView(
        event._id,
        req.get('User-Agent'),
        req.ip
      );
      
      res.json({
        success: true,
        data: event
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateEvent(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          errors: errors.array() 
        });
      }

      const event = await Event.findByIdAndUpdate(
        req.params.id,
        { ...req.body, updated_at: new Date() },
        { new: true }
      );

      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }

      res.json({
        success: true,
        message: 'Event updated successfully',
        data: event
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteEvent(req, res) {
    try {
      const event = await Event.findByIdAndUpdate(
        req.params.id,
        { deleted_at: new Date() },
        { new: true }
      );

      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }

      res.json({
        success: true,
        message: 'Event deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async searchEvents(req, res) {
    try {
      const result = await eventService.searchEvents(req.body);
      
      res.json({
        success: true,
        data: result.events,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getEventAnalytics(req, res) {
    try {
      const { id } = req.params;
      const { period = 'day', start_date, end_date } = req.query;
      
      const analytics = await analyticsService.getDashboardMetrics(id, {
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

  async updateSeatAvailability(req, res) {
    try {
      const { id } = req.params;
      const seatUpdates = req.body;
      
      const event = await eventService.updateSeatAvailability(id, seatUpdates);
      
      res.json({
        success: true,
        message: 'Seat availability updated successfully',
        data: event
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new EventsController();