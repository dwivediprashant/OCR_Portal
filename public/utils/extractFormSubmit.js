const form = document.getElementById("fileForm");
const select = document.getElementById("fileSelect");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!select.value) {
    alert("Please select a document first.");
    return;
  }

  form.action = `/extractData/${encodeURIComponent(select.value)}`;
  form.submit();
});
