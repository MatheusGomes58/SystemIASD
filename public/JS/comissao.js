// Configurar o Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAEEYZKzvkZsn7Jfql0gPjdmuRgmqOCX3Y",
    authDomain: "systemiasd.firebaseapp.com",
    projectId: "systemiasd",
    storageBucket: "systemiasd.appspot.com",
    messagingSenderId: "1024933571418",
    appId: "1:1024933571418:web:abc3e9e106b8385966a163"
};

firebase.initializeApp(firebaseConfig);
// Referência para o Firestore
var db = firebase.firestore();
var storage = firebase.storage();
var categoriaReader = "";
var categoriasPesquisadas = [];

// Referência para a coleção de categorias
var categoriasRef = db.collection('departamento');

// Referência para a coleção de cronogramas
var cronogramaRef = (document.title == "INDICAÇÃO") ? db.collection('sugestões') : db.collection('lideres');

// Elementos do DOM categoria
var categoriaIDALL = document.getElementById('catID');
var categoriaInput = document.getElementById('categoriaInput');
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

    // Verificar se a categoria já existe
    categoriasRef.where("nome", "==", nome).get()
        .then(function (querySnapshot) {
            if (querySnapshot.empty) {
                // Criar nova categoria
                categoriasRef.add({
                    nome: nome,
                    posicao: parseInt(posicao)
                })
                    .then(function () {
                        categoriaIDALL.value = "";
                        categoriaInput.value = "";
                        categoriaSequence.value = "";
                        buscarCategorias();
                    })
                    .catch(function (error) {
                        console.error('Erro ao criar categoria: ', error);
                    });
            } else {
                // Atualizar categoria existente
                querySnapshot.forEach(function (doc) {
                    categoriasRef.doc(doc.id).update({
                        nome: nome,
                        posicao: parseInt(posicao)
                    })
                        .then(function () {
                            categoriaIDALL.value = "";
                            categoriaInput.value = "";
                            categoriaSequence.value = "";
                            buscarCategorias();
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


function criarCronograma() {
    var cronogramaID = idCronInput.value;
    var categoriaId = categoriaSelect.value;
    var horario = horarioInput.value;
    var acao = acaoInput.value;
    var responsavel = responsavelInput.value;

    if (!cronogramaID) {
        cronogramaRef.add({
            categoria: categoriaId,
            horario: horario,
            acao: acao,
            responsavel: responsavel
        })
            .then(function (docRef) {
                console.log('Cronograma criado com ID: ', docRef.id);
            })
            .catch(function (error) {
                console.error('Erro ao criar cronograma: ', error);
            });
    } else {
        cronogramaRef.doc(cronogramaID).update({
            categoria: categoriaId,
            horario: horario,
            acao: acao,
            responsavel: responsavel
        })
            .then(function (docRef) {
                console.log('Cronograma criado com ID: ', docRef.id);
            })
            .catch(function (error) {
                console.error('Erro ao criar cronograma: ', error);
            });
    }

    idCronInput.value = "";
    categoriaSelect.value = "";
    horarioInput.value = "";
    acaoInput.value = "";
    responsavelInput.value = "";


    buscarCategorias();
}


// Função para atualizar um cronograma
function atualizarCronograma(key, categoriaId, horario, acao, responsavel) {
    const formSection = document.getElementById('cronograma');
    formSection.scrollIntoView({ behavior: 'smooth' });
    idCronInput.value = key;
    categoriaSelect.value = categoriaId;
    horarioInput.value = horario;
    acaoInput.value = acao;
    responsavelInput.value = responsavel;
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

    buscarCategoriaECronograma()
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
function renderizarCategorias(categoriasSnapshot) {

    // Converter a coleção de categorias em um array
    const categoriasArray = categoriasSnapshot.docs.map(doc => { const data = doc.data(); return { id: doc.id, ...data }; });
    // Ordenar o array de categorias pelo campo 'posicao' em ordem crescente
    categoriasArray.sort((a, b) => a.posicao - b.posicao);
    categoriasPesquisadas = categoriasArray;

    if (document.title == "COMISSÃO EDITAVEL") {
        // Limpar a lista de categorias existentes
        categoriaList.innerHTML = '';

        var categoriaTable = document.createElement('table');
        categoriaTable.className = "table table-dark table-hover";
        categoriaTable.style = "margin-left: 5%; margin-right: 5%; max-width: 100%; margin: 0 auto; ";
        var categoriaBody = document.createElement('tbody');

        categoriasPesquisadas.forEach(categoriaData => {
            var categoriaID = categoriaData.id;
            var categoria = categoriaData.nome;
            var posicao = categoriaData.posicao;

            var categoriaItemData = document.createElement('tr');
            categoriaItemData.className = "table-created"

            var categoriaItem = document.createElement('td');
            categoriaItem.innerHTML = categoria;
            categoriaItemData.appendChild(categoriaItem);

            if (document.title == "COMISSÃO EDITAVEL") {
                var posicaoItem = document.createElement('td');
                posicaoItem.innerHTML = posicao;
                categoriaItemData.appendChild(posicaoItem);
            }

            var exibirCategoria = document.createElement('button');
            exibirCategoria.innerText = 'Exibir';
            exibirCategoria.className = "btn btn-outline-secondary";
            if (posicao == 0) {
                exibirCategoria.onclick = function () {
                    categoriasArray.forEach(categoriaData => {
                        var nome = categoriaData.nome;
                        var posicao = categoriaData.posicao;
                        if (posicao != 0) {
                            buscarCronograma(nome);
                        }
                    })
                };
            } else {
                exibirCategoria.onclick = function () {
                    categoriaReader = categoria;
                    buscarCronograma(categoria);
                };
            }
            var actionsCategorias = document.createElement('td');
            actionsCategorias.appendChild(exibirCategoria);

            if (document.title == "COMISSÃO EDITAVEL") {
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
                    editarCategoria(categoriaID, categoria, posicao);
                };
                actionsCategorias.appendChild(excluirButton);
                actionsCategorias.appendChild(editarButton);
            }
            categoriaItemData.appendChild(actionsCategorias);
            categoriaBody.appendChild(categoriaItemData);
        });

        categoriaTable.appendChild(categoriaBody);
        categoriaList.appendChild(categoriaTable);

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
    } else if (document.title == "INDICAÇÃO" && categoriaSelect) {
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
}

// Função para renderizar as categorias e os cronogramas juntos
function renderizarCronograma(categoriaNome, cronogramaSnapshot) {
    // Converter a coleção de categorias em um array
    const cronogramaArray = cronogramaSnapshot.docs.map(doc => { const data = doc.data(); return { id: doc.id, ...data }; });

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
    var categoriaCronogramas = cronogramaArray.filter(function (cronogramaDoc) {
        return cronogramaDoc.categoria === categoriaNome;
    });

    categoriaCronogramas.forEach(function (cronogramaDoc) {
        var key = cronogramaDoc.id;
        var dataObjeto = cronogramaDoc.horario;
        var horario = cronogramaDoc.horario;
        var acao = cronogramaDoc.acao;
        var responsavel = cronogramaDoc.responsavel;
        var validaMes = true;

        var cronogramaItem = document.createElement('tr');

        if (dataObjeto){
            var acaoInput = document.createElement('td');
            acaoInput.style = "width: 30%;";
            acaoInput.innerHTML = dataObjeto;
            acaoInput.style = "white-space: pre-wrap; word-break: break-all; font-family: 'Comfortaa', sans-serif;";
            cronogramaItem.appendChild(acaoInput);
        }else{
            var acaoInput = document.createElement('td');
            cronogramaItem.appendChild(acaoInput);
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

        if (document.title == "COMISSÃO EDITAVEL") {
            var cronogramaEdit = document.createElement('td');
            var editarButton = document.createElement('button');
            editarButton.className = "btn btn-outline-secondary";
            editarButton.innerText = 'Editar';
            editarButton.onclick = function () {
                var novaCategoriaId = categoriaNome;
                var novoHorario = horario;
                var novaAcao = acao;
                var novoResponsavel = responsavel;
                var newkey = key;

                atualizarCronograma(newkey, novaCategoriaId, novoHorario, novaAcao, novoResponsavel);
            };
            cronogramaEdit.appendChild(editarButton);

            var excluirButton = document.createElement('button');
            excluirButton.className = "btn btn-outline-secondary";
            excluirButton.innerText = 'Excluir';
            excluirButton.onclick = function () {
                excluirCronograma(key);
            };
            cronogramaEdit.appendChild(excluirButton);

            var editarButton = document.createElement('button');
            editarButton.className = "btn btn-outline-secondary";
            editarButton.innerText = 'Copiar';
            editarButton.onclick = function () {
                var novaCategoriaId = categoriaNome;
                var novoHorario = horario;
                var novaAcao = acao;
                var novoResponsavel = responsavel;

                atualizarCronograma("", novaCategoriaId, novoHorario, novaAcao, novoResponsavel);
            };
            cronogramaEdit.appendChild(editarButton);
            cronogramaItem.appendChild(cronogramaEdit)
        }
        cronogramaBody.appendChild(cronogramaItem)


    });
    cronogramaTable.appendChild(cronogramaBody);
    cronogramaList.appendChild(cronogramaTable);
}

function abrirLinkEmNovaGuia(link) {
    window.open(link, 'name', 'width=600,height=400')
}

function editarCategoria(categoriaID, categoria, posicao) {
    const formSection = document.getElementById('cat');
    formSection.scrollIntoView({ behavior: 'smooth' });
    categoriaIDALL.value = categoriaID;
    categoriaInput.value = categoria;
    categoriaSequence.value = posicao;
}

// Função para buscar categorias e cronogramas no Firestore
function buscarCategorias() {
    Promise.all([
        categoriasRef.get()
    ])
        .then(function (results) {
            var categoriasEncontradas = results[0];

            renderizarCategorias(categoriasEncontradas);
        })
        .catch(function (error) {
            console.error('Erro ao obter dados do Firestore: ', error);
        });
    if (document.title !== "INDICAÇÃO") {
        buscarCronograma(categoriaReader);
    }
}

// Função para buscar categorias e cronogramas no Firestore
function buscarCronograma(categoria) {
    if (categoria) {
        // Limpar a lista de cronogramas existentes
        cronogramaList ? cronogramaList.innerHTML = '' : "";

        Promise.all([
            cronogramaRef.where("categoria", "==", categoria).orderBy("horario", "asc").get()
        ])
            .then(function (results) {
                var cronogramaSnapshot = results[0];

                renderizarCronograma(categoria, cronogramaSnapshot);
            })
            .catch(function (error) {
                console.error('Erro ao obter dados do Firestore: ', error);
            });
    }
}


function excluirCategoria(id) {
    console.log(id)
    categoriasRef.doc(id).delete()
        .catch(function (error) {
            console.error("Erro ao excluir categoria: ", error);
        });
    buscarCategorias()
}

function buscarCategoriaECronograma() {
    // Limpar a lista de cronogramas existentes
    Promise.all([
        categoriasRef.get()
    ])
        .then(function (results) {
            var categoriasEncontradas = results[0];

            renderizarCategorias(categoriasEncontradas);
            categoriasPesquisadas.forEach(categoriaData => {
                var nome = categoriaData.nome;
                console.log(nome)
                var posicao = categoriaData.posicao;
                if (posicao != 0) {
                    buscarCronograma(nome)
                }
            });
        })
        .catch(function (error) {
            console.error('Erro ao obter dados do Firestore: ', error);
        });
}

// Função para inicializar a página
function inicializarPagina() {
    var botao1 = document.getElementById('criarCronogramaBtn')
    var botao2 = document.getElementById('criarCronogramaBtn')
    // Registrar os eventos dos botões e formulários
    botao1 ? botao1.addEventListener('click', criarCategoria) : "";
    botao2 ? botao2.addEventListener('click', criarCronograma) : "";
    // Carregar categorias e cronogramas do Firestore
    buscarCategoriaECronograma();
}

// Chamar a função para inicializar a página
inicializarPagina();