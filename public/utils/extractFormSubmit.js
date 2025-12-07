const form = document.getElementById("fileForm");
const select = document.getElementById("fileSelect");
const progress = document.getElementById("extractDataProgress");
const percent = document.getElementById("extractPercent");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!select.value) {
    alert("Please select a document first.");
    return;
  }

  // Start smooth fake progress
  let p = 0;
  const interval = setInterval(() => {
    if (p >= 95) {
      clearInterval(interval);
      return;
    }
    p += 1;
    progress.value = p;
    percent.innerText = p + "%";
  }, 40);

  // Submit the form
  form.action = `/extractData/${encodeURIComponent(select.value)}`;
  form.submit();
});
