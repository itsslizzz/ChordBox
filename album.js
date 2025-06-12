import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
    addDoc,
    collection,
    deleteDoc,
    getDocs,
    onSnapshot,
    query,
    where
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { auth, db } from "./FireBase-Config.js";

// Obtener parámetros de la URL
document.addEventListener("DOMContentLoaded", function () {
  const params = new URLSearchParams(window.location.search);
  const titulo = params.get("titulo");
  const artista = params.get("artista");
  const imagen = params.get("imagen");

  if (titulo && artista && imagen) {
    document.getElementById("album-title").textContent = titulo;
    document.getElementById("album-artist").textContent = artista;
    document.getElementById("album-image").src = imagen;
  }
});

// Configurar la colección de reseñas en Firebase
const reviewsCollection = collection(db, "reviews");

// Enviar reseña
document.getElementById("submit-review").addEventListener("click", async () => {
  const reviewText = document.getElementById("review").value;
  const rating = document.getElementById("rating").value;
  const params = new URLSearchParams(window.location.search);
  const albumId = params.get("titulo"); // Usamos el título como identificador

  if (!reviewText.trim()) {
    alert("Escribe una reseña antes de enviar.");
    return;
  }

  await addDoc(reviewsCollection, {
    albumId,
    reviewText,
    rating,
    timestamp: new Date(),
  });

  document.getElementById("review").value = "";
  alert("Reseña enviada.");
});

// Cargar reseñas en tiempo real
onSnapshot(reviewsCollection, (snapshot) => {
  const params = new URLSearchParams(window.location.search);
  const albumId = params.get("titulo");
  const reviewsContainer = document.getElementById("reviews-container");
  reviewsContainer.innerHTML = "";

  snapshot.docs
    .filter(doc => doc.data().albumId === albumId)
    .forEach(doc => {
      const data = doc.data();
      const div = document.createElement("div");
      div.innerHTML = `<p>${data.reviewText} - ${"⭐".repeat(data.rating)}</p>`;
      reviewsContainer.appendChild(div);
    });
});

// Mostrar inputs de reseña si está autenticado
onAuthStateChanged(auth, (user) => {
  document.getElementById("review").style.display = user ? "block" : "none";
  document.getElementById("rating").style.display = user ? "block" : "none";
  document.getElementById("submit-review").style.display = user ? "block" : "none";
});

// Eliminar álbum si el usuario está logueado
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const titulo = params.get("titulo");
  const deleteBtn = document.getElementById("delete-album");

  onAuthStateChanged(auth, async (user) => {
    if (user && deleteBtn) {
      deleteBtn.style.display = "block";

      deleteBtn.addEventListener("click", async () => {
        const confirmDelete = confirm("¿Estás seguro de eliminar este álbum?");
        if (!confirmDelete) return;

        try {
          const q = query(collection(db, "fotos"), where("titulo", "==", titulo));
          const result = await getDocs(q);

          if (!result.empty) {
            const docRef = result.docs[0].ref;
            await deleteDoc(docRef);
            alert("Álbum eliminado exitosamente.");
            window.location.href = "index.html";
          } else {
            alert("No se encontró el álbum en la base de datos.");
          }
        } catch (error) {
          console.error("Error al eliminar el álbum:", error);
          alert("Error al eliminar el álbum.");
        }
      });
    }
  });
});
