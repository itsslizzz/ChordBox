import { auth, db } from "./FireBase-Config.js";
import { collection, addDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

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


onAuthStateChanged(auth, (user) =>{
    document.getElementById("review").style.display = user ? "block" : "none";
    document.getElementById("rating").style.display = user ? "block" : "none";
    document.getElementById("submit-review").style.display = user ? "block" : "none";
});