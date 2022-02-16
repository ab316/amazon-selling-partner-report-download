const zlib = require("zlib");
const fs = require("fs");
const crypto = require("crypto");

const document = require("./response.json").payload;

async function init() {
  const details = document;
  const encryptedBuffer = await fetchFile(details);
  const decryptedBuffer = await decryptAndUnzipBuffer(encryptedBuffer, details);
  await writeFile(decryptedBuffer, "decrypted");
}

async function fetchFile(details) {
  const data = await request({ url: details.url });
  return Buffer.concat(data.chunks);
  // const encryptedBuffer = fs.readFileSync("report.T2B6RZTVPRT9JZ");
  // return encryptedBuffer;
}

async function decryptAndUnzipBuffer(encryptedBuffer, details) {
  let decryptedBuffer;

  var decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(details.encryptionDetails.key, "base64"),
    Buffer.from(details.encryptionDetails.initializationVector, "base64")
  );

  if (details.encryptionDetails) {
    decryptedBuffer = Buffer.concat([
      decipher.update(encryptedBuffer),
      decipher.final(),
    ]);
  } else {
    // TODO: clone the buffer instead
    decryptedBuffer = encryptedBuffer;
  }

  if (details.compressionAlgorithm) {
    decryptedBuffer = await unzip(decryptedBuffer);
  }

  return decryptedBuffer;
}

async function writeFile(buffer, filename) {
  return new Promise((resolve, reject) => {
    var writer = fs.createWriteStream(filename);
    writer.write(buffer);

    writer.on("error", (error) => {
      console.error(error.message || error);
      writerOne.close();
      reject(`${error.message || error}`);
    });
    writer.on("close", () => {
      resolve(filename);
    });
  });
}

async function unzip(buffer) {
  return new Promise((resolve, reject) => {
    zlib.gunzip(buffer, (err, unzipped_buffer) => {
      if (err) {
        reject(err);
      }
      resolve(unzipped_buffer);
    });
  });
}

async function request() {
  return new Promise((resolve, reject) => {
    let url = new URL(req_options.url);
    let options = {
      method: req_options.method,
      port: 443,
      hostname: url.hostname,
      path: url.pathname + url.search,
      headers: req_options.headers || {},
    };
    let post_params;
    if (req_options.body) {
      post_params = req_options.body;
      options.headers["Content-Length"] = Buffer.byteLength(post_params);
    }
    let req = https.request(options, (res) => {
      let chunks = [];
      let body = "";
      res.on("data", (chunk) => {
        body += chunk;
        chunks.push(chunk);
      });
      res.on("end", () => {
        resolve({
          body: body,
          chunks: chunks,
          statusCode: res.statusCode,
          headers: res.headers,
        });
      });
    });

    req.on("error", (e) => {
      reject(e);
    });
    if (post_params) {
      req.write(post_params, "utf8");
    }
    req.end();
  });
}

init();
