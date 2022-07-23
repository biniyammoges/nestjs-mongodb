import mongoose, { CallbackError, SaveOptions } from 'mongoose';

export const softDeletePlugin = (schema: mongoose.Schema) => {
  schema.add({
    IsDeleted: {
      type: Boolean,
      required: true,
      default: false,
    },
    DeletedAt: {
      type: Date,
      default: null,
    },
  });

  // @ts-ignore
  schema.pre(
    'find',
    async function (this, next: (err?: CallbackError) => void) {
      if (this.getFilter().IsDeleted === true) {
        return next();
      }
      this.setQuery({ ...this.getFilter(), IsDeleted: false });
      next();
    },
  );

  // @ts-ignore
  schema.pre(
    'count',
    async function (this, next: (err?: CallbackError) => void) {
      if (this.getFilter().IsDeleted === true) {
        return next();
      }
      this.setQuery({ ...this.getFilter(), IsDeleted: false });
      next();
    },
  );

  schema.static('findDeleted', async function () {
    return this.find({ IsDeleted: true });
  });

  schema.static('restore', async function (query) {
    // add {IsDeleted: true} because the method find is set to filter the non deleted documents only,
    // so if we don't add {IsDeleted: true}, it won't be able to find it
    const updatedQuery = {
      ...query,
      IsDeleted: true,
    };

    const deletedTemplates = await this.find(updatedQuery);
    if (!deletedTemplates) {
      return Error('Not Found');
    }

    let restored = 0;
    for (const deletedTemplate of deletedTemplates) {
      if (deletedTemplate.IsDeleted) {
        deletedTemplate.$IsDeleted(false);
        deletedTemplate.IsDeleted = false;
        deletedTemplate.DeletedAt = null;
        await deletedTemplate
          .save()
          .then(() => restored++)
          .catch((e: mongoose.Error) => {
            throw new Error(e.name + ' ' + e.message);
          });
      }
    }
    return { restored };
  });

  schema.static('softDelete', async function (query, options?: SaveOptions) {
    const templates = await this.find(query);
    if (!templates) {
      return Error('Not Found');
    }

    let deleted = 0;
    for (const template of templates) {
      if (!template.IsDeleted) {
        template.$IsDeleted(true);
        template.IsDeleted = true;
        template.DeletedAt = new Date();
        await template
          .save(options)
          .then(() => deleted++)
          .catch((e: mongoose.Error) => {
            throw new Error(e.name + ' ' + e.message);
          });
      }
    }
    return { deleted };
  });
};
