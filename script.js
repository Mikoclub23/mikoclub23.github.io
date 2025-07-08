// Variables globales
let carrito = [];
const umbralDocena = 12; // A partir de 12 piezas, se aplica precio por docena
const umbralCaja = 30; // A partir de 30 piezas, se aplica precio por caja

// Precios base por producto (mayoreo)
const precios = {
    'md469': 220,
    'asjf': 150,
    '511': 180
};

// Multiplicadores de precio para cada tipo
const multiplicadores = {
    'mayoreo': 1.0, // Precio base
    'docena': 0.9,  // 10% de descuento por docena
    'caja': 0.8     // 20% de descuento por caja
};

// Funciones de carga inicial
document.addEventListener('DOMContentLoaded', function() {
    // Inicialización del botón de categorías
    const btnCategorias = document.getElementById('btnCategorias');
    if (btnCategorias) {
        btnCategorias.addEventListener('click', function() {
            const navCategorias = document.getElementById('categorias');
            navCategorias.classList.toggle('oculto');
        });
    }
    
    // Inicialización de contadores
    inicializarContadores();
    
    // Establecer valores mínimos para todos los inputs de color
    document.querySelectorAll('.color-input').forEach(input => {
        input.min = "0";
        
        // Añadir event listener para actualizar precio al cambiar cantidad
        input.addEventListener('input', function() {
            actualizarCantidadProducto(this.dataset.producto);
        });
    });
    
    // Inicializar precios mostrados
    actualizarPrecioMostrado('md469', 0);
    actualizarPrecioMostrado('asjf', 0);
    actualizarPrecioMostrado('511', 0);
    
    // Mostrar la primera categoría por defecto
    mostrarCategoria('mochilas');
});

// Función para mostrar categorías específicas
function mostrarCategoria(categoria) {
    // Ocultar todas las categorías
    document.querySelectorAll('.categoria').forEach(function(cat) {
        cat.classList.remove('activa');
    });
    
    // Mostrar la categoría seleccionada
    const categoriaSeleccionada = document.getElementById(categoria);
    if (categoriaSeleccionada) {
        categoriaSeleccionada.classList.add('activa');
    }
    
    // Ocultar el menú de categorías después de seleccionar
    document.getElementById('categorias').classList.add('oculto');
}

// Funciones para manejar cantidades y colores
function inicializarContadores() {
    // Asignar eventos a todos los campos de colores
    document.querySelectorAll('.color-input').forEach(input => {
        input.addEventListener('change', function() {
            actualizarCantidadProducto(this.dataset.producto);
        });
    });
}

function actualizarCantidadProducto(productoId) {
    let total = 0;
    // Sumar todas las cantidades de colores para este producto
    document.querySelectorAll(`.color-input[data-producto="${productoId}"]`).forEach(input => {
        total += parseInt(input.value || 0);
    });
    
    // Actualizar el campo de cantidad total
    const cantidadInput = document.getElementById(`cantidad-${productoId}`);
    if (cantidadInput) {
        cantidadInput.value = total;
    }
    
    // Actualizar el precio mostrado según la cantidad
    actualizarPrecioMostrado(productoId, total);
}

// Función específica para el producto MD469
function actualizarCantidad() {
    const negro = parseInt(document.getElementById("color-negro").value || 0);
    const azul = parseInt(document.getElementById("color-azul").value || 0);
    const total = negro + azul;
    document.getElementById("cantidad-md469").value = total;
    
    // Actualizar el precio mostrado según la cantidad
    actualizarPrecioMostrado('md469', total);
}

// Función para actualizar los precios mostrados en la página
function actualizarPrecioMostrado(productoId, cantidad) {
    const precioElementos = document.querySelectorAll(`.precio[data-producto="${productoId}"]`);
    if (precioElementos.length === 0) return;
    
    const precioBase = precios[productoId];
    if (!precioBase) return;
    
    // Usar las funciones existentes para mantener consistencia
    const precioActual = calcularPrecioSegunCantidad(productoId, cantidad);
    const tipoPrecio = obtenerTipoPrecio(cantidad);
    
    // No mostrar precio si la cantidad es menor que 6 (según nueva regla)
    if (cantidad > 0 && cantidad < 6) {
        return; // Salir sin actualizar precio para cantidades menores a 6
    }
    
    // Formatear precio con 2 decimales
    const precioFormateado = precioActual.toFixed(2);
    
    // Actualizar cada elemento de precio
    precioElementos.forEach(elemento => {
        // Eliminar cualquier span de precio-actual que ya exista
        const spanExistente = elemento.querySelector('.precio-actual');
        if (spanExistente) {
            spanExistente.remove();
        }
        
        // Establecer el texto del precio base
        elemento.textContent = `$${precioBase.toFixed(2)}`;
        
        // Si hay descuento y hay cantidad, mostrar el precio actual
        if (cantidad > 0 && (tipoPrecio !== "Precio Base" || precioActual > 0)) {
            const span = document.createElement('span');
            span.className = 'precio-actual';
            span.textContent = `${tipoPrecio} (${cantidad} pzs): $${precioFormateado}`;
            elemento.appendChild(span);
        }
    });
}

// Función para limpiar todas las cantidades
function limpiarCantidades() {
    // Reiniciamos todos los inputs de color
    const colorInputs = document.querySelectorAll('.color-input');
    colorInputs.forEach(input => {
        input.value = 0;
    });
    
    // Actualizar todos los contadores de productos
    document.querySelectorAll('[id^="cantidad-"]').forEach(contador => {
        contador.value = 0;
    });
    
    // Actualizar precios mostrados
    actualizarPrecioMostrado('md469', 0);
    actualizarPrecioMostrado('asjf', 0);
    actualizarPrecioMostrado('511', 0);
}

// Función para calcular el precio según la cantidad de cada modelo
function calcularPrecioSegunCantidad(productoId, cantidad) {
    if (cantidad < 6) return 0; // Mínimo 6 piezas según nueva regla
    
    // Obtener el precio base del producto
    const precioBase = precios[productoId] || 0;
    
    // Determinar el multiplicador según la cantidad
    let multiplicador;
    if (cantidad >= umbralCaja) {
        multiplicador = multiplicadores.caja;
    } else if (cantidad >= umbralDocena) {
        multiplicador = multiplicadores.docena;
    } else {
        multiplicador = multiplicadores.mayoreo;
    }
    
    // Calcular y devolver el precio unitario ajustado
    return precioBase * multiplicador;
}

// Función para obtener el tipo de precio según la cantidad
function obtenerTipoPrecio(cantidad) {
    if (cantidad >= umbralCaja) {
        return "Precios por caja";
    } else if (cantidad >= umbralDocena) {
        return "Precio por docena";
    } else if (cantidad >= 6) {
        return "Precio base";
    } else {
        return "";
    }
}

// Funciones para confirmación de pedido
function confirmarPedido() {
    // Recolectar información de todos los productos
    const cantidadMD469 = parseInt(document.getElementById("cantidad-md469").value || 0);
    const negroMD469 = parseInt(document.getElementById("color-negro").value || 0);
    const azulMD469 = parseInt(document.getElementById("color-azul").value || 0);
    
    const cantidadASJF = parseInt(document.getElementById("cantidad-asjf").value || 0);
    const cantidadLapicera = parseInt(document.getElementById("cantidad-511").value || 0);
    
    // Sumar todas las cantidades para verificar mínimo
    const cantidadTotal = cantidadMD469 + cantidadASJF + cantidadLapicera;
    
    // Validación de cantidad mínima de 6 piezas
    if (cantidadTotal <= 0) {
        alert("Por favor seleccione al menos un producto");
        return;
    }
    
    if (cantidadTotal < 6) {
        alert("El pedido mínimo es de 6 piezas");
        return;
    }
    
    // Calcular precios según cantidad por modelo
    let precioMD469 = calcularPrecioSegunCantidad('md469', cantidadMD469);
    let precioASJF = calcularPrecioSegunCantidad('asjf', cantidadASJF);
    let precioLapicera = calcularPrecioSegunCantidad('511', cantidadLapicera);
    
    // Determinar tipo de precio general para el mensaje
    let mensajeTipo = "";
    if (cantidadTotal >= umbralCaja) {
        mensajeTipo = "Precios por caja";
    } else if (cantidadTotal >= umbralDocena) {
        mensajeTipo = "Precio por docena";
    } else if (cantidadTotal >= 6) {
        mensajeTipo = "Precio base";
    } else {
        mensajeTipo = "";
    }

    // Crear mensaje para WhatsApp con los precios actualizados
    let mensaje = `¡Hola! Quiero hacer un pedido:\n\n`;
    
    if (cantidadMD469 > 0) {
        const precioUnitario = calcularPrecioSegunCantidad('md469', cantidadMD469);
        const precioTotal = precioUnitario * cantidadMD469;
        const tipoPrecioMD469 = obtenerTipoPrecio(cantidadMD469);
        
        mensaje += `* Modelo: MD469\n` +
                  `  Cantidad total: ${cantidadMD469}\n` +
                  `  Colores:\n` +
                  `  - Negro: ${negroMD469}\n` +
                  `  - Azul: ${azulMD469}\n` +
                  `  Precio unitario: $${precioUnitario} (${tipoPrecioMD469})\n` +
                  `  Subtotal: $${precioTotal}\n\n`;
    }
    
    if (cantidadASJF > 0) {
        const precioUnitario = calcularPrecioSegunCantidad('asjf', cantidadASJF);
        const precioTotal = precioUnitario * cantidadASJF;
        const tipoPrecioASJF = obtenerTipoPrecio(cantidadASJF);
        
        mensaje += `* Modelo: ASJF (Lonchera)\n` +
                  `  Cantidad total: ${cantidadASJF}\n` +
                  `  Precio unitario: $${precioUnitario} (${tipoPrecioASJF})\n` +
                  `  Subtotal: $${precioTotal}\n\n`;
    }
    
    if (cantidadLapicera > 0) {
        const precioUnitario = calcularPrecioSegunCantidad('511', cantidadLapicera);
        const precioTotal = precioUnitario * cantidadLapicera;
        const tipoPrecioLapicera = obtenerTipoPrecio(cantidadLapicera);
        
        mensaje += `* Modelo: 5.11 Cinturón (Lapicera)\n` +
                  `  Cantidad total: ${cantidadLapicera}\n` +
                  `  Precio unitario: $${precioUnitario} (${tipoPrecioLapicera})\n` +
                  `  Subtotal: $${precioTotal}\n\n`;
    }
    
    // Calcular total general
    let totalGeneral = 0;
    if (cantidadMD469 > 0) totalGeneral += calcularPrecioSegunCantidad('md469', cantidadMD469) * cantidadMD469;
    if (cantidadASJF > 0) totalGeneral += calcularPrecioSegunCantidad('asjf', cantidadASJF) * cantidadASJF;
    if (cantidadLapicera > 0) totalGeneral += calcularPrecioSegunCantidad('511', cantidadLapicera) * cantidadLapicera;
    
    mensaje += `Cantidad total de piezas: ${cantidadTotal}\n`;
    mensaje += `Total del pedido: $${totalGeneral}\n\n`;
    mensaje += `Quiero recoger mi pedido en la tienda ubicada en: Calle Aztecas #17, Plaza Charly, Interior 23, Centro, CDMX.`;

    // Abrir WhatsApp con el mensaje
    window.open(`https://wa.me/525549384964?text=${encodeURIComponent(mensaje)}`, "_blank");
}

// Función para agregar productos a más categorías
function agregarProducto(categoria, id, nombre, precio, imagenes, descripcion, colores) {
    const productoHTML = crearHTMLProducto(id, nombre, precio, imagenes, descripcion, colores);
    document.getElementById(categoria).appendChild(productoHTML);
}

function crearHTMLProducto(id, nombre, precio, imagenes, descripcion, colores) {
    // Crear el elemento del producto
    const productoDiv = document.createElement('div');
    productoDiv.className = 'producto';
    productoDiv.id = `producto-${id}`;
    
    // Agregar título con precio
    const titulo = document.createElement('h3');
    titulo.textContent = `${nombre} - $${precio}`;
    productoDiv.appendChild(titulo);
    
    // Agregar imágenes
    const galeriaDiv = document.createElement('div');
    galeriaDiv.className = 'galeria-imagenes';
    imagenes.forEach(src => {
        const img = document.createElement('img');
        img.src = src;
        img.alt = nombre;
        galeriaDiv.appendChild(img);
    });
    productoDiv.appendChild(galeriaDiv);
    
    // Agregar descripción
    const descDiv = document.createElement('p');
    descDiv.className = 'descripcion';
    descDiv.innerHTML = descripcion;
    productoDiv.appendChild(descDiv);
    
    // Agregar selección de colores
    const coloresDiv = document.createElement('div');
    coloresDiv.className = 'colores';
    
    colores.forEach(color => {
        const label = document.createElement('label');
        label.textContent = `${color}:`;
        
        const input = document.createElement('input');
        input.type = 'number';
        input.id = `color-${id}-${color.toLowerCase()}`;
        input.className = 'color-input';
        input.dataset.producto = id;
        input.value = '0';
        input.min = '0';
        input.addEventListener('change', function() {
            actualizarCantidadProducto(id);
        });
        
        coloresDiv.appendChild(label);
        coloresDiv.appendChild(input);
        coloresDiv.appendChild(document.createElement('br'));
    });
    
    productoDiv.appendChild(coloresDiv);
    
    // Agregar contador total
    const contadorDiv = document.createElement('div');
    contadorDiv.className = 'contador';
    
    const contadorLabel = document.createElement('label');
    contadorLabel.textContent = 'Total piezas:';
    
    const contadorInput = document.createElement('input');
    contadorInput.type = 'number';
    contadorInput.id = `cantidad-${id}`;
    contadorInput.value = '0';
    contadorInput.readOnly = true;
    
    contadorDiv.appendChild(contadorLabel);
    contadorDiv.appendChild(contadorInput);
    productoDiv.appendChild(contadorDiv);
    
    // Botón de actualizar
    const btnActualizar = document.createElement('button');
    btnActualizar.className = 'btn btn-agregar';
    btnActualizar.textContent = 'Actualizar Cantidad';
    btnActualizar.addEventListener('click', function() {
        actualizarCantidadProducto(id);
    });
    productoDiv.appendChild(btnActualizar);
    
    return productoDiv;
}