// api/upload.js
import fs from 'fs';
import fetch from 'node-fetch';
import formidable from 'formidable';

export const config = {
  api: { bodyParser: false } // Required for file uploads
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      res.status(500).json({ error: 'Error parsing file' });
      return;
    }

    try {
      const file = files.file;

      const fileData = fs.readFileSync(file.filepath);

      const response = await fetch('https://api.nft.storage/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.NFT_KEY}` },
        body: fileData
      });

      const data = await response.json();

      if (data && data.value && data.value.cid) {
        const cid = data.value.cid;
        const url = `https://ipfs.io/ipfs/${cid}/${file.originalFilename}`;
        res.status(200).json({ url, cid });
      } else {
        res.status(500).json({ error: 'Upload failed', details: data });
      }
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Server error' });
    }
  });
        }
