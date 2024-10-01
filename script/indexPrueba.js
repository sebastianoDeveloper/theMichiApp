//! API DE api.thecatapi
const API_URL = [
  'https://api.thecatapi.com/v1/images/search',
  '?',
  'limit=2',
  //* sin esto x default la api te da solo una imagen
  // `&order=Asc`,
  // `&api_key=${API_KEY}`,
].join('')

const API_KEY = 'live_wVdIJjY2OA3mM5lq7SimIpktR3zu52KhWykxGntxvAvwZH3FbOIVUhowmfBwTaqg';

const API_URL_FAVORITE = [
  'https://api.thecatapi.com/v1/',
  'favourites',
  '?',
  // `&api_key=${API_KEY}`,
].join('')

const API_URL_FAVORITE_DLT = (id) =>
  `https://api.thecatapi.com/v1/favourites/${id}`;

const API_UPLOAD = 'https://api.thecatapi.com/v1/images/upload';

const reloadBtn = document.getElementById('reloadButton')
const gato1 = document.getElementById('cat1')
const gato2 = document.getElementById('cat2')

const spanError = document.getElementById('error')
const cancel = document.getElementById('cancel')
cargarImagenGato()
verImgFav()

reloadBtn.addEventListener('click', loadAllImg)
function loadAllImg() {
  cargarImagenGato()
  verImgFav()
}

function cargarImagenGato() {
  fetch(API_URL)
  // * fetch devuelve una promise
  .then(res => res.json())
  // * nosotros resolvemos la promise con .then y
  .then(data => {
    if (data.length >= 2) {
        // Si el array tiene al menos dos elementos
        gato1.src = data[0].url;
        gato2.src = data[1].url;
        console.log(data);
        const btn1 = document.getElementById('btnConvFav1')
        const btn2 = document.getElementById('btnConvFav2')
        btn1.onclick = () => {
        setTimeout(() => {
          loadAllImg()
        }, 500);
        saveFavouriteMichis(data[0].id)
      };
      btn2.onclick = () => {
        setTimeout(() => {
          loadAllImg()
        }, 500);
        saveFavouriteMichis(data[1].id)
      };
      } else {
        // Manejo del error si no hay suficientes datos
        console.error('No se recibieron suficientes imágenes de gatos.');
        spanError.innerText = 'No se pudieron cargar suficientes imágenes.';
      }
    })
    .catch(error => {
      console.error('Error fetching the image:', error);
      spanError.innerText = 'Error al cargar las imágenes.';
    });}

function verImgFav() {
  fetch(API_URL_FAVORITE, {
    method: 'GET',
    headers: {
      'X-API-KEY': API_KEY
    }
  })
  // * fetch devuelve una promise
  .then(res => res.json())
  .then(data => {
    console.log(data);
    console.log('PANCHITA');
    // * AQUI SE VE LAS IMG FAV EN LA PAGINA WEB
    const section = document.getElementById('favouritesMichis')
    section.innerHTML = ""
    const h2 = document.createElement('h2')
    const h2Text = document.createTextNode('Gatos favoritos')
    h2.appendChild(h2Text)
    section.appendChild(h2)
    data.forEach(michi => {
      const article = document.createElement('article')
      const img = document.createElement('img')
      const btn = document.createElement('button')
      const btnText = document.createTextNode('Eliminar de favoritos')
      img.src = michi.image.url
      img.width = 150
      btn.appendChild(btnText)
      btn.onclick = () => deleteFavouriteMichis(michi.id)
      // k es esto
      article.appendChild(img)
      article.appendChild(btn)
      section.appendChild(article)
    });
  })
  .catch(error => console.error('Error fetching the image:', error));

}

async function saveFavouriteMichis(id) {

  const queryString = {
      image_id: id,
  }
  const res = await fetch(API_URL_FAVORITE, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        // 'Content-Type': 'text/plain',
        'x-api-key': API_KEY
    },
    // body: queryString,
    body: JSON.stringify(queryString),
    // de esta manera stinfiamos o parciamos la info correctamente
  })
  // Verificar el tipo de contenido en la respuesta
  const contentType = res.headers.get('content-type');

  let dataCatFav;
  if (contentType && contentType.includes('application/json')) {
    dataCatFav = await res.json();
  } else {
    // Si no es JSON, probablemente sea texto plano
    const errorText = await res.text();
    spanError.innerText = `Error: ${res.status} - ${errorText}`;
    console.error('Respuesta no JSON recibida:', errorText);
    return; // Salir de la función si hay un error
  }
  if (res.status !== 200) {
    const errorMessage = dataCatFav.message ? dataCatFav.message : "Error desconocido";
    spanError.innerText = `Hubo un error ${res.status}: ${errorMessage}`;
  }
  else {
    console.log('¡Imagen añadida a favoritos!', dataCatFav);
  }
}

async function deleteFavouriteMichis(id) {
  const queryString = {
      image_id: id,
  }
  const res = await fetch(API_URL_FAVORITE_DLT(id), {
    method: 'DELETE',
    headers: {
      'X-API-KEY': API_KEY
    }
  })
  const dataCatFav = await res.json()
  const errorMessage = dataCatFav.message ? dataCatFav.message : "Error desconocido";

  console.log('save',res);
  if (res.status !== 200) {
    const errorMessage = dataCatFav.message ? dataCatFav.message : "Error desconocido";
    spanError.innerText = `Hubo un error ${res.status}: ${errorMessage}`;
  }
  else {
    verImgFav()
    console.log('¡Imagen eliminada de favoritos!', dataCatFav);
  }


}

async function uploadMichi() {
  const form = document.getElementById('uploadingForm')
  const formData = new FormData(form)
  // console.log(formData.get('file'));

  try {
    const res = await fetch(API_UPLOAD, {
      method: 'POST',
      headers: {
        // 'Content-Type': 'multipart/form-data',
        'x-api-key': API_KEY
      },
      body: formData
    })

    // Verificamos si el tipo de contenido es JSON antes de procesarlo
    let data;
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await res.json();
    } else {
      data = await res.text(); // Lee el texto si no es JSON
    }

    if (res.status !== 201) {
      // Muestra el mensaje de error en pantalla
      spanError.innerHTML = 'Hubo un error: ' + res.status + ' ' + data.message || data;
      console.error('Error:', data);
    } else {
      console.log('Foto de michi subida exitosamente:', data);
      console.log({ data });
      console.log(data.url);
      await saveFavouriteMichis(data.id);
      verImgFav()
    }
  } catch (error) {
    console.error('Error al subir la imagen:', error);
  }
}

function previewImage() {
  const fileInput = document.getElementById('file');
  const thumbnail = document.getElementById('thumbnail');
  cancel.style.display = 'block';

  // Verifica si se ha seleccionado un archivo
  if (fileInput.files && fileInput.files[0]) {
    const reader = new FileReader();

    // Cuando el archivo se ha leído, muestra la vista previa
    reader.onload = function(e) {
      thumbnail.src = e.target.result; // Asignamos la imagen leída al src del img
      thumbnail.style.display = 'block'; // Hacemos visible la miniatura

        setTimeout(() => {
          thumbnail.style.display = 'none';
          cancel.style.display = 'none';
      }, 10000); // 10000 milisegundos = 10 segundos
    }

    // Leemos el archivo seleccionado
    reader.readAsDataURL(fileInput.files[0]);
  }
}

function cancelUploadMichi() {
  const fileInput = document.getElementById('file');
  const thumbnail = document.getElementById('thumbnail');
  const cancel = document.getElementById('cancel');

  cancel.style.display = 'none';
  thumbnail.style.display = 'none';

  // **Restablece el input de archivo**
  fileInput.value = ''; // <-- Cambio: Restablecer el valor del input de archivo

}