const getAll = (req, res) => {
  res.json({ message: 'List all examples' });
};

const getById = (req, res) => {
  const { id } = req.params;
  res.json({ message: `Get example by id: ${id}` });
};

const create = (req, res) => {
  const data = req.body;
  res.status(201).json({ message: 'Example created', data });
};

const update = (req, res) => {
  const { id } = req.params;
  const data = req.body;
  res.json({ message: `Example ${id} updated`, data });
};

const remove = (req, res) => {
  const { id } = req.params;
  res.json({ message: `Example ${id} deleted` });
};

module.exports = { getAll, getById, create, update, remove };
