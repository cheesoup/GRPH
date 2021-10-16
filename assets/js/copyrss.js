function copyURI(evt) {
    evt.preventDefault();
    navigator.clipboard.writeText(evt.target.getAttribute('data-url')).then(() => {
      document.getElementById("copied").style.opacity = "1";
      setTimeout(() => {  document.getElementById("copied").style.opacity = "0"; }, 2000);
    }, () => {
      /* clipboard write failed */
    });
}
