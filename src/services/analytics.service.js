const Analytics = require('../models/mongodb/Analytics');
const Event = require('../models/mongodb/Event');

class AnalyticsService {
  async recordPageView(eventId, userAgent, ipAddress) {
    try {
      const today = this.getTodayDate();
      
      await this.updateOrCreateAnalytics(eventId, today, 'day', {
        $inc: { 
          'metrics.page_views': 1,
          'metrics.unique_visitors': 1 // Esto debería ser más sofisticado en producción
        }
      });
      
      // También actualizar el evento
      await Event.findByIdAndUpdate(eventId, {
        $inc: { 'stats.views': 1 }
      });
      
    } catch (error) {
      console.error('Error recording page view:', error);
    }
  }

  async recordTicketPurchase(eventId, ticketData) {
    try {
      const today = this.getTodayDate();
      const { quantity, amount } = ticketData;
      
      await this.updateOrCreateAnalytics(eventId, today, 'day', {
        $inc: {
          'metrics.tickets_sold': quantity,
          'metrics.revenue': amount,
          'metrics.checkout_initiated': 1
        }
      });
      
      // Actualizar estadísticas del evento
      await Event.findByIdAndUpdate(eventId, {
        $inc: {
          'stats.sold_tickets': quantity,
          'stats.revenue': amount
        }
      });
      
      // Calcular tasa de conversión
      await this.updateConversionRate(eventId, today);
      
    } catch (error) {
      console.error('Error recording ticket purchase:', error);
    }
  }

  async recordRefund(eventId, refundData) {
    try {
      const today = this.getTodayDate();
      const { quantity, amount } = refundData;
      
      await this.updateOrCreateAnalytics(eventId, today, 'day', {
        $inc: {
          'metrics.refunds': 1,
          'metrics.tickets_sold': -quantity,
          'metrics.revenue': -amount
        }
      });
      
      await Event.findByIdAndUpdate(eventId, {
        $inc: {
          'stats.sold_tickets': -quantity,
          'stats.revenue': -amount
        }
      });
      
    } catch (error) {
      console.error('Error recording refund:', error);
    }
  }

  async updateOrCreateAnalytics(eventId, date, period, updateData) {
    try {
      const result = await Analytics.findOneAndUpdate(
        { event_id: eventId, date, period },
        updateData,
        { upsert: true, new: true }
      );
      
      return result;
    } catch (error) {
      throw new Error(`Error updating analytics: ${error.message}`);
    }
  }

  async updateConversionRate(eventId, date) {
    try {
      const analytics = await Analytics.findOne({
        event_id: eventId,
        date,
        period: 'day'
      });
      
      if (analytics && analytics.metrics.page_views > 0) {
        const conversionRate = (analytics.metrics.checkout_initiated / analytics.metrics.page_views) * 100;
        
        await Analytics.findByIdAndUpdate(analytics._id, {
          'metrics.conversion_rate': Math.round(conversionRate * 100) / 100
        });
      }
    } catch (error) {
      console.error('Error updating conversion rate:', error);
    }
  }

  async getDashboardMetrics(eventId, dateRange = {}) {
    try {
      const { start_date, end_date } = dateRange;
      const query = { event_id: eventId, period: 'day' };
      
      if (start_date || end_date) {
        query.date = {};
        if (start_date) query.date.$gte = new Date(start_date);
        if (end_date) query.date.$lte = new Date(end_date);
      }
      
      const analytics = await Analytics.find(query).sort({ date: -1 });
      
      // Agregar métricas totales
      const totals = analytics.reduce((acc, curr) => {
        Object.keys(curr.metrics.toObject()).forEach(key => {
          acc[key] = (acc[key] || 0) + curr.metrics[key];
        });
        return acc;
      }, {});
      
      return {
        daily_analytics: analytics,
        totals,
        period_summary: {
          total_days: analytics.length,
          avg_daily_views: totals.page_views / analytics.length || 0,
          avg_conversion_rate: totals.conversion_rate / analytics.length || 0
        }
      };
    } catch (error) {
      throw new Error(`Error fetching dashboard metrics: ${error.message}`);
    }
  }

  async getTopEvents(limit = 10, metric = 'revenue') {
    try {
      const pipeline = [
        {
          $group: {
            _id: '$event_id',
            total_metric: { $sum: `$metrics.${metric}` }
          }
        },
        { $sort: { total_metric: -1 } },
        { $limit: limit },
        {
          $lookup: {
            from: 'events',
            localField: '_id',
            foreignField: '_id',
            as: 'event_info'
          }
        },
        { $unwind: '$event_info' },
        {
          $project: {
            event_id: '$_id',
            event_name: '$event_info.name',
            event_type: '$event_info.type',
            total_metric: 1,
            start_date: '$event_info.start_date'
          }
        }
      ];
      
      const topEvents = await Analytics.aggregate(pipeline);
      return topEvents;
    } catch (error) {
      throw new Error(`Error fetching top events: ${error.message}`);
    }
  }

  getTodayDate() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  // Generar reportes automáticos
  async generateWeeklyReport(eventId) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 7);
      
      const analytics = await this.getDashboardMetrics(eventId, {
        start_date: startDate,
        end_date: endDate
      });
      
      const event = await Event.findById(eventId);
      
      const report = {
        event: {
          id: event._id,
          name: event.name,
          type: event.type
        },
        period: {
          start: startDate,
          end: endDate
        },
        summary: analytics.totals,
        daily_breakdown: analytics.daily_analytics,
        insights: this.generateInsights(analytics)
      };
      
      return report;
    } catch (error) {
      throw new Error(`Error generating weekly report: ${error.message}`);
    }
  }

  generateInsights(analytics) {
    const insights = [];
    
    // Insight sobre tendencias de ventas
    if (analytics.totals.revenue > 0) {
      insights.push({
        type: 'revenue',
        message: `Se generaron ${analytics.totals.revenue} en ventas`,
        trend: 'positive'
      });
    }
    
    // Insight sobre conversión
    const avgConversion = analytics.period_summary.avg_conversion_rate;
    if (avgConversion > 5) {
      insights.push({
        type: 'conversion',
        message: `Excelente tasa de conversión del ${avgConversion.toFixed(1)}%`,
        trend: 'positive'
      });
    } else if (avgConversion < 2) {
      insights.push({
        type: 'conversion',
        message: `Tasa de conversión baja del ${avgConversion.toFixed(1)}%. Considere optimizar la página`,
        trend: 'negative'
      });
    }
    
    return insights;
  }
}

module.exports = new AnalyticsService();