import { auth, db, initializeApp } from "./FireBase-Config.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";
import { getFirestore, collection, addDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
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
    window.location.reload();
  }).catch((error) => {
    alert("Error al cerrar sesión: " + error.message);
  });
});

// Verificar si hay un usuario autenticado
onAuthStateChanged(auth, (user) => {
  const userInfo = document.getElementById("user-info");
  userInfo.textContent = user ? user.email : "No hay usuario conectado";
});

// Configuración de Firebase
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
const albumsContainer = document.getElementById("albumsContainer");
const fotosCollection = collection(firestore, "fotos");

document.addEventListener("DOMContentLoaded", function () {
  const submit = document.getElementById("submit");
  if (submit) {
    submit.addEventListener("click", subirImagen);
  }

  // Escucha cambios en la colección 'fotos' en tiempo real
  onSnapshot(fotosCollection, (snapshot) => {
    const fotos = snapshot.docs.map(doc => doc.data());
    mostrarImagenesEnLista(fotos);
  });
});

async function subirImagen() {
  if (!auth.currentUser) {
    alert("Debes iniciar sesión para subir un álbum.");
    return;
  }

  const AlbumFile = document.getElementById("AlbumFile");
  const albumTitle = document.getElementById("albumTitle");
  const albumArtist = document.getElementById("albumArtist");

  if (!albumTitle.value.trim() || !albumArtist.value.trim() || !AlbumFile.files.length) {
    alert("Todos los campos son obligatorios.");
    return;
  }

  try {
    const file = AlbumFile.files[0];
    const storageRef = ref(storage, `fotos/${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    await addDoc(fotosCollection, {
      url: downloadURL,
      titulo: albumTitle.value,
      Nombre: albumArtist.value,
      usuarioId: auth.currentUser.uid
    });

    AlbumFile.value = "";
    albumTitle.value = "";
    albumArtist.value = "";

    alert("Álbum subido con éxito.");
  } catch (error) {
    console.error("Error al subir la imagen:", error);
    alert("Error al subir la imagen");
  }
}

function mostrarImagenesEnLista(fotos) {
  if (!albumsContainer) return;
  albumsContainer.innerHTML = "";
  
  fotos.forEach((foto) => {
    const container = document.createElement("div");
    container.classList.add("album-container");

    const imgElement = document.createElement("img");
    imgElement.src = foto.url;
    imgElement.classList.add("uploaded-album");
    container.appendChild(imgElement);

    albumsContainer.appendChild(container);
    // evento para redirigir a album.html para calificar
    imgElement.addEventListener("click", () => {
      window.location.href = `album.html?titulo=${encodeURIComponent(foto.titulo)}&artista=${encodeURIComponent(foto.Nombre)}&imagen=${encodeURIComponent(foto.url)}`;
    });
  });
}

onAuthStateChanged(auth, (user) => {
  document.querySelector(".ShowSign").style.display = user ? "none" : "block";
  document.querySelector(".ShowCreate").style.display = user ? "none" : "block";
  document.querySelector(".SubirAlbumes").style.display = user ? "block" : "none";
  document.getElementById("logout").style.display = user ? "block" : "none";
  document.querySelector(".showMessage").style.display = user ? "none" : "block";
});


// Definir las variables globalmente
let RegisterVentana = document.getElementById("registerVentana");
let LoginVentana = document.getElementById("LoginVentana");

// bloque para redirijir al usuario a iniciar sesion
document.getElementById("goToLogin").addEventListener("click", function(event) {
  event.preventDefault();

  let loginInput = document.getElementById("login-email");

  LoginVentana.style.display = "block";

  loginInput.scrollIntoView({ behavior: "smooth", block: "center" });
  loginInput.focus();
});

// bloque para redirijir al usuario para crear su cuenta
document.getElementById("goToRegister").addEventListener("click", function(event){
  event.preventDefault();

  let RegisterInput = document.getElementById("email");

  RegisterVentana.style.display = "block";

  RegisterInput.scrollIntoView({ behavior: "smooth", block: "center"});
  RegisterInput.focus();
})

// Cerrar la ventana emergente si el usuario hace clic fuera de ella (login)
document.addEventListener("click", function(event) {
  if (LoginVentana.style.display === "block" && !LoginVentana.contains(event.target) && event.target.id !== "goToLogin") {
      LoginVentana.style.display = "none";
  }
});

// Cerrar la ventana emergente si el usuario hace clic fuera de ella (registro)
document.addEventListener("click", function(event) {
  if (RegisterVentana && RegisterVentana.style.display === "block" && !RegisterVentana.contains(event.target) && event.target.id !== "goToRegister") {
      RegisterVentana.style.display = "none";
  }
});