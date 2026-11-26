const Task = require('../models/Task');

async function list(req, res, next) {
  try {
    const tasks = await Task.find({ userId: req.user.id }).sort({ createdAt: -1 });
    return res.json({ tasks });
  } catch (error) {
    return next(error);
  }
}

async function create(req, res, next) {
  try {
    const { title, description, status, priority, dueDate } = req.body;
    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      userId: req.user.id
    });
    return res.status(201).json({ task });
  } catch (error) {
    return next(error);
  }
}

async function getOne(req, res, next) {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user.id });

    if (!task) {
      return res.status(404).json({ message: 'Tarefa não encontrada.' });
    }

    return res.json({ task });
  } catch (error) {
    return next(error);
  }
}

async function update(req, res, next) {
  try {
    const allowedFields = ['title', 'description', 'status', 'priority', 'dueDate'];
    const updates = {};

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'Envie pelo menos um campo para atualizar.' });
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      updates,
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Tarefa não encontrada.' });
    }

    return res.json({ task });
  } catch (error) {
    return next(error);
  }
}

async function remove(req, res, next) {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

    if (!task) {
      return res.status(404).json({ message: 'Tarefa não encontrada.' });
    }

    return res.json({ message: 'Tarefa excluída.' });
  } catch (error) {
    return next(error);
  }
}

module.exports = { list, create, getOne, update, remove };
