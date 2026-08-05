module.exports = function handler(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.statusCode = 405;
    res.setHeader("Allow", "GET, HEAD");
    return res.end();
  }

  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  res.end(
    JSON.stringify({
      status: "online",
      service: "Shadow313",
      version: "1.0.0",
      timestamp: new Date().toISOString()
    })
  );
};
