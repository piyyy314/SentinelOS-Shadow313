module.exports = function handler(req, res) {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");

  res.end(
    JSON.stringify({
      status: "online",
      service: "Shadow313",
      version: "1.0.0",
      timestamp: new Date().toISOString()
    })
  );
};
