// src/services/event.service.js
const Event = require('../models/mongodb/Event');
const Analytics = require('../models/mongodb/Analytics');

class EventService {
  // Crear evento
  async createEvent(eventData, userId) {
    try {
      const event = new Event({
        ...eventData,
        created_by: userId,
        organizer: {
          ...eventData.organizer,
          user_id: userId
        }
      });

      await event.save();
      
      // Inicializar analytics para el evento
      await this.initializeEventAnalytics(event._id);
      
      return event;
    } catch (error) {
      throw new Error(`Error creating event: ${error.message}`);
    }
  }

  // Obtener eventos con filtros
  async getEvents(filters = {}, pagination = {}) {
    try {
      const { 
        type, 
        status = 'published', 
        city, 
        date_from, 
        date_to, 
        is_featured,
        search,
        tags 
      } = filters;
      
      const { page = 1, limit = 20, sort = '-created_at' } = pagination;
      
      // Construir query
      const query = {};
      
      if (type) query.type = type;
      if (status) query.status = status;
      if (city) query['venue.city'] = new RegExp(city, 'i');
      if (is_featured !== undefined) query.is_featured = is_featured;
      if (tags && tags.length) query.tags = { $in: tags };
      
      // Filtro de fechas
      if (date_from || date_to) {
        query.start_date = {};
        if (date_from) query.start_date.$gte = new Date(date_from);
        if (date_to) query.start_date.$lte = new Date(date_to);
      }
      
      // Búsqueda de texto
      if (search) {
        query.$or = [
          { name: new RegExp(search, 'i') },
          { description: new RegExp(search, 'i') },
          { 'venue.name': new RegExp(search, 'i') },
          { tags: new RegExp(search, 'i') }
        ];
      }
      
      const events = await Event.find(query)
        .sort(sort)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();
      
      const total = await Event.countDocuments(query);
      
      return {
        events,
        pagination: {
          current_page: page,
          total_pages: Math.ceil(total / limit),
          total_items: total,
          items_per_page: limit
        }
      };
    } catch (error) {
      throw new Error(`Error fetching events: ${error.message}`);
    }
  }

  // Obtener evento por ID o slug
  async getEventByIdOrSlug(identifier) {
    try {
      const isObjectId = identifier.match(/^[0-9a-fA-F]{24}$/);
      const query = isObjectId ? { _id: identifier } : { slug: identifier };
      
      const event = await Event.findOne(query);
      
      if (!event) {
        throw new Error('Event not found');
      }
      
      // Incrementar vistas
      await Event.findByIdAndUpdate(event._id, { 
        $inc: { 'stats.views': 1 } 
      });
      
      return event;
    } catch (error) {
      throw new Error(`Error fetching event: ${error.message}`);
    }
  }

  // Actualizar disponibilidad de asientos
  async updateSeatAvailability(eventId, seatUpdates) {
    try {
      const event = await Event.findById(eventId);
      if (!event) throw new Error('Event not found');
      
      // Lógica específica según el tipo de evento
      switch (event.type) {
        case 'cinema':
          return await this.updateCinemaSeats(event, seatUpdates);
        case 'concert':
          return await this.updateConcertSeats(event, seatUpdates);
        case 'transport':
          return await this.updateTransportSeats(event, seatUpdates);
        default:
          throw new Error('Unsupported event type');
      }
    } catch (error) {
      throw new Error(`Error updating seat availability: ${error.message}`);
    }
  }

  // Métodos específicos por tipo de evento
  async updateCinemaSeats(event, seatUpdates) {
    // Implementar lógica específica para cine
    const { theater_id, row, seat_numbers, status } = seatUpdates;
    
    const theater = event.config.cinema.theaters.find(t => t.id === theater_id);
    if (!theater) throw new Error('Theater not found');
    
    const targetRow = theater.rows.find(r => r.letter === row);
    if (!targetRow) throw new Error('Row not found');
    
    seat_numbers.forEach(seatNum => {
      const seat = targetRow.seats.find(s => s.number === seatNum);
      if (seat) seat.status = status;
    });
    
    await event.save();
    return event;
  }

  async updateConcertSeats(event, seatUpdates) {
    // Implementar lógica específica para conciertos
    const { section_id, row, seat_numbers, status } = seatUpdates;
    
    const section = event.config.concert.sections.find(s => s.id === section_id);
    if (!section) throw new Error('Section not found');
    
    const targetRow = section.rows.find(r => r.letter === row);
    if (!targetRow) throw new Error('Row not found');
    
    seat_numbers.forEach(seatNum => {
      const seat = targetRow.seats.find(s => s.number === seatNum);
      if (seat) seat.status = status;
    });
    
    await event.save();
    return event;
  }

  async updateTransportSeats(event, seatUpdates) {
    // Implementar lógica específica para transporte
    const { route_id, schedule_id, seats_to_book } = seatUpdates;
    
    const route = event.config.transport.routes.find(r => r.id === route_id);
    if (!route) throw new Error('Route not found');
    
    const schedule = route.schedule.find(s => s._id.toString() === schedule_id);
    if (!schedule) throw new Error('Schedule not found');
    
    schedule.available_seats -= seats_to_book;
    if (schedule.available_seats < 0) {
      throw new Error('Not enough seats available');
    }
    
    await event.save();
    return event;
  }

  // Inicializar analytics para un evento
  async initializeEventAnalytics(eventId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const analytics = new Analytics({
      event_id: eventId,
      date: today,
      period: 'day'
    });
    
    await analytics.save();
  }

  // Obtener estadísticas del evento
  async getEventAnalytics(eventId, period = 'day', dateRange = {}) {
    try {
      const { start_date, end_date } = dateRange;
      
      const query = { event_id: eventId, period };
      
      if (start_date || end_date) {
        query.date = {};
        if (start_date) query.date.$gte = new Date(start_date);
        if (end_date) query.date.$lte = new Date(end_date);
      }
      
      const analytics = await Analytics.find(query)
        .sort({ date: -1 })
        .exec();
      
      return analytics;
    } catch (error) {
      throw new Error(`Error fetching analytics: ${error.message}`);
    }
  }

  // Búsqueda avanzada de eventos
  async searchEvents(searchParams) {
    try {
      const {
        query,
        filters,
        location,
        radius,
        sort_by = 'relevance',
        page = 1,
        limit = 20
      } = searchParams;

      // Construir agregación de MongoDB
      const pipeline = [];

      // Stage 1: Match básico
      const matchStage = { status: 'published' };
      
      if (query) {
        matchStage.$text = { $search: query };
      }
      
      if (filters) {
        if (filters.type) matchStage.type = filters.type;
        if (filters.price_min || filters.price_max) {
          matchStage['ticket_types.price'] = {};
          if (filters.price_min) matchStage['ticket_types.price'].$gte = filters.price_min;
          if (filters.price_max) matchStage['ticket_types.price'].$lte = filters.price_max;
        }
      }

      pipeline.push({ $match: matchStage });

      // Stage 2: Filtro geográfico si se especifica
      if (location && radius) {
        pipeline.push({
          $match: {
            'venue.coordinates': {
              $geoWithin: {
                $centerSphere: [
                  [location.lng, location.lat],
                  radius / 6378.1 // Radio en km convertido a radianes
                ]
              }
            }
          }
        });
      }

      // Stage 3: Agregar score de relevancia
      if (query) {
        pipeline.push({
          $addFields: {
            relevance_score: { $meta: 'textScore' }
          }
        });
      }

      // Stage 4: Sort
      const sortStage = {};
      switch (sort_by) {
        case 'relevance':
          if (query) sortStage.relevance_score = { $meta: 'textScore' };
          else sortStage.created_at = -1;
          break;
        case 'date_asc':
          sortStage.start_date = 1;
          break;
        case 'date_desc':
          sortStage.start_date = -1;
          break;
        case 'price_asc':
          sortStage['ticket_types.price'] = 1;
          break;
        case 'price_desc':
          sortStage['ticket_types.price'] = -1;
          break;
        case 'popularity':
          sortStage['stats.views'] = -1;
          break;
        default:
          sortStage.created_at = -1;
      }
      pipeline.push({ $sort: sortStage });

      // Stage 5: Paginación
      pipeline.push({ $skip: (page - 1) * limit });
      pipeline.push({ $limit: limit });

      const events = await Event.aggregate(pipeline);
      
      // Contar total para paginación
      const countPipeline = pipeline.slice(0, -2); // Remover skip y limit
      countPipeline.push({ $count: "total" });
      const countResult = await Event.aggregate(countPipeline);
      const total = countResult[0]?.total || 0;

      return {
        events,
        pagination: {
          current_page: page,
          total_pages: Math.ceil(total / limit),
          total_items: total,
          items_per_page: limit
        }
      };
    } catch (error) {
      throw new Error(`Error searching events: ${error.message}`);
    }
  }
}

module.exports = new EventService();
