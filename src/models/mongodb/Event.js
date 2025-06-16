const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  number: { type: Number, required: true },
  type: { type: String, enum: ['standard', 'vip', 'wheelchair', 'premium'], default: 'standard' },
  status: { type: String, enum: ['available', 'occupied', 'maintenance', 'reserved'], default: 'available' },
  price: { type: Number, required: true },
  row_position: { type: Number },
  accessibility: { type: Boolean, default: false }
});

const rowSchema = new mongoose.Schema({
  letter: { type: String, required: true },
  seats: [seatSchema],
  row_type: { type: String, enum: ['front', 'middle', 'back'], default: 'middle' }
});

const theaterSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  capacity: { type: Number, required: true },
  rows: [rowSchema],
  screen_type: { type: String, enum: ['2D', '3D', 'IMAX', '4DX'], default: '2D' },
  audio_system: { type: String, default: 'Dolby Digital' }
});

const concertSectionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  rows: [rowSchema],
  pricing: {
    base_price: { type: Number, required: true },
    early_bird: { type: Number },
    vip_price: { type: Number },
    group_discount: { type: Number, default: 0 }
  },
  benefits: [{ type: String }], // ["backstage_access", "meet_greet", "vip_lounge"]
  max_capacity: { type: Number, required: true }
});

const transportScheduleSchema = new mongoose.Schema({
  departure_time: { type: Date, required: true },
  arrival_time: { type: Date, required: true },
  price: { type: Number, required: true },
  available_seats: { type: Number, required: true },
  stops: [{ 
    name: String, 
    arrival_time: Date, 
    departure_time: Date 
  }],
  vehicle_number: { type: String },
  driver_info: {
    name: String,
    license: String,
    phone: String
  }
});

const transportRouteSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  origin: {
    name: { type: String, required: true },
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  destination: {
    name: { type: String, required: true },
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  vehicle_type: { 
    type: String, 
    enum: ['bus', 'train', 'plane', 'boat', 'metro'], 
    required: true 
  },
  capacity: { type: Number, required: true },
  schedule: [transportScheduleSchema],
  route_duration: { type: Number }, // en minutos
  amenities: [{ type: String }], // ["wifi", "ac", "bathroom", "food"]
  vehicle_class: { type: String, enum: ['economy', 'business', 'first'] }
});

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, required: true },
  short_description: { type: String, maxlength: 200 },
  category_id: { type: Number, required: true }, // Referencia a MySQL
  type: { 
    type: String, 
    enum: ['cinema', 'concert', 'transport', 'theater', 'sports', 'conference'], 
    required: true 
  },
  
  // Fechas y horarios
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  
  // Sessions/Showtimes
  sessions: [{
    id: { type: String, required: true },
    start_time: { type: Date, required: true },
    end_time: { type: Date, required: true },
    available_seats: { type: Number, required: true },
    price_modifiers: {
      weekend_surcharge: { type: Number, default: 0 },
      holiday_surcharge: { type: Number, default: 0 },
      early_bird_discount: { type: Number, default: 0 }
    },
    status: { type: String, enum: ['active', 'cancelled', 'sold_out'], default: 'active' }
  }],
  
  // Ubicación del evento
  venue: {
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: String,
    country: { type: String, required: true },
    postal_code: String,
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    capacity: { type: Number, required: true },
    facilities: [{ type: String }], // ["parking", "restaurant", "bar", "accessibility"]
    contact: {
      phone: String,
      email: String,
      website: String
    }
  },
  
  // Configuración específica por tipo de evento
  config: {
    // Para CINE
    cinema: {
      theaters: [theaterSchema],
      movie_info: {
        title: String,
        duration: Number, // en minutos
        genre: [{ type: String }],
        rating: { type: String, enum: ['G', 'PG', 'PG-13', 'R', 'NC-17'] },
        director: String,
        cast: [{ 
          name: String, 
          role: String,
          image_url: String 
        }],
        synopsis: String,
        trailer_url: String,
        poster_url: String,
        release_date: Date,
        language: String,
        subtitles: [{ type: String }]
      }
    },
    
    // Para CONCIERTOS
    concert: {
      sections: [concertSectionSchema],
      artist_info: {
        main_artist: { type: String, required: true },
        supporting_acts: [{
          name: String,
          start_time: Date,
          duration: Number
        }],
        genre: [{ type: String }],
        biography: String,
        social_media: {
          instagram: String,
          twitter: String,
          facebook: String,
          youtube: String
        }
      },
      technical_info: {
        sound_system: String,
        lighting: String,
        stage_size: String,
        age_restriction: { type: Number, default: 0 }
      }
    },
    
    // Para TRANSPORTE
    transport: {
      routes: [transportRouteSchema],
      company_info: {
        name: String,
        license: String,
        contact: {
          phone: String,
          email: String,
          website: String
        },
        rating: { type: Number, min: 0, max: 5 }
      },
      policies: {
        cancellation_policy: String,
        baggage_policy: String,
        refund_policy: String
      }
    }
  },
  
  // Media y contenido
  images: [{
    url: { type: String, required: true },
    alt: String,
    type: { type: String, enum: ['poster', 'gallery', 'banner', 'thumbnail'], default: 'gallery' },
    is_primary: { type: Boolean, default: false },
    order: { type: Number, default: 0 }
  }],
  
  videos: [{
    url: { type: String, required: true },
    title: String,
    type: { type: String, enum: ['trailer', 'behind_scenes', 'interview'], default: 'trailer' },
    thumbnail_url: String,
    duration: Number
  }],
  
  // Configuración de tickets
  ticket_types: [{
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    quantity_available: { type: Number, required: true },
    quantity_sold: { type: Number, default: 0 },
    max_per_user: { type: Number, default: 10 },
    sale_start: { type: Date, required: true },
    sale_end: { type: Date, required: true },
    includes: [{ type: String }], // ["drink", "snack", "merchandise"]
    restrictions: {
      age_min: Number,
      age_max: Number,
      requires_id: { type: Boolean, default: false }
    },
    is_active: { type: Boolean, default: true }
  }],
  
  // Estado y configuración
  status: { 
    type: String, 
    enum: ['draft', 'published', 'sold_out', 'cancelled', 'completed'], 
    default: 'draft' 
  },
  is_featured: { type: Boolean, default: false },
  is_private: { type: Boolean, default: false },
  requires_approval: { type: Boolean, default: false },
  
  // Categorización y etiquetas
  tags: [{ type: String, lowercase: true, trim: true }],
  
  // SEO y marketing
  seo: {
    title: String,
    description: String,
    keywords: [{ type: String }],
    og_image: String,
    canonical_url: String
  },
  
  // Estadísticas (se actualiza en tiempo real)
  stats: {
    total_tickets: { type: Number, default: 0 },
    sold_tickets: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    favorites: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    conversion_rate: { type: Number, default: 0 }
  },
  
  // Configuración de precios dinámicos
  pricing: {
    dynamic_pricing: { type: Boolean, default: false },
    base_price: Number,
    surge_multiplier: { type: Number, default: 1 },
    discount_codes: [{
      code: String,
      discount_percent: Number,
      discount_amount: Number,
      valid_from: Date,
      valid_until: Date,
      max_uses: Number,
      used_count: { type: Number, default: 0 }
    }]
  },
  
  // Información del organizador
  organizer: {
    user_id: { type: Number, required: true }, // Referencia a MySQL
    name: String,
    email: String,
    phone: String,
    company: String
  },
  
  // Metadata del sistema
  created_by: { type: Number, required: true }, // user_id de MySQL
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  published_at: Date,
  deleted_at: Date
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para optimización
eventSchema.index({ slug: 1 });
eventSchema.index({ type: 1, status: 1 });
eventSchema.index({ start_date: 1, end_date: 1 });
eventSchema.index({ 'venue.city': 1, 'venue.country': 1 });
eventSchema.index({ tags: 1 });
eventSchema.index({ is_featured: 1, status: 1 });
eventSchema.index({ created_by: 1 });
eventSchema.index({ 'stats.views': -1 });

// Virtuals
eventSchema.virtual('available_tickets').get(function() {
  return this.stats.total_tickets - this.stats.sold_tickets;
});

eventSchema.virtual('is_sold_out').get(function() {
  return this.available_tickets <= 0;
});

eventSchema.virtual('days_until_event').get(function() {
  const now = new Date();
  const eventDate = new Date(this.start_date);
  const diffTime = eventDate - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Middleware
eventSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

module.exports = mongoose.model('Event', eventSchema);