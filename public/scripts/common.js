$("#postTextArea, #respuestaTextArea").keyup(event => {
    const textbox = $(event.target);
    const value = $(event.target).val().trim();
    
    // Chequeamos si es el modal de respuesta
    const isModal = textbox.parents(".modal").length == 1;
    const enviarPostButton = isModal ? $("#responderButton") : $("#enviarPostButton");


    if (value == ""){
        enviarPostButton.prop("disabled", true);
        return;
    }

    enviarPostButton.prop("disabled", false);

});

$("#enviarPostButton").click((event) => {
    const boton = $(event.target);
    const textBox = $("#postTextArea")

    const data = {
      contenido: textBox.val()
    }
    

    // Publicar Dwit y renderizarlo en la pagina
    axios.post('/api/posts', {data})
    .then((response) => {
    const html = createPostHtml(response.data);
    $(".postContainer").prepend(html);
    textBox.val("");
    boton.prop("disabled", true);

    })
    .catch((error) => {
      console.log(error);
    });


});

// Se maneja distinto el click, ya que el likeButton es un elemento dinamico, se maneja a nivel document
$(document).on("click", ".likeButton", (event) => {
  const boton = $(event.target);
  const id = getElementId(boton);

  axios.put(`/api/posts/${id}/like`)
  .then((data) => {
    boton.find("span").text(data.data.likes.length || "");

    // Chequear si el usuario likeo el post
    if (data.data.likes.includes(userLoggedIn._id)){
      boton.addClass("active");
    }
    else {
      boton.removeClass("active");
    }
  
  })
  .catch((error) => {
    console.log(error);
  })


});

// Redweet
$(document).on("click", ".redweetButton", (event) => {
  const boton = $(event.target);
  const id = getElementId(boton);
  axios.post(`/api/posts/${id}/redweet`)
  .then((data) => {
    boton.find("span").text(data.data.redweetsUsers.length || "");

    // Chequear si el usuario likeo el post
    if (data.data.redweetsUsers.includes(userLoggedIn._id)){
      boton.addClass("active");
    }
    else {
      boton.removeClass("active");
    }
  
  })
  .catch((error) => {
    console.log(error);
  })


});

const getElementId = (element) => {
  const esRoot = element.hasClass("post");
  const rootElement = esRoot ? element : element.closest('.post');
  const id = rootElement.data().id;

  return id;

};

const createPostHtml = (data) => {

  // Es un RD si posee el objeto RedweetData
  const isRedweet = data.redweetData !== undefined;
  const redweetAutor = isRedweet ? data.autor.usuario : null;
  data = isRedweet ? data.redweetData : data;

  const autor = data.autor;
  const timestamp = calculadoraTiempo(new Date(), new Date(data.createdAt));

  const likeButtonActiveClass = data.likes.includes(userLoggedIn._id) ? "active" : "";
  const redweetButtonActiveClass = data.redweetsUsers.includes(userLoggedIn._id) ? "active" : "";

  let redweetText = '';

  if (isRedweet){
    redweetText =  `<span>
   <i class='fas fa-retweet'></i>
   Retweeted by <a href='/profile/${redweetAutor}'>@${redweetAutor}</a>    
</span>`
  }


  return `<div class="post" data-id='${data._id}'>
  <div class="postActionContainer">
  ${redweetText}
  </div>
  <div class="mainContentContainer">
  <div class="imagenUsuarioContainer">
  <img src='${autor.foto}'>
  </div>
  <div class="postContentContainer">
  <div class="header">
    <a class="displayName" href='/profile/${autor.usuario}'>${autor.displayName}</a>
    <span class="usuario">@${autor.usuario}</span>
    <span class="date">${timestamp}</span>
  </div>
  <div class="postBody">
    <span>${data.contenido}</span>
  </div>
  <div class="postFooter">
  <div class="containerActions">
  <div class="postBotonesContainer green"> 
  <button data-toggle='modal' data-target="#responderModal">
  <i class="far fa-comment-alt"></i>
  </button> 
  </div>
  <div class="postBotonesContainer green">  
  <button class='redweetButton ${redweetButtonActiveClass}'>
  <i class="fas fa-retweet"></i>
  <span>${data.redweetsUsers.length || ""}</span>
  </button></div>
 <div class="postBotonesContainer red">
 <button class='likeButton ${likeButtonActiveClass}'>
  <i class="far fa-heart"></i>
  <span>${data.likes.length || ""}</span>
  </button> </div>
  
  </div>
  </div>
  </div>
  </div>
  </div>`;
}

const calculadoraTiempo = (current, previous) =>  {

  var msPerMinute = 60 * 1000;
  var msPerHour = msPerMinute * 60;
  var msPerDay = msPerHour * 24;
  var msPerMonth = msPerDay * 30;
  var msPerYear = msPerDay * 365;

  var elapsed = current - previous;

  if (elapsed < msPerMinute) {
      if(elapsed/1000 < 30) return "Hace un momento";
      
      return 'Hace ' + Math.round(elapsed/1000) + ' segundos';   
  }

  else if (elapsed < msPerHour) {
       return 'Hace ' + Math.round(elapsed/msPerMinute) + ' minutos';   
  }

  else if (elapsed < msPerDay ) {
       return 'Hace ' + Math.round(elapsed/msPerHour ) + ' horas';   
  }

  else if (elapsed < msPerMonth) {
      return 'Hace ' +Math.round(elapsed/msPerDay) + ' dias';   
  }

  else if (elapsed < msPerYear) {
      return 'Hace ' +Math.round(elapsed/msPerMonth) + ' meses';   
  }

  else {
      return 'Hace ' +Math.round(elapsed/msPerYear ) + ' años';   
  }
}