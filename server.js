const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Sample data (replace with MongoDB later)
let data = {
    featureFlags: {
        chatEnabled: true,
        bookingEnabled: true,
        promotionsEnabled: true,
        weatherEnabled: true
    },
    rooms: [
        {
            id: 1,
            name: "Rainforest Treehouse",
            price: 450,
            description: "Luxurious treehouse nestled in the rainforest canopy",
            type: "villa",
            amenities: ["Ocean View", "Private Beach", "Eco-Friendly"],
            images: [
                "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=400&h=300&fit=crop",
                "https://images.unsplash.com/photo-1586375300773-8384e3e4916f?w=400&h=300&fit=crop"
            ],
            featured: true,
            available: true
        },
        {
            id: 2,
            name: "Beachfront Suite",
            price: 380,
            description: "Stunning beachfront suite with panoramic ocean views",
            type: "suite",
            amenities: ["Beach Access", "Sunset View", "Luxury Bath"],
            images: [
                "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop"
            ],
            featured: true,
            available: true
        }
    ],
    promotions: [
        {
            id: 1,
            title: "Summer Special",
            description: "Enjoy 20% off all beachfront accommodations",
            discount: "20% OFF",
            validUntil: "2024-12-31",
            active: true
        }
    ],
    announcements: [
        "🌴 New rainforest tours available!",
        "🍹 Happy hour: 4PM-6PM daily",
        "🎉 Special events this weekend"
    ],
    weather: {
        temperature: 28,
        condition: "Sunny",
        forecast: "Clear skies all week"
    },
    recentMessages: [],
    stats: {
        totalBookings: 156,
        totalMessages: 42,
        activeRooms: 8,
        activePromotions: 3
    }
};

// ======== NEW ROUTES FOR FRONTEND ========

// Site content endpoint for frontend
app.get('/api/site-content', (req, res) => {
    res.json({
        success: true,
        data: {
            featuredRooms: data.rooms.filter(room => room.featured),
            featureFlags: data.featureFlags,
            promotions: data.promotions.filter(promo => promo.active),
            announcements: data.announcements,
            weather: data.weather
        }
    });
});

// Booking endpoint
app.post('/api/bookings', (req, res) => {
    const bookingData = req.body;
    
    // Simulate booking processing
    const bookingId = 'BK' + Date.now();
    const totalAmount = calculateBookingAmount(bookingData);
    
    res.json({
        success: true,
        message: 'Booking request received successfully!',
        bookingId: bookingId,
        data: {
            totalAmount: totalAmount,
            bookingDetails: bookingData
        }
    });
});

// Helper function for booking calculation
function calculateBookingAmount(bookingData) {
    const roomPrices = {
        1: 1050,
        2: 700, 
        3: 525
    };
    
    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    
    const roomPrice = roomPrices[bookingData.accommodationId] || 500;
    return roomPrice * nights;
}

// ======== EXISTING ADMIN ROUTES ========

// API Routes
app.get('/api/admin/data', (req, res) => {
    res.json({ success: true, data });
});

// Feature Flags
app.post('/api/admin/feature-flags', (req, res) => {
    data.featureFlags = { ...data.featureFlags, ...req.body };
    res.json({ success: true, message: 'Feature flags updated' });
});

// Rooms Management
app.get('/api/admin/rooms', (req, res) => {
    res.json({ success: true, rooms: data.rooms });
});

app.post('/api/admin/rooms', (req, res) => {
    const newRoom = {
        id: Date.now(),
        ...req.body,
        images: []
    };
    data.rooms.push(newRoom);
    res.json({ success: true, room: newRoom });
});

app.put('/api/admin/rooms/:id', (req, res) => {
    const roomId = parseInt(req.params.id);
    const roomIndex = data.rooms.findIndex(room => room.id === roomId);
    
    if (roomIndex !== -1) {
        data.rooms[roomIndex] = { ...data.rooms[roomIndex], ...req.body };
        res.json({ success: true, room: data.rooms[roomIndex] });
    } else {
        res.status(404).json({ success: false, message: 'Room not found' });
    }
});

app.put('/api/admin/rooms/:id/images', (req, res) => {
    const roomId = parseInt(req.params.id);
    const room = data.rooms.find(room => room.id === roomId);
    
    if (room) {
        room.images = req.body.images;
        res.json({ success: true, images: room.images });
    } else {
        res.status(404).json({ success: false, message: 'Room not found' });
    }
});

app.delete('/api/admin/rooms/:id', (req, res) => {
    const roomId = parseInt(req.params.id);
    data.rooms = data.rooms.filter(room => room.id !== roomId);
    res.json({ success: true, message: 'Room deleted' });
});

// Promotions Management
app.get('/api/admin/promotions', (req, res) => {
    res.json({ success: true, promotions: data.promotions });
});

app.post('/api/admin/promotions', (req, res) => {
    const newPromo = {
        id: Date.now(),
        ...req.body
    };
    data.promotions.push(newPromo);
    res.json({ success: true, promotion: newPromo });
});

app.put('/api/admin/promotions/:id', (req, res) => {
    const promoId = parseInt(req.params.id);
    const promoIndex = data.promotions.findIndex(promo => promo.id === promoId);
    
    if (promoIndex !== -1) {
        data.promotions[promoIndex] = { ...data.promotions[promoIndex], ...req.body };
        res.json({ success: true, promotion: data.promotions[promoIndex] });
    } else {
        res.status(404).json({ success: false, message: 'Promotion not found' });
    }
});

app.delete('/api/admin/promotions/:id', (req, res) => {
    const promoId = parseInt(req.params.id);
    data.promotions = data.promotions.filter(promo => promo.id !== promoId);
    res.json({ success: true, message: 'Promotion deleted' });
});

// Announcements
app.put('/api/admin/announcements', (req, res) => {
    data.announcements = req.body.announcements;
    res.json({ success: true, announcements: data.announcements });
});

// Weather
app.put('/api/admin/weather', (req, res) => {
    data.weather = { ...data.weather, ...req.body };
    res.json({ success: true, weather: data.weather });
});

// Chat Messages
app.post('/api/chat', (req, res) => {
    const newMessage = {
        id: Date.now(),
        userName: req.body.userName || req.body.name,
        userEmail: req.body.userEmail || req.body.email,
        message: req.body.message,
        timestamp: new Date().toISOString()
    };
    data.recentMessages.unshift(newMessage);
    // Keep only last 20 messages
    data.recentMessages = data.recentMessages.slice(0, 20);
    
    // Auto-response simulation
    const responses = [
        "Thanks for your message! Our team will contact you soon.",
        "We'll get back to you within 24 hours with more information!",
        "Thank you for your interest in Pangpang Paradise!",
        "Our nature guides are excited to help you plan your stay!"
    ];
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    res.json({ 
        success: true, 
        message: newMessage,
        response: randomResponse
    });
});

// Admin route
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Main route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🏝️ Pangpang Paradise Server running on port ${PORT}`);
    console.log(`🌐 Website: http://localhost:${PORT}`);
    console.log(`⚙️ Admin: http://localhost:${PORT}/admin`);
    console.log(`🚀 Ready for deployment!`);
});