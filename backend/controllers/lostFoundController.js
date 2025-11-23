const LostFoundItem = require('../models/LostFoundItem');

async function createReport(req, res) {
  try {
    console.log('=== CREATE REPORT REQUEST ===');
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);
    
    let itemData = { ...req.body };
    
    // Handle uploaded files with proper storage
    if (req.files && req.files.length > 0) {
      const imageFile = req.files.find(file => file.fieldname === 'image');
      if (imageFile) {
        // File is automatically saved to uploads folder by multer
        itemData.imageUrl = `/uploads/${imageFile.filename}`;
      }
    }

    // Validate required fields
    if (!itemData.title) {
      return res.status(400).json({ message: 'Title is required' });
    }
    
    if (!itemData.description) {
      return res.status(400).json({ message: 'Description is required' });
    }

    console.log('Creating item with data:', itemData);

    const item = await LostFoundItem.create({
      title: itemData.title,
      description: itemData.description,
      category: itemData.category || 'other',
      status: itemData.status || 'lost',
      location: itemData.location || '',
      date: itemData.date || new Date(),
      imageUrl: itemData.imageUrl || '',
      reporterId: itemData.reporterId || 'unknown', // Make sure this is included
      reporterName: itemData.reporterName || 'Anonymous',
      reporterEmail: itemData.reporterEmail || '',
    });
    
    console.log('✅ Item created successfully:', item._id);
    res.status(201).json(item);
    
  } catch (err) {
    console.error('❌ Create report error:', err);
    res.status(400).json({ 
      message: 'Failed to create report', 
      error: err.message
    });
  }
}

async function getItems(req, res) {
  try {
    const { q, category, status } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;

    let query = LostFoundItem.find(filter).sort({ createdAt: -1 });
    if (q) {
      query = query.find({ $text: { $search: q } });
    }
    const items = await query.exec();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch items', error: err.message });
  }
}

async function getItemById(req, res) {
  try {
    const item = await LostFoundItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: 'Failed to fetch item', error: err.message });
  }
}

async function updateItemStatus(req, res) {
  try {
    const { status } = req.body;
    if (!['lost', 'found', 'claimed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const item = await LostFoundItem.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update status', error: err.message });
  }
}

module.exports = {
  createReport,
  getItems,
  getItemById,
  updateItemStatus,
};
