import { auth, db } from "./FireBase-Config.js";
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
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

const storage = getStorage(app);  // ✅ Correcto
// Obtener el formulario y los campos
const albumForm = document.getElementById("albumForm");
const albumTitle = document.getElementById("albumTitle");
const albumArtist = document.getElementById("albumArtist");
const albumFile = document.getElementById("AlbumFile");

// Manejar el envío del formulario para subir el álbum
albumForm.addEventListener("submit", (event) => {
  event.preventDefault(); // Prevenir recarga de página

  const title = albumTitle.value;
  const artist = albumArtist.value;
  const file = albumFile.files[0];  // Obtener el archivo seleccionado

  // Crear una referencia en Firebase Storage para el archivo subido
  const storageRef = storage.ref('albums/' + file.name);

  // Subir el archivo
  const uploadTask = storageRef.put(file);

  uploadTask.on('state_changed', 
    (snapshot) => {
      // Puedes monitorear el progreso de la subida (opcional)
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      console.log('Progreso: ' + progress + '%');
    }, 
    (error) => {
      console.error('Error al subir el archivo:', error);
      alert('Error al subir el archivo');
    }, 
    () => {
      // Cuando la subida se complete, obtener la URL del archivo
      uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
        console.log('Archivo disponible en:', downloadURL);
        // Aquí puedes guardar el álbum en Firestore si lo deseas
        firestore.collection('albums').add({
          title: title,
          artist: artist,
          imageUrl: downloadURL,
        })
        .then(() => {
          alert('Álbum subido correctamente');
          showAlbumInGallery(downloadURL, title, artist);  // Mostrar el álbum en la galería
        })
        .catch((error) => {
          console.error('Error al guardar en Firestore:', error);
          alert('Error al guardar el álbum en Firestore');
        });
      });
    }
  );
});

// Función para mostrar los álbumes en la galería
function showAlbumInGallery(url, title, artist) {
  const albumsContainer = document.getElementById("albumsContainer");
  const albumElement = document.createElement("div");

  // Crear un elemento para mostrar el álbum
  albumElement.innerHTML = `
    <div>
      <h4>${title}</h4>
      <p>Artista: ${artist}</p>
      <img src="${url}" alt="${title}" style="width: 200px; height: auto;">
    </div>
  `;

  // Agregar el álbum al contenedor
  albumsContainer.appendChild(albumElement);
}

// Cargar los álbumes desde Firestore y mostrarlos en la galería
window.onload = function() {
  firestore.collection('albums').get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      const album = doc.data();
      showAlbumInGallery(album.imageUrl, album.title, album.artist);  // Mostrar álbum en la galería
    });
  });
};
