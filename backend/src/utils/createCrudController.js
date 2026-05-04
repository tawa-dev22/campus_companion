export function createCrudController(Model, defaultSort = '-createdAt') {
  return {
    create: async (req, res, next) => {
      try {
        const payload = { ...req.body, user: req.user.id };
        const item = await Model.create(payload);
        res.status(201).json(item);
      } catch (error) {
        next(error);
      }
    },
    list: async (req, res, next) => {
      try {
        const items = await Model.find({ user: req.user.id }).sort(defaultSort);
        res.json(items);
      } catch (error) {
        next(error);
      }
    },
    getOne: async (req, res, next) => {
      try {
        const item = await Model.findOne({ _id: req.params.id, user: req.user.id });
        if (!item) return res.status(404).json({ message: 'Not found' });
        res.json(item);
      } catch (error) {
        next(error);
      }
    },
    update: async (req, res, next) => {
      try {
        const item = await Model.findOneAndUpdate(
          { _id: req.params.id, user: req.user.id },
          req.body,
          { new: true, runValidators: true }
        );
        if (!item) return res.status(404).json({ message: 'Not found' });
        res.json(item);
      } catch (error) {
        next(error);
      }
    },
    remove: async (req, res, next) => {
      try {
        const item = await Model.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!item) return res.status(404).json({ message: 'Not found' });
        res.json({ message: 'Deleted successfully' });
      } catch (error) {
        next(error);
      }
    }
  };
}
