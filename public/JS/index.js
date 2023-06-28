const firebaseConfig = {
    apiKey: "AIzaSyAEEYZKzvkZsn7Jfql0gPjdmuRgmqOCX3Y",
    authDomain: "systemiasd.firebaseapp.com",
    projectId: "systemiasd",
    storageBucket: "systemiasd.appspot.com",
    messagingSenderId: "1024933571418",
    appId: "1:1024933571418:web:abc3e9e106b8385966a163"
};

firebase.initializeApp(firebaseConfig);

// Referência para o Firestore e Storage
var db = firebase.firestore();
var storage = firebase.storage();

// Função para criar uma nova seção
function createSection(title, contentBefore, image, contentAfter, nameLink, link) {
    // Substituir as quebras de linha por uma sequência especial
    var contentBeforeWithLineBreaks = contentBefore.replace(/\n/g, "<br>");

    db.collection("secoes").add({
        title: title,
        contentBefore: contentBefore,
        image: image,
        contentAfter: contentAfter,
        nameLink: nameLink,
        link: link
    })
        .then(function (docRef) {
            console.log("Seção criada com ID: ", docRef.id);
            loadSections();
            clearForm();
        })
        .catch(function (error) {
            console.error("Erro ao criar seção: ", error);
        });
}

// Função para atualizar uma seção existente
function updateSection(sectionId, title, contentBefore, image, contentAfter, nameLink, link) {
    // Substituir as quebras de linha por uma sequência especial
    var contentBeforeWithLineBreaks = contentBefore.replace(/\n/g, "<br>");

    db.collection("secoes").doc(sectionId).update({
        title: title,
        contentBefore: contentBefore,
        image: image,
        contentAfter: contentAfter,
        nameLink: nameLink,
        link: link
    })
        .then(function () {
            console.log("Seção atualizada com sucesso!");
            loadSections();
            clearForm();
        })
        .catch(function (error) {
            console.error("Erro ao atualizar seção: ", error);
        });
}

// Função para criar ou atualizar uma seção
function createOrUpdateSection(sectionId, title, contentBefore, image, contentAfter, nameLink, link) {
    if (sectionId) {
        updateSection(sectionId, title, contentBefore, image, contentAfter, nameLink, link);
    } else {
        createSection(title, contentBefore, image, contentAfter, nameLink, link);
    }
}

// Função para excluir uma seção
function deleteSection(sectionId, imageUrl) {
    db.collection("secoes").doc(sectionId).delete()
        .then(function () {
            console.log("Seção excluída com sucesso!");
            // Remover a imagem do Storage se existir
            if (imageUrl) {
                var storageRef = storage.refFromURL(imageUrl);
                storageRef.delete()
                    .then(function () {
                        console.log("Imagem excluída do Storage com sucesso!");
                        loadSections();
                    })
                    .catch(function (error) {
                        console.error("Erro ao excluir imagem do Storage: ", error);
                    });
            } else {
                loadSections();
            }
        })
        .catch(function (error) {
            console.error("Erro ao excluir seção: ", error);
        });
}

// Função para carregar os dados da seção no formulário de edição
function editSection(sectionId) {
    db.collection("secoes").doc(sectionId).get()
        .then(function (doc) {
            if (doc.exists) {
                var sectionData = doc.data();
                document.getElementById("section-id").value = sectionId;
                document.getElementById("section-title").value = sectionData.title;
                document.getElementById("section-content-before").value = sectionData.contentBefore.replace(/<br>/g, "\n");
                document.getElementById("section-content-after").value = sectionData.contentAfter.replace(/<br>/g, "\n");
                document.getElementById("section-name-link").value = sectionData.nameLink;
                document.getElementById("section-link").value = sectionData.link;
            } else {
                console.log("Seção não encontrada");
            }
        })
        .catch(function (error) {
            console.error("Erro ao obter dados da seção: ", error);
        });
}

// Função para limpar o formulário
function clearForm() {
    document.getElementById("section-id").value = "";
    document.getElementById("section-title").value = "";
    document.getElementById("section-content-before").value = "";
    document.getElementById("section-image").value = "";
    document.getElementById("section-content-after").value = "";
    document.getElementById("section-name-link").value = "";
    document.getElementById("section-link").value = "";
}

// Evento de envio do formulário para criar ou atualizar uma seção
function cadastrar() {
    event.preventDefault();
    var sectionId = document.getElementById("section-id").value;
    var title = document.getElementById("section-title").value;
    var contentBefore = document.getElementById("section-content-before").value;
    var image = document.getElementById("section-image").files[0];
    var contentAfter = document.getElementById("section-content-after").value;
    var nameLink = document.getElementById("section-name-link").value;
    var link = document.getElementById("section-link").value;

    // Upload da imagem para o Storage, se existir uma nova imagem selecionada
    if (image) {
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
                    createOrUpdateSection(sectionId, title, contentBefore, downloadURL, contentAfter, nameLink, link);
                });
            }
        );
    } else {
        // Se não houver uma nova imagem, manter a imagem existente (caso haja)
        if (sectionId) {
            db.collection("secoes").doc(sectionId).get()
            .then(function (doc) {
                if (doc.exists) {
                    var sectionData = doc.data();
                    createOrUpdateSection(sectionId, title, contentBefore, sectionData.image, contentAfter, nameLink, link);
                } else {
                    createOrUpdateSection(sectionId, title, contentBefore, "", contentAfter, nameLink, link);
                }
            })
            .catch(function (error) {
                console.error("Erro ao obter dados da seção: ", error);
            });
        }else {
            createOrUpdateSection(sectionId, title, contentBefore, "", contentAfter, nameLink, link);
        }
        
    }
};

function loadSections() {
    var sectionsContainer = document.getElementById("sections-container");
    sectionsContainer.innerHTML = "";

    db.collection("secoes").get()
        .then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                var sectionData = doc.data();
                var sectionElement = document.createElement("div");
                sectionElement.innerHTML += `<div style="color: white;">`;
                if (document.title != 'HOME') {
                    sectionElement.innerHTML += `<button onclick="deleteSection('${doc.id}', '${sectionData.image}')" class="btn btn-danger btn-sm float-end">Excluir</button>`;
                    sectionElement.innerHTML += `<button onclick="editSection('${doc.id}')" class="btn btn-primary btn-sm float-end me-2">Editar</button>`;
                } if (sectionData.title != "") {
                    sectionElement.innerHTML += `<h1 class="text-center py-4 h1" style="color: white; background-color: #173f74; font-size:250%">
                ${sectionData.title} </h1>`;
                }
                if (sectionData.contentBefore != "") {
                    var contentLines = sectionData.contentBefore.split('\n'); // Divide o conteúdo em linhas
                    sectionElement.innerHTML += `<div style="margin-bottom: 4%; margin-top: 4%;">`
                    for (var i = 0; i < contentLines.length; i++) {
                        sectionElement.innerHTML += `<p style="font-size:150%; margin-left: 5%; margin-right: 5%">${contentLines[i]}</p>`;
                    }
                    sectionElement.innerHTML += `</div">`
                }
                if (sectionData.image != "") {
                    sectionElement.innerHTML += `<div class="text-center"><img src="${sectionData.image}" class="img-fluid rounded"></div>`;
                }
                if (sectionData.contentAfter != "") {
                    var contentLines = sectionData.contentAfter.split('\n'); // Divide o conteúdo em linhas
                    sectionElement.innerHTML += `<div style="margin-bottom: 4%; margin-top: 4%;">`
                    for (var i = 0; i < contentLines.length; i++) {
                        sectionElement.innerHTML += `<p style="font-size:150%; margin-left: 5%; margin-right: 5%">${contentLines[i]}</p>`;
                    }
                    sectionElement.innerHTML += `</div">`
                }
                if (sectionData.nameLink != "" && sectionData.link != "") {
                    sectionElement.innerHTML += ` <div class="text-center">
                <a href="${sectionData.link}" class="btn btn-secondary" style="font-size:150%; margin-bottom: 2%;">${sectionData.nameLink}</a>
              </div></div>`;
                }

                sectionsContainer.appendChild(sectionElement);
            });
        })
        .catch(function (error) {
            console.error("Erro ao carregar seções: ", error);
        });
}

// Carregar as seções ao carregar a página
window.addEventListener("load", function () {
    loadSections();
});
