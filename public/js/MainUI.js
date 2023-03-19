function visiblePost(){
    document.getElementById("create-post").style.visibility='visible';
    document.getElementById("create-post").style.display = 'block';
    document.getElementById("backgroundOverlay").style.display='block';
}
function hidePost() {

    document.getElementById("create-post").style.visibility='hiden';
    document.getElementById("create-post").style.display='none';
}
function preview(){
    let fileInput = document.getElementById("file-input");
    let imageContainer = document.getElementById("images");
    imageContainer.innerHTML="";
    for(i of fileInput.files){
        let reader = new FileReader();
        let figure = document.createElement("figure");
        let figCap = document.createElement("figcaption");
        figCap.innerText = i.name;
        figure.appendChild(figCap);
        reader.onload=()=>{
            let img = document.createElement("img");
            img.setAttribute("src",reader.result);
            figure.insertBefore(img,figCap);
        }
        imageContainer.appendChild(figure);
        reader.readAsDataURL(i);
    }
}
window.onload = function(){
    var overlay = document.getElementById("backgroundOverlay");
    document.onclick = function(e){
      /* if(e.target.id !== "create-post" && e.target.id !=="post-area" && e.target.id != "post-area__inside" && e.target.id != "user-think" 
        && e.target.id != "wrapper" && e.target.id != "post"&& e.target.id !="form-post" && e.target.id !="content" && e.target.id !="icon" && e.target.id !="detail" && e.target.id !="user-name" 
        && e.target.id !="text-area" && e.target.id !="photo-area" && e.target.id !="file-input" && e.target.id !="images" && e.target.id !="photo-emoji" && e.target.id !="file" && e.target.id !="emoji" && e.target.id !="btn-post"
        && e.target.id != "photo" && e.target.id != "header" && e.target.id!= "title") */
        if(e.target.id == 'backgroundOverlay'){
            document.getElementById("create-post").style.visibility='hiden';
            document.getElementById("create-post").style.display='none';
            overlay.style.display='none';
        }
    };
  };