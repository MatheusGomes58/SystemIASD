const firebaseConfig = {
    apiKey: "AIzaSyAEEYZKzvkZsn7Jfql0gPjdmuRgmqOCX3Y",
    authDomain: "systemiasd.firebaseapp.com",
    projectId: "systemiasd",
    storageBucket: "systemiasd.appspot.com",
    messagingSenderId: "1024933571418",
    appId: "1:1024933571418:web:abc3e9e106b8385966a163"
}

firebase.initializeApp(firebaseConfig);

// Referência para o Firestore e Storage
var db = firebase.firestore();
var storage = firebase.storage();

// Função para criar uma nova seção
function createSection(title, content, image) {
    db.collection("secoes").add({
        titulo: title,
        conteudo: content,
        imagem: image
    })
        .then(function (docRef) {
            console.log("Seção criada com ID: ", docRef.id);
        })
        .catch(function (error) {
            console.error("Erro ao criar seção: ", error);
        });
}

// Função para carregar as seções do Firestore
function loadSections() {
    var sectionsContainer = document.getElementById("sections-container");
    sectionsContainer.innerHTML = "";

    db.collection("secoes").get()
        .then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                var sectionData = doc.data();
                var sectionElement = document.createElement("div");
                sectionElement.innerHTML = `
            <div style="color: white;">
              <h1 class="py-4 h1" style="color: white; background-color: #173f74; font-size:250%">
                ${sectionData.titulo}`
                if (this.document.title != 'IASD Santa Mônica | HOME') {
                    sectionElement.innerHTML += `<button onclick="deleteSection('${doc.id}')" class="btn btn-danger btn-sm float-end">Excluir</button>`
                }
                sectionElement.innerHTML += `</h1>
              <img src="${sectionData.imagem}" class="img-fluid rounded">
              <p style="font-size:150%">${sectionData.conteudo}</p>
            </div>
          `;
                sectionsContainer.appendChild(sectionElement);
            });
        })
        .catch(function (error) {
            console.error("Erro ao carregar seções: ", error);
        });
}

function deleteSection(sectionId, imageUrl) {
    db.collection("secoes").doc(sectionId).delete()
        .then(function () {
            console.log("Seção excluída com sucesso!");
            // Remover a imagem do Storage
            var storageRef = storage.refFromURL(imageUrl);
            storageRef.delete()
                .then(function () {
                    console.log("Imagem excluída do Storage com sucesso!");
                    // Recarregar as seções após a exclusão
                    loadSections();
                })
                .catch(function (error) {
                    console.error("Erro ao excluir imagem do Storage: ", error);
                });
        })
        .catch(function (error) {
            console.error("Erro ao excluir seção: ", error);
        });
}

// Evento de envio do formulário para criar uma nova seção
function cadastrar() {
    var title = document.getElementById("section-title").value;
    var content = document.getElementById("section-content").value;
    var image = document.getElementById("section-image").files[0];

    // Upload da imagem para o Storage
    var storageRef = storage.ref("images/" + image.name);
    var uploadTask = storageRef.put(image);

    uploadTask.on("state_changed",
        function (snapshot) {
            // Acompanhar o progresso do upload, se necessário
        },
        function (error) {
            console.error("Erro ao fazer upload da imagem: ", error);
        },
        function () {
            // Quando o upload da imagem for concluído, obter a URL da imagem
            uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
                createSection(title, content, downloadURL);
            });
        }
    );
}

// Carregar as seções ao carregar a página
window.addEventListener("load", function () {
    loadSections();
});
