const { body, param } = require('express-validator');

const validateEvent = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Event name must be between 3 and 200 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  
  body('type')
    .isIn(['cinema', 'concert', 'transport', 'theater', 'sports', 'conference'])
    .withMessage('Invalid event type'),
  
  body('start_date')
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  
  body('end_date')
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date')
    .custom((endDate, { req }) => {
      if (new Date(endDate) <= new Date(req.body.start_date)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  
  body('venue.name')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Venue name is required'),
  
  body('venue.address')
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Venue address is required'),
  
  body('venue.city')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Venue city is required'),
  
  body('venue.country')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Venue country is required'),
  
  body('venue.coordinates.lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude'),
  
  body('venue.coordinates.lng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude'),
  
  body('venue.capacity')
    .isInt({ min: 1 })
    .withMessage('Venue capacity must be a positive integer'),
  
  body('ticket_types')
    .isArray({ min: 1 })
    .withMessage('At least one ticket type is required'),
  
  body('ticket_types.*.name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Ticket type name is required'),
  
  body('ticket_types.*.price')
    .isFloat({ min: 0 })
    .withMessage('Ticket price must be a positive number'),
  
  body('ticket_types.*.quantity_available')
    .isInt({ min: 1 })
    .withMessage('Ticket quantity must be a positive integer'),
];

const validateSeatUpdate = [
  param('id')
    .isMongoId()
    .withMessage('Invalid event ID'),
  
  body('theater_id')
    .optional()
    .isString()
    .withMessage('Theater ID must be a string'),
  
  body('section_id')
    .optional()
    .isString()
    .withMessage('Section ID must be a string'),
  
  body('route_id')
    .optional()
    .isString()
    .withMessage('Route ID must be a string'),
  
  body('row')
    .optional()
    .isString()
    .withMessage('Row must be a string'),
  
  body('seat_numbers')
    .optional()
    .isArray()
    .withMessage('Seat numbers must be an array'),
  
  body('status')
    .optional()
    .isIn(['available', 'occupied', 'maintenance', 'reserved'])
    .withMessage('Invalid seat status'),
  
  body('seats_to_book')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Seats to book must be a positive integer'),
];

module.exports = {
  validateEvent,
  validateSeatUpdate
};