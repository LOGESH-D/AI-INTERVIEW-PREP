const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

// POST /api/contacts - Submit a new contact form
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // Validate required fields
    if (!name || !email || !phone) {
      return res.status(400).json({ message: 'Name, email, and phone are required' });
    }

    // Create new contact submission
    const contact = new Contact({
      name,
      email,
      phone,
      message: message || ''
    });

    await contact.save();

    res.status(201).json({
      message: 'Contact form submitted successfully',
      contact: {
        id: contact._id,
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        message: contact.message,
        status: contact.status,
        createdAt: contact.createdAt
      }
    });

  } catch (error) {
    console.error('Contact submission error:', error);
    res.status(500).json({ message: 'Failed to submit contact form' });
  }
});

// GET /api/contacts - Get all contact submissions (admin only)
router.get('/', async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ message: 'Failed to fetch contacts' });
  }
});

// PUT /api/contacts/:id - Update contact status (admin only)
router.put('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    res.json(contact);
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({ message: 'Failed to update contact' });
  }
});

// DELETE /api/contacts/:id - Delete contact submission (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({ message: 'Failed to delete contact' });
  }
});

module.exports = router; 