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

// Referência para a coleção de categorias
var categoriasRef = db.collection('categorias');

// Referência para a coleção de cronogramas
var cronogramaRef = db.collection('cronograma');

// Elementos do DOM
var categoriaInput = document.getElementById('categoriaInput');
var categoriaSequence = document.getElementById('categoriaOrder');
var categoriaList = document.getElementById('categoriasList');
var categoriaSelect = document.getElementById('categoriaSelect');
var horarioInput = document.getElementById('horarioInput');
var acaoInput = document.getElementById('acaoInput');
var responsavelInput = document.getElementById('responsavelInput');
var cronogramaList = document.getElementById('cronogramaList');
var fileInput = document.getElementById("file");
var textInput = document.getElementById("link");

// Função para criar uma categoria
function criarCategoria() {
    var nome = categoriaInput.value;
    var posicao = categoriaSequence.value;

    categoriasRef.add({
        nome: nome,
        posicao: posicao
    })
        .then(function () {
            categoriaInput.value = '';
            categoriaSequence.value = '';
            buscarCategoriasECronograma()
        })
        .catch(function (error) {
            console.error('Erro ao criar categoria: ', error);
        });
}

// Função para atualizar uma categoria
function atualizarCategoria(key, nome) {
    categoriasRef.doc(key).update({
        nome: nome
    }).then(buscarCategoriasECronograma())
        .catch(function (error) {
            console.error('Erro ao atualizar categoria: ', error);
        });
}

function criarCronograma() {
    var categoriaId = categoriaSelect.value;
    var horario = horarioInput.value;
    var acao = acaoInput.value;
    var responsavel = responsavelInput.value;
    var fileInputs = fileInput;
    var textInputs = textInput.value;



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
                    imagemURL: downloadURL
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
    } else if(textInputs != "") {
        // Não há imagem selecionada, salvar apenas os outros dados no Firestore
        cronogramaRef.add({
            categoria: categoriaId,
            horario: horario,
            acao: acao,
            responsavel: responsavel,
            linkExterno: textInputs
        })
        .then(function (docRef) {
            console.log('Cronograma criado com ID: ', docRef.id);
        })
        .catch(function (error) {
            console.error('Erro ao criar cronograma: ', error);
        });
    } else{
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
    }

    buscarCategoriasECronograma();
}

// Função para atualizar um cronograma
function atualizarCronograma(key, categoriaId, horario, acao, responsavel) {
    cronogramaRef.doc(key).update({
        categoria: categoriaId,
        horario: horario,
        acao: acao,
        responsavel: responsavel
    }).then(buscarCategoriasECronograma())
        .catch(function (error) {
            console.error('Erro ao atualizar cronograma: ', error);
        });
}

// Função para excluir um cronograma
function excluirCronograma(key) {
    cronogramaRef.doc(key).delete()
        .catch(function (error) {
            console.error('Erro ao excluir cronograma: ', error);
        });
    buscarCategoriasECronograma()
}

function showInput() {
    var selectedOption = document.getElementById("seletor").value;
    var textInput = document.getElementById("link");
    var fileInput = document.getElementById("file");

    if (selectedOption === "A") {
        textInput.style.display = "block";
        fileInput.style.display = "none";
    } else if (selectedOption === "B") {
        textInput.style.display = "none";
        fileInput.style.display = "block";
    }else{
        textInput.style.display = "none";
        fileInput.style.display = "none";
    }
}



// Função para renderizar as categorias e os cronogramas juntos
function renderizarCategoriasECronograma(categoriasSnapshot, cronogramaSnapshot) {

    // Converter a coleção de categorias em um array
    const categoriasArray = categoriasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Ordenar o array de categorias pelo campo 'posicao' em ordem crescente
    categoriasArray.sort((a, b) => a.posicao - b.posicao);

    if (document.title == "LITURGIA EDITAVEL") {
        // Limpar a lista de categorias existentes
        categoriaList.innerHTML = '';

        categoriasArray.forEach(categoriaData => {
            var categoria = categoriaData.nome;
            var posicao = categoriaData.posicao;

            var categoriaItems = document.createElement('div');
            categoriaItems.className = "input-group";
            categoriaItems.style= "margin-top: 2%;"

            var spanCategoria = document.createElement('span');
            spanCategoria.className = "input-group-text";
            spanCategoria.style = "background-color: #222222; color: white;"
            spanCategoria.innerHTML = "Categoria:"
            categoriaItems.appendChild(spanCategoria)

            var categoriaItem = document.createElement('input');
            categoriaItem.type = 'text';
            categoriaItem.id = categoriaData.id + "Categoria";
            categoriaItem.className = "form-control";
            categoriaItem.style = "background-color: #222222; color: white;"
            categoriaItem.value = categoria;
            categoriaItems.appendChild(categoriaItem)
            categoriaList.appendChild(categoriaItems);

            var categoriaItems = document.createElement('div');
            categoriaItems.className = "input-group";

            var spanCategoria = document.createElement('span');
            spanCategoria.className = "input-group-text";
            spanCategoria.style = "background-color: #222222; color: white;"
            spanCategoria.innerHTML = "Posição da Seção:"
            categoriaItems.appendChild(spanCategoria)

            var categoriaItem = document.createElement('input');
            categoriaItem.type = 'number';
            categoriaItem.id = categoriaData.id + "Posicao";
            categoriaItem.className = "form-control";
            categoriaItem.style = "background-color: #222222; color: white;"
            categoriaItem.value = posicao;
            categoriaItems.appendChild(categoriaItem)

            var excluirButton = document.createElement('button');
            excluirButton.innerText = 'Excluir';
            excluirButton.className = "btn btn-outline-secondary";
            excluirButton.onclick = function () {
                excluirCategoria(categoriaData.id);
            };
            categoriaItems.appendChild(excluirButton);

            var editarButton = document.createElement('button');
            editarButton.innerText = 'Editar';
            editarButton.className = "btn btn-outline-secondary";
            editarButton.onclick = function () {
                editarCategoria(categoriaData.id);
            };
            categoriaItems.appendChild(editarButton);

            categoriaList.appendChild(categoriaItems);

            var categoriaOption = document.createElement('option');
            categoriaOption.value = categoria;
            categoriaOption.innerText = categoria;
            categoriaSelect.appendChild(categoriaOption);
        });

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

            var cronogramaItem = document.createElement('div');
            cronogramaItem.className = "input-group col-10";

            if (horario != "") {
                var horarioInput = document.createElement('input');
                horarioInput.className = "form-control";
                horarioInput.style = "background-color: #222222; color: white;"
                horarioInput.type = 'time';
                horarioInput.value = horario;
                cronogramaItem.appendChild(horarioInput);
            }

            if (acao != "") {
                var acaoInput = document.createElement('textarea');
                acaoInput.className = "form-control";
                acaoInput.style = "background-color: #222222; color: white;"
                acaoInput.value = acao;
                cronogramaItem.appendChild(acaoInput);
            }

            if (responsavel != "") {
                var responsavelInput = document.createElement('input');
                responsavelInput.className = "form-control";
                responsavelInput.style = "background-color: #222222; color: white;"
                responsavelInput.type = 'text';
                responsavelInput.value = responsavel;
                cronogramaItem.appendChild(responsavelInput);

            }

            if (document.title == "LITURGIA EDITAVEL") {
                var editarButton = document.createElement('button');
                editarButton.className = "btn btn-outline-secondary";
                editarButton.innerText = 'Editar';
                editarButton.onclick = function () {
                    var novaCategoriaId = categoriaNome;
                    var novoHorario = horarioInput.value;
                    var novaAcao = acaoInput.value;
                    var novoResponsavel = responsavelInput.value;

                    atualizarCronograma(key, novaCategoriaId, novoHorario, novaAcao, novoResponsavel);
                };
                cronogramaItem.appendChild(editarButton);

                var excluirButton = document.createElement('button');
                excluirButton.className = "btn btn-outline-secondary";
                excluirButton.innerText = 'Excluir';
                excluirButton.onclick = function () {
                    excluirCronograma(key);
                };
                cronogramaItem.appendChild(excluirButton);
            } 
            cronogramaList.appendChild(cronogramaItem);

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
                    input.style.height = input.scrollHeight + "px";
                    input.style.width = "30%";
                });
            }else{
                const inputxs = document.querySelectorAll('textarea');
                // Percorrer cada elemento de input e definir o atributo readonly
                inputxs.forEach(input => {
                    input.style.height = (input.scrollHeight*0.95) + "px";
                    input.style.width = "30%";
                });
            }
        });
    });
}

function editarCategoria(categoriaId) {
    var novoNome = document.getElementById(categoriaId + 'Categoria').value;
    var novoPosicao = document.getElementById(categoriaId + 'Posicao').value;

    categoriasRef.doc(categoriaId).update({
        nome: novoNome,
        posicao: novoPosicao
    })
        .then(function () {
            console.log('Categoria atualizada com sucesso!');
            buscarCategoriasECronograma();
        })
        .catch(function (error) {
            console.error('Erro ao atualizar categoria: ', error);
        });
}

// Função para buscar categorias e cronogramas no Firestore
function buscarCategoriasECronograma() {
    Promise.all([
        categoriasRef.get(),
        cronogramaRef.get()
    ])
        .then(function (results) {
            var categoriasSnapshot = results[0];
            var cronogramaSnapshot = results[1];

            renderizarCategoriasECronograma(categoriasSnapshot, cronogramaSnapshot);
        })
        .catch(function (error) {
            console.error('Erro ao obter dados do Firestore: ', error);
        });
}

function excluirCategoria(id) {
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