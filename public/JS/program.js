// Configurar o Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAEEYZKzvkZsn7Jfql0gPjdmuRgmqOCX3Y",
    authDomain: "systemiasd.firebaseapp.com",
    projectId: "systemiasd",
    storageBucket: "systemiasd.appspot.com",
    messagingSenderId: "1024933571418",
    appId: "1:1024933571418:web:abc3e9e106b8385966a163"
};

var diasDaSemana = [
    "Domingo",
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
    "Todos"
];

firebase.initializeApp(firebaseConfig);
// Referência para o Firestore
var db = firebase.firestore();
var storage = firebase.storage();

// Referência para a coleção de categorias
var categoriasRef = db.collection('categorias');

// Referência para a coleção de cronogramas
var cronogramaRef = db.collection('cronograma');

// Elementos do DOM categoria
var categoriaIDALL = document.getElementById('catID');
var categoriaInput = document.getElementById('categoriaInput');
var categoriaDay = document.getElementById('dayOfWeek');
var categoriaSatus = document.getElementById('switchCategoria');
var categoriaSequence = document.getElementById('categoriaOrder');
var categoriaList = document.getElementById('categoriasList');
var categoriaSelect = document.getElementById('categoriaSelect');

// Elementos do DOM Cronograma
var idCronInput = document.getElementById('idCron');
var horarioInput = document.getElementById('horarioInput');
var acaoInput = document.getElementById('acaoInput');
var responsavelInput = document.getElementById('responsavelInput');
var cronogramaList = document.getElementById('cronogramaList');
var selectedOption = document.getElementById("seletor");
var textInput = document.getElementById("link");
var fileInput = document.getElementById("file");

// Função para criar uma categoria
function criarCategoria() {
    var nome = categoriaInput.value;
    var posicao = categoriaSequence.value;
    var Day = categoriaDay.value;
    var Satus = categoriaSatus.checked;

    // Verificar se a categoria já existe
    categoriasRef.where("nome", "==", nome).get()
        .then(function (querySnapshot) {
            if (querySnapshot.empty) {
                // Criar nova categoria
                categoriasRef.add({
                    nome: nome,
                    posicao: parseInt(posicao),
                    DIA: parseInt(Day),
                    STATE: Satus
                })
                    .then(function () {
                        categoriaIDALL.value = "";
                        categoriaInput.value = "";
                        categoriaSequence.value = "";
                        categoriaDay.value = "";
                        categoriaSatus.checked = false;
                        buscarCategoriasECronograma();
                    })
                    .catch(function (error) {
                        console.error('Erro ao criar categoria: ', error);
                    });
            } else {
                // Atualizar categoria existente
                querySnapshot.forEach(function (doc) {
                    categoriasRef.doc(doc.id).update({
                        nome: nome,
                        posicao: parseInt(posicao),
                        DIA: parseInt(Day),
                        STATE: Satus
                    })
                        .then(function () {
                            categoriaIDALL.value = "";
                            categoriaInput.value = "";
                            categoriaSequence.value = "";
                            categoriaDay.value = "";
                            categoriaSatus.checked = false;
                            buscarCategoriasECronograma();
                        })
                        .catch(function (error) {
                            console.error('Erro ao atualizar categoria: ', error);
                        });
                });
            }
        })
        .catch(function (error) {
            console.error('Erro ao buscar categoria: ', error);
        });
}
function changeState(categoriaID, categoria, posicao, dia, checkbox){
    categoriasRef.doc(categoriaID).update({
        nome: categoria,
        posicao: parseInt(posicao),
        DIA: parseInt(dia),
        STATE: checkbox.checked
    })
}


function criarCronograma() {
    var cronogramaID = idCronInput.value;
    var categoriaId = categoriaSelect.value;
    var link = selectedOption.value;
    var horario = horarioInput.value;
    var acao = acaoInput.value;
    var responsavel = responsavelInput.value;
    var fileInputs = fileInput;
    var textInputs = textInput.value;

    if (!cronogramaID) {
        // Verificar se há uma imagem selecionada
        var file = fileInput.files[0];
        if (file) {
            // Criar uma referência para o arquivo no Firebase Storage
            var storageRef = firebase.storage().ref().child('imagens/' + file.name);

            // Fazer upload do arquivo para o Firebase Storage
            storageRef.put(file)
                .then(function (snapshot) {
                    console.log('Arquivo enviado com sucesso!');
                    return snapshot.ref.getDownloadURL();
                })
                .then(function (downloadURL) {
                    console.log('URL da imagem: ', downloadURL);
                    // Salvar o URL da imagem no Firestore
                    cronogramaRef.add({
                        categoria: categoriaId,
                        horario: horario,
                        acao: acao,
                        responsavel: responsavel,
                        imagemURL: downloadURL,
                        linkExterno: textInputs
                    })
                        .then(function (docRef) {
                            console.log('Cronograma criado com ID: ', docRef.id);
                        })
                        .catch(function (error) {
                            console.error('Erro ao criar cronograma: ', error);
                        });
                })
                .catch(function (error) {
                    console.error('Erro ao enviar o arquivo: ', error);
                });
        } else if (textInputs != "") {
            // Não há imagem selecionada, salvar apenas os outros dados no Firestore
            cronogramaRef.add({
                categoria: categoriaId,
                horario: horario,
                acao: acao,
                responsavel: responsavel,
                imagemURL: "",
                linkExterno: textInputs
            })
                .then(function (docRef) {
                    console.log('Cronograma criado com ID: ', docRef.id);
                })
                .catch(function (error) {
                    console.error('Erro ao criar cronograma: ', error);
                });
        } else {
            cronogramaRef.add({
                categoria: categoriaId,
                horario: horario,
                acao: acao,
                responsavel: responsavel,
                imagemURL: "",
                linkExterno: ""
            })
                .then(function (docRef) {
                    console.log('Cronograma criado com ID: ', docRef.id);
                })
                .catch(function (error) {
                    console.error('Erro ao criar cronograma: ', error);
                });
        }
    } else {
        if (link == 'A') {
            cronogramaRef.doc(cronogramaID).update({
                categoria: categoriaId,
                horario: horario,
                acao: acao,
                responsavel: responsavel,
                imagemURL: "",
                linkExterno: textInputs
            })
                .then(function () {
                    console.log('Cronograma Atualizado');
                })
                .catch(function (error) {
                    console.error('Erro ao criar cronograma: ', error);
                });
        } else if (link == 'B') {
            //APAGA O ARQUIVO DO LINK E COLOCA OUTRO NO LUGAR
        } else if (link == '') {
            if (textInputs.indexOf("firebasestorage") !== -1) {
                cronogramaRef.doc(cronogramaID).update({
                    categoria: categoriaId,
                    horario: horario,
                    acao: acao,
                    responsavel: responsavel,
                    imagemURL: "",
                    linkExterno: ""
                })
                    .then(function (docRef) {
                        // Criar uma referência para o arquivo no Firebase Storage
                        var storageRef = firebase.storage().refFromURL(textInputs);

                        // Excluir o arquivo do Firebase Storage
                        storageRef.delete()
                            .then(function () {
                                console.log("Arquivo excluído do Firebase Storage com sucesso!");
                            })
                            .catch(function (error) {
                                console.error("Erro ao excluir arquivo do Firebase Storage: ", error);
                            });
                    })
                    .catch(function (error) {
                        console.error('Erro ao criar cronograma: ', error);
                    });
            } else {
                cronogramaRef.doc(cronogramaID).update({
                    categoria: categoriaId,
                    horario: horario,
                    acao: acao,
                    responsavel: responsavel,
                    imagemURL: "",
                    linkExterno: ""
                })
            }
        }
    }
    idCronInput.value = "";
    categoriaSelect.value = "";
    horarioInput.value = "";
    acaoInput.value = "";
    responsavelInput.value = "";
    fileInput.value = "";
    textInput.value = "";
    selectedOption.value = "";

    buscarCategoriasECronograma();
}

// Função para atualizar um cronograma
function atualizarCronograma(key, categoriaId, horario, acao, responsavel, imagemURL, linkExterno) {

    const formSection = document.getElementById('cronograma');
    formSection.scrollIntoView({ behavior: 'smooth' });
    idCronInput.value = key;
    categoriaSelect.value = categoriaId;
    horarioInput.value = horario;
    acaoInput.value = acao;
    responsavelInput.value = responsavel;
    if (imagemURL) {
        selectedOption.value = "A";
        textInput.style.display = "block";
        fileInput.style.display = "none";
        textInput.value = imagemURL;
    }
    if (linkExterno) {
        selectedOption.value = "A";
        textInput.style.display = "block";
        fileInput.style.display = "none";
        textInput.value = linkExterno;
    }
    console.log(imagemURL)
    console.log(linkExterno)
}

function excluirCronograma(id) {
    cronogramaRef.doc(id).get()
        .then(function (doc) {
            if (doc.exists) {
                var data = doc.data();
                var imagemURL = data.imagemURL; // Obter o URL da imagem ou link

                // Excluir a categoria do Firestore
                cronogramaRef.doc(id).delete()
                    .then(function () {
                        console.log("Categoria excluída com sucesso!");

                        // Verificar se há um URL da imagem ou link
                        if (imagemURL) {
                            // Criar uma referência para o arquivo no Firebase Storage
                            var storageRef = firebase.storage().refFromURL(imagemURL);

                            // Excluir o arquivo do Firebase Storage
                            storageRef.delete()
                                .then(function () {
                                    console.log("Arquivo excluído do Firebase Storage com sucesso!");
                                })
                                .catch(function (error) {
                                    console.error("Erro ao excluir arquivo do Firebase Storage: ", error);
                                });
                        }
                    })
                    .catch(function (error) {
                        console.error("Erro ao excluir categoria: ", error);
                    });
            } else {
                console.log("Categoria não encontrada.");
            }
        })
        .catch(function (error) {
            console.error("Erro ao obter categoria: ", error);
        });

    buscarCategoriasECronograma();
}

function showInput() {
    if (selectedOption.value === "A") {
        textInput.style.display = "block";
        fileInput.style.display = "none";
    } else if (selectedOption.value === "B") {
        textInput.style.display = "none";
        fileInput.style.display = "block";
    } else {
        textInput.style.display = "none";
        fileInput.style.display = "none";
    }
}



// Função para renderizar as categorias e os cronogramas juntos
function renderizarCategoriasECronograma(categoriasSnapshot, cronogramaSnapshot, todasCategorias) {

    // Converter a coleção de categorias em um array
    const categoriasArray = categoriasSnapshot
    const CategoriasAll = [];
    todasCategorias.forEach(function (categoriaDoc) {
        const categoriaData = categoriaDoc.data();
        categoriaData.id = categoriaDoc.id;
        CategoriasAll.push(categoriaData);
    });

    // Ordenar o array de categorias pelo campo 'posicao' em ordem crescente
    categoriasArray.sort((a, b) => a.posicao - b.posicao);
    CategoriasAll.sort((a, b) => a.posicao - b.posicao);

    if (document.title == "LITURGIA EDITAVEL") {
        // Limpar a lista de categorias existentes
        categoriaList.innerHTML = '';

        var categoriaTable = document.createElement('table');
        categoriaTable.className = "table table-dark table-hover";
        categoriaTable.style = "margin-left: 5%; margin-right: 5%; max-width: 100%; margin: 0 auto; ";
        var categoriaBody = document.createElement('tbody');

        CategoriasAll.forEach(categoriaData => {
            var categoriaID = categoriaData.id;
            var categoria = categoriaData.nome;
            var posicao = categoriaData.posicao;
            var dia = categoriaData.DIA;
            var STATE = categoriaData.STATE;

            var categoriaItemData = document.createElement('tr');

            var categoriaItem = document.createElement('td');
            categoriaItem.innerHTML = categoria;
            categoriaItem.style = "white-space: pre-wrap; word-break: break-all; font-family: 'Comfortaa', sans-serif;";
            categoriaItemData.appendChild(categoriaItem);

            var posicaoItem = document.createElement('td');
            posicaoItem.innerHTML = posicao;
            posicaoItem.style = "white-space: pre-wrap; word-break: break-all; font-family: 'Comfortaa', sans-serif;";
            categoriaItemData.appendChild(posicaoItem);

            var posicaoItem = document.createElement('td');
            posicaoItem.innerHTML = diasDaSemana[dia];
            posicaoItem.style = "white-space: pre-wrap; word-break: break-all; font-family: 'Comfortaa', sans-serif;";
            categoriaItemData.appendChild(posicaoItem);

            var posicaoItem = document.createElement('td');
            posicaoItem.innerHTML = "<div class='form-check form-switch'><input class='form-check-input' type='checkbox' id='"+ categoriaID +"'style='display: flex; justify-content: center; align-items: center;' onchange='changeState(\""+categoriaID +"\",\""+ categoria+"\",\""+ posicao+"\",\""+ dia+"\","+"this)'></div>";
            categoriaItemData.appendChild(posicaoItem);

            var excluirButton = document.createElement('button');
            excluirButton.innerText = 'Excluir';
            excluirButton.className = "btn btn-outline-secondary";
            excluirButton.onclick = function () {
                excluirCategoria(categoriaID);
            };

            var editarButton = document.createElement('button');
            editarButton.innerText = 'Editar';
            editarButton.className = "btn btn-outline-secondary";
            editarButton.onclick = function () {
                editarCategoria(categoriaID, categoria, posicao, dia, STATE);
            };


            var editarButtom = document.createElement('td');
            var excluirButtom = document.createElement('td');
            excluirButtom.appendChild(excluirButton);
            editarButtom.appendChild(editarButton);
            categoriaItemData.appendChild(editarButtom);
            categoriaItemData.appendChild(excluirButtom);

            categoriaBody.appendChild(categoriaItemData);
        });
        categoriaTable.appendChild(categoriaBody);
        categoriaList.appendChild(categoriaTable);

        CategoriasAll.forEach(categoriaData => {
            var categoriaID = categoriaData.id;
            var STATE = categoriaData.STATE;
            document.getElementById(categoriaID).checked = STATE;
        })

        // Popula a lista de categorias no formulário de criação e edição de cronogramas
        categoriaSelect.innerHTML = '';
        categoriasArray.forEach(categoriaData => {
            var key = categoriaData.id;
            var nome = categoriaData.nome;

            var option = document.createElement('option');
            option.value = nome;
            option.innerText = nome;
            categoriaSelect.appendChild(option);
        });
    }
    // Limpar a lista de cronogramas existentes
    cronogramaList.innerHTML = '';

    // Renderizar as categorias e os cronogramas
    categoriasArray.forEach(categoriaData => {
        var categoriaKey = categoriaData.id;
        var categoriaNome = categoriaData.nome;

        // Renderizar o título da categoria centralizado
        var categoriaTitulo = document.createElement('h2');
        categoriaTitulo.style = "margin-top: 2%; margin-bottom: 3% color: white; background-color: #173f74; font-size:250%;"
        categoriaTitulo.className = "text-center py-4 h1";
        categoriaTitulo.innerText = categoriaNome;
        categoriaTitulo.style.textAlign = 'center';
        cronogramaList.appendChild(categoriaTitulo);
        var cronogramaTable = document.createElement('table');
        cronogramaTable.className = "table table-dark table-hover";
        var cronogramaBody = document.createElement('tbody');
        cronogramaTable.style = "margin-left: 5%; margin-right: 5%; max-width: 100%; margin: 0 auto; ";

        // Filtrar os cronogramas pertencentes à categoria atual
        var categoriaCronogramas = cronogramaSnapshot.docs.filter(function (cronogramaDoc) {
            return cronogramaDoc.data().categoria === categoriaNome;
        });

        // Ordenar os cronogramas por horário
        categoriaCronogramas.sort(function (a, b) {
            return a.data().horario.localeCompare(b.data().horario);
        });

        categoriaCronogramas.forEach(function (cronogramaDoc) {
            var key = cronogramaDoc.id;
            var horario = cronogramaDoc.data().horario;
            var acao = cronogramaDoc.data().acao;
            var responsavel = cronogramaDoc.data().responsavel;
            var linkExterno = cronogramaDoc.data().linkExterno;
            var imagemURL = cronogramaDoc.data().imagemURL;

            var cronogramaItem = document.createElement('tr');

            if (horario) {
                var horarioInput = document.createElement('td');
                horarioInput.innerHTML = horario;
                horarioInput.style = "white-space: pre-wrap; word-break: break-all; font-family: 'Comfortaa', sans-serif;";
                cronogramaItem.appendChild(horarioInput);
            } else {
                var horarioInput = document.createElement('td');
                cronogramaItem.appendChild(horarioInput);
            }

            if (acao) {
                var acaoInput = document.createElement('td');
                acaoInput.style = "width: 30%;";
                acaoInput.innerHTML = acao;
                acaoInput.style = "white-space: pre-wrap; word-break: break-all; font-family: 'Comfortaa', sans-serif;";
                cronogramaItem.appendChild(acaoInput);
            } else {
                var acaoInput = document.createElement('td');
                cronogramaItem.appendChild(acaoInput);
            }

            if (responsavel) {
                var responsavelInput = document.createElement('td');
                responsavelInput.innerHTML = responsavel;
                responsavelInput.style = "white-space: pre-wrap; word-break: break-all; font-family: 'Comfortaa', sans-serif;";
                cronogramaItem.appendChild(responsavelInput);
            } else {
                var responsavelInput = document.createElement('td');
                cronogramaItem.appendChild(responsavelInput);
            }

            if (linkExterno) {
                var imagemURLButtonTd = document.createElement('td');
                var linkExternoButton = document.createElement('button');
                linkExternoButton.className = "btn btn-outline-secondary";
                linkExternoButton.innerText = 'LINK';
                linkExternoButton.onclick = function () { abrirLinkEmNovaGuia(linkExterno); };
                linkExternoButton.value = linkExterno;
                imagemURLButtonTd.appendChild(linkExternoButton);
                cronogramaItem.appendChild(imagemURLButtonTd);
            }

            if (imagemURL) {
                var imagemURLButtonTd = document.createElement('td');
                var imagemURLButton = document.createElement('button');
                imagemURLButton.className = "btn btn-outline-secondary";
                imagemURLButton.innerText = 'FILE';
                imagemURLButton.onclick = function () { abrirLinkEmNovaGuia(imagemURL); };
                imagemURLButton.value = imagemURL;
                imagemURLButtonTd.appendChild(imagemURLButton);
                cronogramaItem.appendChild(imagemURLButtonTd);
            } else if (!linkExterno) {
                var imagemURLButtonTd = document.createElement('td');
                cronogramaItem.appendChild(imagemURLButtonTd);
            }

            if (document.title == "LITURGIA EDITAVEL") {
                var editarButton = document.createElement('button');
                editarButton.className = "btn btn-outline-secondary";
                editarButton.innerText = 'Editar';
                editarButton.onclick = function () {
                    var novaCategoriaId = categoriaNome;
                    var novoHorario = horario;
                    var novaAcao = acao;
                    var novoResponsavel = responsavel;
                    var novaimagemURL = imagemURL;
                    var novolinkExterno = linkExterno;

                    atualizarCronograma(key, novaCategoriaId, novoHorario, novaAcao, novoResponsavel, novaimagemURL, novolinkExterno);
                };
                imagemURLButtonTd.appendChild(editarButton)

                var excluirButton = document.createElement('button');
                excluirButton.className = "btn btn-outline-secondary";
                excluirButton.innerText = 'Excluir';
                excluirButton.onclick = function () {
                    excluirCronograma(key);
                };
                imagemURLButtonTd.appendChild(excluirButton)
                cronogramaItem.appendChild(imagemURLButtonTd)
            }
            cronogramaBody.appendChild(cronogramaItem)

            if (document.title != "LITURGIA EDITAVEL") {
                // Selecionar todos os elementos de input na tela
                const inputs = document.querySelectorAll('input');
                const inputxs = document.querySelectorAll('textarea');

                // Percorrer cada elemento de input e definir o atributo readonly
                inputs.forEach(input => {
                    input.readOnly = true;

                });

                // Percorrer cada elemento de input e definir o atributo readonly
                inputxs.forEach(input => {
                    input.readOnly = true;
                });
            }
        });
        cronogramaTable.appendChild(cronogramaBody);
        cronogramaList.appendChild(cronogramaTable);

    });
}

function abrirLinkEmNovaGuia(link) {
    window.open(link, "_blank");
}

function editarCategoria(categoriaID, categoria, posicao, dia, STATE) {
    const formSection = document.getElementById('cat');
    formSection.scrollIntoView({ behavior: 'smooth' });
    categoriaIDALL.value = categoriaID;
    categoriaInput.value = categoria;
    categoriaDay.value = dia;
    categoriaSatus.checked = STATE;
    categoriaSequence.value = posicao;
}

// Função para buscar categorias e cronogramas no Firestore
function buscarCategoriasECronograma() {
    var diaSemana = new Date().getDay();
    console.log([diaSemana, (diaSemana + 1), (diaSemana + 2), 7])
    if (document.title != "LITURGIA EDITAVEL") {
        var category = categoriasRef.where("DIA", "in", [diaSemana, (diaSemana + 1), (diaSemana + 2), 7]).where("STATE", "==", true);
    } else {
        var category = categoriasRef.where("STATE", "==", true);
    }

    category.get()
        .then(function (categoriasSnapshot) {
            // Obtém todas as categorias encontradas
            var categorias = [];
            categoriasSnapshot.forEach(function (categoriaDoc) {
                categorias.push(categoriaDoc.data());
            });

            return Promise.all([
                categorias, // Passa as categorias encontradas
                cronogramaRef.get(),
                categoriasRef.get()
            ]);
        })
        .then(function (results) {
            var categoriasEncontradas = results[0];
            var cronogramaSnapshot = results[1];
            var todasCategorias = results[2];

            renderizarCategoriasECronograma(categoriasEncontradas, cronogramaSnapshot, todasCategorias);
        })
        .catch(function (error) {
            console.error('Erro ao obter dados do Firestore: ', error);
        });
}

function excluirCategoria(id,) {
    categoriasRef.doc(id).delete()
        .catch(function (error) {
            console.error("Erro ao excluir categoria: ", error);
        });
    buscarCategoriasECronograma()
}


// Função para inicializar a página
function inicializarPagina() {
    if (document.title == "LITURGIA EDITAVEL") {
        // Registrar os eventos dos botões e formulários
        document.getElementById('criarCategoriaBtn').addEventListener('click', criarCategoria);
        document.getElementById('criarCronogramaBtn').addEventListener('click', criarCronograma);
    }
    // Carregar categorias e cronogramas do Firestore
    buscarCategoriasECronograma();
}

// Chamar a função para inicializar a página
inicializarPagina();