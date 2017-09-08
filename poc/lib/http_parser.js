const binding = process.binding('http_parser');
exports.methods = binding.methods;
exports.HTTPParser = binding.HTTPParser;