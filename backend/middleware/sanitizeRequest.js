const dangerousMongoKeyPattern = /[$.]/;

const htmlEntities = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '`': '&#x60;',
};

const escapeHtml = (value) =>
  value.replace(/[&<>"'`]/g, (character) => htmlEntities[character]);

const sanitizeValue = (value) => {
  if (typeof value === 'string') {
    return escapeHtml(value);
  }

  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      value[index] = sanitizeValue(value[index]);
    }
    return value;
  }

  if (value && typeof value === 'object') {
    Object.keys(value).forEach((key) => {
      if (dangerousMongoKeyPattern.test(key)) {
        delete value[key];
        return;
      }

      value[key] = sanitizeValue(value[key]);
    });
  }

  return value;
};

const sanitizeRequest = (req, res, next) => {
  if (req.body) sanitizeValue(req.body);
  if (req.params) sanitizeValue(req.params);
  if (req.query) sanitizeValue(req.query);

  next();
};

export default sanitizeRequest;
