const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

const dataFilePath = 'data.json';

function loadData() {
  try {
    const data = fs.readFileSync(dataFilePath);
    return JSON.parse(data);
  } catch (error) {
    return { albums: [] };
  }
}

function saveData(data) {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



// Visualizza tutti gli album
app.get('/albums', (req, res) => {
  const data = loadData();
  res.json(data.albums);
});



// Crea un nuovo album
app.post('/albums', (req, res) => {
  const { nome, hashtags } = req.body;
  const newAlbum = {
    _id: generateUniqueId(),
    nome,
    fotografie: [],
    hashtags,
    data_creazione: new Date().toISOString(),
    data_modifica: new Date().toISOString(),
  };

  const data = loadData();
  data.albums.push(newAlbum);
  saveData(data);

  res.json(newAlbum);
});

// Visualizza un singolo album
app.get('/albums/:albumId', (req, res) => {
  const data = loadData();
  const album = data.albums.find((album) => album._id === req.params.albumId);
  res.json(album);
  
});

// Cancella un album
app.delete('/albums/:albumId', (req, res) => {
  const data = loadData();
  const index = data.albums.findIndex((album) => album._id === req.params.albumId);

  if (index !== -1) {
    data.albums.splice(index, 1);
    saveData(data);
    res.json({ message: 'Album deleted successfully' });
  } else {
    res.status(404).json({ message: 'Album not found' });
  }
});

// Aggiungi una nuova foto a un album
app.post('/albums/:albumId/photos', (req, res) => {
  const { nome, hashtags } = req.body;
  const newPhoto = {
    _id: generateUniqueId(),
    nome,
    data_creazione: new Date().toISOString(),
    data_modifica: new Date().toISOString(),
    hashtags,
  };

  const data = loadData();
  const album = data.albums.find((album) => album._id === req.params.albumId);

  if (album) {
    album.fotografie.push(newPhoto);
    album.data_modifica = new Date().toISOString();
    saveData(data);
    res.json(album);
  } else {
    res.status(404).json({ message: 'Album not found' });
  }
});

// Rimuovi una foto da un album
app.delete('/albums/:albumId/photos/:photoId', (req, res) => {
  const data = loadData();
  const album = data.albums.find((album) => album._id === req.params.albumId);

  if (album) {
    const photoIndex = album.fotografie.findIndex((photo) => photo._id === req.params.photoId);

    if (photoIndex !== -1) {
      album.fotografie.splice(photoIndex, 1);
      album.data_modifica = new Date().toISOString();
      saveData(data);
      res.json(album);
    } else {
      res.status(404).json({ message: 'Photo not found in the album' });
    }
  } else {
    res.status(404).json({ message: 'Album not found' });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

function generateUniqueId() {
  return '_' + Math.random().toString(36).substr(2, 9);
}
