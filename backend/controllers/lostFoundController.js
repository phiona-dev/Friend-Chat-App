const LostFoundItem = require('../models/LostFoundItem');

async function createReport(req, res) {
  try {
    const { title, description, category, status, location, date, imageUrl, reporterName, reporterEmail } = req.body;
    const item = await LostFoundItem.create({
      title,
      description,
      category,
      status: status || 'lost',
      location,
      date,
      imageUrl,
      reporterName,
      reporterEmail,
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create report', error: err.message });
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
