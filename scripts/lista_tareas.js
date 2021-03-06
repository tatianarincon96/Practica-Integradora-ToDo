comprobarToken();
window.onload = () => { // Protegido con onload porque necesito algo del documento 
    renderizarSkeletons(5, ".tareas-pendientes");
    setTimeout(() => {
        pedirTareas();
        botonAgregarTarea();   
        cerrarSesion();     
    }, 2000);
}



function comprobarToken() {
    const token = localStorage.getItem("token");
    if (!token) {
        location.href = './login.html';
    }
}

function pedirTareas() {
    const url = 'https://ctd-todo-api.herokuapp.com/v1';
    const token = localStorage.getItem("token");
    fetch(`${url}/tasks`, {
        // method: 'GET', No es necesario, va por defecto
        headers: {
            "Authorization": token // agregrarlo en clase de datosUsuarios
        }
    }).then(datos => {
        return datos.json();
    }).then(tareas => {
        crearTareas(tareas);
        removerSkeleton(contenedor);
    }).catch(err => {
        console.log(err);
    });
}

// Actualizar tareas
function completarTarea(id, completed) {
    const url = 'https://ctd-todo-api.herokuapp.com/v1';
    const token = localStorage.getItem("token");

    fetch(`${url}/tasks/${id}`, {
        method: 'PUT',
        headers: {
            authorization: token, // agregrarlo en clase de datosUsuarios
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            completed: !completed
        })
    }).then(datos => {
        return datos.json();
    }).then(tareas => {
        pedirTareas();
    }).catch(err => {
        console.log(err);
    });
}

function eliminarTarea(id) {
    const url = 'https://ctd-todo-api.herokuapp.com/v1';
    const token = localStorage.getItem("token");

    if (!confirm("¿Realmente desea eliminar la tarea?")) {
        return;
    }

    fetch(`${url}/tasks/${id}`, {
        method: 'DELETE',
        headers: {
            authorization: token
        }
    }).then(datos => {
        return datos.json();
    }).then(tareas => { // Se puede optimizar y complejizar lógica para que solo se renderice lo que cambió
        pedirTareas();
    }).catch(err => {
        console.log(err);
    })
}

// Funcion: Recorre tarea solamente, y por cada una hace algo, renderizarla (esa responsabilidad está en otra función)
function crearTareas(tareas) {
    document.querySelector('ul.tareas-pendientes').innerHTML = '';
    document.querySelector('ul.tareas-terminadas').innerHTML = '';

    tareas.forEach(tarea => renderizarTarea(tarea)); // Se podría usar filter de tareas completas también
}

function definirContenedor(tarea) {
    const contenedorTareasPendientes = document.querySelector("ul.tareas-pendientes");
    const contenedorTareasTerminadas = document.querySelector("ul.tareas-terminadas");

    return tarea.completed ? contenedorTareasTerminadas : contenedorTareasPendientes;
}

// Funcion: Renderizar tarea y dónde renderizarla
function renderizarTarea(tarea) {
    contenedorTareas = definirContenedor(tarea);
    const formatDate = formatearFecha(tarea.createdAt);
    const template = `
    <li class="tarea">
        <div class="not-done" onClick="completarTarea(${tarea.id},${tarea.completed})"></div>
        <div class="descripcion">
            <p class="nombre">${tarea.description}</p>
            <div class="right-description">
                <p class="timestamp">Creado el: ${formatDate}</p>
                <button class="button-trash" onClick="eliminarTarea(${tarea.id})"><i class="fas fa-trash trash"></i></button>
            </div>
        </div>
    </li>
    `;
    contenedorTareas.innerHTML += template;
}

function agregarTareas(userValue,loadingTasks) {
    const url = 'https://ctd-todo-api.herokuapp.com/v1';
    const token = localStorage.getItem("token");
    const body = {
        description: userValue,
        completed: false
    }
    
    fetch(`${url}/tasks`, {
        method: 'POST',
        headers: {
            authorization: token,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    }).then(datos => {
        console.log(datos)
        return datos.json();
    }).then(tareas => {
        console.log(tareas);
        pedirTareas();
        loadingTasks.style.opacity = 0;
    }).catch(err => {
        console.log(err);
    });
}

function botonAgregarTarea() {
    const form = document.forms.newtask;
    const loadingTasks = document.querySelector("#loading-spinner");
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        loadingTasks.style.opacity = 1;
        setTimeout(() => {
            agregarTareas(form.input.value,loadingTasks);
        }, 3000);
    });
}

function formatearFecha(fecha) {
    const date = new Date(fecha);
    const day = date.getDay();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return formatDay = `${day < 10 ? "0" + day : day}-${month < 10 ? "0" + month : month}-${year}`;

}


function cerrarSesion() {
    const loguotButton = document.querySelector("#logout-button");
    loguotButton.addEventListener( "click", () => {
        location.href = './login.html';
    });
}