const { Transform } = require("stream");

const sanitizeCsvCell = (cell) => {
  if (cell === null || cell === undefined) return "";

  const value = String(cell).trim(); // trim prevents whitespace bypass
  if (value.length === 0) return "";

  const dangerousChars = ["=", "+", "-", "@"];
  if (dangerousChars.includes(value[0])) {
    return `\t${value}`;
  }

  return value;
};

const escapeCsvValue = (value) => {
  const stringValue = String(value);
  const needsQuotes = /[",\n\r\t]/.test(stringValue); // added \t to trigger quoting for sanitised cells
  const escaped = stringValue.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
};

const buildCsvHeaderLine = (headers) => {
  return `${headers.map((header) => escapeCsvValue(header.label)).join(",")}\n`;
};

const buildCsvRowLine = (headers, row) => {
  const line = headers
    .map((header) => {
      const rawValue = row[header.key];
      const safeValue = sanitizeCsvCell(rawValue);
      return escapeCsvValue(safeValue);
    })
    .join(",");
  return `${line}\n`;
};

const createCsvTransform = (headers) => {
  let headerWritten = false;

  return new Transform({
    readableObjectMode: false, 
    writableObjectMode: true,  

    _transform(row, _encoding, callback) {
      try {
        if (!headerWritten) {
          this.push(buildCsvHeaderLine(headers));
          headerWritten = true;
        }
        this.push(buildCsvRowLine(headers, row));
        callback();
      } catch (err) {
        callback(err);
      }
    },

    _flush(callback) {
      if (!headerWritten) {
        this.push(buildCsvHeaderLine(headers));
      }
      callback();
    },
  });
};

module.exports = {
  sanitizeCsvCell,
  escapeCsvValue,
  buildCsvHeaderLine,
  buildCsvRowLine,
  createCsvTransform,
};