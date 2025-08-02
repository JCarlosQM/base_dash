let tablaUsuarios;

function getCSRF() {
    const token = document.querySelector('meta[name="csrf-token"]');
    return token ? token.getAttribute('content') : '';
}


// SWET ALERT 

async function confirmarAccion(mensaje = "¿Estás seguro?") {
    const result = await Swal.fire({
        title: mensaje,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí',
        cancelButtonText: 'Cancelar',
    });
    return result.isConfirmed;
}

async function mostrarAlerta(titulo, texto = '', icono = 'info') {
    await Swal.fire({
        title: titulo,
        text: texto,
        icon: icono,
        confirmButtonText: 'OK'
    });
}


// INVOCACION  DE API

async function realizarPeticion(url, metodo = 'GET', data = null) {
    const opciones = {
        method: metodo,
        headers: {
            'X-CSRF-TOKEN': getCSRF()
        }
    };

    if (data) {
        opciones.headers['Content-Type'] = 'application/json';
        opciones.body = JSON.stringify(data);
    }

    const res = await fetch(url, opciones);
    if (!res.ok) {
        let mensajeError = `Error: ${res.status} ${res.statusText}`;
        try {
            const json = await res.json();
            if (json.message) mensajeError = json.message;
        } catch {}
        throw new Error(mensajeError);
    }
    return res;
}

function inicializarDataTable() {
    // Destruye la tabla si ya está inicializada para evitar error "Cannot reinitialise"
    if ($.fn.DataTable.isDataTable('#tabla-usuarios')) {
        $('#tabla-usuarios').DataTable().clear().destroy();
    }

    tablaUsuarios = $('#tabla-usuarios').DataTable({
        ajax: {
            url: '/api/usuarios',
            dataSrc: '',
        },
        columns: [
            { data: null, render: (data, type, row, meta) => meta.row + 1 }, // índice
            { data: 'nombre' },
            { data: 'email' },
            {
                data: 'id',
                orderable: false,
                searchable: false,
                render: function(data, type, row) {
                    // Escapar comillas simples para evitar romper el onclick
                    const nombre = row.nombre.replace(/'/g, "\\'");
                    const email = row.email.replace(/'/g, "\\'");
                    return `
                        <button class="btn btn-sm btn-primary me-1" onclick="abrirModalUsuario(${data}, '${nombre}', '${email}')">
                            <i class="bi bi-pencil-fill"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="eliminarUsuario(${data})">
                            <i class="bi bi-trash-fill"></i>
                        </button>
                    `;
                }
            }
        ],
        language: {
            url: 'https://cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json'
        },
        responsive: true,
        paging: true,
        pageLength: 10,
        lengthChange: false,
        searching: true,
    });
}

function recargarTabla() {
    if (tablaUsuarios) {
        tablaUsuarios.ajax.reload(null, false);
    }
}

function abrirModalCrear() {
    // Limpiar campos del formulario crear
    document.getElementById("createNombre").value = '';
    document.getElementById("createEmail").value = '';
    document.getElementById("createPassword").value = '';

    // Mostrar modal crear
    new bootstrap.Modal(document.getElementById('createModal')).show();
}

function abrirModalUsuario(id, nombre, email) {
    document.getElementById("editId").value = id;
    document.getElementById("editNombre").value = nombre;
    document.getElementById("editEmail").value = email;
    new bootstrap.Modal(document.getElementById('editModal')).show();
}

async function crearUsuario() {
    const nombre = document.getElementById("createNombre").value;
    const email = document.getElementById("createEmail").value;
    const password = document.getElementById("createPassword").value;

    try {
        await realizarPeticion('/usuarios', 'POST', { nombre, email, password });
        bootstrap.Modal.getInstance(document.getElementById('createModal')).hide();
        await mostrarAlerta('¡Creado!', 'El usuario fue creado correctamente.', 'success');
        recargarTabla();
    } catch (error) {
        await mostrarAlerta('Error', error.message, 'error');
    }
}

async function actualizarUsuario() {
    const confirmado = await confirmarAccion("¿Seguro que quieres actualizar este usuario?");
    if (!confirmado) return;

    const id = document.getElementById("editId").value;
    const nombre = document.getElementById("editNombre").value;
    const email = document.getElementById("editEmail").value;

    try {
        await realizarPeticion(`/usuarios/${id}`, 'PUT', { nombre, email });
        bootstrap.Modal.getInstance(document.getElementById('editModal')).hide();
        await mostrarAlerta('¡Actualizado!', 'El usuario fue actualizado correctamente.', 'success');
        recargarTabla();
    } catch (error) {
        await mostrarAlerta('Error', error.message, 'error');
    }
}

async function eliminarUsuario(id) {
    const confirmado = await confirmarAccion("¿Seguro que deseas eliminar este usuario?");
    if (!confirmado) return;

    try {
        await realizarPeticion(`/usuarios/${id}`, 'DELETE');
        await mostrarAlerta('¡Eliminado!', 'El usuario fue eliminado.', 'success');
        recargarTabla();
    } catch (error) {
        await mostrarAlerta('Error', error.message, 'error');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    inicializarDataTable();

    document.getElementById("createForm").addEventListener("submit", function(e) {
        e.preventDefault();
        crearUsuario();
    });

    document.getElementById("editForm").addEventListener("submit", function(e) {
        e.preventDefault();
        actualizarUsuario();
    });
});
