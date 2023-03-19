/*profile page*/
function iframeLoaded() {
    var iFrameID = document.getElementById('main__content__iframe');
    if(iFrameID) {
          iFrameID.height = "";
          iFrameID.height = iFrameID.contentWindow.document.body.scrollHeight + "px";
    }   
}

function changeTab(btn){
    var frame = document.getElementById('main__content__iframe');
    if(btn.id=="main__nav__edit"){
        frame.src="../doan/editProfile.html";
        frame.with="100%";
        frame.height="180%";
    }
    else if(btn.id=="main__nav__list"){
        frame.src="../doan/doctorList.html";
        frame.with="100%";
        frame.height="100%";
    }
}
/*edit page*/
function viewPassword()
{
  var passwordInput = document.getElementById('pass__field');
  var passStatus = document.getElementById('pass-status');
 
  if (passwordInput.type == 'password'){
    passwordInput.type='text';
    passStatus.className='fa fa-eye-slash';
    
  }
  else{
    passwordInput.type='password';
    passStatus.className='fa fa-eye';
  }
}
/*dr list page*/
