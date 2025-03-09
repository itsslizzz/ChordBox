import { auth, db, initializeApp} from "./FireBase-Config.js";
import { getStorage, ref, uploadBytes, getDownloadURL} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js"
import { getFirestore, collection, addDoc, onSnapshot} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js"

import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Registro de usuario
document.getElementById("register").addEventListener("click", () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      alert("Registro exitoso");
      console.log("Usuario registrado:", userCredential.user);
    })
    .catch((error) => {
      alert("Error: " + error.message);
    });
});

// Iniciar sesión
document.getElementById("login").addEventListener("click", () => {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      alert("Inicio de sesión exitoso");
      console.log("Usuario logueado:", userCredential.user);
    })
    .catch((error) => {
      alert("Error: " + error.message);
    });
});

// Cerrar sesión
document.getElementById("logout").addEventListener("click", () => {
  signOut(auth).then(() => {
    alert("Sesión cerrada");
  }).catch((error) => {
    alert("Error al cerrar sesión: " + error.message);
  });
});

// Verificar si hay un usuario autenticado
onAuthStateChanged(auth, (user) => {
  const userInfo = document.getElementById("user-info");
  if (user) {
    userInfo.textContent = user.email;
  } else {
    userInfo.textContent = "No hay usuario conectado";
  }
});

// Bloque para la subida de album

const firebaseConfig = {
  apiKey: "AIzaSyBf6pH4qUfoQNmHN4mFDYywE4_ORRo7z4w",
  authDomain: "chordbox-360a3.firebaseapp.com",
  databaseURL: "https://chordbox-360a3-default-rtdb.firebaseio.com",
  projectId: "chordbox-360a3",
  storageBucket: "chordbox-360a3.firebasestorage.app",
  messagingSenderId: "25066021446",
  appId: "1:25066021446:web:579891ee2c9f159589a047"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage();
const firestore = getFirestore();
const albumsContainer = document.getElementById('albumsContainer');

// Obtén una referencia a la colección "fotos" en Firestore
const fotosCollection = collection(firestore, 'fotos');

document.addEventListener('DOMContentLoaded', function () {
  const AlbumFile = document.getElementById('AlbumFile');
  const albumTitle = document.getElementById('albumTitle');
  const albumArtist = this.getElementById('albumArtist');
  const submit = document.getElementById('submit');

  if (submit) {
    submit.addEventListener('click', subirImagen);
  }

  // Escucha cambios en la colección 'fotos' en tiempo real
  onSnapshot(fotosCollection, (snapshot) => {
      // Obtén los documentos de la colección 'fotos'
      const fotos = snapshot.docs.map(doc => doc.data());
      // Muestra todas las imágenes en la lista
      mostrarImagenesEnLista(fotos);
  });
});

async function subirImagen() {
  // Verificar si el usuario está autenticado
  if (!auth.currentUser) {
      alert("Debes iniciar sesión para subir un álbum.");
      return;
  }

  const AlbumFile = document.getElementById('AlbumFile');
  const albumTitle = document.getElementById('albumTitle');
  const albumArtist = document.getElementById('albumArtist');

  // Limpiar errores previos
  document.getElementById('titleError').textContent = "";
  document.getElementById('artistError').textContent = "";
  document.getElementById('coverError').textContent = "";

  let valid = true;

  // Validaciones
  if (albumTitle.value.trim() === "") {
      alert("El título es obligatorio.");
      valid = false;
  }
  if (albumArtist.value.trim() === "") {
      alert("El nombre del artista es obligatorio.");
      valid = false;
  }
  if (!AlbumFile || AlbumFile.files.length === 0) {
      alert("Debes subir una foto de portada.");
      valid = false;
  }

  // Si falta información, detener la ejecución
  if (!valid) return;

  // Si todo está bien, proceder con la subida
  try {
      const file = AlbumFile.files[0];
      const AlbumName = file.name;
      const storageRef = ref(storage, `fotos/${AlbumName}`);
      await uploadBytes(storageRef, file);

      // Obtén la URL de descarga
      const downloadURL = await getDownloadURL(storageRef);

      // Agrega la URL y los datos asociados a la colección 'fotos' en Firestore
      await addDoc(fotosCollection, {
          url: downloadURL,
          titulo: albumTitle.value,
          Nombre: albumArtist.value,
          usuarioId: auth.currentUser.uid // Guarda el ID del usuario que subió el álbum
      });

      // Limpiar los campos después de la carga
      AlbumFile.value = '';
      albumTitle.value = '';
      albumArtist.value = '';

      alert("Álbum subido con éxito.");

  } catch (error) {
      console.error('Error al subir la imagen:', error);
      alert('Error al subir la imagen');
  }
}


function mostrarImagenesEnLista(fotos) {
  const albumsContainer = document.getElementById('albumsContainer');

  if (albumsContainer) {
      // Limpiar la lista antes de mostrar nuevas imágenes
      albumsContainer.innerHTML = '';

      // Iterar sobre las imágenes y crear elementos de imagen, título y descripción
      fotos.forEach((foto) => {
          // Contenedor para cada elemento
          const container = document.createElement('div');
          container.classList.add('album-container');

          // Imagen
          const imgElement = document.createElement('img');
          imgElement.src = foto.url;
          imgElement.classList.add('uploaded-album');
          container.appendChild(imgElement);

          // Título
          const tituloElement = document.createElement('p');
          tituloElement.textContent = `Título: ${foto.titulo}`;
          tituloElement.classList.add('album-title');
          container.appendChild(tituloElement);

          // Artista 
          const artistaElement = document.createElement('p');
          artistaElement.textContent = `Artista: ${foto.Nombre}`;
          artistaElement.classList.add('album-title');
          container.appendChild(artistaElement);

          // Agregar el contenedor al imageList
          albumsContainer.appendChild(container);
      });
  }
}
